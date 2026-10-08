<?php

namespace WPIcons\Admin;

use WPIcons\Icons\LucideIcon;
use WPIcons\Template\Template;

if (!defined('ABSPATH')) {
    exit;
}

class Settings
{
    public const OPTION = 'wp_icons__settings';
    public const PAGE = 'wp-icons';
    public const GROUP = 'wp_icons';

    private Template $templates;

    public function __construct(Template $templates)
    {
        $this->templates = $templates;
    }

    public function register(): void
    {
        add_action('admin_menu', [$this, 'addPage']);
        add_action('admin_init', [$this, 'registerSetting']);
        add_filter(
            'plugin_action_links_' . plugin_basename(WP_ICONS__FILE),
            [$this, 'pluginLinks']
        );
    }

    /**
     * @return array{source: string, cdn_version: string}
     */
    public static function get(): array
    {
        $defaults = [
            'source' => 'plugin',
            'cdn_version' => 'latest',
        ];

        $stored = get_option(self::OPTION, []);
        if (!\is_array($stored)) {
            return $defaults;
        }

        return [...$defaults, ...$stored];
    }

    public function addPage(): void
    {
        add_options_page(
            __('WP Icons', 'wp-icons'),
            __('WP Icons', 'wp-icons'),
            'manage_options',
            self::PAGE,
            [$this, 'renderPage']
        );
    }

    public function registerSetting(): void
    {
        register_setting(self::GROUP, self::OPTION, [
            'type' => 'array',
            'sanitize_callback' => [$this, 'sanitize'],
            'default' => [
                'source' => 'plugin',
                'cdn_version' => 'latest',
            ],
        ]);
    }

    /**
     * @param mixed $input
     * @return array{source: string, cdn_version: string}
     */
    public function sanitize($input): array
    {
        $current = self::get();
        $source = (\is_array($input) && isset($input['source']) && $input['source'] === 'cdn')
            ? 'cdn'
            : 'plugin';

        $version = \is_array($input) && isset($input['cdn_version'])
            ? trim((string) $input['cdn_version'])
            : $current['cdn_version'];

        if ($version !== 'latest' && !preg_match('/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/', $version)) {
            add_settings_error(
                self::OPTION,
                'wp_icons_invalid_version',
                __('CDN version must be “latest” or a valid Lucide semver (for example 0.468.0).', 'wpicons')
            );
            $version = $current['cdn_version'];
        }

        return [
            'source' => $source,
            'cdn_version' => $version,
        ];
    }

    /**
     * @param array<int, string> $links
     * @return array<int, string>
     */
    public function pluginLinks(array $links): array
    {
        $url = admin_url('options-general.php?page=' . self::PAGE);
        array_unshift(
            $links,
            '<a href="' . esc_url($url) . '">' . esc_html__('Settings', 'wpicons') . '</a>'
        );

        return $links;
    }

    public function renderPage(): void
    {
        if (!current_user_can('manage_options')) {
            return;
        }

        $versions = $this->cdnVersions();

        echo $this->templates->render('admin/settings', [
            'settings' => self::get(),
            'option_name' => self::OPTION,
            'group' => self::GROUP,
            'bundled_version' => LucideIcon::BUNDLED_VERSION,
            'cdn_versions' => $versions,
            'versions_fetch_failed' => $versions === [],
        ]);
    }

    /**
     * Stable lucide versions from npm, newest first.
     *
     * @return array<int, string>
     */
    private function cdnVersions(): array
    {
        $cached = get_transient('wp_icons__npm_versions');
        if (\is_array($cached)) {
            return $cached;
        }

        $response = wp_remote_get('https://registry.npmjs.org/lucide', [
            'timeout' => 10,
        ]);

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
        set_transient('wp_icons__npm_versions', $versions, 12 * HOUR_IN_SECONDS);

        return $versions;
    }
}
