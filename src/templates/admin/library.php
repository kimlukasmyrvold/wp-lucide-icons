<?php

if (!defined('ABSPATH')) {
    exit;
}

?>
<div class="wpicons wpicons--admin" theme="light">
    <div class="wpicons__library">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <p><?php esc_html_e('Browse bundled icon libraries, preview customization, and copy a shortcode. In the block editor, insert the Icon block to place an icon on a page.', 'wpicons'); ?></p>
        <div id="wpicons-library-root" class="wpicons__library__root"></div>
    </div>
</div>
