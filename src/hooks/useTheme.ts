import { useState, useEffect } from 'react';
import { UI_THEMES } from '../constants/themes';

export const useTheme = () => {
    const [primaryColor, setPrimaryColor] = useState('#F28C28');
    const [animationsEnabled, setAnimationsEnabled] = useState(true);

    // Sync Primary Color
    useEffect(() => {
        const savedPrefs = localStorage.getItem('ficha_tecnica_prefs');
        if (savedPrefs) {
            try {
                const parsed = JSON.parse(savedPrefs);
                if (parsed.primaryColor) setPrimaryColor(parsed.primaryColor);
                if (typeof parsed.animationsEnabled === 'boolean') setAnimationsEnabled(parsed.animationsEnabled);
            } catch { }
        }
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty('--primary', primaryColor);
        localStorage.setItem('ficha_tecnica_prefs', JSON.stringify({ primaryColor, animationsEnabled }));
    }, [primaryColor, animationsEnabled]);

    // System Theme Listener (Strict)
    useEffect(() => {
        const root = document.documentElement;
        const media = window.matchMedia('(prefers-color-scheme: dark)');

        const apply = () => {
            const isDark = media.matches;
            root.classList.toggle('dark', isDark);
            root.style.colorScheme = isDark ? 'dark' : 'light';
        };

        apply();

        // Modern listener
        media.addEventListener('change', apply);
        return () => media.removeEventListener('change', apply);
    }, []);

    return {
        primaryColor,
        setPrimaryColor,
        animationsEnabled,
        setAnimationsEnabled,
        UI_THEMES
    };
};
