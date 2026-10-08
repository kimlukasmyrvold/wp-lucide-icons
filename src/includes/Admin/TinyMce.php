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
    }

    public function registerPlugin(array $plugins): array
    {
        $plugins['lucideicons'] = WP_ICONS__URL . 'src/assets/js/lucide-icons.js';

        return $plugins;
    }

    public function registerButton(array $buttons): array
    {
        $buttons[] = 'lucideicons';

        return $buttons;
    }
}
