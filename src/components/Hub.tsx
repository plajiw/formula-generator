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
        <div className="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6 border-b border-slate-200 dark:border-neutral-800 pb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                        {t('common.appName')}
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">
                        {t('common.systemTitle')}
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400 font-mono">{t('common.version')}</p>
                    <p className="text-xs text-slate-400 font-mono">{t('common.systemReady')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
                {/* Card: Nova Receita */}
                <button
                    onClick={onNewRecipe}
                    className="group relative flex flex-col items-start p-6 ds-card hover:border-[var(--primary)] dark:hover:border-[var(--primary)] transition-all duration-200"
                >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mb-6 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-200">
                        <Plus size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">{t('buttons.newSheet')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-left leading-relaxed">
                        {t('hub.newSheetDesc')}
                    </p>
                    <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-bold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                        {t('hub.start')} <ArrowRight size={12} />
                    </div>
                </button>

                {/* Card: Assistente IA */}
                <button
                    onClick={onOpenWizard}
                    className="group relative flex flex-col items-start p-6 ds-card hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-200"
                >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                        <Wand2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">{t('buttons.openWizard')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-left leading-relaxed">
                        {t('hub.wizardDesc')}
                    </p>
                    <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                        {t('hub.access')} <ArrowRight size={12} />
                    </div>
                </button>

                {/* Card: Importar XML */}
                <button
                    onClick={onImportXML}
                    className="group relative flex flex-col items-start p-6 ds-card hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200"
                >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                        <FileInput size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">{t('buttons.importXml')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-left leading-relaxed">
                        {t('hub.importXmlDesc')}
                    </p>
                    <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                        {t('hub.upload')} <ArrowRight size={12} />
                    </div>
                </button>

                {/* Card: Importar JSON */}
                <button
                    onClick={onImportJSON}
                    className="group relative flex flex-col items-start p-6 ds-card hover:border-sky-500 dark:hover:border-sky-500 transition-all duration-200"
                >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mb-6 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-200">
                        <FileJson size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">{t('buttons.importJson')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-left leading-relaxed">
                        {t('hub.importJsonDesc')}
                    </p>
                    <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-bold text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                        {t('hub.paste')} <ArrowRight size={12} />
                    </div>
                </button>

                {/* Card: Presets */}
                <button
                    onClick={onOpenPresets}
                    className="group relative flex flex-col items-start p-6 ds-card hover:border-[var(--primary)] dark:hover:border-[var(--primary)] transition-all duration-200"
                >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mb-6 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-200">
                        <Layers3 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">{t('buttons.presets')}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-left leading-relaxed">
                        {t('hub.presetsDesc')}
                    </p>
                    <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-bold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                        {t('hub.choose')} <ArrowRight size={12} />
                    </div>
                </button>
            </div>

            {/* Histórico Recente */}
            <div>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200 dark:border-neutral-800">
                    <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History size={16} /> {t('hub.recent')}
                    </h2>
                    <button onClick={onOpenHistory} className="text-xs font-bold text-[var(--primary)] hover:underline uppercase tracking-wide">
                        {t('hub.viewAll')}
                    </button>
                </div>

                {recentRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentRecipes.slice(0, 3).map((recipe) => (
                            <div key={recipe.id}
                                onClick={() => onLoadRecipe(recipe)}
                                className="cursor-pointer ds-card p-4 hover:border-[var(--primary)] dark:hover:border-[var(--primary)] transition-colors flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-lg group-hover:text-[var(--primary)] transition-colors">
                                    {recipe.nome_formula.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate pr-2 tracking-tight group-hover:text-[var(--primary)] transition-colors">{recipe.nome_formula}</h4>
                                    <p className="text-xs text-slate-500 font-mono">{new Intl.DateTimeFormat(locale).format(new Date(recipe.data))}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-neutral-900 border border-dashed border-slate-200 dark:border-neutral-800">
                        <p className="text-sm text-slate-400 font-mono">{t('hub.empty')}</p>
                    </div>
                )}
            </div>

        </div>
    );
};
