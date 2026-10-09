<?php

namespace WPIcons\Icons\Lucide;

use WPIcons\Icons\IconOptions;
use WPIcons\Icons\LibraryInterface;
use WPIcons\Icons\LucideIcon;
use WPIcons\Icons\Svg;

if (!\defined('ABSPATH')) {
    exit;
}

final class LucideLibrary implements LibraryInterface
{
    public function id(): string
    {
        return 'lucide';
    }

    public function label(): string
    {
        return __('Lucide Icons', 'wpicons');
    }

    public function npmPackage(): string
    {
        return 'lucide-static';
    }

    public function bundledVersion(): string
    {
        return LucideIcon::BUNDLED_VERSION;
    }

    public function supports(): array
    {
        return ['size', 'color', 'stroke'];
    }

    public function bundledNames(): array
    {
        return array_values(array_map(
            static fn (LucideIcon $icon): string => $icon->value,
            LucideIcon::cases()
        ));
    }

    public function bundledInner(string $name): ?string
    {
        $icon = LucideIcon::fromName($name);

        return $icon?->inner();
    }

    public function wrap(string $inner, IconOptions $options): string
    {
        return Svg::lucide($inner, $options);
    }
}
