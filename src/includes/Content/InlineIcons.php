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
        add_filter('the_content', [$this, 'replaceInHtml'], 13);
        add_filter('acf_the_content', [$this, 'replaceInHtml'], 13);
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
        if (!isset($tags['span']) || !\is_array($tags['span'])) {
            $tags['span'] = [];
        }

        foreach (['img', 'span'] as $tag) {
            $tags[$tag]['class'] = true;
            $tags[$tag]['style'] = true;
            $tags[$tag]['data-src'] = true;
            $tags[$tag]['data-library'] = true;
            $tags[$tag]['data-name'] = true;
            $tags[$tag]['data-color'] = true;
            $tags[$tag]['data-stroke'] = true;
        }

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
            '/<(?:img\b(?=[^>]*\bwpicons-inline\b)[^>]*\/?>|span\b(?=[^>]*\bwpicons-inline\b)[^>]*>.*?<\/span>)/is',
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
        $tag = $matches[0];
        $inner = '';
        if (preg_match('/^<span\b[^>]*>(.*)<\/span>$/is', $tag, $innerMatch) === 1) {
            $inner = $innerMatch[1];
        }

        $processor = new WP_HTML_Tag_Processor($tag);
        if (!$processor->next_tag()) {
            return $tag;
        }

        $name = trim((string) $processor->get_attribute('data-name'));
        if ($name === '') {
            return $tag;
        }

        $svg = (new Renderer())->fromAttributes([
            'library' => (string) $processor->get_attribute('data-library'),
            'name' => $name,
            'size' => 24,
            'color' => (string) ($processor->get_attribute('data-color') ?: 'currentColor'),
            'stroke' => $processor->get_attribute('data-stroke'),
            'class' => 'wpicons-inline',
        ]);

        return $svg !== '' ? $svg . $inner : $tag;
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
