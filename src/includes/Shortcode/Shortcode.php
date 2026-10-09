<?php

namespace WPIcons\Shortcode;

use WPIcons\Admin\Settings;
use WPIcons\Icons\Renderer;

if (!\defined('ABSPATH')) {
    exit;
}

class Shortcode
{
    public function register(): void
    {
        add_shortcode('wp_icon', [$this, 'render']);
        add_shortcode('lucide_icon', [$this, 'renderLucideAlias']);
    }

    /**
     * @param array|string $atts
     */
    public function render($atts): string
    {
        $defaults = Settings::get();
        $atts = shortcode_atts(
            [
                'library' => $defaults['default_library'],
                'name' => 'circle',
                'size' => (string) $defaults['default_size'],
                'color' => $defaults['default_color'],
                'stroke' => (string) $defaults['default_stroke'],
                'width' => '',
                'class' => '',
                'title' => '',
            ],
            \is_array($atts) ? $atts : [],
            'wp_icon'
        );

        $stroke = $atts['stroke'] !== '' ? $atts['stroke'] : ($atts['width'] !== '' ? $atts['width'] : $defaults['default_stroke']);

        return (new Renderer())->fromAttributes([
            'library' => $atts['library'],
            'name' => $atts['name'],
            'size' => $atts['size'],
            'color' => $atts['color'],
            'stroke' => $stroke,
            'class' => $atts['class'],
            'title' => $atts['title'],
        ]);
    }

    /**
     * @param array|string $atts
     */
    public function renderLucideAlias($atts): string
    {
        $atts = \is_array($atts) ? $atts : [];
        $atts['library'] = 'lucide';

        return $this->render($atts);
    }
}
