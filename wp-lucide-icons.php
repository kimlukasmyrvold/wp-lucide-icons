<?php
/*
Plugin Name: Lucide Icons
Description: Adds Lucide icons support to the Flatsome theme using shortcodes.
Version: 1.0.3
Author: Kim Lukas Myrvold
License: GPLv2 or later
*/

if (!defined('ABSPATH'))
    exit;


$lucidePath = "https://unpkg.com/lucide@latest";


function lucide_icons_enqueue()
{
    global $lucidePath;
    wp_enqueue_script('lucideicons', $lucidePath, [], null, true);
    wp_add_inline_script('lucideicons', 'document.addEventListener("DOMContentLoaded", function() { lucide.createIcons(); });');

    $lucideicons_style__path = "css/main.css";
    wp_enqueue_style('lucideicons_style', plugin_dir_url(__FILE__) . $lucideicons_style__path, [], date("ymd-Gis", filemtime(plugin_dir_path(__FILE__) . $lucideicons_style__path)));
}
add_action('wp_enqueue_scripts', 'lucide_icons_enqueue');

function lucide_icons_enqueue_admin($hook)
{
    if ($hook === 'post.php' || $hook === 'post-new.php') {
        global $lucidePath;
        wp_enqueue_script('lucideicons', $lucidePath, [], null, true);

        $fuse_script__path = "js/lib/fuse.min.js";
        wp_enqueue_script('fuse_script', plugin_dir_url(__FILE__) . $fuse_script__path, [], date("ymd-Gis", filemtime(plugin_dir_path(__FILE__) . $fuse_script__path)), true);

        $lucideicons_script__path = "js/lucide-icons.js";
        wp_enqueue_script('lucideicons_admin_script', plugin_dir_url(__FILE__) . $lucideicons_script__path, ['jquery'], date("ymd-Gis", filemtime(plugin_dir_path(__FILE__) . $lucideicons_script__path)), true);
        wp_localize_script('lucideicons_admin_script', 'wpLucideIcons', ['ajaxUrl' => plugins_url('html/', __FILE__)]);

        $lucideicons_style__path = "css/main-admin.css";
        wp_enqueue_style('lucideicons_admin_style', plugin_dir_url(__FILE__) . $lucideicons_style__path, [], date("ymd-Gis", filemtime(plugin_dir_path(__FILE__) . $lucideicons_style__path)));
    }
}
add_action('admin_enqueue_scripts', 'lucide_icons_enqueue_admin');



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

    return "<i data-lucide='{$icon_name}' width='{$size}' height='{$size}' stroke='{$color}' stroke-width='{$stroke_width}'></i>";
}
add_shortcode('lucide_icon', 'lucide_icon_shortcode');



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
