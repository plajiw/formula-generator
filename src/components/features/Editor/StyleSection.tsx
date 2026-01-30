import React, { useState } from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';

import { useI18n } from '../../../i18n/i18n.tsx';
import { FORMULA_THEMES, FORMULA_FONTS } from '../../../constants/themes';
import { useRecipeManager } from '../../../hooks/useRecipeManager';

interface StyleSectionProps {
  accentColor: string;
  fontFamily: string;
  exibir_ilustracao: boolean;
  ilustracao_svg: string;
  ilustracao_alt: string;
  ingredientNames: string[];
  nomeFormula: string;
  isIllustrationGenerating: boolean;
  illustrationError: string | null;
  manager: ReturnType<typeof useRecipeManager>;
  onGenerateIllustration: () => Promise<void>;
  onRemoveIllustration: () => void;
}

export const StyleSection: React.FC<StyleSectionProps> = ({
  accentColor,
  fontFamily,
  exibir_ilustracao,
  ilustracao_svg,
  ilustracao_alt,
  ingredientNames,
  nomeFormula,
  isIllustrationGenerating,
  illustrationError,
  manager,
  onGenerateIllustration,
  onRemoveIllustration
}) => {
  const { t } = useI18n();

  const canGenerateIllustration = !!nomeFormula?.trim() || ingredientNames.length > 0;
  const hasIllustration = !!ilustracao_svg?.trim();

  return (
    <div className="space-y-8">
      {/* Color Themes */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-4">
          {t('editor.themes')}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {FORMULA_THEMES.map((theme) => (
            <button
              key={theme.nameKey}
              onClick={() => manager.handleFieldChange('accentColor', theme.color)}
              className={`h-12 rounded-xl border flex items-center justify-center font-bold text-sm transition ${
                accentColor === theme.color
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] shadow-sm'
                  : 'border-slate-200 dark:border-neutral-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: theme.color }}
              ></div>
              {t(theme.nameKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-3 p-6 ds-card">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {t('editor.typography')}
        </label>
        <select
          className="w-full ds-select p-3 text-sm font-medium"
          value={fontFamily || FORMULA_FONTS[0].value}
          onChange={(e) => manager.handleFieldChange('fontFamily', e.target.value)}
        >
          {FORMULA_FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      {/* Illustration */}
      <div className="ds-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
              {t('editor.illustration')}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t('editor.illustrationHint')}</p>
          </div>
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <input
              type="checkbox"
              checked={exibir_ilustracao ?? false}
              onChange={(e) => manager.handleFieldChange('exibir_ilustracao', e.target.checked)}
              disabled={!hasIllustration}
              className="w-4 h-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer disabled:opacity-50"
            />
            {t('editor.showInFile')}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onGenerateIllustration}
            disabled={!canGenerateIllustration || isIllustrationGenerating}
            className="px-4 py-2 text-xs font-bold ds-button hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles size={14} />
            {isIllustrationGenerating
              ? t('editor.illustrationLoading')
              : hasIllustration
                ? t('editor.illustrationRegenerate')
                : t('editor.illustrationGenerate')}
          </button>
          {hasIllustration && (
            <button
              onClick={onRemoveIllustration}
              className="px-4 py-2 text-xs font-bold ds-button hover:border-red-400 hover:text-red-500 transition-colors"
            >
              {t('editor.illustrationRemove')}
            </button>
          )}
        </div>

        {/* Empty State */}
        {!canGenerateIllustration && (
          <p className="text-[10px] text-slate-400 italic">{t('editor.illustrationEmpty')}</p>
        )}

        {/* Error */}
        {illustrationError && (
          <p className="text-xs text-red-500">{illustrationError}</p>
        )}

        {/* Preview */}
        {hasIllustration && (
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 flex items-center justify-center recipe-illustration"
              role="img"
              aria-label={ilustracao_alt || t('printable.illustrationAltFallback')}
              style={{ color: accentColor || '#3b82f6' }}
              dangerouslySetInnerHTML={{ __html: ilustracao_svg || '' }}
            />
            <div className="text-xs text-slate-500">
              {ilustracao_alt || t('printable.illustrationAltFallback')}
            </div>
          </div>
        )}
      </div>

      {/* Striped Rows Option */}
      <div className="flex items-center gap-3 p-6 ds-card">
        <input
          type="checkbox"
          id="striped"
          defaultChecked={false}
          onChange={(e) => manager.handleFieldChange('stripedRows', e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
        />
        <label htmlFor="striped" className="text-sm font-bold text-slate-700 dark:text-white cursor-pointer">
          {t('editor.stripedRows')}
        </label>
      </div>
    </div>
  );
};
