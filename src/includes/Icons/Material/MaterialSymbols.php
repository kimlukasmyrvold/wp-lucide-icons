<?php

namespace WPIcons\Icons\Material;

if (!\defined('ABSPATH')) {
    exit;
}

final class MaterialSymbols
{
    public const BUNDLED_VERSION = '0.0.0';

    /**
     * @return array{version: string, icons: array<string, string>}
     */
    public static function catalog(): array
    {
        static $catalog = null;

        if ($catalog !== null) {
            return $catalog;
        }

        $path = __DIR__ . '/material-symbols-outlined-map.php';
        if (!is_readable($path)) {
            $catalog = [
                'version' => self::BUNDLED_VERSION,
                'icons' => [],
            ];

            return $catalog;
        }

        $loaded = require $path;
        if (!\is_array($loaded)) {
            $catalog = [
                'version' => self::BUNDLED_VERSION,
                'icons' => [],
            ];

            return $catalog;
        }

        $icons = [];
        if (isset($loaded['icons']) && \is_array($loaded['icons'])) {
            $icons = $loaded['icons'];
        } else {
            foreach ($loaded as $name => $inner) {
                if (\is_string($name) && \is_string($inner) && $name !== 'version') {
                    $icons[$name] = $inner;
                }
            }
        }

        $version = self::BUNDLED_VERSION;
        if (isset($loaded['version']) && \is_string($loaded['version']) && $loaded['version'] !== '') {
            $version = $loaded['version'];
        }

        $catalog = [
            'version' => $version,
            'icons' => $icons,
        ];

        return $catalog;
    }

    /**
     * @return array<string, string>
     */
    public static function map(): array
    {
        return self::catalog()['icons'];
    }

    public static function version(): string
    {
        return self::catalog()['version'];
    }
}
