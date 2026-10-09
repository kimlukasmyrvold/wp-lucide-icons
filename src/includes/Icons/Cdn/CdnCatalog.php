<?php

namespace WPIcons\Icons\Cdn;

use WPIcons\Admin\Settings;
use WPIcons\Icons\Registry;
use WPIcons\Icons\Svg;

if (!\defined('ABSPATH')) {
    exit;
}

final class CdnCatalog
{
    public const CRON_HOOK = 'wp_icons_refresh_cdn_catalogs';
    public const META_OPTION = 'wp_icons__cdn_meta';

    public function register(): void
    {
        add_action('init', [$this, 'schedule']);
        add_action(self::CRON_HOOK, [self::class, 'refreshEnabled']);
    }

    public function schedule(): void
    {
        if (!wp_next_scheduled(self::CRON_HOOK)) {
            wp_schedule_event(time() + HOUR_IN_SECONDS, 'daily', self::CRON_HOOK);
        }
    }

    public static function unschedule(): void
    {
        $timestamp = wp_next_scheduled(self::CRON_HOOK);
        if ($timestamp) {
            wp_unschedule_event($timestamp, self::CRON_HOOK);
        }
    }

    /**
     * @return array<string, array{version: string, fetched_at: int, count: int, file: string}>
     */
    public static function meta(): array
    {
        $stored = get_option(self::META_OPTION, []);

        return \is_array($stored) ? $stored : [];
    }

    public static function version(string $libraryId): ?string
    {
        $meta = self::meta();

        return isset($meta[$libraryId]['version']) && \is_string($meta[$libraryId]['version'])
            ? $meta[$libraryId]['version']
            : null;
    }

    public static function fetchedAt(string $libraryId): ?int
    {
        $meta = self::meta();

        return isset($meta[$libraryId]['fetched_at']) ? (int) $meta[$libraryId]['fetched_at'] : null;
    }

    /**
     * @return list<string>
     */
    public static function names(string $libraryId): array
    {
        return array_keys(self::icons($libraryId));
    }

    public static function inner(string $libraryId, string $name): ?string
    {
        $icons = self::icons($libraryId);
        if (isset($icons[$name]) && \is_string($icons[$name])) {
            return $icons[$name];
        }

        $alt = str_contains($name, '-') ? str_replace('-', '_', $name) : str_replace('_', '-', $name);
        if (isset($icons[$alt]) && \is_string($icons[$alt])) {
            return $icons[$alt];
        }

        return null;
    }

    /**
     * @return array<string, string>
     */
    public static function icons(string $libraryId): array
    {
        static $cache = [];

        if (isset($cache[$libraryId])) {
            return $cache[$libraryId];
        }

        $meta = self::meta();
        if (!isset($meta[$libraryId]['file']) || !\is_string($meta[$libraryId]['file'])) {
            $cache[$libraryId] = [];

            return $cache[$libraryId];
        }

        $path = $meta[$libraryId]['file'];
        if (!is_readable($path)) {
            $cache[$libraryId] = [];

            return $cache[$libraryId];
        }

        $json = file_get_contents($path);
        if ($json === false) {
            $cache[$libraryId] = [];

            return $cache[$libraryId];
        }

        $decoded = json_decode($json, true);
        $icons = [];
        if (\is_array($decoded) && isset($decoded['icons']) && \is_array($decoded['icons'])) {
            foreach ($decoded['icons'] as $name => $inner) {
                if (\is_string($name) && \is_string($inner) && $inner !== '') {
                    $icons[$name] = $inner;
                }
            }
        }

        $cache[$libraryId] = $icons;

        return $cache[$libraryId];
    }

    public static function refreshEnabled(): void
    {
        $settings = Settings::get();

        foreach (array_keys(Registry::all()) as $libraryId) {
            if (!Settings::libraryEnabled($settings, $libraryId)) {
                continue;
            }
            if (Settings::librarySource($settings, $libraryId) !== 'cdn') {
                continue;
            }

            self::refresh($libraryId, Settings::libraryCdnVersion($settings, $libraryId));
        }
    }

