<?php

namespace WPIcons;

use WPIcons\Admin\Assets;
use WPIcons\Admin\Settings;
use WPIcons\Admin\TinyMce;
use WPIcons\Shortcode\Shortcode;
use WPIcons\Template\Template;

if (!\defined('ABSPATH')) {
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
            'wpicons',
            false,
            dirname(plugin_basename(WP_ICONS__FILE)) . '/languages'
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
