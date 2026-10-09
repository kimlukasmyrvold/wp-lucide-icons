<?php

namespace WPIcons\Rest;

use WPIcons\Admin\Settings;
use WPIcons\Icons\Cdn\CdnCatalog;
use WPIcons\Icons\CatalogStore;
use WPIcons\Icons\IconOptions;
use WPIcons\Icons\Registry;
use WPIcons\Icons\Renderer;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

if (!\defined('ABSPATH')) {
    exit;
}

class IconsController
{
    public const NAMESPACE = 'wpicons/v1';

    public function register(): void
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route(self::NAMESPACE, '/libraries', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'libraries'],
            'permission_callback' => [$this, 'canRead'],
        ]);

        register_rest_route(self::NAMESPACE, '/icons', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'icons'],
            'permission_callback' => [$this, 'canRead'],
            'args' => [
                'library' => [
                    'type' => 'string',
                    'required' => true,
                ],
                'search' => [
                    'type' => 'string',
                    'default' => '',
                ],
                'page' => [
                    'type' => 'integer',
                    'default' => 1,
                ],
                'per_page' => [
                    'type' => 'integer',
                    'default' => 80,
                ],
            ],
        ]);

        register_rest_route(self::NAMESPACE, '/icon', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'icon'],
            'permission_callback' => [$this, 'canRead'],
            'args' => [
                'library' => [
                    'type' => 'string',
                    'required' => true,
                ],
                'name' => [
                    'type' => 'string',
                    'required' => true,
                ],
                'size' => [
                    'type' => 'integer',
                    'default' => 24,
                ],
                'color' => [
                    'type' => 'string',
                    'default' => 'currentColor',
                ],
                'stroke' => [
                    'type' => 'number',
                    'default' => 2,
                ],
            ],
        ]);
    }

    public function canRead(): bool
    {
        return current_user_can('edit_posts') || current_user_can('manage_options');
    }

    public function libraries(): WP_REST_Response
    {
        $settings = Settings::get();
        $items = [];

        foreach (Registry::enabled() as $id => $library) {
            $items[] = [
                'id' => $id,
                'label' => $library->label(),
                'version' => CatalogStore::version($id),
                'bundledVersion' => $library->bundledVersion(),
                'source' => Settings::librarySource($settings, $id),
                'supports' => $library->supports(),
                'count' => \count(CatalogStore::names($id)),
                'cdn' => [
                    'requested' => Settings::libraryCdnVersion($settings, $id),
                    'cachedVersion' => CdnCatalog::version($id),
                    'cachedAt' => CdnCatalog::fetchedAt($id),
                ],
            ];
        }

        return new WP_REST_Response([
            'libraries' => $items,
            'defaults' => [
                'library' => $settings['default_library'],
                'size' => $settings['default_size'],
                'color' => $settings['default_color'],
                'stroke' => $settings['default_stroke'],
            ],
        ]);
    }

    public function icons(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $libraryId = (string) $request->get_param('library');
        $library = Registry::get($libraryId);
        if ($library === null || !Settings::libraryEnabled(Settings::get(), $libraryId)) {
            return new WP_Error('wpicons_unknown_library', __('Unknown or disabled icon library.', 'wpicons'), ['status' => 404]);
        }

        $search = strtolower(trim((string) $request->get_param('search')));
        $page = max(1, (int) $request->get_param('page'));
        $perPage = min(80, max(1, (int) $request->get_param('per_page')));

        $names = CatalogStore::names($libraryId);
        if ($search !== '') {
            $names = array_values(array_filter(
                $names,
                static fn (string $name): bool => str_contains(strtolower($name), $search)
                    || str_contains(strtolower(str_replace(['_', '-'], ' ', $name)), $search)
            ));
        }

        $total = \count($names);
        $offset = ($page - 1) * $perPage;
        $slice = array_slice($names, $offset, $perPage);
        $items = [];
        $preview = new IconOptions(size: 24, color: 'currentColor');

        foreach ($slice as $name) {
            $inner = CatalogStore::inner($libraryId, $name);
            if ($inner === null) {
                continue;
            }
            $preview->name = $name;
            $items[] = [
                'name' => $name,
                'svg' => $library->wrap($inner, $preview),
            ];
        }

        $response = new WP_REST_Response([
            'library' => $libraryId,
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
            'totalPages' => (int) max(1, ceil($total / $perPage)),
        ]);
        $response->header('X-WP-Total', (string) $total);
        $response->header('X-WP-TotalPages', (string) max(1, (int) ceil($total / $perPage)));

        return $response;
    }

    public function icon(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $libraryId = (string) $request->get_param('library');
        $name = (string) $request->get_param('name');
        $svg = (new Renderer())->fromAttributes([
            'library' => $libraryId,
            'name' => $name,
            'size' => (int) $request->get_param('size'),
            'color' => (string) $request->get_param('color'),
            'stroke' => $request->get_param('stroke'),
            'class' => '',
        ]);

        if ($svg === '') {
            return new WP_Error('wpicons_unknown_icon', __('Icon not found.', 'wpicons'), ['status' => 404]);
        }

        return new WP_REST_Response([
            'library' => $libraryId,
            'name' => $name,
            'svg' => $svg,
        ]);
    }
}
