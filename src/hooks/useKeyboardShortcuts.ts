import { useEffect } from 'react';

const isTypingTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    return target.isContentEditable;
};

interface ShortcutHandlers {
    onAddIngredient: () => void;
    onSave: () => void;
    onPreview: () => void;
    onEscape: () => void;
    isEditor: boolean;
    isPreview: boolean;
    hasModalOpen: boolean;
}

export const useKeyboardShortcuts = ({
    onAddIngredient,
    onSave,
    onPreview,
    onEscape,
    isEditor,
    isPreview,
    hasModalOpen
}: ShortcutHandlers) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            const isCtrl = event.ctrlKey || event.metaKey;
            const typing = isTypingTarget(event.target);

            if (key === 'escape') {
                if (hasModalOpen || isPreview) {
                    event.preventDefault();
                    onEscape();
                }
                return;
            }

            if (isCtrl && key === 'enter') {
                event.preventDefault();
                onSave();
                return;
            }

            if (isCtrl && key === 'p') {
                event.preventDefault();
                onPreview();
                return;
            }

            if (key === 'enter' && isEditor && !typing) {
                event.preventDefault();
                onAddIngredient();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onAddIngredient, onSave, onPreview, onEscape, isEditor, isPreview, hasModalOpen]);
};
