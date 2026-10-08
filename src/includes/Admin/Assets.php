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
    }

    public function enqueueFront(): void
    {
        $lucide = $this->lucideScript();

        wp_enqueue_script(
            'wpicons',
            $lucide['url'],
            [],
            $lucide['ver'],
            true
        );
        wp_add_inline_script('wpicons', 'document.addEventListener("DOMContentLoaded", function() { lucide.createIcons(); });');
    }

    public function enqueueAdmin(string $hook): void
    {
        if ($this->shouldEnqueueAdminStyle($hook)) {
            $adminStyle = 'css/wpicons.css';
            wp_enqueue_style(
                'wpicons_admin_style',
                $this->assetUrl($adminStyle),
                [],
                $this->assetVersion($adminStyle)
            );
        }

        if (!$this->isEditorScreen($hook)) {
            return;
        }

        $lucide = $this->lucideScript();
        $fuse = 'js/lib/fuse.min.js';
        $adminScript = 'js/lucide-icons.js';

        wp_enqueue_script(
            'wpicons',
            $lucide['url'],
            [],
            $lucide['ver'],
            true
        );

        wp_enqueue_script(
            'fuse_script',
            $this->assetUrl($fuse),
            [],
            $this->assetVersion($fuse),
            true
        );

        wp_enqueue_script(
            'wpicons_admin_script',
            $this->assetUrl($adminScript),
            ['jquery', 'wpicons', 'fuse_script'],
            $this->assetVersion($adminScript),
            true
        );

        wp_localize_script('wpicons_admin_script', 'WPIcons', [
            'pluginUrl' => WP_ICONS__URL,
            'html' => $this->templates->render('dropdown', $this->dropdownContext()),
        ]);
    }

    private function isPluginSettingsPage(string $hook): bool
    {
        return $hook === 'settings_page_' . Settings::PAGE;
    }

    private function isEditorScreen(string $hook): bool
    {
        $hooks = [
            'post.php',
            'post-new.php',
            'site-editor.php',
            'widgets.php',
            'customize.php',
            'comment.php',
        ];

        return in_array($hook, $hooks, true) || str_contains($hook, 'uxbuilder');
    }

    private function shouldEnqueueAdminStyle(string $hook): bool
    {
        return $this->isPluginSettingsPage($hook) || $this->isEditorScreen($hook);
    }

    public function dropdownContext(): array
    {
        return [
            'title_wp' => 'WP',
            'title_accent' => 'Lucide',
            'title_icons' => 'Icons',
            'search_label' => __('Search all lucide.dev icons', 'wpicons'),
            'search_placeholder' => __('Search icons', 'wpicons'),
            'options_label' => __('Options', 'wpicons'),
            'stroke_width_label' => __('Stroke width', 'wpicons'),
            'stroke_width_value' => '2px',
            'size_label' => __('Size', 'wpicons'),
            'size_value' => '24px',
            'add_icon_label' => __('Add Lucide Icon', 'wpicons'),
        ];
    }

    /**
     * @return array{url: string, ver: string|false|null}
     */
    private function lucideScript(): array
    {
        $settings = Settings::get();
        $relative = 'js/lib/lucide.min.js';
        $bundled = [
            'url' => $this->assetUrl($relative),
            'ver' => $this->assetVersion($relative),
        ];

        if ($settings['source'] !== 'cdn') {
            return $bundled;
        }

        $version = $settings['cdn_version'];
        if ($version !== 'latest' && !preg_match('/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/', $version)) {
            return $bundled;
        }

        return [
            'url' => 'https://cdn.jsdelivr.net/npm/lucide@' . rawurlencode($version) . '/dist/umd/lucide.min.js',
            'ver' => $version === 'latest' ? null : $version,
        ];
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
