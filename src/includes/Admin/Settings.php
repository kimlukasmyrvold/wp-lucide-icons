<?php

namespace WpLucideIcons\Admin;

use WpLucideIcons\Icons\LucideIcon;
use WpLucideIcons\Template\Template;

if (!defined('ABSPATH')) {
    exit;
}

class Settings
{
    public const OPTION = 'wp_lucide_icons_settings';
    public const PAGE = 'wp-lucide-icons';
    public const GROUP = 'wp_lucide_icons';

    private Template $templates;

    public function __construct(Template $templates)
    {
        $this->templates = $templates;
    }

    public function register(): void
    {
        add_action('admin_menu', array($this, 'addPage'));
        add_action('admin_init', array($this, 'registerSetting'));
        add_filter(
            'plugin_action_links_' . plugin_basename(WP_LUCIDE_ICONS_FILE),
            array($this, 'pluginLinks')
        );
    }

    /**
     * @return array{source: string, cdn_version: string}
     */
    public static function get(): array
    {
        $defaults = array(
            'source' => 'plugin',
            'cdn_version' => 'latest',
        );

        $stored = get_option(self::OPTION, array());
        if (!is_array($stored)) {
            return $defaults;
        }

        return array_merge($defaults, $stored);
    }

    public function addPage(): void
    {
        add_options_page(
            __('Lucide Icons', 'wp-lucide-icons'),
            __('Lucide Icons', 'wp-lucide-icons'),
            'manage_options',
            self::PAGE,
            array($this, 'renderPage')
        );
    }

    public function registerSetting(): void
    {
        register_setting(self::GROUP, self::OPTION, array(
            'type' => 'array',
            'sanitize_callback' => array($this, 'sanitize'),
            'default' => array(
                'source' => 'plugin',
                'cdn_version' => 'latest',
            ),
        ));
    }

    /**
     * @param mixed $input
     * @return array{source: string, cdn_version: string}
     */
    public function sanitize($input): array
    {
        $current = self::get();
        $source = (is_array($input) && isset($input['source']) && $input['source'] === 'cdn')
            ? 'cdn'
            : 'plugin';

        $version = is_array($input) && isset($input['cdn_version'])
            ? trim((string) $input['cdn_version'])
            : $current['cdn_version'];

        if ($version !== 'latest' && !preg_match('/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/', $version)) {
            add_settings_error(
                self::OPTION,
                'wp_lucide_icons_invalid_version',
                __('CDN version must be “latest” or a valid Lucide semver (for example 0.468.0).', 'wp-lucide-icons')
            );
            $version = $current['cdn_version'];
        }

        return array(
            'source' => $source,
            'cdn_version' => $version,
        );
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
            '<a href="' . esc_url($url) . '">' . esc_html__('Settings', 'wp-lucide-icons') . '</a>'
        );

        return $links;
    }

    public function renderPage(): void
    {
        if (!current_user_can('manage_options')) {
            return;
        }

        $versions = $this->cdnVersions();

        echo $this->templates->render('admin/settings', array(
            'settings' => self::get(),
            'option_name' => self::OPTION,
            'group' => self::GROUP,
            'bundled_version' => LucideIcon::BUNDLED_VERSION,
            'cdn_versions' => $versions,
            'versions_fetch_failed' => $versions === array(),
        ));
    }

    /**
     * Stable lucide versions from npm, newest first.
     *
     * @return array<int, string>
     */
    private function cdnVersions(): array
    {
        $cached = get_transient('wp_lucide_icons_npm_versions');
        if (is_array($cached)) {
            return $cached;
        }

        $response = wp_remote_get('https://registry.npmjs.org/lucide', array(
            'timeout' => 10,
        ));

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return array();
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (!is_array($body) || !isset($body['versions']) || !is_array($body['versions'])) {
            return array();
        }

        $versions = array_values(array_filter(
            array_keys($body['versions']),
            static function ($version) {
                return is_string($version) && preg_match('/^\d+\.\d+\.\d+$/', $version);
            }
        ));

        usort($versions, static function ($a, $b) {
            return version_compare($b, $a);
        });

        $versions = array_slice($versions, 0, 50);
        set_transient('wp_lucide_icons_npm_versions', $versions, 12 * HOUR_IN_SECONDS);

        return $versions;
    }
}
