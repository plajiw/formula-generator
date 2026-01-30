import React from 'react';
import { useI18n } from '../../../i18n/i18n.tsx';
import { useRecipeManager } from '../../../hooks/useRecipeManager';

interface ObservationsSectionProps {
  observacoes: string;
  exibir_observacoes: boolean;
  manager: ReturnType<typeof useRecipeManager>;
}

export const ObservationsSection: React.FC<ObservationsSectionProps> = ({
  observacoes,
  exibir_observacoes,
  manager
}) => {
  const { t } = useI18n();

  return (
    <div className="ds-card p-6 space-y-2">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
          {t('editor.observations')}
        </h3>
        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <input
            type="checkbox"
            checked={exibir_observacoes ?? true}
            onChange={(e) => manager.handleFieldChange('exibir_observacoes', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
          />
          {t('editor.showInFile')}
        </label>
      </div>

      {/* Textarea */}
      <textarea
        className="w-full min-w-0 ds-textarea text-sm focus:ring-1 focus:ring-amber-200 transition-all"
        placeholder={t('placeholders.observations')}
        value={observacoes}
        onChange={(e) => manager.handleFieldChange('observacoes', e.target.value)}
        rows={5}
      />

      {/* Hint */}
      <p className="text-[10px] text-slate-400 italic">{t('editor.optionalHint')}</p>
    </div>
  );
};
