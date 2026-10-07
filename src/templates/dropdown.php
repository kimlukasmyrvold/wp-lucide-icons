<?php

if (!defined('ABSPATH')) {
    exit;
}

?>
<div class="wp_lucide_icons">
    <div class="wp_lucide_icons__dropdown">
        <div id="wp_lucide_icons__content" class="wp_lucide_icons__dropdown__content" data-lucide_icons_open="false">
            <div class="wp_lucide_icons__dropdown__content__top">
                <div class="wp_lucide_icons__dropdown__content__title">
                    <p class="wp_lucide_icons__dropdown__content__title__main">
                        <?php echo esc_html($title_wp); ?> <span class="wp_lucide_icons__dropdown__content__title__accent"><?php echo esc_html($title_accent); ?></span> <?php echo esc_html($title_icons); ?>
                    </p>
                </div>
                <div class="wp_lucide_icons__dropdown__content__search">
                    <label for="wp_lucide_icons__search_form" class="screen-reader-text">
                        <?php echo esc_html($search_label); ?>
                    </label>
                    <div class="wp_lucide_icons__dropdown__content__search__input">
                        <?php echo \WpLucideIcons\Icons\LucideIcon::Search->render(true, 20); ?>

                        <input id="wp_lucide_icons__search_form" name="wp_lucide_icons__search_form" type="text"
                            placeholder="<?php echo esc_attr($search_placeholder); ?>">

                        <button class="wp_lucide_icons__dropdown__content__search__input__clear" type="button">
                            <?php echo \WpLucideIcons\Icons\LucideIcon::X->render(true, 18); ?>
                        </button>
                    </div>
                </div>
                <div class="wp_lucide_icons__dropdown__content__options" style="display: none;">
                    <p><?php echo esc_html($options_label); ?></p>

                    <div class="wp_lucide_icons__dropdown__content__options__option">
                        <div class="wp_lucide_icons__dropdown__content__options__option__label">
                            <label for="stroke-width"><?php echo esc_html($stroke_width_label); ?></label>
                            <span class="wp_lucide_icons__dropdown__content__options__option__label__value"><?php echo esc_html($stroke_width_value); ?></span>
                        </div>
                        <div class="wp_lucide_icons__dropdown__content__options__option__slider">
                            <input id="stroke-width" name="stroke-width" type="range" min="0.5" max="3" step="0.25">
                            <div class="wp_lucide_icons__dropdown__content__options__option__slider__bar"></div>
                        </div>
                    </div>

                    <div class="wp_lucide_icons__dropdown__content__options__option">
                        <div class="wp_lucide_icons__dropdown__content__options__option__label">
                            <label for="size"><?php echo esc_html($size_label); ?></label>
                            <span class="wp_lucide_icons__dropdown__content__options__option__label__value"><?php echo esc_html($size_value); ?></span>
                        </div>
                        <div class="wp_lucide_icons__dropdown__content__options__option__slider">
                            <input id="size" name="size" type="range" min="16" max="48" step="4">
                            <div class="wp_lucide_icons__dropdown__content__options__option__slider__bar"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="wp_lucide_icons__icons" class="wp_lucide_icons__dropdown__content__icons"></div>
        </div>
    </div>
</div>
