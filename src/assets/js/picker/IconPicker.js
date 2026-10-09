import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { fetchIcons, fetchLibraries } from './api';

export default function IconPicker({
    library,
    name,
    onLibraryChange,
    onSelect,
    allowedLibraries,
}) {
    const [libraries, setLibraries] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchLibraries()
            .then((data) => {
                if (cancelled) {
                    return;
                }
                const list = (data.libraries || []).filter((item) => {
                    if (!allowedLibraries || allowedLibraries.length === 0) {
                        return true;
                    }
                    return allowedLibraries.includes(item.id);
                });
                setLibraries(list);
                if (list.length && !list.some((item) => item.id === library)) {
                    onLibraryChange?.(list[0].id);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError(__('Could not load icon libraries.', 'wpicons'));
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (!library) {
            return undefined;
        }

        let cancelled = false;
        setLoading(true);
        setError('');
        fetchIcons({ library, search, page, perPage: 80 })
            .then((data) => {
                if (cancelled) {
                    return;
                }
                setItems(data.items || []);
                setTotal(data.total || 0);
                setTotalPages(data.totalPages || 1);
            })
            .catch(() => {
                if (!cancelled) {
                    setError(__('Could not load icons.', 'wpicons'));
                    setItems([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [library, search, page]);

    const currentLibrary = useMemo(
        () => libraries.find((item) => item.id === library),
        [libraries, library],
    );

    return (
        <div className="wpicons__picker">
            <div className="wpicons__picker__toolbar">
                <div className="wpicons__picker__tabs" role="tablist">
                    {libraries.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`wpicons__picker__tab${item.id === library ? ' is-active' : ''}`}
                            onClick={() => {
                                onLibraryChange?.(item.id);
                                setPage(1);
                            }}
                        >
                            {item.label}
                            <span className="wpicons__picker__count">{item.count}</span>
                        </button>
                    ))}
                </div>
                <label className="wpicons__picker__search">
                    <span className="screen-reader-text">{__('Search icons', 'wpicons')}</span>
                    <input
                        type="search"
                        value={searchInput}
                        placeholder={__('Search icons', 'wpicons')}
                        onChange={(event) => setSearchInput(event.target.value)}
                    />
                </label>
            </div>
            {currentLibrary ? (
                <p className="wpicons__picker__meta">
                    {__('Version', 'wpicons')}: {currentLibrary.version}
                    {total ? ` · ${total}` : ''}
                </p>
            ) : null}
            {error ? <p className="wpicons__picker__error">{error}</p> : null}
            <div className="wpicons__picker__grid" aria-busy={loading}>
                {items.map((item) => (
                    <button
                        key={`${library}-${item.name}`}
                        type="button"
                        className={`wpicons__picker__item${item.name === name ? ' is-selected' : ''}`}
                        onClick={() => onSelect?.({ library, name: item.name, svg: item.svg })}
                        title={item.name}
                    >
                        <span
                            className="wpicons__picker__glyph"
                            dangerouslySetInnerHTML={{ __html: item.svg }}
                        />
                        <span className="wpicons__picker__name">{item.name}</span>
                    </button>
                ))}
                {!loading && items.length === 0 ? (
                    <p className="wpicons__picker__empty">{__('No icons match that search.', 'wpicons')}</p>
                ) : null}
            </div>
            {totalPages > 1 ? (
                <div className="wpicons__picker__pager">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                        {__('Previous', 'wpicons')}
                    </button>
                    <span>
                        {page} / {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((value) => value + 1)}
                    >
                        {__('Next', 'wpicons')}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
