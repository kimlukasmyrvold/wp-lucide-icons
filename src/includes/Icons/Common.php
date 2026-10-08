<?php

namespace WPIcons\Icons;

if (!\defined('ABSPATH')) {
    exit;
}

class Common
{
    public static function hidden(string|bool $hiddenOrTitle, bool $do_echo = false): string
    {
        $value = $hiddenOrTitle === true ? "true" : "false";
        $result = "aria-hidden=\"{$value}\"";

        if ($do_echo) {
            echo $result;
        }

        return $result;
    }
    public static function title(string|bool $text, bool $do_echo = false): string
    {
        if ($text === true || $text === false) {
            return '';
        }

        $clean_text = esc_html($text);
        $out = <<<HTML
        <title>$clean_text</title>
        HTML;

        if ($do_echo) {
            echo $out;
        }

        return $out;
    }
}