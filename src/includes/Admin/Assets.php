<?php

namespace WPIcons\Admin;

use WPIcons\Template\Template;

if (!\defined('ABSPATH')) {
    exit;
}

class Assets
{
    public function __construct(protected Template $templates)
    {
        $this->templates = $templates;
    }

    public function register(): void
    {
        add_action('wp_enqueue_scripts', [$this, 'enqueueFront']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueAdmin']);
        add_action('enqueue_block_editor_assets', [$this, 'enqueueEditor']);
    }

    public function enqueueFront(): void
    {
        $this->enqueueWpiconsStyle('wpicons');
    }

    public function enqueueAdmin(string $hook): void
    {
        if ($this->shouldEnqueueAdminStyle($hook)) {
            $this->enqueueWpiconsStyle('wpicons_admin_style');
        }

        if ($hook !== 'toplevel_page_' . Menu::SLUG) {
            return;
        }

        wp_enqueue_style('wp-components');

        $script = WP_ICONS__PATH . 'build/admin/library/index.js';
        $asset = WP_ICONS__PATH . 'build/admin/library/index.asset.php';
        $deps = ['wp-element', 'wp-api-fetch', 'wp-components', 'wp-i18n'];
        $version = WP_ICONS__VERSION;

        if (is_readable($asset)) {
            $meta = require $asset;
            if (\is_array($meta)) {
                $deps = $meta['dependencies'] ?? $deps;
                $version = $meta['version'] ?? $version;
            }
        }

        if (!is_readable($script)) {
            return;
        }

        wp_enqueue_script(
            'wpicons-admin-library',
            WP_ICONS__URL . 'build/admin/library/index.js',
            $deps,
            $version,
            true
        );

        wp_localize_script('wpicons-admin-library', 'WPIconsAdmin', $this->editorConfig());
    }

    public function enqueueEditor(): void
    {
        $this->enqueueWpiconsStyle('wpicons_editor_style');

        $config = 'window.WPIconsAdmin = window.WPIconsAdmin || ' . wp_json_encode($this->editorConfig()) . ';';
        wp_register_script('wpicons-admin-config', false, [], WP_ICONS__VERSION, true);
        wp_enqueue_script('wpicons-admin-config');
        wp_add_inline_script('wpicons-admin-config', $config, 'after');
        wp_add_inline_script('wpicons-icon-editor-script', $config, 'before');
    }

    /**
     * @return array<string, mixed>
     */
    private function editorConfig(): array
    {
        $settings = Settings::get();

        return [
            'restUrl' => rest_url('wpicons/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'defaults' => [
                'library' => $settings['default_library'],
                'size' => $settings['default_size'],
                'color' => $settings['default_color'],
                'stroke' => $settings['default_stroke'],
            ],
        ];
    }

    private function enqueueWpiconsStyle(string $handle): void
    {
        $relative = 'css/wpicons.css';
        wp_enqueue_style(
            $handle,
            $this->assetUrl($relative),
            [],
            $this->assetVersion($relative)
        );
    }

    private function isPluginSettingsPage(string $hook): bool
    {
        return $hook === 'wp-icons_page_' . Settings::PAGE;
    }

    private function shouldEnqueueAdminStyle(string $hook): bool
    {
        return $this->isPluginSettingsPage($hook) || $hook === 'toplevel_page_' . Menu::SLUG;
    }

    private function assetUrl(string $relative): string
    {
        return WP_ICONS__URL . 'src/assets/' . ltrim($relative, '/');
    }

    private function assetPath(string $relative): string
    {
        return WP_ICONS__PATH . 'src/assets/' . ltrim($relative, '/');
    }

    private function assetVersion(string $relative): string
    {
        $path = $this->assetPath($relative);

        if (!file_exists($path)) {
            return WP_ICONS__VERSION;
        }

        return date('ymd-Gis', filemtime($path));
    }
}
