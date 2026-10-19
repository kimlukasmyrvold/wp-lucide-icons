import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { dispatch, select, subscribe } from '@wordpress/data';
import { insertObject, registerFormatType, useAnchor } from '@wordpress/rich-text';
import { RichTextToolbarButton } from '@wordpress/block-editor';
import { Popover } from '@wordpress/components';
import IconPickerModal from '../inline/IconPickerModal';
import IconStyleControls from '../picker/IconStyleControls';
import { fetchLibraries } from '../picker/api';
import {
    migrateInlineIconHtml,
    placeholderAttributes,
    pluginDefaults,
    resolveMaskSvg,
} from '../inline/placeholder';

export const FORMAT_NAME = 'wpicons/inline-icon';

const ANCHOR_SETTINGS = {
    tagName: 'img',
    className: 'wpicons-inline',
};

function draftFromAttributes(attrs) {
    const defaults = pluginDefaults();
    return {
        size: attrs?.size ? Number(attrs.size) : (defaults.size || 24),
        matchText: !attrs?.size,
        color: attrs?.color || defaults.color || 'currentColor',
        stroke: Number(attrs?.stroke ?? defaults.stroke ?? 2),
        title: attrs?.title || '',
    };
}

function updateObjectAt(value, index, attributes) {
    if (!value || index === null || index === undefined) {
        return null;
    }
    const replacements = Array.from(value.replacements || []);
    const current = replacements[index];
    if (!current || current.type !== FORMAT_NAME) {
        return null;
    }
    replacements[index] = {
        type: FORMAT_NAME,
        attributes,
    };
    return {
        ...value,
        replacements,
    };
}

