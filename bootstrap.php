<?php

namespace WpLucideIcons;

if (!defined('ABSPATH')) {
    exit;
}

class Bootstrap
{
    public function wp_lucide_icons_missing_vendor_notice()
    {
        echo '<div class="notice notice-error"><p>' . esc_html__('Lucide Icons is missing Composer dependencies. Run composer install in the plugin directory.', 'wp-lucide-icons') . '</p></div>';
    }

    public static function init()
    {
        $autoload = WP_LUCIDE_ICONS_PATH . 'vendor/autoload.php';

        if (!is_readable($autoload)) {
            add_action('admin_notices', array(new self(), 'wp_lucide_icons_missing_vendor_notice'));
            return;
        }

        require_once $autoload;

        add_action('plugins_loaded', static function () {
            Plugin::instance()->init();
        });
    }
}

Bootstrap::init();
