import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { Save, FileText, Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

import { useRecipeManager } from '../../../hooks/useRecipeManager';
import { RecipePrintable } from '../../RecipePrintable';
import { useI18n } from '../../../i18n/i18n.tsx';
import { generateIllustrationSvg } from '../../../services/geminiService';
import { sanitizeIllustrationSvg } from '../../../utils/svgUtils';

import { MetadataSection } from './MetadataSection';
import { IngredientsSection } from './IngredientsSection';
import { PreparationSection } from './PreparationSection';
import { ObservationsSection } from './ObservationsSection';
import { StyleSection } from './StyleSection';

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
    const { t, locale } = useI18n();
    const { currentRecipe, setCurrentRecipe, newlyAddedId, validationErrors } = manager;
    const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
    const previewStageRef = useRef<HTMLDivElement | null>(null);
    const previewPageRef = useRef<HTMLDivElement | null>(null);
    const [previewScale, setPreviewScale] = useState(1);
    const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
    const editorShellRef = useRef<HTMLDivElement | null>(null);
    const [previewWidth, setPreviewWidth] = useState(0); // Will be set to 50% on mount
    const [showPreview, setShowPreview] = useState(true);
    const [zoomFactor, setZoomFactor] = useState(1);
    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isIllustrationGenerating, setIsIllustrationGenerating] = useState(false);
    const [illustrationError, setIllustrationError] = useState<string | null>(null);

    // Memoized ingredient data
    const ingredientNames = useMemo(
        () => currentRecipe.ingredientes.map((ing) => ing.nome?.trim()).filter((name) => !!name) as string[],
        [currentRecipe.ingredientes]
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

    const handleGenerateIllustration = async () => {
        if (!currentRecipe.nome_formula?.trim() && ingredientNames.length === 0 || isIllustrationGenerating) return;
        setIllustrationError(null);
        setIsIllustrationGenerating(true);
        try {
            const payload = {
                title: String(currentRecipe.nome_formula || '').trim(),
                ingredients: ingredientNames,
                locale
            };
            const result = await generateIllustrationSvg(payload);
            const safeSvg = sanitizeIllustrationSvg(result.svg);
            if (!safeSvg) {
                throw new Error('Invalid SVG');
            }
            manager.handleFieldChange('ilustracao_svg', safeSvg);
            manager.handleFieldChange('ilustracao_alt', result.alt || t('printable.illustrationAltFallback'));
            manager.handleFieldChange('exibir_ilustracao', true);
        } catch (error) {
            console.error('Illustration error:', error);
            setIllustrationError(t('messages.illustrationError'));
        } finally {
            setIsIllustrationGenerating(false);
        }
    };

    const handleRemoveIllustration = () => {
        manager.handleFieldChange('ilustracao_svg', '');
        manager.handleFieldChange('ilustracao_alt', '');
        manager.handleFieldChange('exibir_ilustracao', false);
        setIllustrationError(null);
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
        const storedVisible = localStorage.getItem('previewVisible');
        const storedZoom = Number(localStorage.getItem('previewZoom') || '');
        if (storedVisible !== null) setShowPreview(storedVisible === 'true');
        if (Number.isFinite(storedZoom) && storedZoom > 0) setZoomFactor(storedZoom);

        // Initialize preview width to 50% on mount
        if (editorShellRef.current) {
            const shellWidth = editorShellRef.current.getBoundingClientRect().width;
            setPreviewWidth(Math.round(shellWidth / 2));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('previewVisible', String(showPreview));
    }, [showPreview]);

    useEffect(() => {
        localStorage.setItem('previewZoom', String(zoomFactor));
    }, [zoomFactor]);

    useEffect(() => {
        if (!isResizing) return;
        const handleMove = (event: MouseEvent) => {
            const shell = editorShellRef.current;
            if (!shell) return;
            const rect = shell.getBoundingClientRect();
            const maxPreviewWidth = Math.round(rect.width / 2); // Maximum 50% of total width
            const minEditorWidth = Math.round(rect.width / 2); // Minimum 50% for editor (since preview is max 50%)
            const nextWidth = Math.max(minEditorWidth, Math.min(maxPreviewWidth, rect.right - event.clientX));
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

            {/* LEFT COLUMN: EDITOR CONTROLS - Flex grow to fill remaining space */}
            <div className="flex-1 overflow-y-auto border-r border-slate-200 dark:border-neutral-800 p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">

                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header / Actions */}
                    <div className="flex justify-between items-start ds-card p-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{t('editor.title')}</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">{t('editor.subtitle')}</p>
                            <div className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <span className={`px-2 py-0.5 rounded-full border ${currentRecipe.status === 'FINAL' ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}`}>
                                    {currentRecipe.status || 'RASCUNHO'}
                                </span>
                                <span className="text-slate-400">{t('editor.statusLabel')}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <button
                                onClick={() => setShowPreview((prev) => !prev)}
                                className="px-4 py-2 text-xs font-bold ds-button hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"
                                title={showPreview ? t('buttons.hidePreview') : t('buttons.showPreview')}
                            >
                                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                                {showPreview ? t('buttons.hidePreview') : t('buttons.showPreview')}
                            </button>
                            <button
                                onClick={() => setIsMobilePreviewOpen(true)}
                                className="px-4 py-2 text-xs font-bold ds-button hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center gap-2 lg:hidden"
                            >
                                <Eye size={14} /> {t('buttons.viewPreview')}
                            </button>
                            <button
                                onClick={() => manager.handleFieldChange('status', currentRecipe.status === 'FINAL' ? 'RASCUNHO' : 'FINAL')}
                                className={`ds-button transition ${currentRecipe.status === 'FINAL' ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50' : 'border-amber-500 text-amber-600 hover:bg-amber-50'}`}
                            >
                                {currentRecipe.status === 'FINAL' ? t('buttons.markDraft') : t('buttons.markFinal')}
                            </button>
                            <button onClick={onCancel} className="px-4 py-2 text-sm font-bold ds-button hover:bg-slate-100 dark:hover:bg-neutral-800 transition">{t('common.cancel')}</button>
                            <button onClick={onFinalize} className="px-5 py-2 text-sm font-bold ds-button-primary hover:bg-opacity-90 transition-all flex items-center gap-2">
                                <Save size={16} /> {t('buttons.saveSheet')}
                            </button>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <MetadataSection
                        nomeFormula={currentRecipe.nome_formula}
                        nomeEmpresa={currentRecipe.nome_empresa || ''}
                        data={currentRecipe.data}
                        manager={manager}
                    />

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'content' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className="flex items-center gap-2"><Calculator size={16} /> {t('editor.composition')}</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('style')}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'style' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className="flex items-center gap-2"><Settings2 size={16} /> {t('editor.appearance')}</div>
                        </button>
                    </div>

                    {/* Content Tab */}
                    {activeTab === 'content' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Ingredients Section */}
                            <IngredientsSection
                                ingredientes={currentRecipe.ingredientes}
                                manager={manager}
                                newlyAddedId={newlyAddedId}
                                onDragEnd={handleDragEndIngredients}
                            />

                            {/* Preparation Section */}
                            <PreparationSection
                                steps={currentRecipe.modo_preparo}
                                exibir_modo_preparo={currentRecipe.exibir_modo_preparo ?? true}
                                manager={manager}
                                newlyAddedId={newlyAddedId}
                                onDragEnd={handleDragEndSteps}
                            />

                            {/* Observations Section */}
                            <ObservationsSection
                                observacoes={currentRecipe.observacoes}
                                exibir_observacoes={currentRecipe.exibir_observacoes ?? true}
                                manager={manager}
                            />
                        </div>
                    )}

                    {/* Style Tab */}
                    {activeTab === 'style' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <StyleSection
                                accentColor={currentRecipe.accentColor || primaryColor}
                                fontFamily={currentRecipe.fontFamily || ''}
                                exibir_ilustracao={currentRecipe.exibir_ilustracao ?? false}
                                ilustracao_svg={currentRecipe.ilustracao_svg || ''}
                                ilustracao_alt={currentRecipe.ilustracao_alt || ''}
                                ingredientNames={ingredientNames}
                                nomeFormula={currentRecipe.nome_formula}
                                isIllustrationGenerating={isIllustrationGenerating}
                                illustrationError={illustrationError}
                                manager={manager}
                                onGenerateIllustration={handleGenerateIllustration}
                                onRemoveIllustration={handleRemoveIllustration}
                            />
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
                        {t('editor.a4Preview')}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoomFactor((z) => Math.max(0.7, Number((z - 0.1).toFixed(2))))}
                            className="ds-icon-button"
                            title={t('preview.zoomOut')}
                        >
                            <ZoomOut size={14} />
                        </button>
                        <button
                            onClick={() => setZoomFactor(1)}
                            className="ds-icon-button"
                            title={t('preview.zoomReset')}
                        >
                            <RotateCcw size={14} />
                        </button>
                        <button
                            onClick={() => setZoomFactor((z) => Math.min(1.6, Number((z + 0.1).toFixed(2))))}
                            className="ds-icon-button"
                            title={t('preview.zoomIn')}
                        >
                            <ZoomIn size={14} />
                        </button>
                        <span className="text-[10px] bg-slate-200 dark:bg-neutral-800 text-slate-500 px-2 py-1 rounded font-mono">{t('editor.previewSize')}</span>
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
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('common.preview')}</h3>
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
