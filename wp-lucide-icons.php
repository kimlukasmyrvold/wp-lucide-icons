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
        array(),
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
        array(
            'name' => 'circle',
            'size' => '24',
            'color' => '#000000',
        ),
        $atts,
        'lucide_icon'
    );

    $icon_name = esc_attr($atts['name']);
    $size = esc_attr($atts['size']);
    $color = esc_attr($atts['color']);

    return "<svg data-lucide='{$icon_name}' width='{$size}' height='{$size}' stroke='{$color}' fill='none' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'></svg>";
}
add_shortcode('lucide_icon', 'lucide_icon_shortcode');



// function flatsome_lucide_icon_editor_script($hook)
// {
//     if ($hook === 'post.php' || $hook === 'post-new.php') {
//         wp_enqueue_script('flatsome_lucide_icons', plugin_dir_url(__FILE__) . 'lucide-icons.js', array('jquery'), '1.0', true);
//     }
// }
// add_action('admin_enqueue_scripts', 'flatsome_lucide_icon_editor_script');

// function flatsome_lucide_icon_plugin($plugins)
// {
//     $plugins['lucide-icons'] = plugin_dir_url(__FILE__) . 'lucide-icons.js';
//     return $plugins;
// }
// add_filter('mce_external_plugins', 'flatsome_lucide_icon_plugin');

// function flatsome_lucide_icon_button($buttons)
// {
//     $buttons[] = 'lucide-icons';
//     return $buttons;
// }
// add_filter('mce_buttons', 'flatsome_lucide_icon_button');


function my_enqueue_editor_script($hook)
{
    if ($hook === 'post.php' || $hook === 'post-new.php') {
        wp_enqueue_script('my-tinymce-plugin', plugin_dir_url(__FILE__) . 'js/lucide-icons.js', array('jquery'), '1.0', true);
    }
}
add_action('admin_enqueue_scripts', 'my_enqueue_editor_script');


function my_custom_tinymce_plugin($plugins)
{
    $plugins['lucideicons'] = plugin_dir_url(__FILE__) . 'js/lucide-icons.js';
    return $plugins;
}
add_filter('mce_external_plugins', 'my_custom_tinymce_plugin');

function my_custom_tinymce_button($buttons)
{
    $buttons[] = 'lucideicons';
    return $buttons;
}
add_filter('mce_buttons', 'my_custom_tinymce_button');




// function add_editor_buttons($buttons)
// {
//     var_dump($buttons);
//     $buttons[] = 'styleselect';
//     $buttons[] = 'hr';

//     return $buttons;
// }
// add_filter('mce_buttons_3', 'add_editor_buttons');

// Add UX Builder component for Lucide icons
// function flatsome_lucide_icons_ux_builder_component()
// {
//     if (function_exists('ux_builder_register_element')) {
//         ux_builder_register_element(
//             'lucide_icon',
//             array(
//                 'name' => __('Lucide Icon', 'flatsome-lucide-icons'),
//                 'category' => __('Content', 'flatsome-lucide-icons'),
//                 'options' => array(
//                     'name' => array(
//                         'type' => 'textfield',
//                         'heading' => __('Icon Name', 'flatsome-lucide-icons'),
//                         'default' => 'circle',
//                         'placeholder' => __('e.g., arrow-right', 'flatsome-lucide-icons'),
//                     ),
//                     'size' => array(
//                         'type' => 'slider',
//                         'heading' => __('Icon Size', 'flatsome-lucide-icons'),
//                         'default' => 24,
//                         'min' => 12,
//                         'max' => 128,
//                         'step' => 1,
//                     ),
//                     'color' => array(
//                         'type' => 'colorpicker',
//                         'heading' => __('Icon Color', 'flatsome-lucide-icons'),
//                         'default' => '#000000',
//                     ),
//                 ),
//                 'render' => function ($options) {
//                     $name = esc_attr($options['name']);
//                     $size = esc_attr($options['size']);
//                     $color = esc_attr($options['color']);
//                     return "<svg data-lucide='{$name}' width='{$size}' height='{$size}' stroke='{$color}' fill='none' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'></svg>";
//                 },
//             )
//         );
//     }
// }
// add_action('init', 'flatsome_lucide_icons_ux_builder_component');