function Edit({
    value,
    onChange,
    onFocus,
    isObjectActive,
    activeObjectAttributes,
    contentRef,
}) {
    const defaults = pluginDefaults();
    const valueRef = useRef(value);
    const editIndexRef = useRef(null);
    const popoverRef = useRef(null);
    const strokeTimer = useRef(0);
    const strokeRequest = useRef(0);
    const holdOpenRef = useRef(false);
    const holdGenerationRef = useRef(0);
    const pointerInsideRef = useRef(false);
    valueRef.current = value;

    const holdOpen = () => {
        const generation = holdGenerationRef.current + 1;
        holdGenerationRef.current = generation;
        holdOpenRef.current = true;
        window.setTimeout(() => {
            window.setTimeout(() => {
                if (holdGenerationRef.current === generation) {
                    holdOpenRef.current = false;
                }
            }, 0);
        }, 0);
    };

    const stayOpen = (event) => {
        if (holdOpenRef.current || pointerInsideRef.current) {
            return true;
        }
        const content = popoverRef.current;
        if (content && content.contains(document.activeElement)) {
            return true;
        }
        if (event && event.key !== 'Escape' && event.relatedTarget == null && event.type !== 'pointerdown' && event.type !== 'mousedown') {
            return true;
        }
        return false;
    };

    const liveAnchor = useAnchor({
        editableContentElement: contentRef?.current,
        settings: ANCHOR_SETTINGS,
    });
    const [anchorElement, setAnchorElement] = useState(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [library, setLibrary] = useState(defaults.library);
    const [pickerName, setPickerName] = useState('');
    const [pickerOptions, setPickerOptions] = useState(() => draftFromAttributes(null));
    const [draft, setDraft] = useState(null);
    const [supportsStroke, setSupportsStroke] = useState(true);

    useEffect(() => {
        if (liveAnchor) {
            setAnchorElement(liveAnchor);
        }
    }, [liveAnchor]);

    const selectedKey = isObjectActive
        ? `${value.start}:${activeObjectAttributes?.library || ''}:${activeObjectAttributes?.iconName || ''}`
        : '';

    useEffect(() => {
        if (!selectedKey) {
            return undefined;
        }
        editIndexRef.current = value.start;
        setDraft(draftFromAttributes(activeObjectAttributes));
        setPinned(true);
        // #region agent log
        fetch('http://127.0.0.1:7861/ingest/e51822a5-516d-4574-a743-ff8836d1dd47',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'22d134'},body:JSON.stringify({sessionId:'22d134',hypothesisId:'C',location:'inline-icon.js:selectedKey',message:'draft reset from active object',data:{selectedKey,color:activeObjectAttributes?.color||'',styleHasBg:String(activeObjectAttributes?.iconStyle||'').includes('background-color')},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return undefined;
    }, [selectedKey]);

    useEffect(() => {
        if (isObjectActive) {
            editIndexRef.current = value.start;
            setPinned(true);
            return undefined;
        }

        const timer = window.setTimeout(() => {
            if (stayOpen()) {
                return;
            }
            // #region agent log
            fetch('http://127.0.0.1:7861/ingest/e51822a5-516d-4574-a743-ff8836d1dd47',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'22d134'},body:JSON.stringify({sessionId:'22d134',hypothesisId:'B',location:'inline-icon.js:unpin',message:'unpin because object inactive',data:{hold:holdOpenRef.current,pointer:pointerInsideRef.current,active:document.activeElement&&document.activeElement.tagName},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            setPinned(false);
        }, 0);

        return () => window.clearTimeout(timer);
    }, [isObjectActive, value.start]);

    useEffect(() => {
        if (!pinned) {
            return undefined;
        }
        const id = activeObjectAttributes?.library || defaults.library;
        let cancelled = false;
        fetchLibraries()
            .then((data) => {
                if (cancelled) {
                    return;
                }
                const current = (data.libraries || []).find((item) => item.id === id);
                setSupportsStroke(Boolean(current?.supports?.includes('stroke')));
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [pinned, activeObjectAttributes?.library]);

    useEffect(() => {
        if (!pinned) {
            return undefined;
        }

        const documents = [document];
        const editableDocument = contentRef?.current?.ownerDocument;
        if (editableDocument && editableDocument !== document) {
            documents.push(editableDocument);
        }

        const onPointerDown = (event) => {
            const content = popoverRef.current;
            if (content && content.contains(event.target)) {
                return;
            }
            if (anchorElement && (event.target === anchorElement || anchorElement.contains(event.target))) {
                return;
            }
            setPinned(false);
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setPinned(false);
            }
        };
        const onPointerEnd = () => {
            pointerInsideRef.current = false;
        };

        documents.forEach((doc) => {
            doc.addEventListener('pointerdown', onPointerDown, true);
            doc.addEventListener('keydown', onKeyDown);
        });
        document.addEventListener('pointerup', onPointerEnd);
        document.addEventListener('pointercancel', onPointerEnd);

        return () => {
            documents.forEach((doc) => {
                doc.removeEventListener('pointerdown', onPointerDown, true);
                doc.removeEventListener('keydown', onKeyDown);
            });
            document.removeEventListener('pointerup', onPointerEnd);
            document.removeEventListener('pointercancel', onPointerEnd);
        };
    }, [pinned, anchorElement, contentRef]);

    const openPicker = () => {
        const attrs = isObjectActive ? (activeObjectAttributes || {}) : {};
        editIndexRef.current = isObjectActive ? value.start : null;
        const options = isObjectActive ? draftFromAttributes(attrs) : draftFromAttributes(null);
        setLibrary(attrs.library || defaults.library);
        setPickerName(attrs.iconName || '');
        setPickerOptions(options);
        setPickerOpen(true);
    };

    const applyIcon = async (icon) => {
        const svg = await resolveMaskSvg({
            library: icon.library,
            name: icon.name,
            svg: icon.svg,
            stroke: icon.stroke,
        });
        if (!svg) {
            setPickerOpen(false);
            return;
        }

        const attributes = placeholderAttributes({
            library: icon.library,
            name: icon.name,
            svg,
            color: icon.color,
            stroke: icon.stroke,
            size: icon.size,
            title: icon.title,
        });
        const index = editIndexRef.current;
        const current = valueRef.current;
        const replaced = updateObjectAt(current, index, attributes);
        onChange(replaced || insertObject(current, {
            type: FORMAT_NAME,
            attributes,
        }));
        onFocus?.();
        setPickerOpen(false);
        setPinned(false);
    };

    const commitStyle = (patch, nextDraft = draft) => {
        const index = editIndexRef.current;
        const currentValue = valueRef.current;
        const current = currentValue?.replacements?.[index];
        if (!current || current.type !== FORMAT_NAME) {
            // #region agent log
            fetch('http://127.0.0.1:7861/ingest/e51822a5-516d-4574-a743-ff8836d1dd47',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'22d134'},body:JSON.stringify({sessionId:'22d134',hypothesisId:'A',location:'inline-icon.js:commitStyle',message:'commit skipped',data:{index,hasCurrent:Boolean(current),type:current&&current.type,patchColor:Object.prototype.hasOwnProperty.call(patch,'color')?patch.color:undefined},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            return;
        }

        const prev = current.attributes || {};
        let nextSize = prev.size;
        if (Object.prototype.hasOwnProperty.call(patch, 'matchText')) {
            nextSize = patch.matchText ? '' : (nextDraft?.size || defaults.size || 24);
        } else if (Object.prototype.hasOwnProperty.call(patch, 'size')) {
            nextSize = patch.size;
        }

        const nextStroke = Object.prototype.hasOwnProperty.call(patch, 'stroke') ? patch.stroke : prev.stroke;
        const nextColor = Object.prototype.hasOwnProperty.call(patch, 'color') ? patch.color : prev.color;
        const attributes = placeholderAttributes({
            library: prev.library,
            name: prev.iconName,
            url: prev.url,
            color: nextColor,
            stroke: nextStroke,
            size: nextSize,
            title: Object.prototype.hasOwnProperty.call(patch, 'title') ? patch.title : prev.title,
            keepTypedColor: true,
            previousStyle: prev.iconStyle,
        });
        const updated = updateObjectAt(currentValue, index, attributes);
        // #region agent log
        fetch('http://127.0.0.1:7861/ingest/e51822a5-516d-4574-a743-ff8836d1dd47',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'22d134'},body:JSON.stringify({sessionId:'22d134',hypothesisId:'A',location:'inline-icon.js:commitStyle',message:'color commit',data:{patchColor:Object.prototype.hasOwnProperty.call(patch,'color')?patch.color:undefined,nextColor,stored:attributes.color,styleHasBg:String(attributes.iconStyle||'').includes('background-color'),wrote:Boolean(updated)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (updated) {
            holdOpen();
            onChange(updated);
        }

        if (!Object.prototype.hasOwnProperty.call(patch, 'stroke') || String(patch.stroke) === String(prev.stroke)) {
            return;
        }

        const requestId = ++strokeRequest.current;
        window.clearTimeout(strokeTimer.current);
        strokeTimer.current = window.setTimeout(async () => {
            const svg = await resolveMaskSvg({
                library: prev.library,
                name: prev.iconName,
                stroke: patch.stroke,
            });
            if (!svg || requestId !== strokeRequest.current) {
                return;
            }
            const latest = valueRef.current;
            const latestAttrs = latest?.replacements?.[index]?.attributes || attributes;
            const withSvg = placeholderAttributes({
                library: prev.library,
                name: prev.iconName,
                svg,
                color: latestAttrs.color,
                stroke: patch.stroke,
                size: latestAttrs.size,
                title: latestAttrs.title,
                keepTypedColor: true,
                previousStyle: latestAttrs.iconStyle,
            });
            const nextValue = updateObjectAt(latest, index, withSvg);
            if (nextValue) {
                holdOpen();
                onChange(nextValue);
            }
        }, 200);
    };

    return (
        <>
            <RichTextToolbarButton
                icon="star-filled"
                title={__('Insert icon', 'wpicons')}
                onClick={openPicker}
                isActive={isObjectActive}
            />
            {pinned && anchorElement && draft && !pickerOpen ? (
                <Popover
                    anchor={anchorElement}
                    placement="bottom-start"
                    focusOnMount={false}
                    className="wpicons wpicons_ wpicons__inline-popover"
                    theme="light"
                    onClose={(event) => {
                        if (stayOpen(event)) {
                            return;
                        }
                        // #region agent log
                        fetch('http://127.0.0.1:7861/ingest/e51822a5-516d-4574-a743-ff8836d1dd47',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'22d134'},body:JSON.stringify({sessionId:'22d134',hypothesisId:'B',location:'inline-icon.js:onClose',message:'popover onClose',data:{type:event&&event.type,key:event&&event.key,related:event&&event.relatedTarget&&event.relatedTarget.tagName},timestamp:Date.now()})}).catch(()=>{});
                        // #endregion
                        setPinned(false);
                    }}
                    onFocusOutside={(event) => {
                        if (!event?.relatedTarget || stayOpen(event)) {
                            event?.preventDefault?.();
                            return;
                        }
                        setPinned(false);
                    }}
                >
                    <div
                        ref={popoverRef}
                        className="wpicons"
                        theme="light"
                        onPointerDown={() => {
                            pointerInsideRef.current = true;
                        }}
                    >
                        <IconStyleControls
                            size={draft.size}
                            color={draft.color}
                            stroke={draft.stroke}
                            title={draft.title}
                            supportsStroke={supportsStroke}
                            allowMatchText
                            matchText={draft.matchText}
                            onChange={(patch) => {
                                const nextDraft = { ...(draft || {}), ...patch };
                                setDraft(nextDraft);
                                commitStyle(patch, nextDraft);
                            }}
                        />
                    </div>
                </Popover>
            ) : null}
            {pickerOpen ? (
                <IconPickerModal
                    library={library}
                    name={pickerName}
                    size={pickerOptions.size}
                    color={pickerOptions.color}
                    stroke={pickerOptions.stroke}
                    title={pickerOptions.title}
                    matchText={pickerOptions.matchText}
                    allowMatchText
                    onLibraryChange={setLibrary}
                    onSelect={applyIcon}
                    onClose={() => setPickerOpen(false)}
                />
            ) : null}
        </>
    );
}

registerFormatType(FORMAT_NAME, {
    title: __('Icon', 'wpicons'),
    tagName: 'img',
    className: 'wpicons-inline',
    object: true,
    attributes: {
        url: 'data-src',
        src: 'src',
        alt: 'alt',
        iconStyle: 'style',
        library: 'data-library',
        iconName: 'data-name',
        color: 'data-color',
        stroke: 'data-stroke',
        size: 'data-size',
        title: 'data-title',
    },
    edit: Edit,
});

function migrateBlockTree(blocks) {
    blocks.forEach((block) => {
        const updates = {};
        Object.entries(block.attributes || {}).forEach(([key, value]) => {
            if (typeof value !== 'string' || !value.includes('wpicons-inline') || !value.includes('<span')) {
                return;
            }
            const next = migrateInlineIconHtml(value);
            if (next !== value) {
                updates[key] = next;
            }
        });
        if (Object.keys(updates).length > 0) {
            dispatch('core/block-editor').updateBlockAttributes(block.clientId, updates);
        }
        if (block.innerBlocks && block.innerBlocks.length) {
            migrateBlockTree(block.innerBlocks);
        }
    });
}

function watchForLegacyIcons() {
    if (typeof subscribe !== 'function' || !select('core/block-editor')) {
        return;
    }

    let started = false;
    const unsubscribe = subscribe(() => {
        if (started) {
            return;
        }
        const editorSelect = select('core/editor');
        if (editorSelect && typeof editorSelect.__unstableIsEditorReady === 'function') {
            if (!editorSelect.__unstableIsEditorReady()) {
                return;
            }
        } else if (!select('core/block-editor').getBlocks().length) {
            return;
        }

        started = true;
        unsubscribe();
        window.setTimeout(() => {
            const blocks = select('core/block-editor').getBlocks();
            if (blocks.length) {
                migrateBlockTree(blocks);
            }
        }, 0);
    });
}

watchForLegacyIcons();