    /**
     * @return array{ok: bool, message: string, version?: string, count?: int}
     */
    public static function refresh(string $libraryId, string $requestedVersion = 'latest'): array
    {
        $library = Registry::get($libraryId);
        if ($library === null) {
            return ['ok' => false, 'message' => 'Unknown library'];
        }

        $package = $library->npmPackage();
        $resolved = self::resolveNpmVersion($package, $requestedVersion);
        if ($resolved === null) {
            return ['ok' => false, 'message' => sprintf('Could not resolve npm version for %s.', $package)];
        }

        $existing = self::version($libraryId);
        if ($existing === $resolved && self::icons($libraryId) !== []) {
            return ['ok' => true, 'message' => 'Catalog already up to date.', 'version' => $resolved, 'count' => \count(self::icons($libraryId))];
        }

        $tarball = self::npmTarball($package, $resolved);
        if ($tarball === null) {
            return ['ok' => false, 'message' => sprintf('Could not find tarball for %s@%s.', $package, $resolved)];
        }

        $parsed = self::downloadAndParse($libraryId, $tarball);
        if ($parsed === null || $parsed === []) {
            return ['ok' => false, 'message' => 'Could not parse icon SVGs from the CDN package.'];
        }

        $dir = self::storageDir();
        if ($dir === null) {
            return ['ok' => false, 'message' => 'Could not create the local CDN cache directory.'];
        }

        $file = $dir . '/' . sanitize_file_name($libraryId) . '.json';
        $payload = wp_json_encode([
            'version' => $resolved,
            'package' => $package,
            'icons' => $parsed,
        ]);

        if (!\is_string($payload) || file_put_contents($file, $payload) === false) {
            return ['ok' => false, 'message' => 'Could not write the CDN catalog cache.'];
        }

        $meta = self::meta();
        $meta[$libraryId] = [
            'version' => $resolved,
            'fetched_at' => time(),
            'count' => \count($parsed),
            'file' => $file,
        ];
        update_option(self::META_OPTION, $meta, false);

        return [
            'ok' => true,
            'message' => 'CDN catalog updated.',
            'version' => $resolved,
            'count' => \count($parsed),
        ];
    }

    public static function deleteAll(): void
    {
        $meta = self::meta();
        foreach ($meta as $entry) {
            if (isset($entry['file']) && \is_string($entry['file']) && is_file($entry['file'])) {
                wp_delete_file($entry['file']);
            }
        }
        delete_option(self::META_OPTION);

        $dir = self::storageDir();
        if ($dir && is_dir($dir)) {
            $index = $dir . '/index.php';
            if (is_file($index)) {
                wp_delete_file($index);
            }
        }
    }

    /**
     * @return list<string>
     */
    public static function npmVersions(string $package): array
    {
        $key = 'wp_icons__npm_versions_' . md5($package);
        $cached = get_transient($key);
        if (\is_array($cached)) {
            return $cached;
        }

        $url = 'https://registry.npmjs.org/' . rawurlencode($package);
        if (str_starts_with($package, '@')) {
            $url = 'https://registry.npmjs.org/' . str_replace('/', '%2f', $package);
        }

        $response = wp_remote_get($url, ['timeout' => 10]);
        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return [];
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (!\is_array($body) || !isset($body['versions']) || !\is_array($body['versions'])) {
            return [];
        }

        $versions = array_values(array_filter(
            array_keys($body['versions']),
            static function ($version) {
                return \is_string($version) && preg_match('/^\d+\.\d+\.\d+$/', $version);
            }
        ));

        usort($versions, static function ($a, $b) {
            return version_compare($b, $a);
        });

        $versions = \array_slice($versions, 0, 50);
        set_transient($key, $versions, 12 * HOUR_IN_SECONDS);

        return $versions;
    }

    private static function resolveNpmVersion(string $package, string $requested): ?string
    {
        if ($requested !== 'latest' && preg_match('/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/', $requested)) {
            return $requested;
        }

        $versions = self::npmVersions($package);

        return $versions[0] ?? null;
    }

