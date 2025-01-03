<?php
/*
Plugin Name: Lucide Icons
Description: Adds Lucide icons support to the Flatsome theme using shortcodes.
Version: 1.0
Author: Kim Lukas Myrvold
License: GPLv2 or later
*/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Enqueue Lucide library
function lucide_icons_enqueue()
{
    wp_enqueue_script(
        'lucide-icons',
        'https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.min.js',
        [],
        null,
        true
    );
    wp_add_inline_script(
        'lucide-icons',
        'document.addEventListener("DOMContentLoaded", function() { lucide.createIcons(); });'
    );
}
add_action('wp_enqueue_scripts', 'lucide_icons_enqueue');

// Shortcode to render Lucide icons
function lucide_icon_shortcode($atts)
{
    $atts = shortcode_atts(
        [
            'name' => 'circle',
            'size' => '24',
            'color' => '#000000',
            'width' => '2',
        ],
        $atts,
        'lucide_icon'
    );

    $icon_name = esc_attr($atts['name']);
    $size = esc_attr($atts['size']);
    $color = esc_attr($atts['color']);
    $stroke_width = esc_attr($atts['width']);

    return "<svg data-lucide='{$icon_name}' width='{$size}' height='{$size}' stroke='{$color}' fill='none' stroke-width='{$stroke_width}' stroke-linecap='round' stroke-linejoin='round'></svg>";
}
add_shortcode('lucide_icon', 'lucide_icon_shortcode');


function lucide_icons_enqueue_admin($hook)
{
    if ($hook === 'post.php' || $hook === 'post-new.php') {
        wp_enqueue_script(
            'lucide-icons',
            'https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.min.js',
            [],
            null,
            true
        );
        wp_enqueue_script('my-tinymce-plugin', plugin_dir_url(__FILE__) . 'js/lucide-icons.js', ['jquery'], '1.0', true);
        wp_enqueue_style('my-tinymce-style', plugin_dir_url(__FILE__) . 'css/main.css');
    }
}
add_action('admin_enqueue_scripts', 'lucide_icons_enqueue_admin');



function lucide_icons_tinymce_plugins($plugins)
{
    $plugins['lucideicons'] = plugin_dir_url(__FILE__) . 'js/lucide-icons.js';
    return $plugins;
}
add_filter('mce_external_plugins', 'lucide_icons_tinymce_plugins');

function lucide_icons_tinymce_buttons($buttons)
{
    $buttons[] = 'lucideicons';
    return $buttons;
}
add_filter('mce_buttons', 'lucide_icons_tinymce_buttons');
