import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, FlaskConical, Settings, X } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useHistory } from './hooks/useHistory';
import { useRecipeManager } from './hooks/useRecipeManager';
import { useAIWizard } from './hooks/useAIWizard';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Layout } from './components/layout/Layout';
import { Hub } from './components/Hub';
import { RecipeEditor } from './components/features/Editor/RecipeEditor';
import { WizardModal } from './components/WizardModal';
import { RecipePrintable } from './components/RecipePrintable';
import { exportToXML, parseXML } from './services/xmlService';
import { Recipe } from './types';
import { isoToday } from './utils/dateUtils';

type ViewState = 'HUB' | 'EDITOR' | 'PREVIEW' | 'HISTORY';

const App: React.FC = () => {
    const {
        primaryColor, setPrimaryColor,
        animationsEnabled,
        UI_THEMES
    } = useTheme();

    const {
        history,
        saveToHistory,
        deleteRecipe,
        filteredHistory
    } = useHistory();

    const recipeManager = useRecipeManager();
    const { currentRecipe, loadRecipe, validateRecipe, clearRecipe, sanitizeRecipe } = recipeManager;

    const handleAiGenerated = (recipe: Recipe) => {
        // Sanitize and set as current
        loadRecipe(sanitizeRecipe(recipe));
        setView('EDITOR');
    };

    const wizard = useAIWizard(handleAiGenerated);

    const [view, setView] = useState<ViewState>('HUB');

    // Settings Modal State (Local to App for now, or extract to component)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isJsonImportOpen, setIsJsonImportOpen] = useState(false);
    const [jsonImportText, setJsonImportText] = useState('');
    const [isPresetsOpen, setIsPresetsOpen] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const previewRef = useRef<HTMLDivElement | null>(null);

    const PRESETS = [
        {
            id: 'chimichurri-base',
            name: 'Base Chimichurri',
            description: 'Estrutura seca com ervas e especiarias.',
            data: {
                nome_formula: 'Base Chimichurri',
                ingredientes: [
                    { nome: 'Salsa desidratada', quantidade: 10, unidade: 'KG' },
                    { nome: 'Alho granulado', quantidade: 5, unidade: 'KG' },
                    { nome: 'Cebola granulada', quantidade: 4, unidade: 'KG' },
                    { nome: 'Pimenta do reino', quantidade: 1, unidade: 'KG' },
                    { nome: 'Sal refinado', quantidade: 8, unidade: 'KG' }
                ],
                modo_preparo: [],
                observacoes: 'Base seca. Ajustar proporções conforme necessidade.'
            }
        },
        {
            id: 'lemon-pepper-base',
            name: 'Base Lemon Pepper',
            description: 'Blend seco com notas cítricas.',
            data: {
                nome_formula: 'Base Lemon Pepper',
                ingredientes: [
                    { nome: 'Sal refinado', quantidade: 12, unidade: 'KG' },
                    { nome: 'Pimenta do reino moída', quantidade: 2, unidade: 'KG' },
                    { nome: 'Aroma de limão em pó', quantidade: 0.5, unidade: 'KG' }
                ],
                modo_preparo: [],
                observacoes: 'Ficha base. Completar com aditivos conforme uso.'
            }
        },
        {
            id: 'sem-modo-preparo',
            name: 'Ficha sem modo de preparo',
            description: 'Estrutura com modo de preparo desabilitado.',
            data: {
                nome_formula: 'Ficha sem modo de preparo',
                ingredientes: [],
                modo_preparo: [],
                exibir_modo_preparo: false,
                observacoes: ''
            }
        },
        {
            id: 'industrial-seco',
            name: 'Ficha industrial seca',
            description: 'Ficha voltada para blends secos.',
            data: {
                nome_formula: 'Ficha industrial seca',
                ingredientes: [],
                modo_preparo: [],
                observacoes: 'Documento apresenta apenas a composição de ingredientes.',
                exibir_modo_preparo: false
            }
        }
    ];

    // XML Import Logic (Local wrapper)
    const handleXmlImport = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xml';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const recipe = await parseXML(file);
                    loadRecipe(recipe);
                    saveToHistory(recipe);
                    setView('PREVIEW');
                } catch (err) {
                    alert('Erro ao importar XML invalid');
                }
            }
        };
        input.click();
    };

    const handleJsonImport = () => {
        setJsonImportText('');
        setIsJsonImportOpen(true);
    };

    const handleOpenPresets = () => {
        setIsPresetsOpen(true);
    };

    const handleApplyPreset = (preset: any) => {
        const recipe: Recipe = {
            id: crypto.randomUUID(),
            nome_formula: String(preset.nome_formula || '').trim(),
            nome_empresa: '',
            data: isoToday(),
            ingredientes: (preset.ingredientes || []).map((ing: any) => ({
                id: crypto.randomUUID(),
                nome: String(ing?.nome || '').trim(),
                quantidade: Number(ing?.quantidade || 0),
                unidade: String(ing?.unidade || 'KG').toUpperCase()
            })),
            modo_preparo: (preset.modo_preparo || []).map((step: any) => ({
                id: crypto.randomUUID(),
                text: typeof step === 'string' ? step : String(step?.text || '')
            })),
            observacoes: String(preset.observacoes || ''),
            stripedRows: true,
            exibir_modo_preparo: preset.exibir_modo_preparo ?? true,
            exibir_observacoes: preset.exibir_observacoes ?? true,
            status: 'RASCUNHO'
        };

        loadRecipe(sanitizeRecipe(recipe));
        setIsPresetsOpen(false);
        setView('EDITOR');
    };

    const parseJsonImport = () => {
        try {
            const parsed = JSON.parse(jsonImportText);
            const ingredientes = Array.isArray(parsed.ingredientes) ? parsed.ingredientes : [];
            const modoPreparoRaw = Array.isArray(parsed.modo_preparo) ? parsed.modo_preparo : [];
            const modo_preparo = modoPreparoRaw.map((step: any) => {
                if (typeof step === 'string') {
                    return { id: crypto.randomUUID(), text: step };
                }
                return { id: crypto.randomUUID(), text: String(step?.text || '') };
            });

            const recipe: Recipe = {
                id: crypto.randomUUID(),
                nome_formula: String(parsed.nome_formula || '').trim(),
                nome_empresa: String(parsed.empresa_responsavel || parsed.nome_empresa || '').trim(),
                data: String(parsed.data || isoToday()),
                ingredientes: ingredientes.map((ing: any) => ({
                    id: crypto.randomUUID(),
                    nome: String(ing?.nome || '').trim(),
                    quantidade: Number(ing?.quantidade || 0),
                    unidade: String(ing?.unidade || '').toUpperCase()
                })),
                modo_preparo,
                observacoes: String(parsed.observacoes || ''),
                stripedRows: true,
                exibir_modo_preparo: true,
                exibir_observacoes: true,
            };

            loadRecipe(sanitizeRecipe(recipe));
            setIsJsonImportOpen(false);
            setView('EDITOR');
        } catch (err) {
            alert('JSON inválido. Verifique a estrutura e tente novamente.');
        }
    };


    const handleFinalize = () => {
        if (validateRecipe()) {
            saveToHistory(currentRecipe);
            setView('PREVIEW');
        }
    };

    const handleCreateNew = () => {
        clearRecipe();
        setView('EDITOR');
    };

    useKeyboardShortcuts({
        onAddIngredient: recipeManager.addIngredient,
        onSave: handleFinalize,
        onPreview: () => setView('PREVIEW'),
        onEscape: () => {
            if (isSettingsOpen) setIsSettingsOpen(false);
            if (isJsonImportOpen) setIsJsonImportOpen(false);
            if (wizard.isOpen) wizard.close();
            if (view === 'PREVIEW') setView('EDITOR');
        },
        isEditor: view === 'EDITOR',
        isPreview: view === 'PREVIEW',
        hasModalOpen: isSettingsOpen || isJsonImportOpen || wizard.isOpen
    });

    return (
        <Layout>
            <WizardModal wizard={wizard} animationsEnabled={animationsEnabled} />

            {/* Nav */}
            {!isFocusMode && (
                <nav className="no-print bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800 sticky top-0 z-50 h-14">
                <div className="max-w-[1920px] mx-auto px-6 h-full">
                    <div className="flex justify-between items-center h-full">
                        <div className="flex items-center gap-4">
                            {view !== 'HUB' && (
                                <button
                                    onClick={() => setView('HUB')}
                                    className="ds-icon-button hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                                    title="Voltar ao Hub"
                                >
                                    <ArrowLeft size={14} />
                                </button>
                            )}

                            <div
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => setView('HUB')}
                            >
                                <div className="w-8 h-8 bg-[var(--primary)] text-white flex items-center justify-center rounded-lg">
                                    <FlaskConical size={14} />
                                </div>
                                <h1 className="font-bold text-slate-900 dark:text-white text-lg tracking-tighter uppercase">Formula<span className="text-[var(--primary)]">Pro</span></h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="ds-icon-button hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                                title="Configurações"
                            >
                                <Settings size={14} />
                            </button>
                        </div>
                    </div>
                </div>
                </nav>
            )}

            <main className={`flex-1 relative z-10 w-full animate-in fade-in duration-300 ${isFocusMode ? 'pt-2' : ''}`}>
                {view === 'HUB' && (
                    <Hub
                        onNewRecipe={handleCreateNew}
                        onOpenWizard={wizard.open}
                        onImportXML={handleXmlImport}
                        onImportJSON={handleJsonImport}
                        onOpenPresets={handleOpenPresets}
                        onOpenHistory={() => setView('HISTORY')}
                        recentRecipes={filteredHistory}
                        onLoadRecipe={(recipe) => { loadRecipe(recipe); setView('PREVIEW'); }}
                    />
                )}

                {view === 'EDITOR' && (
                    <>
                        <div className="no-print max-w-5xl mx-auto px-6 pt-4 flex justify-end">
                            <button
                                onClick={() => setIsFocusMode((prev) => !prev)}
                                className="px-4 py-2 text-xs font-bold ds-button hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                            >
                                {isFocusMode ? 'Sair do Modo Foco' : 'Modo Foco'}
                            </button>
                        </div>
                        <RecipeEditor
                            manager={recipeManager}
                            onCancel={() => setView('HUB')}
                            onPreview={() => setView('PREVIEW')}
                            onFinalize={handleFinalize}
                            animationsEnabled={animationsEnabled}
                            primaryColor={primaryColor}
                            focusMode={isFocusMode}
                        />
                    </>
                )}

                {view === 'PREVIEW' && (
                    <div className="max-w-[210mm] mx-auto flex flex-col items-center py-8 animate-in zoom-in-95 duration-300">
                        <div className="w-full flex items-center justify-between gap-3 mb-6 no-print">
                            <div className="text-xs text-slate-500">
                                Arquivo: <span className="font-mono text-slate-700 dark:text-slate-200">{fileBaseName}.pdf</span>
                            </div>
                            <div className="flex items-center gap-3">
                            <button
                                onClick={() => setView('EDITOR')}
                                className="px-5 py-2 text-sm font-bold ds-button hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                            >
                                Editar
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="px-6 py-2 text-sm font-bold ds-button-primary hover:opacity-90 transition-opacity"
                            >
                                Exportar PDF
                            </button>
                            <button
                                onClick={() => {
                                    if ((currentRecipe.status || 'RASCUNHO') !== 'FINAL') {
                                        alert('A ficha está como RASCUNHO. Marque como FINAL para exportar.');
                                        return;
                                    }
                                    exportToXML(currentRecipe);
                                }}
                                className="px-5 py-2 text-sm font-bold ds-button hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                            >
                                Exportar XML
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-5 py-2 text-sm font-bold ds-button hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                            >
                                Imprimir
                            </button>
                            </div>
                        </div>
                        <div className="w-full ds-card">
                            <div className="px-4 pt-4 flex items-center justify-between no-print">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${currentRecipe.status === 'FINAL' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {currentRecipe.status || 'RASCUNHO'}
                                </span>
                                {currentRecipe.status !== 'FINAL' && (
                                    <span className="text-[10px] text-slate-400">Pré-visualização em rascunho</span>
                                )}
                            </div>
                            <div ref={previewRef}>
                                <RecipePrintable recipe={currentRecipe} />
                            </div>
                        </div>
                    </div>
                )}

                {view === 'HISTORY' && (
                    <div className="max-w-7xl mx-auto p-8 animate-in fade-in duration-300">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setView('HUB')}
                                    className="ds-icon-button hover:text-slate-900 transition mb-1"
                                >
                                    <ArrowLeft size={12} />
                                </button>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Histórico</h2>
                            </div>
                            <span className="text-sm font-mono text-slate-500">{filteredHistory.length} FICHAS</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredHistory.map(recipe => (
                                <div
                                    key={recipe.id}
                                    className="ds-card p-6 hover:border-[var(--primary)] dark:hover:border-[var(--primary)] transition-colors cursor-pointer group"
                                    onClick={() => { loadRecipe(recipe); setView('PREVIEW'); }}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-8 h-8 bg-slate-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
                                            {recipe.nome_formula.charAt(0).toUpperCase()}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }}
                                            className="text-slate-300 hover:text-red-500 transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate mb-1">{recipe.nome_formula}</h3>
                                    <p className="text-xs text-slate-500 font-mono mb-4">{new Date(recipe.data).toLocaleDateString()}</p>
                                    <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400">{recipe.ingredientes.length} Itens</span>
                                        <ArrowRight size={12} className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Settings Modal - Simplified for now */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[200]">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsSettingsOpen(false)}
                    ></div>
                    <div className="absolute right-0 top-0 h-full w-full max-w-md ds-card border-l border-slate-200 dark:border-neutral-800 p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configurações</h2>
                            <button onClick={() => setIsSettingsOpen(false)} className="ds-icon-button">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="space-y-6">


                            <div className="p-4 ds-panel">
                                <h3 className="font-semibold mb-3 dark:text-white">Cor Principal</h3>
                                <div className="flex flex-wrap gap-2">
                                    {UI_THEMES.map(theme => (
                                        <button
                                            key={theme.name}
                                            onClick={() => setPrimaryColor(theme.color)}
                                            className={`w-8 h-8 rounded-full border ${primaryColor === theme.color ? 'ring-2 ring-offset-2 ring-[var(--primary)]' : ''}`}
                                            style={{ backgroundColor: theme.color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isJsonImportOpen && (
                <div className="fixed inset-0 z-[210]">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsJsonImportOpen(false)}
                    ></div>
                    <div className="absolute left-1/2 top-1/2 w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Importar JSON</h2>
                            <button onClick={() => setIsJsonImportOpen(false)} className="ds-icon-button">
                                <X size={14} />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                            Cole o JSON no formato solicitado. Campos opcionais serão preservados.
                        </p>
                        <textarea
                            className="w-full h-64 ds-textarea font-mono text-sm focus:border-[var(--primary)]"
                            value={jsonImportText}
                            onChange={(e) => setJsonImportText(e.target.value)}
                            placeholder={`{\n  "nome_formula": "Tempero Lemon Pepper",\n  "empresa_responsavel": "",\n  "ingredientes": [\n    { "nome": "Sal refinado", "quantidade": 12.5, "unidade": "KG" }\n  ],\n  "modo_preparo": [],\n  "observacoes": ""\n}`}
                        />
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={() => setIsJsonImportOpen(false)}
                                className="px-5 py-2 text-sm font-bold ds-button hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={parseJsonImport}
                                className="px-6 py-2 text-sm font-bold ds-button-primary hover:opacity-90 transition-opacity"
                            >
                                Importar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isPresetsOpen && (
                <div className="fixed inset-0 z-[210]">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsPresetsOpen(false)}
                    ></div>
                    <div className="absolute left-1/2 top-1/2 w-[min(760px,92vw)] -translate-x-1/2 -translate-y-1/2 ds-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Presets</h2>
                            <button onClick={() => setIsPresetsOpen(false)} className="ds-icon-button">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => handleApplyPreset(preset.data)}
                                    className="text-left ds-card p-4 hover:border-[var(--primary)] transition-colors"
                                >
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{preset.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{preset.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </Layout>
    );
};

export default App;
    const fileBaseName = useMemo(() => {
        const rawName = currentRecipe.nome_formula || 'Ficha';
        const safeName = rawName
            .normalize('NFKD')
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '_');
        const status = currentRecipe.status || 'RASCUNHO';
        const date = currentRecipe.data || isoToday();
        return `Ficha_${safeName}_${status}_${date}`;
    }, [currentRecipe.nome_formula, currentRecipe.status, currentRecipe.data]);

    const handleExportPDF = async () => {
        if ((currentRecipe.status || 'RASCUNHO') !== 'FINAL') {
            alert('A ficha está como RASCUNHO. Marque como FINAL para exportar PDF.');
            return;
        }
        const target = previewRef.current;
        if (!target) return;
        // @ts-expect-error global from CDN
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF || !window.html2canvas) {
            alert('Ferramentas de exportação não disponíveis.');
            return;
        }
        const canvas = await window.html2canvas(target, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
        pdf.save(`${fileBaseName}.pdf`);
    };