    private static function npmTarball(string $package, string $version): ?string
    {
        $url = 'https://registry.npmjs.org/' . rawurlencode($package);
        if (str_starts_with($package, '@')) {
            $url = 'https://registry.npmjs.org/' . str_replace('/', '%2f', $package);
        }

        $response = wp_remote_get($url . '/' . rawurlencode($version), ['timeout' => 15]);
        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return null;
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (!\is_array($body) || !isset($body['dist']['tarball']) || !\is_string($body['dist']['tarball'])) {
            return null;
        }

        return $body['dist']['tarball'];
    }

    /**
     * @return array<string, string>|null
     */
    private static function downloadAndParse(string $libraryId, string $tarballUrl): ?array
    {
        if (!class_exists(\PharData::class)) {
            return null;
        }

        $response = wp_remote_get($tarballUrl, [
            'timeout' => 60,
            'stream' => false,
        ]);

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return null;
        }

        $body = wp_remote_retrieve_body($response);
        if ($body === '') {
            return null;
        }

        $tmp = wp_tempnam($tarballUrl);
        if ($tmp === false) {
            return null;
        }

        $gz = $tmp . '.tar.gz';
        if (file_put_contents($gz, $body) === false) {
            wp_delete_file($tmp);

            return null;
        }

        wp_delete_file($tmp);

        try {
            $phar = new \PharData($gz);
            $tarPath = preg_replace('/\.gz$/', '', $gz);
            if (!is_string($tarPath)) {
                return null;
            }

            if (!is_file($tarPath)) {
                $phar->decompress();
            }

            $tar = new \PharData($tarPath);
            $icons = [];

            foreach (new \RecursiveIteratorIterator($tar) as $file) {
                if (!$file instanceof \SplFileInfo || !$file->isFile()) {
                    continue;
                }

                $path = str_replace('\\', '/', $file->getPathname());
                if (!str_ends_with(strtolower($path), '.svg')) {
                    continue;
                }

                $name = self::iconNameFromPackagePath($libraryId, $path);
                if ($name === null) {
                    continue;
                }

                $svg = file_get_contents($file->getPathname());
                if (!\is_string($svg) || $svg === '') {
                    continue;
                }

                $inner = Svg::sanitizeInner(self::innerSvg($svg));
                if ($inner === '') {
                    continue;
                }

                $icons[$name] = $inner;
            }

            if (is_file($tarPath) && $tarPath !== $gz) {
                wp_delete_file($tarPath);
            }
            wp_delete_file($gz);

            return $icons;
        } catch (\Throwable $e) {
            if (isset($gz) && is_file($gz)) {
                wp_delete_file($gz);
            }

            return null;
        }
    }

    private static function iconNameFromPackagePath(string $libraryId, string $path): ?string
    {
        $normalized = str_replace('\\', '/', $path);
        $file = basename($normalized, '.svg');
        if ($file === '') {
            return null;
        }

        if ($libraryId === 'material-symbols') {
            if (!str_contains($normalized, '/outlined/')) {
                return null;
            }

            return $file;
        }

        if (!str_contains($normalized, '/icons/')) {
            return null;
        }

        return $file;
    }

    private static function innerSvg(string $svg): string
    {
        $svg = preg_replace('/<\?xml[^>]*>/i', '', $svg) ?? $svg;
        $svg = preg_replace('/<!DOCTYPE[^>]*>/i', '', $svg) ?? $svg;
        $svg = preg_replace('/<svg\b[^>]*>/i', '', $svg) ?? $svg;
        $svg = preg_replace('/<\/svg>\s*$/i', '', $svg) ?? $svg;

        return trim(preg_replace('/\s+/', ' ', $svg) ?? $svg);
    }

    private static function storageDir(): ?string
    {
        $uploads = wp_upload_dir();
        if (!empty($uploads['error']) || empty($uploads['basedir'])) {
            return null;
        }

        $dir = trailingslashit($uploads['basedir']) . 'wp-icons';
        if (!wp_mkdir_p($dir)) {
            return null;
        }

        $index = $dir . '/index.php';
        if (!is_file($index)) {
            file_put_contents($index, "<?php\n// Silence is golden.\n");
        }

        return $dir;
    }
}
