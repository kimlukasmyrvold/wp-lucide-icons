<?php

namespace WpLucideIcons;

use WpLucideIcons\Admin\Assets;
use WpLucideIcons\Admin\Settings;
use WpLucideIcons\Admin\TinyMce;
use WpLucideIcons\Shortcode\Shortcode;
use WpLucideIcons\Template\Template;

if (!defined('ABSPATH')) {
    exit;
}

class Plugin
{
    private static ?self $instance = null;

    private Template $templates;

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function __construct()
    {
        $this->templates = new Template();
    }

    public function init(): void
    {
        load_plugin_textdomain(
            'wp-lucide-icons',
            false,
            dirname(plugin_basename(WP_LUCIDE_ICONS_FILE)) . '/languages'
        );

        (new Assets($this->templates))->register();
        (new Settings($this->templates))->register();
        (new Shortcode())->register();
        (new TinyMce())->register();
    }

    public function templates(): Template
    {
        return $this->templates;
    }
}
