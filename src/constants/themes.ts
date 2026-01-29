import { Recipe } from '../types';

export const UI_THEMES = [
    { nameKey: 'themes.safetyOrange', color: '#F28C28' },
    { nameKey: 'themes.royalBlue', color: '#2563EB' },
    { nameKey: 'themes.emeraldGreen', color: '#10B981' },
    { nameKey: 'themes.slateDark', color: '#475569' },
];

export const FORMULA_THEMES = [
    { nameKey: 'themes.safetyOrange', color: '#F28C28' },
    { nameKey: 'themes.royalBlue', color: '#2563EB' },
    { nameKey: 'themes.emeraldGreen', color: '#10B981' },
    { nameKey: 'themes.roseRed', color: '#E11D48' },
    { nameKey: 'themes.violet', color: '#7C3AED' },
    { nameKey: 'themes.teal', color: '#0D9488' },
    { nameKey: 'themes.slate', color: '#475569' },
];

export const FORMULA_FONTS = [
    { name: 'Manrope', value: 'Manrope, sans-serif' },
    { name: 'Merriweather', value: '"Merriweather", serif' },
    { name: 'Oswald', value: '"Oswald", sans-serif' },
];

export const FORMULA_FONT_SIZES = [
    { nameKey: 'fontSizes.small', value: 'small' },
    { nameKey: 'fontSizes.medium', value: 'medium' },
    { nameKey: 'fontSizes.large', value: 'large' },
] as const;

export const isUiThemeColor = (value?: string) =>
    !!value && UI_THEMES.some((theme) => theme.color === value);

export const isFormulaThemeColor = (value?: string) =>
    !!value && FORMULA_THEMES.some((theme) => theme.color === value);

export const isFormulaFont = (value?: string) =>
    !!value && FORMULA_FONTS.some((font) => font.value === value);

export const isFormulaFontSize = (value?: string): value is Recipe['fontSize'] =>
    value === 'small' || value === 'medium' || value === 'large';
