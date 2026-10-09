<?php

namespace WPIcons\Icons;

use WPIcons\Admin\Settings;
use WPIcons\Icons\Lucide\LucideLibrary;
use WPIcons\Icons\Material\MaterialSymbolsLibrary;

if (!\defined('ABSPATH')) {
    exit;
}

final class Registry
{
    /**
     * @var array<string, LibraryInterface>|null
     */
    private static ?array $libraries = null;

    /**
     * @return array<string, LibraryInterface>
     */
    public static function all(): array
    {
        if (self::$libraries === null) {
            $lucide = new LucideLibrary();
            $material = new MaterialSymbolsLibrary();
            self::$libraries = [
                $lucide->id() => $lucide,
                $material->id() => $material,
            ];
        }

        return self::$libraries;
    }

    public static function get(string $id): ?LibraryInterface
    {
        return self::all()[$id] ?? null;
    }

    /**
     * @return array<string, LibraryInterface>
     */
    public static function enabled(): array
    {
        $settings = Settings::get();
        $enabled = [];

        foreach (self::all() as $id => $library) {
            if (Settings::libraryEnabled($settings, $id)) {
                $enabled[$id] = $library;
            }
        }

        return $enabled;
    }
}
