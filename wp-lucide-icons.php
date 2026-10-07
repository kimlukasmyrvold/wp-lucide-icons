<?php
/*
Plugin Name: Lucide Icons
Description: Adds Lucide icons support to the Flatsome theme using shortcodes.
Version: 1.3.1
Author: Kim Lukas Myrvold
License: GPLv2 or later
Requires at least: 5.5
Requires PHP: 8.1
Text Domain: wp-lucide-icons
*/

if (!defined('ABSPATH')) {
    exit;
}

define('WP_LUCIDE_ICONS_VERSION', '1.3.1');
define('WP_LUCIDE_ICONS_FILE', __FILE__);
define('WP_LUCIDE_ICONS_PATH', plugin_dir_path(__FILE__));
define('WP_LUCIDE_ICONS_URL', plugin_dir_url(__FILE__));
define('WP_LUCIDE_ICONS_MIN_PHP', '8.1');
define('WP_LUCIDE_ICONS_MIN_WP', '5.5');

/**
 * Whether the current PHP and WordPress versions meet plugin requirements.
 *
 * Kept PHP 5.6-safe so a too-old runtime can still show the activation error.
 *
 * @return bool
 */
function wp_lucide_icons_compatible()
{
    if (version_compare(PHP_VERSION, WP_LUCIDE_ICONS_MIN_PHP, '<')) {
        return false;
    }

    global $wp_version;
    if (isset($wp_version) && version_compare($wp_version, WP_LUCIDE_ICONS_MIN_WP, '<')) {
        return false;
    }

    return true;
}

/**
 * Human-readable incompatibility message.
 *
 * @return string
 */
function wp_lucide_icons_incompatible_message()
{
    global $wp_version;

    $wp = isset($wp_version) ? $wp_version : 'unknown';

    return sprintf(
        'Lucide Icons requires PHP %1$s or higher and WordPress %2$s or higher. You are running PHP %3$s and WordPress %4$s.',
        WP_LUCIDE_ICONS_MIN_PHP,
        WP_LUCIDE_ICONS_MIN_WP,
        PHP_VERSION,
        $wp
    );
}

/**
 * Admin notice when the environment is too old.
 *
 * @return void
 */
function wp_lucide_icons_incompatible_notice()
{
    echo '<div class="notice notice-error"><p>' . esc_html(wp_lucide_icons_incompatible_message()) . '</p></div>';
}

/**
 * Deactivate on activation if PHP or WordPress is too old.
 *
 * @return void
 */
function wp_lucide_icons_activation()
{
    if (wp_lucide_icons_compatible()) {
        return;
    }

    deactivate_plugins(plugin_basename(WP_LUCIDE_ICONS_FILE));

    wp_die(
        esc_html(wp_lucide_icons_incompatible_message()),
        'Plugin Activation Error',
        array('back_link' => true)
    );
}

register_activation_hook(__FILE__, 'wp_lucide_icons_activation');

if (!wp_lucide_icons_compatible()) {
    add_action('admin_notices', 'wp_lucide_icons_incompatible_notice');
    return;
}

require_once WP_LUCIDE_ICONS_PATH . 'bootstrap.php';
