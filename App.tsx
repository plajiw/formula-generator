
import React, { useState, useEffect, useCallback } from 'react';
import { Recipe, AppState, Ingredient } from './types';
import { parseRecipe } from './services/geminiService';
import { RecipePrintable } from './components/RecipePrintable';

// Premium Color Palettes
const THEMES = [
  { name: 'Safety Orange', color: '#F28C28' },
  { name: 'Royal Blue', color: '#3B82F6' },
  { name: 'Emerald Green', color: '#10B981' },
  { name: 'Berry Purple', color: '#8B5CF6' },
  { name: 'Slate Dark', color: '#475569' },
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [inputText, setInputText] = useState('');
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [history, setHistory] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#F28C28');

  // Load history and theme
  useEffect(() => {
    const savedHistory = localStorage.getItem('ficha_tecnica_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Set initial theme css variable
    document.documentElement.style.setProperty('--primary', primaryColor);
  }, []);

  // Update CSS variable when color changes
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
  }, [primaryColor]);

  const saveToHistory = useCallback((recipe: Recipe) => {
    const updated = [recipe, ...history.filter(h => h.id !== recipe.id)];
    setHistory(updated);
    localStorage.setItem('ficha_tecnica_history', JSON.stringify(updated));
  }, [history]);

  const sanitizeAndSetRecipe = (rawRecipe: Recipe) => {
    const sanitized: Recipe = {
      ...rawRecipe,
      nome_formula: rawRecipe.nome_formula || 'Nova Receita sem Título',
      ingredientes: rawRecipe.ingredientes && rawRecipe.ingredientes.length > 0
        ? rawRecipe.ingredientes
        : [{ nome: '', quantidade: 0, unidade: 'GR' }],
      modo_preparo: rawRecipe.modo_preparo && rawRecipe.modo_preparo.length > 0
        ? rawRecipe.modo_preparo
        : ['Primeiro passo da receita...'],
      observacoes: rawRecipe.observacoes || ''
    };
    setCurrentRecipe(sanitized);
    setState('EDITING');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState('PROCESSING');
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const mimeType = file.type;
          const result = await parseRecipe({ data: base64, mimeType });
          sanitizeAndSetRecipe(result);
        } catch (err) {
          setError('Não foi possível ler este arquivo. Verifique se é uma imagem ou PDF válido.');
          setState('IDLE');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Erro ao ler o arquivo.');
      setState('IDLE');
    }
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;
    setState('PROCESSING');
    setError(null);
    try {
      const result = await parseRecipe(inputText);
      sanitizeAndSetRecipe(result);
    } catch (err) {
      setError('Erro ao processar. Verifique sua chave API no .env.local');
      setState('IDLE');
    }
  };

  const handleSaveEdit = () => {
    if (currentRecipe) {
      saveToHistory(currentRecipe);
      setState('PREVIEW');
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    if (!currentRecipe) return;
    const newIngs = [...currentRecipe.ingredientes];
    newIngs[index] = { ...newIngs[index], [field]: value };
    setCurrentRecipe({ ...currentRecipe, ingredientes: newIngs });
  };

  const addIngredient = () => {
    if (!currentRecipe) return;
    setCurrentRecipe({
      ...currentRecipe,
      ingredientes: [...currentRecipe.ingredientes, { nome: '', quantidade: 0, unidade: 'GR' }]
    });
  };

  const removeIngredient = (index: number) => {
    if (!currentRecipe) return;
    const newIngs = currentRecipe.ingredientes.filter((_, i) => i !== index);
    setCurrentRecipe({ ...currentRecipe, ingredientes: newIngs.length > 0 ? newIngs : [{ nome: '', quantidade: 0, unidade: 'GR' }] });
  };

  const addStep = () => {
    if (!currentRecipe) return;
    setCurrentRecipe({
      ...currentRecipe,
      modo_preparo: [...currentRecipe.modo_preparo, '']
    });
  };

  const removeStep = (index: number) => {
    if (!currentRecipe) return;
    const newSteps = currentRecipe.modo_preparo.filter((_, i) => i !== index);
    setCurrentRecipe({ ...currentRecipe, modo_preparo: newSteps.length > 0 ? newSteps : [''] });
  };

  const updateStep = (index: number, value: string) => {
    if (!currentRecipe) return;
    const newSteps = [...currentRecipe.modo_preparo];
    newSteps[index] = value;
    setCurrentRecipe({ ...currentRecipe, modo_preparo: newSteps });
  };

  const deleteRecipe = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('ficha_tecnica_history', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50 selection:bg-[var(--primary)] selection:text-white" style={{ '--primary': primaryColor } as React.CSSProperties}>

      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`, backgroundSize: '32px 32px' }}>
      </div>

      {/* Navigation */}
      <nav className="no-print bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => { setState('IDLE'); setInputText(''); }}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center transform group-hover:rotate-12 transition-all shadow-lg shadow-[var(--primary)]/30">
                <i className="fas fa-flask text-lg"></i>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg tracking-tight">Ficha Técnica <span className="text-[var(--primary)]">Pro</span></h1>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Industrial Standard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Picker */}
              <div className="hidden md:flex gap-1 bg-gray-100 p-1 rounded-full">
                {THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setPrimaryColor(theme.color)}
                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${primaryColor === theme.color ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                    style={{ backgroundColor: theme.color }}
                    title={theme.name}
                  />
                ))}
              </div>

              <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

              <button
                onClick={() => setState('HISTORY')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${state === 'HISTORY' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <i className="fas fa-history"></i> <span className="hidden sm:inline">Histórico</span>
              </button>

              <button
                onClick={() => { setState('IDLE'); setInputText(''); }}
                className="bg-[var(--primary)] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-[var(--primary)]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Nova Ficha
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-8">
        {state === 'IDLE' && (
          <div className="max-w-3xl mx-auto mt-8 sm:mt-16 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="text-center mb-12 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold tracking-wider uppercase mb-2">
                Powered by AI Gemini
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Padronize sua Produção <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-gray-600">Em Segundos</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                Transforme anotações soltas, fotos de caderno ou PDFs em documentos técnicos industriais perfeitamente formatados.
              </p>
            </div>

            <div className="glass-panel bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden backdrop-blur-xl">
              <div className="p-1">
                <div className="bg-gray-50/50 rounded-[22px] p-6 sm:p-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Descreva sua receita ou cole o texto</label>
                  <div className="relative group">
                    <textarea
                      className="w-full h-48 sm:h-56 p-6 bg-white border-0 rounded-2xl shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-[var(--primary)] transition-all resize-none text-gray-700 placeholder:text-gray-300 text-lg leading-relaxed"
                      placeholder="Ex: Bolo de Chocolate Industrial. 20kg de farinha, 10kg de açúcar... Misture os secos, adicione os líquidos..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        disabled={!inputText}
                        onClick={handleTextSubmit}
                        className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2"
                      >
                        <i className="fas fa-wand-magic-sparkles"></i> Gerar Ficha
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 my-8">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ou envie um arquivo</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col items-center justify-center h-32 bg-white rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group">
                      <i className="fas fa-file-pdf text-3xl text-gray-300 group-hover:text-[var(--primary)] mb-3 transition-colors"></i>
                      <span className="text-sm font-bold text-gray-600 group-hover:text-[var(--primary)]">PDF / DOC</span>
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                    </label>
                    <label className="flex flex-col items-center justify-center h-32 bg-white rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group">
                      <i className="fas fa-camera text-3xl text-gray-300 group-hover:text-[var(--primary)] mb-3 transition-colors"></i>
                      <span className="text-sm font-bold text-gray-600 group-hover:text-[var(--primary)]">Foto / Imagem</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                <i className="fas fa-exclamation-circle text-xl"></i>
                <p className="font-medium">{error}</p>
              </div>
            )}
          </div>
        )}

        {state === 'PROCESSING' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-1000">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-brain text-4xl text-[var(--primary)] animate-pulse"></i>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analisando Ingredientes...</h2>
            <p className="text-gray-500 animate-pulse">A IA está estruturando sua ficha técnica.</p>
          </div>
        )}

        {state === 'EDITING' && currentRecipe && (
          <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Revisão Técnica</h2>
                <div className="h-1 w-20 bg-[var(--primary)] rounded-full mt-2"></div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setState('IDLE')}
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 sm:flex-none px-8 py-2.5 bg-[var(--primary)] text-white rounded-xl font-bold shadow-lg shadow-[var(--primary)]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-check"></i> Finalizar
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-8 space-y-12">
                {/* Nome e Dados Básicos */}
                <div className="group">
                  <label className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest mb-2 block">Identificação do Produto</label>
                  <input
                    className="w-full text-4xl font-black text-gray-800 border-b-2 border-transparent focus:border-[var(--primary)] placeholder-gray-200 outline-none bg-transparent transition-colors pb-2"
                    value={currentRecipe.nome_formula}
                    onChange={(e) => setCurrentRecipe({ ...currentRecipe, nome_formula: e.target.value })}
                    placeholder="Nome da Receita"
                  />
                </div>

                {/* Ingredientes */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm"><i className="fas fa-balance-scale"></i></span>
                      Composição
                    </h3>
                    <button onClick={addIngredient} className="text-[var(--primary)] font-bold text-sm hover:underline">+ Adicionar Item</button>
                  </div>

                  <div className="space-y-3">
                    {currentRecipe.ingredientes.map((ing, idx) => (
                      <div key={idx} className="flex gap-3 items-center group">
                        <div className="w-6 text-center text-xs font-bold text-gray-300">{idx + 1}</div>
                        <input
                          className="flex-1 p-3 bg-white rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition font-medium text-gray-700"
                          value={ing.nome}
                          onChange={(e) => updateIngredient(idx, 'nome', e.target.value)}
                          placeholder="Ingrediente..."
                        />
                        <input
                          type="number"
                          className="w-24 p-3 bg-white rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition font-mono text-right text-gray-700"
                          value={ing.quantidade}
                          onChange={(e) => updateIngredient(idx, 'quantidade', parseFloat(e.target.value) || 0)}
                        />
                        <select
                          className="w-24 p-3 bg-white rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition font-bold text-xs uppercase cursor-pointer"
                          value={ing.unidade}
                          onChange={(e) => updateIngredient(idx, 'unidade', e.target.value)}
                        >
                          {['GR', 'KG', 'ML', 'LT', 'UN', 'PC'].map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <button onClick={() => removeIngredient(idx)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition">
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modo de Preparo */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm"><i className="fas fa-list-ol"></i></span>
                      Procedimento
                    </h3>
                    <button onClick={addStep} className="text-[var(--primary)] font-bold text-sm hover:underline">+ Adicionar Passo</button>
                  </div>

                  <div className="space-y-4">
                    {currentRecipe.modo_preparo.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start group">
                        <span className="flex-shrink-0 w-8 h-8 bg-white rounded-full border-2 border-gray-100 text-gray-400 font-bold flex items-center justify-center group-hover:border-[var(--primary)] group-hover:text-[var(--primary)] transition-colors">
                          {idx + 1}
                        </span>
                        <textarea
                          className="flex-1 p-3 bg-white rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition text-gray-700 resize-none"
                          rows={2}
                          value={step}
                          onChange={(e) => updateStep(idx, e.target.value)}
                          placeholder="Descreva este passo..."
                        />
                        <button onClick={() => removeStep(idx)} className="mt-2 text-gray-300 hover:text-red-500 transition">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Notas Adicionais</label>
                  <textarea
                    className="w-full p-4 bg-yellow-50/50 border-l-4 border-yellow-200 rounded-r-xl outline-none text-gray-600 focus:bg-yellow-50 transition"
                    placeholder="Observações de qualidade, validade ou armazenamento..."
                    value={currentRecipe.observacoes}
                    onChange={(e) => setCurrentRecipe({ ...currentRecipe, observacoes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {state === 'PREVIEW' && currentRecipe && (
          <div className="max-w-4xl mx-auto flex flex-col gap-8 items-center animate-in zoom-in-95 duration-500">
            <div className="no-print w-full flex justify-between items-center glass-panel p-4 rounded-2xl bg-white border border-gray-100 shadow-lg">
              <button onClick={() => setState('EDITING')} className="text-gray-500 font-bold hover:text-gray-800 transition flex items-center gap-2">
                <i className="fas fa-arrow-left"></i> Voltar
              </button>
              <button
                onClick={() => window.print()}
                className="bg-[var(--primary)] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[var(--primary)]/30 hover:scale-105 transition-all flex items-center gap-2"
              >
                <i className="fas fa-print"></i> Imprimir Ficha
              </button>
            </div>
            <RecipePrintable recipe={currentRecipe} />
          </div>
        )}

        {state === 'HISTORY' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Seu Arquivo</h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{history.length} ITEMS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map(recipe => (
                <div key={recipe.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
                  onClick={() => { setCurrentRecipe(recipe); setState('PREVIEW'); }}>

                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)]/5 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none group-hover:bg-[var(--primary)]/10 transition-colors"></div>

                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/5 px-2 py-1 rounded">{recipe.data}</span>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setCurrentRecipe(recipe); setState('EDITING'); }} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-[var(--primary)] hover:text-white transition flex items-center justify-center text-gray-400">
                        <i className="fas fa-pen text-xs"></i>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-500 hover:text-white transition flex items-center justify-center text-gray-400">
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-800 text-xl mb-2 line-clamp-1">{recipe.nome_formula}</h3>
                  <div className="flex gap-4 text-xs text-gray-400 font-medium">
                    <span>{recipe.ingredientes.length} Insumos</span>
                    <span>{recipe.modo_preparo.length} Passos</span>
                  </div>
                </div>
              ))}

              {history.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400">
                  <i className="fas fa-inbox text-5xl mb-4 opacity-20"></i>
                  <p>Nenhuma ficha salva ainda.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
