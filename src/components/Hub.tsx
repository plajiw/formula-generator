import React from 'react';
import { Plus, Wand2, FileInput, FileJson, History, ArrowRight, Layers3 } from 'lucide-react';
import { useI18n } from '../i18n/i18n.tsx';

interface HubProps {
    onNewRecipe: () => void;
    onOpenWizard: () => void;
    onImportXML: () => void;
    onImportJSON: () => void;
    onOpenPresets: () => void;
    onOpenHistory: () => void;
    recentRecipes: any[];
    onLoadRecipe: (recipe: any) => void;
}

export const Hub: React.FC<HubProps> = ({
    onNewRecipe,
    onOpenWizard,
    onImportXML,
    onImportJSON,
    onOpenPresets,
    onOpenHistory,
    recentRecipes,
    onLoadRecipe
}) => {
    const { t, locale } = useI18n();
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
                {/* Header */}
                <div className="mb-12 sm:mb-16">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b-2 border-slate-200 dark:border-slate-700">
                        <div className="space-y-2 flex-1">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                                {t('common.appName')}
                            </h1>
                            <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400 tracking-wide">
                                {t('common.systemTitle')}
                            </p>
                        </div>
                        <div className="text-right text-xs sm:text-sm space-y-1">
                            <p className="text-slate-500 dark:text-slate-400 font-mono font-semibold">{t('common.version')}</p>
                            <p className="text-slate-500 dark:text-slate-400 font-mono">{t('common.systemReady')}</p>
                        </div>
                    </div>
                </div>

                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-12 sm:mb-16">
                {/* Card: Nova Receita */}
                <button
                    onClick={onNewRecipe}
                    className="group relative flex flex-col p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-[var(--primary)] dark:hover:border-[var(--primary)] transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-white items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <Plus size={24} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2 text-left">{t('buttons.newSheet')}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-left leading-relaxed flex-1 mb-4">
                        {t('hub.newSheetDesc')}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest">
                        {t('hub.start')} <ArrowRight size={14} />
                    </div>
                </button>

                {/* Card: Assistente IA */}
                <button
                    onClick={onOpenWizard}
                    className="group relative flex flex-col p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <Wand2 size={24} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2 text-left">{t('buttons.openWizard')}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-left leading-relaxed flex-1 mb-4">
                        {t('hub.wizardDesc')}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest">
                        {t('hub.access')} <ArrowRight size={14} />
                    </div>
                </button>

                {/* Card: Importar XML */}
                <button
                    onClick={onImportXML}
                    className="group relative flex flex-col p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <FileInput size={24} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2 text-left">{t('buttons.importXml')}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-left leading-relaxed flex-1 mb-4">
                        {t('hub.importXmlDesc')}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest">
                        {t('hub.upload')} <ArrowRight size={14} />
                    </div>
                </button>

                {/* Card: Importar JSON */}
                <button
                    onClick={onImportJSON}
                    className="group relative flex flex-col p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-sky-500 dark:hover:border-sky-500 transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600 to-sky-500 text-white items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <FileJson size={24} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2 text-left">{t('buttons.importJson')}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-left leading-relaxed flex-1 mb-4">
                        {t('hub.importJsonDesc')}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest">
                        {t('hub.paste')} <ArrowRight size={14} />
                    </div>
                </button>

                {/* Card: Presets */}
                <button
                    onClick={onOpenPresets}
                    className="group relative flex flex-col p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-[var(--primary)] dark:hover:border-[var(--primary)] transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-white items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <Layers3 size={24} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2 text-left">{t('buttons.presets')}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-left leading-relaxed flex-1 mb-4">
                        {t('hub.presetsDesc')}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest">
                        {t('hub.choose')} <ArrowRight size={14} />
                    </div>
                </button>
            </div>

            {/* Recent History Section */}
            <div className="mt-12 sm:mt-16">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-700">
                    <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <History size={18} className="text-[var(--primary)]" /> {t('hub.recent')}
                    </h2>
                    <button onClick={onOpenHistory} className="text-xs font-bold text-[var(--primary)] hover:underline uppercase tracking-wide transition-colors duration-200">
                        {t('hub.viewAll')} →
                    </button>
                </div>

                {recentRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentRecipes.slice(0, 3).map((recipe) => (
                            <div key={recipe.id}
                                onClick={() => onLoadRecipe(recipe)}
                                className="cursor-pointer group rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-4 hover:border-[var(--primary)] dark:hover:border-[var(--primary)] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-lg group-hover:from-[var(--primary)] group-hover:to-[var(--primary)]/80 group-hover:text-white transition-all duration-300">
                                    {recipe.nome_formula.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-[var(--primary)] transition-colors">{recipe.nome_formula}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(recipe.data).toLocaleDateString(locale)}</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-400 group-hover:text-[var(--primary)] transition-colors opacity-0 group-hover:opacity-100" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <History size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('hub.noRecipes')}</p>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};
