<?php

if (!defined('ABSPATH')) {
    exit;
}

/** @var array<string, mixed> $settings */
/** @var string $option_name */
/** @var string $group */
/** @var array<int, array<string, mixed>> $libraries */

$default_library = $settings['default_library'];
$default_size = $settings['default_size'];
$default_color = $settings['default_color'];
$default_stroke = $settings['default_stroke'];

?>
<div class="wpicons" theme="light">
    <div class="wpicons__settings">
        <h1><?= esc_html(get_admin_page_title()); ?></h1>
        <?php settings_errors(); ?>
        <form action="options.php" method="post">
            <?php settings_fields($group); ?>

            <h2><?php esc_html_e('Defaults', 'wpicons'); ?></h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">
                        <label for="wpicons-default-library"><?php esc_html_e('Default library', 'wpicons'); ?></label>
                    </th>
                    <td>
                        <select id="wpicons-default-library" name="<?= esc_attr($option_name); ?>[default_library]">
                            <?php foreach ($libraries as $library): ?>
                                <option value="<?= esc_attr($library['id']); ?>" <?php selected($default_library, $library['id']); ?>>
                                    <?= esc_html($library['label']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="wpicons-default-size"><?php esc_html_e('Default size', 'wpicons'); ?></label>
                    </th>
                    <td>
                        <input id="wpicons-default-size" name="<?= esc_attr($option_name); ?>[default_size]" type="number" min="8" max="256" value="<?= esc_attr((string) $default_size); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="wpicons-default-color"><?php esc_html_e('Default color', 'wpicons'); ?></label>
                    </th>
                    <td>
                        <input id="wpicons-default-color" name="<?= esc_attr($option_name); ?>[default_color]" type="text" value="<?= esc_attr((string) $default_color); ?>">
                        <p class="description"><?php esc_html_e('Use currentColor to inherit text color, or a CSS color.', 'wpicons'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="wpicons-default-stroke"><?php esc_html_e('Default stroke width', 'wpicons'); ?></label>
                    </th>
                    <td>
                        <input id="wpicons-default-stroke" name="<?= esc_attr($option_name); ?>[default_stroke]" type="number" min="0.25" max="4" step="0.25" value="<?= esc_attr((string) $default_stroke); ?>">
                        <p class="description"><?php esc_html_e('Used by stroke-based libraries such as Lucide.', 'wpicons'); ?></p>
                    </td>
                </tr>
            </table>

            <h2><?php esc_html_e('Icon libraries', 'wpicons'); ?></h2>
            <p><?php esc_html_e('Icons are stored in the plugin. Choose CDN only if this plugin has not been updated and you need a newer catalog. CDN catalogs are cached locally and are never fetched during page views.', 'wpicons'); ?></p>

            <?php foreach ($libraries as $library): ?>
                <?php
                $id = $library['id'];
                $source = $library['source'];
                $cdn_version = $library['cdn_version'];
                $versions = $library['cdn_versions'];
                $select_id = "{$option_name}_{$id}_cdn_version";
                $prefix = "{$option_name}[libraries][{$id}]";
                if (!\in_array($cdn_version, $versions, true) && $cdn_version !== 'latest' && $cdn_version !== '') {
                    $versions = [...[$cdn_version], ...$versions];
                }
                ?>
                <div class="wpicons__settings__library" data-library="<?= esc_attr($id); ?>">
                    <h3><?= esc_html($library['label']); ?></h3>
                    <table class="form-table" role="presentation">
                        <tr>
                            <th scope="row"><?php esc_html_e('Enabled', 'wpicons'); ?></th>
                            <td>
                                <label>
                                    <input type="checkbox" name="<?= esc_attr($prefix); ?>[enabled]" value="1" <?php checked($library['enabled']); ?>>
                                    <?php esc_html_e('Show this library in the picker and allow rendering its icons.', 'wpicons'); ?>
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php esc_html_e('Icon source', 'wpicons'); ?></th>
                            <td>
                                <fieldset>
                                    <legend class="screen-reader-text"><?php esc_html_e('Icon source', 'wpicons'); ?></legend>
                                    <label>
                                        <input type="radio" name="<?= esc_attr($prefix); ?>[source]" value="plugin" <?php checked($source, 'plugin'); ?>>
                                        <?php esc_html_e('Plugin (bundled)', 'wpicons'); ?>
                                    </label>
                                    <br>
                                    <label>
                                        <input type="radio" name="<?= esc_attr($prefix); ?>[source]" value="cdn" <?php checked($source, 'cdn'); ?>>
                                        <?php esc_html_e('CDN (jsDelivr / npm, cached)', 'wpicons'); ?>
                                    </label>
                                    <p class="description">
                                        <?= esc_html(sprintf(
                                            /* translators: 1: npm package, 2: bundled version */
                                            __('Bundled catalog is %1$s %2$s. CDN downloads a newer package in the background and stores it on this site.', 'wpicons'),
                                            $library['package'],
                                            $library['bundled_version']
                                        )); ?>
                                    </p>
                                </fieldset>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="<?= esc_attr($select_id); ?>"><?php esc_html_e('CDN version', 'wpicons'); ?></label>
                            </th>
                            <td>
                                <?php if ($versions !== []): ?>
                                    <select class="wpicons__cdn-version" id="<?= esc_attr($select_id); ?>" name="<?= esc_attr($prefix); ?>[cdn_version]" <?php disabled($source, 'plugin'); ?>>
                                        <option value="latest" <?php selected($cdn_version, 'latest'); ?>>
                                            <?php esc_html_e('latest', 'wpicons'); ?>
                                        </option>
                                        <?php foreach ($versions as $version): ?>
                                            <option value="<?= esc_attr($version); ?>" <?php selected($cdn_version, $version); ?>>
                                                <?= esc_html($version); ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                <?php else: ?>
                                    <input class="wpicons__cdn-version" id="<?= esc_attr($select_id); ?>" name="<?= esc_attr($prefix); ?>[cdn_version]" type="text" value="<?= esc_attr($cdn_version); ?>" <?php disabled($source, 'plugin'); ?>>
                                    <p class="description"><?php esc_html_e('Could not load versions from npm. Enter “latest” or a semver such as 0.468.0.', 'wpicons'); ?></p>
                                <?php endif; ?>
                                <?php if ($library['cached_version']): ?>
                                    <p class="description">
                                        <?= esc_html(sprintf(
                                            /* translators: 1: cached version, 2: icon count, 3: date */
                                            __('Cached CDN catalog: %1$s (%2$d icons)%3$s.', 'wpicons'),
                                            $library['cached_version'],
                                            (int) $library['cached_count'],
                                            $library['cached_at']
                                                ? ' — ' . wp_date(get_option('date_format') . ' ' . get_option('time_format'), (int) $library['cached_at'])
                                                : ''
                                        )); ?>
                                    </p>
                                <?php else: ?>
                                    <p class="description"><?php esc_html_e('No CDN catalog cached yet. Save with CDN selected to fetch one in the background.', 'wpicons'); ?></p>
                                <?php endif; ?>
                            </td>
                        </tr>
                    </table>
                </div>
            <?php endforeach; ?>

            <?php submit_button(); ?>
        </form>
    </div>
    <script>
        (function () {
            document.querySelectorAll('.wpicons__settings__library').forEach(function (root) {
                var radios = root.querySelectorAll('input[type="radio"][name*="[source]"]');
                var version = root.querySelector('.wpicons__cdn-version');
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
            });
        })();
    </script>
</div>
