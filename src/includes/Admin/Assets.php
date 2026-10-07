<?php

namespace WpLucideIcons\Admin;

use WpLucideIcons\Template\Template;

if (!defined('ABSPATH')) {
    exit;
}

class Assets
{
    private Template $templates;

    public function __construct(Template $templates)
    {
        $this->templates = $templates;
    }

    public function register(): void
    {
        add_action('wp_enqueue_scripts', array($this, 'enqueueFront'));
        add_action('admin_enqueue_scripts', array($this, 'enqueueAdmin'));
    }

    public function enqueueFront(): void
    {
        $lucide = $this->lucideScript();
        $style = 'css/main.css';

        wp_enqueue_script(
            'lucideicons',
            $lucide['url'],
            array(),
            $lucide['ver'],
            true
        );
        wp_add_inline_script('lucideicons', 'document.addEventListener("DOMContentLoaded", function() { lucide.createIcons(); });');

        wp_enqueue_style(
            'lucideicons_style',
            $this->assetUrl($style),
            array(),
            $this->assetVersion($style)
        );
    }

    public function enqueueAdmin(string $hook): void
    {
        if ($hook !== 'post.php' && $hook !== 'post-new.php') {
            return;
        }

        $lucide = $this->lucideScript();
        $fuse = 'js/lib/fuse.min.js';
        $adminScript = 'js/lucide-icons.js';
        $adminStyle = 'css/main-admin.css';

        wp_enqueue_script(
            'lucideicons',
            $lucide['url'],
            array(),
            $lucide['ver'],
            true
        );

        wp_enqueue_script(
            'fuse_script',
            $this->assetUrl($fuse),
            array(),
            $this->assetVersion($fuse),
            true
        );

        wp_enqueue_script(
            'lucideicons_admin_script',
            $this->assetUrl($adminScript),
            array('jquery', 'lucideicons', 'fuse_script'),
            $this->assetVersion($adminScript),
            true
        );

        wp_localize_script('lucideicons_admin_script', 'wpLucideIcons', array(
            'pluginUrl' => WP_LUCIDE_ICONS_URL,
            'html' => $this->templates->render('dropdown', $this->dropdownContext()),
        ));

        wp_enqueue_style(
            'lucideicons_admin_style',
            $this->assetUrl($adminStyle),
            array(),
            $this->assetVersion($adminStyle)
        );
    }

    public function dropdownContext(): array
    {
        return array(
            'title_wp' => 'WP',
            'title_accent' => 'Lucide',
            'title_icons' => 'Icons',
            'search_label' => __('Search all lucide.dev icons', 'wp-lucide-icons'),
            'search_placeholder' => __('Search icons', 'wp-lucide-icons'),
            'options_label' => __('Options', 'wp-lucide-icons'),
            'stroke_width_label' => __('Stroke width', 'wp-lucide-icons'),
            'stroke_width_value' => '2px',
            'size_label' => __('Size', 'wp-lucide-icons'),
            'size_value' => '24px',
            'add_icon_label' => __('Add Lucide Icon', 'wp-lucide-icons'),
        );
    }

    /**
     * @return array{url: string, ver: string|false|null}
     */
    private function lucideScript(): array
    {
        $settings = Settings::get();
        $relative = 'js/lib/lucide.min.js';
        $bundled = array(
            'url' => $this->assetUrl($relative),
            'ver' => $this->assetVersion($relative),
        );

        if ($settings['source'] !== 'cdn') {
            return $bundled;
        }

        $version = $settings['cdn_version'];
        if ($version !== 'latest' && !preg_match('/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/', $version)) {
            return $bundled;
        }

        return array(
            'url' => 'https://cdn.jsdelivr.net/npm/lucide@' . rawurlencode($version) . '/dist/umd/lucide.min.js',
            'ver' => $version === 'latest' ? null : $version,
        );
    }

    private function assetUrl(string $relative): string
    {
        return WP_LUCIDE_ICONS_URL . 'src/assets/' . ltrim($relative, '/');
    }

    private function assetPath(string $relative): string
    {
        return WP_LUCIDE_ICONS_PATH . 'src/assets/' . ltrim($relative, '/');
    }

    private function assetVersion(string $relative): string
    {
        $path = $this->assetPath($relative);

        if (!file_exists($path)) {
            return WP_LUCIDE_ICONS_VERSION;
        }

        return date('ymd-Gis', filemtime($path));
    }
}
