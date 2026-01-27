import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Plus, Trash2, Settings2, Calculator, Save, FileText, Building2, AlertTriangle, Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

import { useRecipeManager } from '../../../hooks/useRecipeManager';
import { SortableItem } from '../../common/SortableItem';
import { RecipePrintable } from '../../RecipePrintable';
import { FORMULA_THEMES, FORMULA_FONTS, FORMULA_FONT_SIZES } from '../../../constants/themes';
import { toISODate } from '../../../utils/dateUtils';

interface RecipeEditorProps {
    manager: ReturnType<typeof useRecipeManager>;
    onCancel: () => void;
    onPreview: () => void;
    onFinalize: () => void;
    animationsEnabled: boolean;
    primaryColor: string;
    focusMode?: boolean;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({
    manager,
    onCancel,
    onFinalize,
    primaryColor,
    focusMode = false
}) => {
    const { currentRecipe, setCurrentRecipe, newlyAddedId, validationErrors } = manager;
    const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
    const previewStageRef = useRef<HTMLDivElement | null>(null);
    const previewPageRef = useRef<HTMLDivElement | null>(null);
    const [previewScale, setPreviewScale] = useState(1);
    const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
    const editorShellRef = useRef<HTMLDivElement | null>(null);
    const [previewWidth, setPreviewWidth] = useState(520);
    const [showPreview, setShowPreview] = useState(true);
    const [zoomFactor, setZoomFactor] = useState(1);
    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEndIngredients = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            manager.moveIngredient(active.id as string, over.id as string);
        }
    };

    const handleDragEndSteps = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            manager.moveStep(active.id as string, over.id as string);
        }
    };

    const totalWeight = currentRecipe.ingredientes.reduce((acc, curr) => acc + (curr.quantidade || 0), 0);
    const totalCost = currentRecipe.ingredientes.reduce((acc, curr) => acc + ((curr.custo_unitario || 0) * (curr.quantidade || 0)), 0);
    const hasFilledIngredients = currentRecipe.ingredientes.some((ing) => ing.nome.trim() || ing.quantidade > 0);

    const unitSuggestion = (nome: string, unidade: string) => {
        const lower = nome.toLowerCase();
        const solidKeywords = ['sal', 'açúcar', 'acucar', 'farinha', 'amido', 'pó', 'po', 'pimenta', 'alho', 'cebola', 'temper', 'salsa', 'ervas'];
        const liquidKeywords = ['óleo', 'oleo', 'agua', 'água', 'leite', 'vinagre', 'suco'];
        if ((unidade === 'ML' || unidade === 'LT') && solidKeywords.some((k) => lower.includes(k))) {
            return 'Unidade pode estar em KG/GR para sólidos.';
        }
        if ((unidade === 'KG' || unidade === 'GR') && liquidKeywords.some((k) => lower.includes(k))) {
            return 'Unidade pode estar em LT/ML para líquidos.';
        }
        return '';
    };

    useLayoutEffect(() => {
        const page = previewPageRef.current;
        if (!page) return;
        const updatePageSize = () => {
            setPageSize({ width: page.offsetWidth, height: page.offsetHeight });
        };
        updatePageSize();
        const resizeObserver = new ResizeObserver(updatePageSize);
        resizeObserver.observe(page);
        return () => resizeObserver.disconnect();
    }, []);

    useLayoutEffect(() => {
        const stage = previewStageRef.current;
        if (!stage || !pageSize.width) return;
        const updateScale = () => {
            const stageWidth = stage.clientWidth;
            const nextScale = Math.min(1, stageWidth / pageSize.width);
            setPreviewScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1);
        };
        updateScale();
        const resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(stage);
        return () => resizeObserver.disconnect();
    }, [pageSize.width]);

    useEffect(() => {
        const storedWidth = Number(localStorage.getItem('previewWidth') || '');
        const storedVisible = localStorage.getItem('previewVisible');
        const storedZoom = Number(localStorage.getItem('previewZoom') || '');
        if (storedVisible !== null) setShowPreview(storedVisible === 'true');
        if (Number.isFinite(storedZoom) && storedZoom > 0) setZoomFactor(storedZoom);
        if (Number.isFinite(storedWidth) && storedWidth > 0) {
            setPreviewWidth(storedWidth);
        } else if (editorShellRef.current) {
            const shellWidth = editorShellRef.current.getBoundingClientRect().width;
            setPreviewWidth(Math.round(shellWidth / 2));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('previewVisible', String(showPreview));
    }, [showPreview]);

    useEffect(() => {
        localStorage.setItem('previewWidth', String(previewWidth));
    }, [previewWidth]);

    useEffect(() => {
        localStorage.setItem('previewZoom', String(zoomFactor));
    }, [zoomFactor]);

    useEffect(() => {
        if (!isResizing) return;
        const handleMove = (event: MouseEvent) => {
            const shell = editorShellRef.current;
            if (!shell) return;
            const rect = shell.getBoundingClientRect();
            const minPreview = 360;
            const minEditor = 480;
            const maxPreview = Math.max(minPreview, rect.width - minEditor);
            const nextWidth = Math.min(maxPreview, Math.max(minPreview, rect.right - event.clientX));
            setPreviewWidth(Math.round(nextWidth));
        };
        const handleUp = () => setIsResizing(false);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isResizing]);

    return (
        <div
            ref={editorShellRef}
            className={`flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-neutral-950 transition-colors ${focusMode ? 'h-[calc(100vh-1rem)]' : 'h-[calc(100vh-3.5rem)]'}`}
        >

            {/* LEFT COLUMN: EDITOR CONTROLS (Scrollable) */}
            <div className="flex-1 overflow-y-auto border-r border-slate-200 dark:border-neutral-800 p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">

                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header / Actions */}
                    <div className="flex justify-between items-start ds-card p-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Editor Técnico</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">Defina os parâmetros industriais da formulação.</p>
                            <div className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <span className={`px-2 py-0.5 rounded-full border ${currentRecipe.status === 'FINAL' ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}`}>
                                    {currentRecipe.status || 'RASCUNHO'}
                                </span>
                                <span className="text-slate-400">Status da ficha</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPreview((prev) => !prev)}
                                className="px-4 py-2 text-xs font-bold ds-button hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"
                                title={showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
                            >
                                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                                {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
                            </button>
                            <button
                                onClick={() => setIsMobilePreviewOpen(true)}
                                className="px-4 py-2 text-xs font-bold ds-button hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2 lg:hidden"
                            >
                                <Eye size={14} /> Ver Preview
                            </button>
                            <button
                                onClick={() => manager.handleFieldChange('status', currentRecipe.status === 'FINAL' ? 'RASCUNHO' : 'FINAL')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${currentRecipe.status === 'FINAL' ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50' : 'border-amber-500 text-amber-600 hover:bg-amber-50'}`}
                            >
                                Marcar como {currentRecipe.status === 'FINAL' ? 'Rascunho' : 'Final'}
                            </button>
                            <button onClick={onCancel} className="px-4 py-2 text-sm font-bold ds-button hover:bg-slate-100 dark:hover:bg-neutral-800 transition">Cancelar</button>
                            <button onClick={onFinalize} className="px-5 py-2 text-sm font-bold ds-button-primary hover:bg-opacity-90 transition-all flex items-center gap-2">
                                <Save size={16} /> Salvar Ficha
                            </button>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="ds-card p-6 space-y-5">
                        <div className="flex items-center gap-2 mb-2 text-[var(--primary)]">
                            <FileText size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Dados Principais</span>
                        </div>

                        <div className="space-y-4">
                            {/* Nome do Produto */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nome do Produto</label>
                                <input
                                    className="w-full text-xl font-bold ds-input ds-input-lg focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all placeholder-slate-300"
                                    value={currentRecipe.nome_formula}
                                    onChange={(e) => manager.handleFieldChange('nome_formula', e.target.value)}
                                    placeholder="Ex: Pão de Leite Especial"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Nome da Empresa */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Empresa / Responsável</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input
                                            className="w-full ds-input pl-10 text-sm font-medium focus:border-[var(--primary)] transition-colors"
                                            value={currentRecipe.nome_empresa || ''}
                                            onChange={(e) => manager.handleFieldChange('nome_empresa', e.target.value)}
                                            placeholder="Opcional"
                                        />
                                    </div>
                                </div>

                                {/* Data */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Data de Criação</label>
                                    <input
                                        type="date"
                                        className="w-full ds-input text-sm font-medium focus:border-[var(--primary)] transition-colors"
                                        value={toISODate(currentRecipe.data)}
                                        onChange={(e) => manager.handleFieldChange('data', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'content' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className="flex items-center gap-2"><Calculator size={16} /> Composição</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('style')}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'style' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className="flex items-center gap-2"><Settings2 size={16} /> Aparência</div>
                        </button>
                    </div>

                    {/* Content Tab */}
                    {activeTab === 'content' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

                            {/* Ingredients Table */}
                            <div className="ds-card overflow-hidden">
                                <div className="p-4 bg-slate-50 dark:bg-neutral-900/50 border-b border-slate-200 dark:border-neutral-800 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">Matéria Prima</h3>
                                    </div>
                                        <button onClick={manager.addIngredient} className="text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg hover:bg-[var(--primary)] hover:text-white transition-colors flex items-center gap-1">
                                            <Plus size={14} /> Adicionar Item
                                        </button>
                                </div>

                                <div className="p-2">
                                    {hasFilledIngredients && totalWeight === 0 && (
                                        <div className="mx-2 mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                            <AlertTriangle size={14} />
                                            Peso total está zerado com ingredientes preenchidos.
                                        </div>
                                    )}
                                    {/* Header Row */}
                                    <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                                        <div className="col-span-1 hidden sm:block">#</div>
                                        <div className="col-span-1 block sm:hidden"></div>
                                        <div className="col-span-5 text-left">Item</div>
                                        <div className="col-span-2">Qtd</div>
                                        <div className="col-span-2">Unid</div>
                                        <div className="col-span-2">R$ Unit.</div>
                                    </div>

                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndIngredients} modifiers={[restrictToVerticalAxis]}>
                                        <SortableContext items={currentRecipe.ingredientes} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-1">
                                                {currentRecipe.ingredientes.map((ing, idx) => {
                                                    const totalWeightCalc = totalWeight || 1;
                                                    const pct = ((ing.quantidade || 0) / totalWeightCalc) * 100;

                                                    return (
                                                        <SortableItem key={ing.id} id={ing.id} newlyAddedId={newlyAddedId} animationsEnabled={false}>
                                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                                {/* Removed manual GripVertical here, using SortableItem's internal grip */}
                                                            <div className="col-span-1 hidden sm:flex justify-center items-center text-xs font-bold text-slate-300">
                                                                {idx + 1}
                                                            </div>
                                                            <div className="col-span-1 flex sm:hidden justify-center items-center text-xs font-bold text-slate-300">
                                                                {idx + 1}
                                                            </div>

                                                            <div className="col-span-5">
                                                                <input
                                                                    className="w-full h-9 ds-input text-sm font-medium focus:border-[var(--primary)] transition-colors"
                                                                    value={ing.nome}
                                                                    onChange={(e) => manager.updateIngredient(ing.id, 'nome', e.target.value)}
                                                                    placeholder="Nome do ingrediente..."
                                                                />
                                                                <div className="min-h-[16px] text-[10px] text-slate-400 font-mono mt-0.5 ml-1">{pct.toFixed(1)}%</div>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <div className="min-h-[56px] flex flex-col justify-start">
                                                                    <input
                                                                        type="number"
                                                                        className={`w-full h-9 ds-input text-right text-sm font-mono focus:border-[var(--primary)] transition-colors ${ing.quantidade === 0 ? 'border-amber-300' : ''}`}
                                                                        value={ing.quantidade}
                                                                        onChange={(e) => {
                                                                            const val = parseFloat(e.target.value) || 0;
                                                                            manager.updateIngredient(ing.id, 'quantidade', val);
                                                                        }}
                                                                    />
                                                                    <div className="min-h-[16px] mt-1 text-[10px] text-amber-600 flex items-center gap-1">
                                                                        {ing.quantidade === 0 && (<><AlertTriangle size={12} /> Quantidade zerada</>)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <div className="min-h-[56px] flex flex-col justify-start">
                                                                    <select
                                                                        className="w-full h-9 ds-select text-xs font-bold uppercase text-center cursor-pointer"
                                                                        value={ing.unidade}
                                                                        onChange={(e) => manager.updateIngredient(ing.id, 'unidade', e.target.value)}
                                                                    >
                                                                        {['GR', 'KG', 'ML', 'LT', 'UN'].map(u => <option key={u} value={u}>{u}</option>)}
                                                                    </select>
                                                                    <div className="min-h-[16px] mt-1 text-[10px] text-amber-600 flex items-center gap-1">
                                                                        {ing.nome && unitSuggestion(ing.nome, ing.unidade) ? (<><AlertTriangle size={12} /> {unitSuggestion(ing.nome, ing.unidade)}</>) : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <div className="min-h-[56px] flex items-center gap-1">
                                                                    <span className="text-xs text-slate-400">R$</span>
                                                                    <input
                                                                        type="number"
                                                                        className="w-full h-9 bg-transparent text-right text-xs font-mono outline-none border-b border-transparent focus:border-[var(--primary)]"
                                                                        placeholder="0.00"
                                                                        value={ing.custo_unitario || ''}
                                                                        onChange={(e) => manager.updateIngredient(ing.id, 'custo_unitario', parseFloat(e.target.value) || 0)}
                                                                    />
                                                                    <button
                                                                        onClick={() => manager.removeIngredient(ing.id)}
                                                                        className="ml-1 w-8 h-8 flex items-center justify-center rounded text-red-500 hover:text-red-700 hover:bg-red-100 transition"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            </div>
                                                        </SortableItem>
                                                    )
                                                })}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </div>

                                {/* Totals Footer */}
                                <div className="bg-slate-100 dark:bg-neutral-900/50 p-4 border-t border-slate-200 dark:border-neutral-800 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peso Total</p>
                                        <p className="text-xl font-mono font-bold text-slate-700 dark:text-slate-200">{totalWeight.toFixed(3)} <span className="text-sm text-slate-400">UNIT</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custo Estimado</p>
                                        <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">R$ {totalCost.toFixed(2)}</p>
                                    </div>
                                </div>

                            </div>

                            {/* Preparation Steps */}
                            <div className="ds-card p-6">
                                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">Modo de Preparo</h3>
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                            <input
                                                type="checkbox"
                                                checked={currentRecipe.exibir_modo_preparo ?? true}
                                                onChange={(e) => manager.handleFieldChange('exibir_modo_preparo', e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                                            />
                                            Exibir no arquivo
                                        </label>
                                    </div>
                                    <button onClick={manager.addStep} className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
                                        <Plus size={14} /> Adicionar Passo
                                    </button>
                                </div>

                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSteps} modifiers={[restrictToVerticalAxis]}>
                                    <SortableContext items={currentRecipe.modo_preparo} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-3">
                                            {currentRecipe.modo_preparo.map((step, idx) => (
                                                <SortableItem key={step.id} id={step.id} newlyAddedId={newlyAddedId} animationsEnabled={false}>
                                                    <div className="flex flex-1 min-w-0 w-full gap-3 items-center">
                                                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <textarea
                                                            className="flex-1 min-w-0 w-full bg-transparent text-sm outline-none resize-none min-h-[36px] leading-6 border-b border-transparent focus:border-[var(--primary)] transition-colors"
                                                            value={step.text}
                                                            onChange={(e) => manager.updateStep(step.id, e.target.value)}
                                                            placeholder="Descreva este passo..."
                                                        />
                                                        <button
                                                            onClick={() => manager.removeStep(step.id)}
                                                            className="w-8 h-8 flex items-center justify-center rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </SortableItem>
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                                <p className="text-[10px] text-slate-400 mt-4 italic">* Deixe em branco caso não queira exibir no arquivo final.</p>
                            </div>

                            {/* Observations */}
                            <div className="ds-card p-6 space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">Observações</h3>
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <input
                                            type="checkbox"
                                            checked={currentRecipe.exibir_observacoes ?? true}
                                            onChange={(e) => manager.handleFieldChange('exibir_observacoes', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                                        />
                                        Exibir no arquivo
                                    </label>
                                </div>
                                <textarea
                                    className="w-full min-w-0 ds-textarea text-sm focus:ring-1 focus:ring-amber-200 transition-all"
                                    placeholder="Notas de qualidade, validade, temperatura de forno..."
                                    value={currentRecipe.observacoes}
                                    onChange={(e) => manager.handleFieldChange('observacoes', e.target.value)}
                                />
                                <p className="text-[10px] text-slate-400 italic">* Opicional.</p>
                            </div>

                        </div>
                    )}

                    {/* Style Tab */}
                    {activeTab === 'style' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                {FORMULA_THEMES.map((theme) => (
                                    <button
                                        key={theme.name}
                                        onClick={() => manager.handleFieldChange('accentColor', theme.color)}
                                        className={`h-12 rounded-xl border flex items-center justify-center font-bold text-sm transition ${currentRecipe.accentColor === theme.color ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] shadow-sm' : 'border-slate-200 dark:border-neutral-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800'}`}
                                    >
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: theme.color }}></div>
                                        {theme.name}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3 p-6 ds-card">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tipografia</label>
                                <select
                                    className="w-full ds-select p-3 text-sm font-medium"
                                    value={currentRecipe.fontFamily || FORMULA_FONTS[0].value}
                                    onChange={(e) => manager.handleFieldChange('fontFamily', e.target.value)}
                                >
                                    {FORMULA_FONTS.map((font) => (
                                        <option key={font.value} value={font.value}>{font.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3 p-6 ds-card">
                                <input
                                    type="checkbox"
                                    id="striped"
                                    checked={!!currentRecipe.stripedRows}
                                    onChange={(e) => manager.handleFieldChange('stripedRows', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                                />
                                <label htmlFor="striped" className="text-sm font-bold text-slate-700 dark:text-white cursor-pointer">Linhas Zebradas (Tabela)</label>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {!focusMode && showPreview && (
                <div
                    className="hidden lg:flex w-3 cursor-col-resize items-stretch bg-transparent"
                    onMouseDown={() => setIsResizing(true)}
                >
                    <div className="w-px bg-slate-200 dark:bg-neutral-800 flex-1 mx-auto"></div>
                </div>
            )}

            {/* RIGHT COLUMN: PREVIEW (Sticky) */}
            {!focusMode && showPreview && (
                <div className="hidden lg:flex flex-col border-l border-slate-200 dark:border-neutral-800" style={{ width: previewWidth }}>
                <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex justify-between items-center bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm z-10">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        A4 Preview
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoomFactor((z) => Math.max(0.7, Number((z - 0.1).toFixed(2))))}
                            className="ds-icon-button"
                            title="Zoom -"
                        >
                            <ZoomOut size={14} />
                        </button>
                        <button
                            onClick={() => setZoomFactor(1)}
                            className="ds-icon-button"
                            title="Reset 100%"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <button
                            onClick={() => setZoomFactor((z) => Math.min(1.6, Number((z + 0.1).toFixed(2))))}
                            className="ds-icon-button"
                            title="Zoom +"
                        >
                            <ZoomIn size={14} />
                        </button>
                        <span className="text-[10px] bg-slate-200 dark:bg-neutral-800 text-slate-500 px-2 py-1 rounded font-mono">210mm x 297mm</span>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6 bg-slate-200/50 dark:bg-black/20 select-none">
                    <div className="flex justify-center">
                        <div
                            ref={previewStageRef}
                            className="relative w-full max-w-[210mm]"
                            style={{ aspectRatio: '210 / 297' }}
                        >
                            <div
                                className="absolute top-0 left-0 origin-top-left"
                                style={{
                                    transform: `scale(${previewScale * zoomFactor})`,
                                    width: pageSize.width || undefined,
                                    height: pageSize.height || undefined
                                }}
                            >
                                <div ref={previewPageRef}>
                                    <RecipePrintable recipe={currentRecipe} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}
            {isMobilePreviewOpen && (
                <div className="fixed inset-0 z-[220] bg-black/50 backdrop-blur-sm lg:hidden">
                    <div className="absolute inset-0 flex flex-col bg-white dark:bg-neutral-950">
                        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Preview</h3>
                            <button
                                onClick={() => setIsMobilePreviewOpen(false)}
                                className="ds-icon-button"
                            >
                                <EyeOff size={14} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-slate-200/50 dark:bg-black/20 select-none">
                            <RecipePrintable recipe={currentRecipe} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
