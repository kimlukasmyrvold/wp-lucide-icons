<?php

namespace WPIcons\Admin;

if (!\defined('ABSPATH')) {
    exit;
}

class TinyMce
{
    public function register(): void
    {
        add_filter('mce_external_plugins', [$this, 'registerPlugin']);
        add_filter('mce_buttons', [$this, 'registerButton']);
        add_filter('mce_css', [$this, 'editorCss']);
        add_filter('tiny_mce_before_init', [$this, 'beforeInit']);
    }

    /**
     * @param array<string, string> $plugins
     * @return array<string, string>
     */
    public function registerPlugin(array $plugins): array
    {
        $plugins['wpicons'] = WP_ICONS__URL . 'src/assets/js/tinymce/plugin.js?ver=' . WP_ICONS__VERSION;

        return $plugins;
    }

    /**
     * @param array<int, string> $buttons
     * @return array<int, string>
     */
    public function registerButton(array $buttons): array
    {
        $buttons[] = 'wpicons';

        return $buttons;
    }

    public function editorCss(string $css): string
    {
        $path = WP_ICONS__PATH . 'src/assets/css/wpicons.css';
        $url = WP_ICONS__URL . 'src/assets/css/wpicons.css';
        if (is_readable($path)) {
            $url .= '?ver=' . date('ymd-Gis', filemtime($path));
        }

        return $css === '' ? $url : $css . ',' . $url;
    }

    /**
     * @param array<string, mixed> $init
     * @return array<string, mixed>
     */
    public function beforeInit(array $init): array
    {
        $extra = 'img[class|src|alt|title|width|height|style|data-library|data-name|data-color|data-stroke]';
        if (empty($init['extended_valid_elements'])) {
            $init['extended_valid_elements'] = $extra;
        } else {
            $init['extended_valid_elements'] .= ',' . $extra;
        }

        return $init;
    }
}
