import React from 'react';
import { FileText, Building2 } from 'lucide-react';

import { InputField } from '../../ui/form/InputField';
import { useI18n } from '../../../i18n/i18n.tsx';
import { toISODate } from '../../../utils/dateUtils';
import { useRecipeManager } from '../../../hooks/useRecipeManager';

interface MetadataSectionProps {
  nomeFormula: string;
  nomeEmpresa: string;
  data: string;
  manager: ReturnType<typeof useRecipeManager>;
}

export const MetadataSection: React.FC<MetadataSectionProps> = ({
  nomeFormula,
  nomeEmpresa,
  data,
  manager
}) => {
  const { t } = useI18n();

  return (
    <div className="ds-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 text-[var(--primary)]">
        <FileText size={18} />
        <span className="text-xs font-bold uppercase tracking-widest">{t('editor.mainData')}</span>
      </div>

      {/* Main Product Name - Full Width */}
      <div>
        <InputField
          label={t('editor.productName')}
          value={nomeFormula}
          onChange={(value) => manager.handleFieldChange('nome_formula', value)}
          placeholder={t('placeholders.productName')}
          disabled={false}
        />
      </div>

      {/* Company + Date - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField
          label={t('editor.company')}
          value={nomeEmpresa || ''}
          onChange={(value) => manager.handleFieldChange('nome_empresa', value)}
          placeholder={t('placeholders.company')}
          icon={Building2}
          disabled={false}
        />

        {/* Date Input */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {t('editor.creationDate')}
          </label>
          <input
            type="date"
            className="w-full h-10 rounded-lg border-2 transition-all duration-200
              bg-white dark:bg-slate-800
              border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-white
              focus:border-blue-500 dark:focus:border-blue-400
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              px-3 font-medium"
            value={toISODate(data)}
            onChange={(e) => manager.handleFieldChange('data', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
