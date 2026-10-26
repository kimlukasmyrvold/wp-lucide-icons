<?php

namespace WPIcons\Icons\Material;

use WPIcons\Icons\IconOptions;
use WPIcons\Icons\LibraryInterface;
use WPIcons\Icons\Svg;

if (!\defined('ABSPATH')) {
    exit;
}

final class MaterialSymbolsLibrary implements LibraryInterface
{
    public function id(): string
    {
        return 'material-symbols';
    }

    public function label(): string
    {
        return __('Material Symbols', 'wpicons');
    }

    public function npmPackage(): string
    {
        return '@material-symbols/svg-400';
    }

    public function bundledVersion(): string
    {
        return MaterialSymbols::version();
    }

    public function supports(): array
    {
        return ['size', 'color'];
    }

    public function bundledNames(): array
    {
        return array_keys(MaterialSymbols::map());
    }

    public function bundledInner(string $name): ?string
    {
        $map = MaterialSymbols::map();
        $key = str_replace('-', '_', $name);

        if (isset($map[$key]) && \is_string($map[$key])) {
            return $map[$key];
        }

        if (isset($map[$name]) && \is_string($map[$name])) {
            return $map[$name];
        }

        return null;
    }

    public function wrap(string $inner, IconOptions $options): string
    {
        return Svg::material($inner, $options);
    }
}
