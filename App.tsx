
import React, { useState, useEffect, useCallback } from 'react';
import { Recipe, AppState, Ingredient } from './types';
import { parseRecipe } from './services/geminiService';
import { RecipePrintable } from './components/RecipePrintable';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [inputText, setInputText] = useState('');
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [history, setHistory] = useState<Recipe[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const mimeType = file.type;
        const result = await parseRecipe({ data: base64, mimeType });
        setCurrentRecipe(result);
        setState('EDITING');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Erro ao processar arquivo. Verifique sua chave API.');
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await parseRecipe(inputText);
      setCurrentRecipe(result);
      setState('EDITING');
      setIsProcessing(false);
    } catch (err) {
      setError('Erro ao processar texto. Verifique sua chave API.');
      setIsProcessing(false);
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
    setCurrentRecipe({ ...currentRecipe, ingredientes: newIngs });
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
              onClick={() => setState('IDLE')}
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
              <p className="text-gray-500">Cole uma anotação, suba um PDF ou tire uma foto de uma receita manuscrita.</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Entrada de Texto</label>
                <textarea 
                  className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                  placeholder="Ex: Molho Shoyu - 20L de água, 2L vinagre, 21.5g benzoato... Bater tudo no liquidificador."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button 
                  disabled={!inputText || isProcessing}
                  onClick={handleTextSubmit}
                  className="w-full mt-4 bg-[#F28C28] text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isProcessing ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : <i className="fas fa-magic mr-2"></i>}
                  Processar com Inteligência Artificial
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#f9fafb] px-2 text-gray-400 font-bold">ou</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center h-32 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition group">
                  <i className="fas fa-file-pdf text-3xl text-gray-300 group-hover:text-orange-400 mb-2"></i>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-orange-600">Subir PDF</span>
                  <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} />
                </label>
                <label className="flex flex-col items-center justify-center h-32 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition group">
                  <i className="fas fa-camera text-3xl text-gray-300 group-hover:text-orange-400 mb-2"></i>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-orange-600">Foto / Imagem</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex">
                    <i className="fas fa-exclamation-triangle text-red-500 mr-3 mt-1"></i>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {state === 'EDITING' && currentRecipe && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Revisão Técnica</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setState('IDLE')}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  Descartar
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-[#F28C28] text-white font-bold rounded-lg hover:bg-orange-600 transition shadow-md"
                >
                  Gerar PDF
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome da Fórmula</label>
                <input 
                  className="w-full text-2xl font-bold text-gray-800 border-b-2 border-transparent focus:border-orange-500 outline-none pb-2 transition"
                  value={currentRecipe.nome_formula}
                  onChange={(e) => setCurrentRecipe({...currentRecipe, nome_formula: e.target.value})}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-bold text-gray-400 uppercase">Ingredientes</label>
                  <button onClick={addIngredient} className="text-[#F28C28] text-xs font-bold hover:underline">
                    <i className="fas fa-plus mr-1"></i> Adicionar
                  </button>
                </div>
                <div className="space-y-3">
                  {currentRecipe.ingredientes.map((ing, idx) => (
                    <div key={idx} className="flex gap-3 items-center group">
                      <input 
                        className="flex-1 p-2 bg-gray-50 rounded-md border border-gray-200 text-sm"
                        value={ing.nome}
                        onChange={(e) => updateIngredient(idx, 'nome', e.target.value)}
                        placeholder="Nome do ingrediente"
                      />
                      <input 
                        type="number"
                        className="w-24 p-2 bg-gray-50 rounded-md border border-gray-200 text-sm text-right font-mono"
                        value={ing.quantidade}
                        onChange={(e) => updateIngredient(idx, 'quantidade', parseFloat(e.target.value))}
                      />
                      <select 
                        className="w-20 p-2 bg-gray-50 rounded-md border border-gray-200 text-sm uppercase font-mono"
                        value={ing.unidade}
                        onChange={(e) => updateIngredient(idx, 'unidade', e.target.value)}
                      >
                        <option value="GR">GR</option>
                        <option value="KG">KG</option>
                        <option value="ML">ML</option>
                        <option value="LT">LT</option>
                        <option value="UN">UN</option>
                      </select>
                      <button 
                        onClick={() => removeIngredient(idx)}
                        className="p-2 text-gray-300 hover:text-red-500 transition"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Modo de Preparo</label>
                <div className="space-y-2">
                  {currentRecipe.modo_preparo.map((passo, idx) => (
                    <div key={idx} className="flex gap-3 items-start group">
                      <span className="mt-2 text-xs font-bold text-gray-300">{idx+1}.</span>
                      <textarea 
                        className="flex-1 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm leading-relaxed outline-none focus:border-orange-300"
                        rows={2}
                        value={passo}
                        onChange={(e) => {
                          const newModo = [...currentRecipe.modo_preparo];
                          newModo[idx] = e.target.value;
                          setCurrentRecipe({...currentRecipe, modo_preparo: newModo});
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {state === 'PREVIEW' && currentRecipe && (
          <div className="flex flex-col items-center gap-6">
            <div className="no-print flex gap-4">
              <button 
                onClick={() => setState('EDITING')}
                className="bg-white border border-gray-200 text-gray-600 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm"
              >
                <i className="fas fa-edit mr-2"></i>Editar
              </button>
              <button 
                onClick={() => window.print()}
                className="bg-[#F28C28] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-orange-600 transition shadow-md"
              >
                <i className="fas fa-print mr-2"></i>Imprimir / Salvar PDF
              </button>
            </div>
            <RecipePrintable recipe={currentRecipe} />
          </div>
        )}

        {state === 'HISTORY' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Arquivo de Fórmulas</h2>
            {history.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <i className="fas fa-folder-open text-4xl text-gray-200 mb-4"></i>
                <p className="text-gray-400">Nenhuma ficha salva ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {history.map((recipe) => (
                  <div key={recipe.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{recipe.data}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button 
                          onClick={() => { setCurrentRecipe(recipe); setState('EDITING'); }}
                          className="p-2 text-gray-400 hover:text-[#F28C28]"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => deleteRecipe(recipe.id)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{recipe.nome_formula}</h3>
                    <p className="text-xs text-gray-500 mb-4">{recipe.ingredientes.length} ingredientes • {recipe.modo_preparo.length} passos</p>
                    <button 
                      onClick={() => { setCurrentRecipe(recipe); setState('PREVIEW'); }}
                      className="w-full py-2 bg-gray-50 text-gray-600 font-bold text-sm rounded-lg hover:bg-orange-50 hover:text-[#F28C28] transition"
                    >
                      Ver Ficha Técnica
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer (No print) */}
      <footer className="no-print border-t border-gray-100 py-6 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          Desenvolvido para Gestão Técnica e Padronização
        </p>
      </footer>
    </div>
  );
};

export default App;
