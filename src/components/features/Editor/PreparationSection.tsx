import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Plus, Trash2 } from 'lucide-react';

import { SortableItem } from '../../common/SortableItem';
import { useI18n } from '../../../i18n/i18n.tsx';
import type { Step } from '../../../types';
import { useRecipeManager } from '../../../hooks/useRecipeManager';

interface PreparationSectionProps {
  steps: Step[];
  exibir_modo_preparo: boolean;
  manager: ReturnType<typeof useRecipeManager>;
  newlyAddedId: string | null;
  onDragEnd: (event: DragEndEvent) => void;
}

export const PreparationSection: React.FC<PreparationSectionProps> = ({
  steps,
  exibir_modo_preparo,
  manager,
  newlyAddedId,
  onDragEnd
}) => {
  const { t } = useI18n();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="ds-card p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
            {t('editor.preparation')}
          </h3>
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <input
              type="checkbox"
              checked={exibir_modo_preparo ?? true}
              onChange={(e) => manager.handleFieldChange('exibir_modo_preparo', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
            />
            {t('editor.showInFile')}
          </label>
        </div>
        <button
          onClick={manager.addStep}
          className="ds-button text-[var(--primary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
        >
          <Plus size={14} /> {t('buttons.addStep')}
        </button>
      </div>

      {/* Sortable Steps */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={steps} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <SortableItem key={step.id} id={step.id} newlyAddedId={newlyAddedId} animationsEnabled={false}>
                <div className="flex flex-1 min-w-0 w-full gap-3 items-start py-1">
                  {/* Step Number */}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 flex items-center justify-center text-xs font-bold text-[var(--primary)] flex-shrink-0 transition-all duration-300 hover:from-[var(--primary)] hover:to-[var(--primary)]/80 hover:text-white">
                    {idx + 1}
                  </div>

                  {/* Step Text */}
                  <textarea
                    className="flex-1 min-w-0 w-full bg-transparent text-sm outline-none resize-none min-h-[40px] leading-6 border-b-2 border-slate-200 dark:border-slate-700 focus:border-[var(--primary)] transition-colors pt-1 px-2 font-medium rounded-md focus:bg-slate-50 dark:focus:bg-slate-800/50"
                    value={step.text}
                    onChange={(e) => manager.updateStep(step.id, e.target.value)}
                    placeholder={t('placeholders.step')}
                  />

                  {/* Delete Button */}
                  <button
                    onClick={() => manager.removeStep(step.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors flex-shrink-0"
                    title="Remover passo"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {steps.length === 0 && (
        <p className="text-[10px] text-slate-400 mt-4 italic">{t('editor.emptyHint')}</p>
      )}
    </div>
  );
};
