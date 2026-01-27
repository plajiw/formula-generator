import { Recipe } from '../types';

export const UI_THEMES = [
    { name: 'Safety Orange', color: '#F28C28' },
    { name: 'Royal Blue', color: '#2563EB' },
    { name: 'Emerald Green', color: '#10B981' },
    { name: 'Slate Dark', color: '#475569' },
];

export const FORMULA_THEMES = [
    { name: 'Safety Orange', color: '#F28C28' },
    { name: 'Royal Blue', color: '#2563EB' },
    { name: 'Emerald Green', color: '#10B981' },
    { name: 'Rose Red', color: '#E11D48' },
    { name: 'Violet', color: '#7C3AED' },
    { name: 'Teal', color: '#0D9488' },
    { name: 'Slate', color: '#475569' },
];

export const FORMULA_FONTS = [
    { name: 'Manrope', value: 'Manrope, sans-serif' },
    { name: 'Merriweather', value: '"Merriweather", serif' },
    { name: 'Oswald', value: '"Oswald", sans-serif' },
];

export const FORMULA_FONT_SIZES = [
    { name: 'Pequena', value: 'small' },
    { name: 'Média', value: 'medium' },
    { name: 'Grande', value: 'large' },
] as const;

export const isUiThemeColor = (value?: string) =>
    !!value && UI_THEMES.some((theme) => theme.color === value);

export const isFormulaThemeColor = (value?: string) =>
    !!value && FORMULA_THEMES.some((theme) => theme.color === value);

export const isFormulaFont = (value?: string) =>
    !!value && FORMULA_FONTS.some((font) => font.value === value);

export const isFormulaFontSize = (value?: string): value is Recipe['fontSize'] =>
    value === 'small' || value === 'medium' || value === 'large';
