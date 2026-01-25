
import React, { useState, useEffect, useCallback } from 'react';
import { Recipe, AppState, Ingredient } from './types';
import { parseRecipe } from './services/geminiService';
import { RecipePrintable } from './components/RecipePrintable';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [inputText, setInputText] = useState('');
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [history, setHistory] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('ficha_tecnica_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

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
          setError('Erro ao analisar o arquivo. Tente novamente ou cole o texto.');
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
      setError('Erro ao processar o texto. Verifique sua conexão e chave API.');
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
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="no-print bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => { setState('IDLE'); setInputText(''); }}
          >
            <div className="bg-[#F28C28] p-1.5 rounded-lg">
              <i className="fas fa-flask text-white text-lg"></i>
            </div>
            <h1 className="font-bold text-gray-800 text-lg hidden sm:block">Ficha Técnica Pro</h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setState('HISTORY')}
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition ${state === 'HISTORY' ? 'bg-orange-50 text-[#F28C28]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <i className="fas fa-history mr-2"></i>Histórico
            </button>
            <button 
              onClick={() => { setState('IDLE'); setInputText(''); }}
              className="bg-[#F28C28] text-white text-sm font-semibold px-4 py-1.5 rounded-md hover:bg-orange-600 transition shadow-sm"
            >
              <i className="fas fa-plus mr-2"></i>Nova Ficha
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {state === 'IDLE' && (
          <div className="max-w-2xl mx-auto py-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Gerar Nova Ficha Técnica</h2>
              <p className="text-gray-500">Transforme anotações manuais ou PDFs em documentos industriais padronizados.</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Entrada de Texto Livre</label>
                <textarea 
                  className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition bg-white text-gray-900"
                  placeholder="Ex: Fórmula de Molho Shoyu. Ingredientes: 20L de água, 2L vinagre... Modo de preparo: Bater tudo e envasar."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button 
                  disabled={!inputText}
                  onClick={handleTextSubmit}
                  className="w-full mt-4 bg-[#F28C28] text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50 shadow-md"
                >
                  <i className="fas fa-magic mr-2"></i>Processar com IA
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#f9fafb] px-2 text-gray-400 font-bold">ou use um arquivo</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center h-32 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition group text-center px-4">
                  <i className="fas fa-file-pdf text-3xl text-gray-300 group-hover:text-orange-400 mb-2"></i>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-orange-600">Subir PDF</span>
                  <p className="text-[10px] text-gray-400">Extração direta de texto de PDF</p>
                  <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} />
                </label>
                <label className="flex flex-col items-center justify-center h-32 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition group text-center px-4">
                  <i className="fas fa-camera text-3xl text-gray-300 group-hover:text-orange-400 mb-2"></i>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-orange-600">Foto do Caderno</span>
                  <p className="text-[10px] text-gray-400">OCR avançado para fotos</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-bounce">
                  <div className="flex">
                    <i className="fas fa-exclamation-triangle text-red-500 mr-3 mt-1"></i>
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {state === 'PROCESSING' && (
          <div className="flex flex-col items-center justify-center py-40 animate-pulse">
             <div className="relative">
                <i className="fas fa-flask text-5xl text-[#F28C28] mb-6"></i>
                <i className="fas fa-cog fa-spin absolute -top-2 -right-2 text-gray-400 text-xl"></i>
             </div>
             <p className="text-gray-800 font-bold text-xl">Estruturando Ficha Técnica...</p>
             <p className="text-gray-400 text-sm mt-2">Isso pode levar alguns segundos.</p>
          </div>
        )}

        {state === 'EDITING' && currentRecipe && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Revisão Técnica</h2>
                <p className="text-sm text-gray-500">Verifique os dados extraídos antes de gerar o PDF final.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setState('IDLE')}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="flex-1 sm:flex-none px-8 py-2 bg-[#F28C28] text-white font-bold rounded-lg hover:bg-orange-600 transition shadow-lg flex items-center justify-center"
                >
                  <i className="fas fa-check-circle mr-2"></i> Finalizar Ficha
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 space-y-10">
                {/* Título da Formula */}
                <div className="group">
                  <label className="block text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Título do Documento</label>
                  <input 
                    className="w-full text-3xl font-black text-gray-900 border-b-2 border-gray-50 focus:border-orange-500 outline-none pb-2 transition bg-transparent"
                    value={currentRecipe.nome_formula || ''}
                    onChange={(e) => setCurrentRecipe({...currentRecipe, nome_formula: e.target.value})}
                    placeholder="Nome da Receita/Fórmula"
                  />
                </div>

                {/* Grid de Ingredientes */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Ingredientes e Insumos</h3>
                      <p className="text-xs text-gray-400">Defina quantidades e unidades normalizadas</p>
                    </div>
                    <button 
                      onClick={addIngredient}
                      className="bg-orange-50 text-[#F28C28] text-xs font-bold px-4 py-2 rounded-full hover:bg-[#F28C28] hover:text-white transition flex items-center"
                    >
                      <i className="fas fa-plus-circle mr-2"></i> Novo Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {currentRecipe.ingredientes.map((ing, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:border-orange-100 transition">
                        <input 
                          className="flex-1 p-2 bg-white rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-orange-100 text-gray-900 font-medium"
                          value={ing.nome || ''}
                          onChange={(e) => updateIngredient(idx, 'nome', e.target.value)}
                          placeholder="Nome do Ingrediente"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="number"
                            className="w-24 p-2 bg-white rounded-lg border border-gray-200 text-sm text-right font-mono outline-none focus:ring-2 focus:ring-orange-100 text-gray-900"
                            value={ing.quantidade ?? ''}
                            onChange={(e) => updateIngredient(idx, 'quantidade', parseFloat(e.target.value) || 0)}
                          />
                          <select 
                            className="w-24 p-2 bg-white rounded-lg border border-gray-200 text-sm uppercase font-mono outline-none focus:ring-2 focus:ring-orange-100 text-gray-900 cursor-pointer"
                            value={ing.unidade || 'GR'}
                            onChange={(e) => updateIngredient(idx, 'unidade', e.target.value)}
                          >
                            <option value="GR">GR</option>
                            <option value="KG">KG</option>
                            <option value="ML">ML</option>
                            <option value="LT">LT</option>
                            <option value="UN">UN</option>
                            <option value="PC">PC</option>
                          </select>
                          <button 
                            onClick={() => removeIngredient(idx)}
                            className="p-2 text-gray-300 hover:text-red-500 transition"
                          >
                            <i className="fas fa-times-circle"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modo de Preparo */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Modo de Preparo</h3>
                      <p className="text-xs text-gray-400">Passo a passo da operação técnica</p>
                    </div>
                    <button 
                      onClick={addStep}
                      className="bg-orange-50 text-[#F28C28] text-xs font-bold px-4 py-2 rounded-full hover:bg-[#F28C28] hover:text-white transition flex items-center"
                    >
                      <i className="fas fa-plus-circle mr-2"></i> Adicionar Passo
                    </button>
                  </div>

                  <div className="space-y-4">
                    {currentRecipe.modo_preparo.map((passo, idx) => (
                      <div key={idx} className="flex gap-4 items-start bg-gray-50/30 p-4 rounded-xl border border-gray-100">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-orange-400 border border-orange-100 shadow-sm">
                          {idx + 1}
                        </span>
                        <div className="flex-1 flex flex-col gap-2">
                           <textarea 
                            className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-orange-100 transition resize-none text-gray-800"
                            rows={2}
                            value={passo || ''}
                            onChange={(e) => updateStep(idx, e.target.value)}
                            placeholder={`Instrução do passo ${idx + 1}...`}
                          />
                        </div>
                        <button 
                          onClick={() => removeStep(idx)}
                          className="mt-2 text-gray-300 hover:text-red-500 transition"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observações Finais */}
                <div className="pt-6 border-t border-gray-50">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notas e Observações Técnicas</label>
                  <textarea 
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm outline-none focus:ring-2 focus:ring-orange-100 italic text-gray-800 bg-white"
                    rows={3}
                    value={currentRecipe.observacoes || ''}
                    onChange={(e) => setCurrentRecipe({...currentRecipe, observacoes: e.target.value})}
                    placeholder="Ex: Armazenar em local seco e arejado. Validade: 12 meses."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {state === 'PREVIEW' && currentRecipe && (
          <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
            <div className="no-print flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
              <button 
                onClick={() => setState('EDITING')}
                className="flex-1 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm flex items-center justify-center"
              >
                <i className="fas fa-pencil-alt mr-2"></i> Voltar para Edição
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-[#F28C28] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-xl flex items-center justify-center"
              >
                <i className="fas fa-file-export mr-2"></i> Exportar / Imprimir PDF
              </button>
            </div>
            <RecipePrintable recipe={currentRecipe} />
          </div>
        )}

        {state === 'HISTORY' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Arquivo de Fórmulas</h2>
              <span className="bg-orange-100 text-[#F28C28] text-[10px] font-bold px-3 py-1 rounded-full uppercase">{history.length} Fichas Salvas</span>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-archive text-gray-200 text-3xl"></i>
                </div>
                <p className="text-gray-400 font-medium">Seu arquivo histórico está vazio.</p>
                <button onClick={() => setState('IDLE')} className="mt-4 text-[#F28C28] font-bold hover:underline text-sm">Criar minha primeira ficha</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {history.map((recipe) => (
                  <div key={recipe.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:w-20 group-hover:h-20"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="text-[10px] font-bold text-[#F28C28] bg-orange-50 px-2 py-0.5 rounded uppercase tracking-tighter">{recipe.data}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setCurrentRecipe(recipe); setState('EDITING'); }}
                          className="text-gray-300 hover:text-[#F28C28] transition"
                          title="Editar"
                        >
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button 
                          onClick={() => deleteRecipe(recipe.id)}
                          className="text-gray-300 hover:text-red-500 transition"
                          title="Excluir"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-800 text-xl mb-1 group-hover:text-[#F28C28] transition">{recipe.nome_formula}</h3>
                    <p className="text-[11px] text-gray-400 mb-6 flex items-center">
                       <i className="fas fa-layer-group mr-1.5"></i> {recipe.ingredientes.length} Insumos 
                       <span className="mx-2">•</span> 
                       <i className="fas fa-list-ol mr-1.5"></i> {recipe.modo_preparo.length} Etapas
                    </p>

                    <button 
                      onClick={() => { setCurrentRecipe(recipe); setState('PREVIEW'); }}
                      className="w-full py-3 bg-gray-50 text-gray-600 font-bold text-xs rounded-xl hover:bg-[#F28C28] hover:text-white transition shadow-sm"
                    >
                      ABRIR FICHA TÉCNICA
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer (No print) */}
      <footer className="no-print border-t border-gray-50 py-10 mt-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          <div className="flex gap-4 mb-4">
             <i className="fab fa-react text-gray-200 text-xl"></i>
             <i className="fas fa-brain text-gray-200 text-xl"></i>
             <i className="fas fa-file-pdf text-gray-200 text-xl"></i>
          </div>
          <p className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-bold">
            Gerenciador de Padronização Industrial • 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
