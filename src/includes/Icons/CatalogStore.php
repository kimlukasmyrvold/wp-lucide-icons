<?php

namespace WPIcons\Icons;

use WPIcons\Admin\Settings;
use WPIcons\Icons\Cdn\CdnCatalog;

if (!\defined('ABSPATH')) {
    exit;
}

final class CatalogStore
{
    /** @var array<string, list<string>> */
    private static array $names = [];

    public static function inner(string $libraryId, string $name): ?string
    {
        $library = Registry::get($libraryId);
        if ($library === null) {
            return null;
        }

        $settings = Settings::get();
        if (Settings::librarySource($settings, $libraryId) === 'cdn') {
            $cached = CdnCatalog::inner($libraryId, $name);
            if ($cached !== null) {
                return $cached;
            }
        }

        return $library->bundledInner($name);
    }

    /**
     * @return list<string>
     */
    public static function names(string $libraryId): array
    {
        $library = Registry::get($libraryId);
        if ($library === null) {
            return [];
        }

        $settings = Settings::get();
        $source = Settings::librarySource($settings, $libraryId);
        $cacheKey = $libraryId . ':' . $source;
        if (isset(self::$names[$cacheKey])) {
            return self::$names[$cacheKey];
        }

        $names = $library->bundledNames();

        if ($source === 'cdn') {
            $cdnNames = CdnCatalog::names($libraryId);
            if ($cdnNames !== []) {
                $names = array_values(array_unique([...$cdnNames, ...$names]));
            }
        }

        sort($names, SORT_STRING);
        self::$names[$cacheKey] = $names;

        return $names;
    }

    public static function version(string $libraryId): string
    {
        $library = Registry::get($libraryId);
        if ($library === null) {
            return '';
        }

        $settings = Settings::get();
        if (Settings::librarySource($settings, $libraryId) === 'cdn') {
            $cdnVersion = CdnCatalog::version($libraryId);
            if ($cdnVersion !== null && $cdnVersion !== '') {
                return $cdnVersion;
            }
        }

        return $library->bundledVersion();
    }
}
