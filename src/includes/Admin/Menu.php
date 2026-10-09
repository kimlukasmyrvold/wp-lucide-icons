<?php

namespace WPIcons\Admin;

use WPIcons\Template\Template;

if (!\defined('ABSPATH')) {
    exit;
}

class Menu
{
    public const SLUG = 'wp-icons';

    public function __construct(
        private Template $templates,
        private Settings $settings,
        private LibraryPage $library,
    ) {
    }

    public function register(): void
    {
        add_action('admin_menu', [$this, 'addPages']);
    }

    public function addPages(): void
    {
        add_menu_page(
            __('WP Icons', 'wpicons'),
            __('WP Icons', 'wpicons'),
            'manage_options',
            self::SLUG,
            [$this->library, 'renderPage'],
            'dashicons-star-filled',
            58
        );

        add_submenu_page(
            self::SLUG,
            __('Icon Library', 'wpicons'),
            __('Library', 'wpicons'),
            'manage_options',
            self::SLUG,
            [$this->library, 'renderPage']
        );

        add_submenu_page(
            self::SLUG,
            __('WP Icons Settings', 'wpicons'),
            __('Settings', 'wpicons'),
            'manage_options',
            Settings::PAGE,
            [$this->settings, 'renderPage']
        );
    }
}
