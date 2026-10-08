<?php

if (!defined('ABSPATH')) {
    exit;
}

?>
<div class="wpicons__icons">
    <div class="wpicons__icons__dropdown">
        <div id="wpicons__icons__content" class="wpicons__icons__dropdown__content" data-lucide_icons_open="false">
            <div class="wpicons__icons__dropdown__content__top">
                <div class="wpicons__icons__dropdown__content__title">
                    <p class="wpicons__icons__dropdown__content__title__main">
                        <?php echo esc_html($title_wp); ?> <span class="wpicons__icons__dropdown__content__title__accent"><?php echo esc_html($title_accent); ?></span> <?php echo esc_html($title_icons); ?>
                    </p>
                </div>
                <div class="wpicons__icons__dropdown__content__search">
                    <label for="wpicons__icons__search_form" class="screen-reader-text">
                        <?php echo esc_html($search_label); ?>
                    </label>
                    <div class="wpicons__icons__dropdown__content__search__input">
                        <?php echo \WPIcons\Icons\LucideIcon::Search->render(true, 20); ?>

                        <input id="wpicons__icons__search_form" name="wpicons__icons__search_form" type="text"
                            placeholder="<?php echo esc_attr($search_placeholder); ?>">

                        <button class="wpicons__icons__dropdown__content__search__input__clear" type="button">
                            <?php echo \WPIcons\Icons\LucideIcon::X->render(true, 18); ?>
                        </button>
                    </div>
                </div>
                <div class="wpicons__icons__dropdown__content__options" style="display: none;">
                    <p><?php echo esc_html($options_label); ?></p>

                    <div class="wpicons__icons__dropdown__content__options__option">
                        <div class="wpicons__icons__dropdown__content__options__option__label">
                            <label for="stroke-width"><?php echo esc_html($stroke_width_label); ?></label>
                            <span class="wpicons__icons__dropdown__content__options__option__label__value"><?php echo esc_html($stroke_width_value); ?></span>
                        </div>
                        <div class="wpicons__icons__dropdown__content__options__option__slider">
                            <input id="stroke-width" name="stroke-width" type="range" min="0.5" max="3" step="0.25">
                            <div class="wpicons__icons__dropdown__content__options__option__slider__bar"></div>
                        </div>
                    </div>

                    <div class="wpicons__icons__dropdown__content__options__option">
                        <div class="wpicons__icons__dropdown__content__options__option__label">
                            <label for="size"><?php echo esc_html($size_label); ?></label>
                            <span class="wpicons__icons__dropdown__content__options__option__label__value"><?php echo esc_html($size_value); ?></span>
                        </div>
                        <div class="wpicons__icons__dropdown__content__options__option__slider">
                            <input id="size" name="size" type="range" min="16" max="48" step="4">
                            <div class="wpicons__icons__dropdown__content__options__option__slider__bar"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="wpicons__icons__icons" class="wpicons__icons__dropdown__content__icons"></div>
        </div>
    </div>
</div>
