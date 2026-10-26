<?php

namespace WPIcons\Icons;

if (!\defined('ABSPATH')) {
    exit;
}

interface LibraryInterface
{
    public function id(): string;

    public function label(): string;

    public function npmPackage(): string;

    public function bundledVersion(): string;

    /**
     * @return list<string>
     */
    public function supports(): array;

    /**
     * @return list<string>
     */
    public function bundledNames(): array;

    public function bundledInner(string $name): ?string;

    public function wrap(string $inner, IconOptions $options): string;
}
