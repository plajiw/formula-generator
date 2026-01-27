import React, { useEffect, useMemo } from 'react';
import { AlertCircle, Camera, CheckCircle2, Loader2, Sparkles, Trash2, Wand2, X } from 'lucide-react';
import { useAIWizard } from '../../hooks/useAIWizard';

interface WizardModalProps {
    wizard: ReturnType<typeof useAIWizard>;
    animationsEnabled: boolean;
}

export const WizardModal: React.FC<WizardModalProps> = ({ wizard, animationsEnabled }) => {
    if (!wizard.isOpen) return null;
    const previewUrl = useMemo(() => {
        return wizard.selectedFile ? URL.createObjectURL(wizard.selectedFile) : '';
    }, [wizard.selectedFile]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`ds-card w-full max-w-2xl overflow-hidden ${animationsEnabled ? 'animate-in zoom-in-95 duration-200' : ''}`}>

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-slate-50 dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--primary)]/30">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assistente IA</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Descreva sua receita ou envie uma foto</p>
                        </div>
                    </div>
                    <button onClick={wizard.close} className="ds-icon-button hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 hover:text-red-500 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {wizard.error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                            <AlertCircle size={18} className="text-red-500 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-red-700 dark:text-red-300">Erro no Processamento</h4>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{wizard.error}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Descreva a Receita
                        </label>
                        <textarea
                            className="w-full h-32 ds-textarea text-sm font-normal focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all resize-none placeholder-slate-400"
                            placeholder="Ex: Bolo de cenoura com cobertura de chocolate. Ingredientes: 3 cenouras, 3 ovos..."
                            value={wizard.inputText}
                            onChange={(e) => wizard.setInputText(e.target.value)}
                            onPaste={(e) => {
                                const items = e.clipboardData?.items;
                                if (!items) return;
                                for (const item of items) {
                                    if (item.type.startsWith('image/')) {
                                        const file = item.getAsFile();
                                        if (file) {
                                            wizard.setSelectedFile(file);
                                        }
                                    }
                                }
                            }}
                        />
                        {wizard.selectedFile && (
                            <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 px-3 py-2">
                                <div className="w-10 h-10 rounded-md overflow-hidden border border-slate-200 dark:border-neutral-800 bg-slate-100 dark:bg-neutral-800">
                                    <img src={previewUrl} alt="Pré-visualização" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 text-xs text-slate-500 dark:text-slate-400">
                                    Imagem anexada via colar
                                </div>
                                <button
                                    onClick={() => wizard.setSelectedFile(null)}
                                    className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-neutral-800 transition"
                                    title="Remover imagem"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-neutral-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-neutral-900 text-slate-500">OU envie uma imagem</span>
                        </div>
                    </div>

                    <div>
                        <label className="block w-full cursor-pointer group">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={wizard.handleFileChange}
                            />
                            <div className={`ds-drop p-6 text-center transition-all ${wizard.selectedFile ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'hover:border-[var(--primary)] hover:bg-slate-50 dark:hover:bg-neutral-800/60'}`}>
                                {wizard.selectedFile ? (
                                    <div className="flex items-center justify-center gap-3 text-indigo-600 dark:text-indigo-400">
                                        <CheckCircle2 size={18} />
                                        <span className="font-medium">{wizard.selectedFile.name}</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                            <Camera size={18} className="text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Clique para enviar foto de um caderno ou cardápio
                                        </span>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 dark:bg-neutral-900/60 border-t border-slate-100 dark:border-neutral-800 flex justify-end gap-3">
                    <button
                        onClick={wizard.close}
                        disabled={wizard.isProcessing}
                        className="px-5 py-2.5 ds-button hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={wizard.processWizard}
                        disabled={(!wizard.inputText && !wizard.selectedFile) || wizard.isProcessing}
                        className={`px-6 py-2.5 ds-button-primary shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2 transition-all ${(!wizard.inputText && !wizard.selectedFile) || wizard.isProcessing ? 'bg-slate-300 dark:bg-neutral-800 cursor-not-allowed opacity-70 border-transparent' : 'hover:shadow-[var(--primary)]/40 hover:-translate-y-0.5 active:translate-y-0'}`}
                    >
                        {wizard.isProcessing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Processando...
                            </>
                        ) : (
                            <>
                                <Wand2 size={16} /> Gerar Ficha
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
