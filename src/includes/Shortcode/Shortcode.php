<?php

namespace WpLucideIcons\Shortcode;

if (!defined('ABSPATH')) {
    exit;
}

class Shortcode
{
    public function register(): void
    {
        add_shortcode('lucide_icon', array($this, 'render'));
    }

    /**
     * @param array|string $atts
     */
    public function render($atts): string
    {
        $atts = shortcode_atts(
            array(
                'name' => 'circle',
                'size' => '24',
                'color' => '#000000',
                'width' => '2',
            ),
            $atts,
            'lucide_icon'
        );

        $icon_name = esc_attr($atts['name']);
        $size = esc_attr($atts['size']);
        $color = esc_attr($atts['color']);
        $stroke_width = esc_attr($atts['width']);

        return "<i data-lucide='{$icon_name}' width='{$size}' height='{$size}' stroke='{$color}' stroke-width='{$stroke_width}'></i>";
    }
}
