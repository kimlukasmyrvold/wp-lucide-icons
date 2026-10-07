<?php

namespace WpLucideIcons\Admin;

if (!defined('ABSPATH')) {
    exit;
}

class TinyMce
{
    public function register(): void
    {
        add_filter('mce_external_plugins', array($this, 'registerPlugin'));
        add_filter('mce_buttons', array($this, 'registerButton'));
    }

    public function registerPlugin(array $plugins): array
    {
        $plugins['lucideicons'] = WP_LUCIDE_ICONS_URL . 'src/assets/js/lucide-icons.js';

        return $plugins;
    }

    public function registerButton(array $buttons): array
    {
        $buttons[] = 'lucideicons';

        return $buttons;
    }
}
