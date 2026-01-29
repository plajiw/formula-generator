
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Recipe } from '../types';
import { useI18n } from '../i18n/i18n.tsx';

interface Props {
  recipe: Recipe;
  mode?: 'preview' | 'print';
}

const formatDate = (value: string) => {
  if (!value) return '';
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }
  return value;
};

type PaginationState = {
  pageCount: 1 | 2;
  ingredientSplitIndex: number;
  stepSplitIndex: number;
};

export const RecipePrintable: React.FC<Props> = ({ recipe, mode = 'preview' }) => {
  const { t } = useI18n();
  const fontSizeMap: Record<string, string> = {
    small: '13px',
    medium: '14px',
    large: '15px'
  };
  const baseFontSize = recipe.fontSize ? fontSizeMap[recipe.fontSize] || '14px' : '14px';
  const filteredSteps = useMemo(
    () => recipe.modo_preparo.filter((passo) => passo.text?.trim()),
    [recipe.modo_preparo]
  );
  const showModoPreparo = (recipe.exibir_modo_preparo ?? true) && filteredSteps.length > 0;
  const showObservacoes = (recipe.exibir_observacoes ?? true) && !!recipe.observacoes?.trim();
  const showIllustration = (recipe.exibir_ilustracao ?? false) && !!recipe.ilustracao_svg?.trim();
  const isDraft = (recipe.status || 'RASCUNHO') === 'RASCUNHO';
  const totalIngredients = recipe.ingredientes.length;
  const totalSteps = showModoPreparo ? filteredSteps.length : 0;
  const illustrationAlt = recipe.ilustracao_alt?.trim() || t('printable.illustrationAltFallback');

  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageCount: 1,
    ingredientSplitIndex: totalIngredients,
    stepSplitIndex: totalSteps
  }));

  const measureRef = useRef<HTMLDivElement | null>(null);
  const ingredientRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observationsRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  ingredientRowRefs.current = Array(totalIngredients).fill(null);
  stepRefs.current = Array(totalSteps).fill(null);

  const updatePagination = (next: PaginationState) => {
    setPagination((prev) => {
      if (
        prev.pageCount === next.pageCount &&
        prev.ingredientSplitIndex === next.ingredientSplitIndex &&
        prev.stepSplitIndex === next.stepSplitIndex
      ) {
        return prev;
      }
      return next;
    });
  };

  useLayoutEffect(() => {
    if (mode !== 'print') {
      updatePagination({
        pageCount: 1,
        ingredientSplitIndex: totalIngredients,
        stepSplitIndex: totalSteps
      });
      return;
    }

    const container = measureRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (!rect.height) return;

    const styles = window.getComputedStyle(container);
    const paddingBottom = parseFloat(styles.paddingBottom || '0');
    const limit = rect.top + rect.height - paddingBottom;

    const footerRect = footerRef.current?.getBoundingClientRect();
    const hasOverflow = footerRect ? footerRect.bottom > limit + 1 : Math.ceil(container.scrollHeight) - Math.ceil(container.clientHeight) > 1;
    if (!hasOverflow) {
      updatePagination({
        pageCount: 1,
        ingredientSplitIndex: totalIngredients,
        stepSplitIndex: totalSteps
      });
      return;
    }

    if (totalIngredients > 0) {
      const ingredientOverflowIndex = ingredientRowRefs.current.findIndex((row) => {
        if (!row) return false;
        return row.getBoundingClientRect().bottom > limit;
      });
      if (ingredientOverflowIndex !== -1) {
        updatePagination({
          pageCount: 2,
          ingredientSplitIndex: ingredientOverflowIndex,
          stepSplitIndex: 0
        });
        return;
      }
    }

    if (totalSteps > 0) {
      const stepOverflowIndex = stepRefs.current.findIndex((step) => {
        if (!step) return false;
        return step.getBoundingClientRect().bottom > limit;
      });
      if (stepOverflowIndex !== -1) {
        updatePagination({
          pageCount: 2,
          ingredientSplitIndex: totalIngredients,
          stepSplitIndex: stepOverflowIndex
        });
        return;
      }
    }

    const observationsRect = observationsRef.current?.getBoundingClientRect();
    if (observationsRect && observationsRect.bottom > limit) {
      updatePagination({
        pageCount: 2,
        ingredientSplitIndex: totalIngredients,
        stepSplitIndex: totalSteps
      });
      return;
    }

    if (footerRect && footerRect.bottom > limit) {
      updatePagination({
        pageCount: 2,
        ingredientSplitIndex: totalIngredients,
        stepSplitIndex: totalSteps
      });
      return;
    }

    updatePagination({
      pageCount: 2,
      ingredientSplitIndex: totalIngredients,
      stepSplitIndex: totalSteps
    });
  }, [mode, recipe, baseFontSize, showModoPreparo, showObservacoes, totalIngredients, totalSteps]);

  const pageStyle = {
    '--primary': recipe.accentColor || '#F28C28',
    fontFamily: recipe.fontFamily || 'Manrope, sans-serif',
    fontSize: baseFontSize
  } as React.CSSProperties;

  const renderWatermark = () =>
    isDraft ? (
      <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center">
        <div className="text-[64px] font-black uppercase tracking-[0.4em] text-slate-200 opacity-40 rotate-[-18deg]">
          {t('printable.watermark')}
        </div>
      </div>
    ) : null;

  const renderHeader = () => (
    <div className="print-header flex justify-between items-start border-b-2 border-[var(--primary)] pb-4 mb-6">
      <div>
        <h2 className="text-[var(--primary)] font-bold text-[1.3em] tracking-wider">{t('printable.title')}</h2>
        <p className="text-gray-500 text-[0.9em]">{t('printable.subtitle')}</p>
        {recipe.nome_empresa && (
          <p className="text-gray-800 font-bold uppercase text-[0.8em] mt-1">{recipe.nome_empresa}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-[0.75em] font-semibold text-gray-400">{t('printable.issueDate')}</p>
        <p className="text-gray-800 font-medium">{formatDate(recipe.data)}</p>
      </div>
    </div>
  );

  const renderTitle = () => (
    <div className={`print-title text-center mb-10 relative ${showIllustration ? 'print-title--with-illustration' : ''}`}>
      {showIllustration && (
        <div
          className="print-illustration recipe-illustration"
          role="img"
          aria-label={illustrationAlt}
          style={{ color: 'var(--primary)' }}
          dangerouslySetInnerHTML={{ __html: recipe.ilustracao_svg || '' }}
        />
      )}
      <h1 className="text-[2em] font-bold text-gray-800 uppercase tracking-tight">{recipe.nome_formula}</h1>
      <div className="h-1 w-24 bg-[var(--primary)] mx-auto mt-2"></div>
    </div>
  );

  const renderIngredients = (
    items: Recipe['ingredientes'],
    options?: { offset?: number; attachRefs?: boolean }
  ) => {
    const offset = options?.offset ?? 0;
    const attachRefs = options?.attachRefs ?? false;
    return (
      <div className="mb-8 print-section">
        <h3 className="text-[0.85em] font-bold text-[var(--primary)] mb-3 uppercase tracking-widest border-l-4 border-[var(--primary)] pl-2">
          {t('printable.ingredientsTitle')}
        </h3>
        <table className="w-full border-collapse print-table">
          <thead>
            <tr className="bg-gray-50 text-left border-y border-gray-200">
              <th className="py-3 px-4 text-[0.75em] font-bold text-gray-600 uppercase">{t('printable.item')}</th>
              <th className="py-3 px-4 text-[0.75em] font-bold text-gray-600 uppercase text-right">{t('common.qty')}</th>
              <th className="py-3 px-4 text-[0.75em] font-bold text-gray-600 uppercase text-center w-20">{t('common.unit')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ing, idx) => {
              const globalIndex = offset + idx;
              const rowBackground = recipe.stripedRows && globalIndex % 2 === 1 ? '#E5E7EB' : undefined;
              return (
                <tr
                  key={ing.id || `${globalIndex}-${ing.nome}`}
                  ref={attachRefs ? (el) => { ingredientRowRefs.current[globalIndex] = el; } : undefined}
                  className="border-b border-gray-100 transition-colors print-row break-inside-avoid"
                >
                  <td className="py-3 px-4 text-[0.9em] text-gray-800 break-words whitespace-normal" style={rowBackground ? { backgroundColor: rowBackground } : undefined}>{ing.nome}</td>
                  <td className="py-3 px-4 text-[0.9em] text-gray-800 text-right font-medium break-words whitespace-normal" style={rowBackground ? { backgroundColor: rowBackground } : undefined}>{ing.quantidade}</td>
                  <td className="py-3 px-4 text-[0.9em] text-gray-500 text-center uppercase font-mono break-words whitespace-normal" style={rowBackground ? { backgroundColor: rowBackground } : undefined}>{ing.unidade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSteps = (
    steps: Recipe['modo_preparo'],
    options?: { offset?: number; attachRefs?: boolean }
  ) => {
    const offset = options?.offset ?? 0;
    const attachRefs = options?.attachRefs ?? false;
    return (
      <div className="mb-8 print-section">
        <h3 className="text-[0.85em] font-bold text-[var(--primary)] mb-4 uppercase tracking-widest border-l-4 border-[var(--primary)] pl-2">
          {t('printable.procedureTitle')}
        </h3>
        <div className="print-steps">
          {steps.map((passo, idx) => {
            const globalIndex = offset + idx;
            return (
              <div
                key={passo.id ?? globalIndex}
                ref={attachRefs ? (el) => { stepRefs.current[globalIndex] = el; } : undefined}
                className="flex gap-4 items-start break-inside-avoid print-step"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
                  {globalIndex + 1}
                </span>
                <p className="print-step-text text-[0.9em] text-gray-700 leading-relaxed pt-0.5 text-justify">{passo.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderObservacoes = (attachRef?: boolean) => (
    <div
      ref={attachRef ? observationsRef : undefined}
      className="mt-auto pt-8 border-t border-gray-100 break-inside-avoid print-section print-observations"
    >
      <h3 className="text-[0.75em] font-bold text-gray-400 mb-2 uppercase tracking-widest">{t('printable.observationsTitle')}</h3>
      <p className="print-observations-text text-[0.75em] text-gray-500 italic leading-relaxed">{recipe.observacoes}</p>
    </div>
  );

  const renderFooter = (attachRef?: boolean) => (
    <div
      ref={attachRef ? footerRef : undefined}
      className="mt-12 text-center text-[0.7em] text-gray-300 uppercase tracking-widest border-t pt-4 print-footer"
    >
      {t('printable.footer')}
    </div>
  );

  const page1Ingredients = pagination.pageCount > 1 ? recipe.ingredientes.slice(0, pagination.ingredientSplitIndex) : recipe.ingredientes;
  const page2Ingredients = pagination.pageCount > 1 ? recipe.ingredientes.slice(pagination.ingredientSplitIndex) : [];
  const page1Steps = showModoPreparo
    ? pagination.pageCount > 1
      ? filteredSteps.slice(0, pagination.stepSplitIndex)
      : filteredSteps
    : [];
  const page2Steps = showModoPreparo && pagination.pageCount > 1
    ? filteredSteps.slice(pagination.stepSplitIndex)
    : [];

  const shouldPaginate = mode === 'print' && pagination.pageCount > 1;

  const measurementMarkup = mode === 'print' ? (
    <div
      ref={measureRef}
      className="bg-white p-8 sm:p-12 border border-gray-200 mx-auto w-[210mm] h-[297mm] print-area print-page print-compact print-measure overflow-visible relative"
      style={pageStyle}
      aria-hidden="true"
    >
      {renderWatermark()}
      {renderHeader()}
      {renderTitle()}
      {renderIngredients(recipe.ingredientes, { attachRefs: true })}
      {showModoPreparo && renderSteps(filteredSteps, { attachRefs: true })}
      {showObservacoes && renderObservacoes(true)}
      {renderFooter(true)}
    </div>
  ) : null;

  if (!shouldPaginate) {
    return (
      <>
        {measurementMarkup}
        <div
          className="bg-white p-8 sm:p-12 border border-gray-200 mx-auto w-[210mm] min-h-[297mm] print-area print-page print-page--last print-compact overflow-visible relative"
          style={pageStyle}
        >
          {renderWatermark()}
          {renderHeader()}
          {renderTitle()}
          {renderIngredients(recipe.ingredientes)}
          {showModoPreparo && renderSteps(filteredSteps)}
          {showObservacoes && renderObservacoes()}
          {renderFooter()}
        </div>
      </>
    );
  }

  return (
    <>
      {measurementMarkup}
      <div className="print-pages">
        <div
          className="bg-white p-8 sm:p-12 border border-gray-200 mx-auto w-[210mm] min-h-[297mm] print-area print-page print-compact overflow-visible relative"
          style={pageStyle}
        >
          {renderWatermark()}
          {renderHeader()}
          {renderTitle()}
          {(page1Ingredients.length > 0 || totalIngredients === 0) && renderIngredients(page1Ingredients)}
          {page1Steps.length > 0 && renderSteps(page1Steps)}
        </div>
        <div
          className="bg-white p-8 sm:p-12 border border-gray-200 mx-auto w-[210mm] min-h-[297mm] print-area print-page print-page--last print-compact overflow-visible relative"
          style={pageStyle}
        >
          {renderWatermark()}
          {renderHeader()}
          <div className="print-continuation">
            {t('printable.pageContinuation', { page: 2 })}
          </div>
          {page2Ingredients.length > 0 && renderIngredients(page2Ingredients, { offset: pagination.ingredientSplitIndex })}
          {page2Steps.length > 0 && renderSteps(page2Steps, { offset: pagination.stepSplitIndex })}
          {showObservacoes && renderObservacoes()}
          {renderFooter()}
        </div>
      </div>
    </>
  );
};
