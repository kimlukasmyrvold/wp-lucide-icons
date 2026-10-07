<?php

if (!defined('ABSPATH')) {
    exit;
}

/** @var array{source: string, cdn_version: string} $settings */
/** @var string $option_name */
/** @var string $group */
/** @var string $bundled_version */
/** @var array<int, string> $cdn_versions */
/** @var bool $versions_fetch_failed */

$source = $settings['source'];
$cdn_version = $settings['cdn_version'];
$select_id = $option_name . '_cdn_version';

if (!in_array($cdn_version, $cdn_versions, true) && $cdn_version !== 'latest' && $cdn_version !== '') {
    $cdn_versions = array_merge(array($cdn_version), $cdn_versions);
}

?>
<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    <?php settings_errors(); ?>

    <form action="options.php" method="post">
        <?php settings_fields($group); ?>

        <table class="form-table" role="presentation">
            <tr>
                <th scope="row"><?php esc_html_e('Lucide source', 'wp-lucide-icons'); ?></th>
                <td>
                    <fieldset>
                        <legend class="screen-reader-text"><?php esc_html_e('Lucide source', 'wp-lucide-icons'); ?></legend>
                        <label>
                            <input type="radio" name="<?php echo esc_attr($option_name); ?>[source]" value="plugin" <?php checked($source, 'plugin'); ?>>
                            <?php esc_html_e('Plugin (bundled)', 'wp-lucide-icons'); ?>
                        </label>
                        <br>
                        <label>
                            <input type="radio" name="<?php echo esc_attr($option_name); ?>[source]" value="cdn" <?php checked($source, 'cdn'); ?>>
                            <?php esc_html_e('CDN (jsDelivr)', 'wp-lucide-icons'); ?>
                        </label>
                        <p class="description">
                            <?php
                            echo esc_html(sprintf(
                                /* translators: %s: bundled Lucide version */
                                __('Bundled icons ship with the plugin (currently Lucide %s). CDN loads lucide.js from jsDelivr instead.', 'wp-lucide-icons'),
                                $bundled_version
                            ));
                            ?>
                        </p>
                    </fieldset>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="<?php echo esc_attr($select_id); ?>"><?php esc_html_e('CDN version', 'wp-lucide-icons'); ?></label>
                </th>
                <td>
                    <?php if (!$versions_fetch_failed) : ?>
                        <select id="<?php echo esc_attr($select_id); ?>" name="<?php echo esc_attr($option_name); ?>[cdn_version]" <?php disabled($source, 'plugin'); ?>>
                            <option value="latest" <?php selected($cdn_version, 'latest'); ?>><?php esc_html_e('latest', 'wp-lucide-icons'); ?></option>
                            <?php foreach ($cdn_versions as $version) : ?>
                                <option value="<?php echo esc_attr($version); ?>" <?php selected($cdn_version, $version); ?>>
                                    <?php echo esc_html($version); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    <?php else : ?>
                        <input id="<?php echo esc_attr($select_id); ?>" name="<?php echo esc_attr($option_name); ?>[cdn_version]" type="text" class="regular-text" value="<?php echo esc_attr($cdn_version); ?>" <?php disabled($source, 'plugin'); ?>>
                        <p class="description"><?php esc_html_e('Could not load versions from npm. Enter “latest” or a Lucide version such as 0.468.0.', 'wp-lucide-icons'); ?></p>
                    <?php endif; ?>
                    <p class="description"><?php esc_html_e('Used only when the CDN source is selected.', 'wp-lucide-icons'); ?></p>
                </td>
            </tr>
        </table>

        <?php submit_button(); ?>
    </form>
</div>
<script>
(function () {
    var radios = document.querySelectorAll('input[name="<?php echo esc_js($option_name); ?>[source]"]');
    var version = document.getElementById(<?php echo wp_json_encode($select_id); ?>);
    if (!version || !radios.length) return;
    function sync() {
        var cdn = Array.prototype.some.call(radios, function (radio) {
            return radio.checked && radio.value === 'cdn';
        });
        version.disabled = !cdn;
    }
    Array.prototype.forEach.call(radios, function (radio) {
        radio.addEventListener('change', sync);
    });
    sync();
})();
</script>
