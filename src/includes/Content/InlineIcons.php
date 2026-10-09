<?php

namespace WPIcons\Content;

use WPIcons\Icons\Renderer;
use WP_HTML_Tag_Processor;

if (!\defined('ABSPATH')) {
    exit;
}

class InlineIcons
{
    public function register(): void
    {
        add_filter('wp_kses_allowed_html', [$this, 'allowAttributes'], 10, 2);
        add_filter('render_block', [$this, 'replaceInHtml']);
        add_filter('the_content', [$this, 'replaceInHtml'], 12);
        add_filter('acf_the_content', [$this, 'replaceInHtml'], 12);
    }

    /**
     * @param array<string, array<string, mixed>> $tags
     * @return array<string, array<string, mixed>>
     */
    public function allowAttributes(array $tags, $context): array
    {
        if ($context !== 'post') {
            return $tags;
        }

        if (!isset($tags['img']) || !\is_array($tags['img'])) {
            $tags['img'] = [];
        }

        $tags['img']['data-library'] = true;
        $tags['img']['data-name'] = true;
        $tags['img']['data-color'] = true;
        $tags['img']['data-stroke'] = true;

        return $tags;
    }

    public function replaceInHtml(string $html): string
    {
        if ($html === '' || !str_contains($html, 'wpicons-inline')) {
            return $html;
        }

        if (!$this->shouldReplace()) {
            return $html;
        }

        $replaced = preg_replace_callback(
            '/<img\b(?=[^>]*\bwpicons-inline\b)[^>]*>/i',
            [$this, 'replaceTag'],
            $html
        );

        return \is_string($replaced) ? $replaced : $html;
    }

    /**
     * @param array<int, string> $matches
     */
    private function replaceTag(array $matches): string
    {
        $processor = new WP_HTML_Tag_Processor($matches[0]);
        if (!$processor->next_tag('img')) {
            return $matches[0];
        }

        $name = trim((string) $processor->get_attribute('data-name'));
        if ($name === '') {
            return $matches[0];
        }

        $svg = (new Renderer())->fromAttributes([
            'library' => (string) $processor->get_attribute('data-library'),
            'name' => $name,
            'size' => 24,
            'color' => (string) ($processor->get_attribute('data-color') ?: 'currentColor'),
            'stroke' => $processor->get_attribute('data-stroke'),
            'class' => 'wpicons-inline',
        ]);

        return $svg !== '' ? $svg : $matches[0];
    }

    private function shouldReplace(): bool
    {
        if (is_admin()) {
            return false;
        }

        if (\defined('REST_REQUEST') && REST_REQUEST) {
            $context = isset($_GET['context']) ? sanitize_key(wp_unslash($_GET['context'])) : '';
            if ($context === 'edit') {
                return false;
            }
        }

        return true;
    }
}
