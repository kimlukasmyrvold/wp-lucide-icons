<?php

namespace WPIcons\Icons;

use WPIcons\Admin\Settings;

if (!\defined('ABSPATH')) {
    exit;
}

final class Renderer
{
    public function render(string $libraryId, IconOptions $options): string
    {
        $libraryId = $libraryId === '' ? Settings::get()['default_library'] : $libraryId;
        $library = Registry::get($libraryId);
        if ($library === null) {
            return '';
        }

        if (!Settings::libraryEnabled(Settings::get(), $libraryId)) {
            return '';
        }

        $inner = CatalogStore::inner($libraryId, $options->name);
        if ($inner === null || $inner === '') {
            return '';
        }

        return $library->wrap($inner, $options);
    }

    /**
     * @param array<string, mixed> $attributes
     */
    public function fromAttributes(array $attributes): string
    {
        $library = isset($attributes['library']) ? (string) $attributes['library'] : 'lucide';
        $class = '';
        if (isset($attributes['class']) && \is_string($attributes['class'])) {
            $class = $attributes['class'];
        } elseif (isset($attributes['className']) && \is_string($attributes['className'])) {
            $class = $attributes['className'];
        }

        $options = IconOptions::fromArray([
            ...$attributes,
            'class' => $class,
        ]);

        $svg = $this->render($library, $options);
        if ($svg === '') {
            return '';
        }

        return $svg;
    }
}
