import apiFetch from '@wordpress/api-fetch';

export async function fetchLibraries() {
    return apiFetch({ path: '/wpicons/v1/libraries' });
}

export async function fetchIcons({ library, search = '', page = 1, perPage = 80 }) {
    const params = new URLSearchParams({
        library,
        search,
        page: String(page),
        per_page: String(perPage),
    });

    return apiFetch({ path: `/wpicons/v1/icons?${params.toString()}` });
}

export async function fetchIcon({ library, name, size = 24, color = 'currentColor', stroke = 2 }) {
    const params = new URLSearchParams({
        library,
        name,
        size: String(size),
        color,
        stroke: String(stroke),
    });

    return apiFetch({ path: `/wpicons/v1/icon?${params.toString()}` });
}
