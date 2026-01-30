import React, { useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

import { SortableItem } from '../../common/SortableItem';
import { SelectField } from '../../ui/form/SelectField';
import { useI18n } from '../../../i18n/i18n.tsx';
import type { Ingredient } from '../../../types';
import { useRecipeManager } from '../../../hooks/useRecipeManager';

interface IngredientsSectionProps {
  ingredientes: Ingredient[];
  manager: ReturnType<typeof useRecipeManager>;
  newlyAddedId: string | null;
  onDragEnd: (event: DragEndEvent) => void;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({
  ingredientes,
  manager,
  newlyAddedId,
  onDragEnd
}) => {
  const { t } = useI18n();

  const totalWeight = useMemo(
    () => ingredientes.reduce((acc, curr) => acc + (curr.quantidade || 0), 0),
    [ingredientes]
  );

  const totalCost = useMemo(
    () => ingredientes.reduce((acc, curr) => acc + ((curr.custo_unitario || 0) * (curr.quantidade || 0)), 0),
    [ingredientes]
  );

  const hasFilledIngredients = ingredientes.some((ing) => ing.nome.trim() || ing.quantidade > 0);

  const unitSuggestion = (nome: string, unidade: string) => {
    const lower = nome.toLowerCase();
    const solidKeywords = ['sal', 'açúcar', 'acucar', 'farinha', 'amido', 'pó', 'po', 'pimenta', 'alho', 'cebola', 'temper', 'salsa', 'ervas'];
    const liquidKeywords = ['óleo', 'oleo', 'agua', 'água', 'leite', 'vinagre', 'suco'];
    if ((unidade === 'ML' || unidade === 'LT') && solidKeywords.some((k) => lower.includes(k))) {
      return t('validation.unitSolid');
    }
    if ((unidade === 'KG' || unidade === 'GR') && liquidKeywords.some((k) => lower.includes(k))) {
      return t('validation.unitLiquid');
    }
    return '';
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="ds-card overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 dark:bg-neutral-900/50 border-b border-slate-200 dark:border-neutral-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
            {t('editor.ingredients')}
          </h3>
        </div>
        <button
          onClick={manager.addIngredient}
          className="ds-button text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white transition-colors"
        >
          <Plus size={14} /> {t('buttons.addItem')}
        </button>
      </div>

      {/* Content */}
      <div className="p-2">
        {hasFilledIngredients && totalWeight === 0 && (
          <div className="mx-2 mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <AlertTriangle size={14} />
            {t('validation.totalWeightZero')}
          </div>
        )}

        {/* Header Row */}
        <div className="grid grid-cols-12 gap-2 pl-10 pr-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-1 hidden sm:block">#</div>
          <div className="col-span-1 block sm:hidden"></div>
          <div className="col-span-5 text-left">{t('editor.itemHeader')}</div>
          <div className="col-span-2 text-right">{t('common.qty')}</div>
          <div className="col-span-2 text-center">{t('common.unit')}</div>
          <div className="col-span-2 text-right">{t('editor.unitPrice')}</div>
        </div>

        {/* Sortable Items */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={ingredientes} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {ingredientes.map((ing, idx) => {
                const totalWeightCalc = totalWeight || 1;
                const pct = ((ing.quantidade || 0) / totalWeightCalc) * 100;

                return (
                  <SortableItem key={ing.id} id={ing.id} newlyAddedId={newlyAddedId} animationsEnabled={false}>
                    <div className="flex-1 grid grid-cols-12 gap-2 items-center pr-3 py-1">
                      {/* Index */}
                      <div className="col-span-1 hidden sm:flex justify-center text-xs font-bold text-slate-400 dark:text-slate-500">
                        {idx + 1}
                      </div>
                      <div className="col-span-1 flex sm:hidden justify-center text-xs font-bold text-slate-400 dark:text-slate-500">
                        {idx + 1}
                      </div>

                      {/* Name + Percentage */}
                      <div className="col-span-5 min-h-[44px] flex flex-col gap-1 justify-center">
                        <input
                          className="w-full h-9 ds-input text-sm font-medium focus:border-[var(--primary)] transition-colors rounded-lg"
                          value={ing.nome}
                          onChange={(e) => manager.updateIngredient(ing.id, 'nome', e.target.value)}
                          placeholder={t('placeholders.ingredientName')}
                        />
                        <div className="min-h-[16px] text-[10px] text-slate-400 dark:text-slate-500 font-mono ml-1 px-1">
                          {pct.toFixed(1)}%
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2 min-h-[44px] flex flex-col gap-1 justify-center">
                        <input
                          type="number"
                          step="0.1"
                          className={`w-full h-9 ds-input text-right text-sm font-mono focus:border-[var(--primary)] transition-colors rounded-lg ${
                            ing.quantidade === 0 ? 'border-amber-300 dark:border-amber-600' : ''
                          }`}
                          value={ing.quantidade}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            manager.updateIngredient(ing.id, 'quantidade', val);
                          }}
                        />
                        <div className="min-h-[16px] text-[10px] text-amber-600 dark:text-amber-500 flex items-center gap-1 px-1">
                          {ing.quantidade === 0 && (
                            <>
                              <AlertTriangle size={12} /> {t('validation.qtyZero')}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Unit */}
                      <div className="col-span-2 min-h-[44px] flex flex-col gap-1 justify-center">
                        <select
                          className="w-full h-9 ds-select text-xs font-bold uppercase text-center cursor-pointer rounded-lg transition-colors focus:border-[var(--primary)]"
                          value={ing.unidade}
                          onChange={(e) => manager.updateIngredient(ing.id, 'unidade', e.target.value)}
                        >
                          {['GR', 'KG', 'ML', 'LT', 'UN'].map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                        <div className="min-h-[16px] text-[10px] text-amber-600 dark:text-amber-500 flex items-center gap-1 px-1">
                          {ing.nome && unitSuggestion(ing.nome, ing.unidade) ? (
                            <>
                              <AlertTriangle size={12} /> {unitSuggestion(ing.nome, ing.unidade)}
                            </>
                          ) : null}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 min-h-[44px] flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{t('common.currency')}</span>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full h-9 ds-input text-right text-sm font-mono focus:border-[var(--primary)] transition-colors rounded-lg"
                          placeholder="0"
                          value={ing.custo_unitario || ''}
                          onChange={(e) =>
                            manager.updateIngredient(ing.id, 'custo_unitario', parseFloat(e.target.value) || 0)
                          }
                        />
                        <button
                          onClick={() => manager.removeIngredient(ing.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors flex-shrink-0"
                          title="Remover ingrediente"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Footer - Totals */}
      <div className="bg-slate-100 dark:bg-neutral-900/50 p-4 border-t border-slate-200 dark:border-neutral-800 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {t('editor.totalWeight')}
          </p>
          <p className="text-xl font-mono font-bold text-slate-700 dark:text-slate-200">
            {totalWeight.toFixed(3)} <span className="text-sm text-slate-400">{t('common.unit')}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {t('editor.estimatedCost')}
          </p>
          <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {t('common.currency')} {totalCost.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};
