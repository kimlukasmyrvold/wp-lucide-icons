<?php

namespace WPIcons\Icons;

if (!\defined('ABSPATH')) {
    exit;
}

final class Svg
{
    public static function color(string $color): string
    {
        $color = trim($color);
        if ($color === '' || strcasecmp($color, 'currentColor') === 0) {
            return 'currentColor';
        }

        if ($color === 'inherit' || $color === 'transparent') {
            return $color;
        }

        if (\function_exists('sanitize_hex_color')) {
            $hex = sanitize_hex_color($color);
            if (\is_string($hex) && $hex !== '') {
                return $hex;
            }
        } elseif (preg_match('/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $color)) {
            return $color;
        }

        if (preg_match('/^(?:rgb|hsl)a?\([^)]+\)$/i', $color)) {
            return $color;
        }

        if (preg_match('/^[a-z]{3,20}$/i', $color)) {
            return strtolower($color);
        }

        return 'currentColor';
    }

    public static function classAttr(string $class): string
    {
        $class = trim(preg_replace('/[^A-Za-z0-9 _\-:]/', '', $class) ?? '');

        return $class;
    }

    public static function sanitizeInner(string $inner): string
    {
        $inner = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $inner) ?? $inner;
        $inner = preg_replace('/\son[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $inner) ?? $inner;
        $inner = preg_replace('/javascript\s*:/i', '', $inner) ?? $inner;

        return trim($inner);
    }

    public static function lucide(string $inner, IconOptions $options): string
    {
        $hidden = Common::hidden($options->hiddenOrTitle);
        $title = Common::title($options->hiddenOrTitle);
        $name = esc_attr($options->name);
        $width = (int) $options->size;
        $height = (int) $options->height;
        $color = esc_attr(self::color($options->color));
        $stroke = esc_attr((string) $options->strokeWidth);
        $class = trim('wpicons wpicons--lucide lucide lucide-' . $name . '-icon lucide-' . $name . ' ' . self::classAttr($options->class));
        $class_attr = esc_attr($class);
        $inner = self::sanitizeInner($inner);

        return <<<SVG
<svg {$hidden} xmlns="http://www.w3.org/2000/svg" width="{$width}" height="{$height}" viewBox="0 0 24 24" fill="none" stroke="{$color}" stroke-width="{$stroke}" stroke-linecap="round" stroke-linejoin="round" class="{$class_attr}">
{$title}{$inner}
</svg>
SVG;
    }

    public static function material(string $inner, IconOptions $options): string
    {
        $hidden = Common::hidden($options->hiddenOrTitle);
        $title = Common::title($options->hiddenOrTitle);
        $name = esc_attr($options->name);
        $width = (int) $options->size;
        $height = (int) $options->height;
        $color = esc_attr(self::color($options->color));
        $class = trim('wpicons wpicons--material-symbols material-symbols material-symbols-' . $name . ' ' . self::classAttr($options->class));
        $class_attr = esc_attr($class);
        $inner = self::sanitizeInner($inner);

        return <<<SVG
<svg {$hidden} xmlns="http://www.w3.org/2000/svg" width="{$width}" height="{$height}" viewBox="0 -960 960 960" fill="{$color}" class="{$class_attr}">
{$title}{$inner}
</svg>
SVG;
    }
}
