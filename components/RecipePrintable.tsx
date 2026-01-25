
import React from 'react';
import { Recipe } from '../types';

interface Props {
  recipe: Recipe;
}

export const RecipePrintable: React.FC<Props> = ({ recipe }) => {
  return (
    <div className="bg-white p-8 sm:p-12 shadow-sm border border-gray-200 mx-auto max-w-[210mm] min-h-[297mm] print-area print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[var(--primary)] pb-4 mb-6">
        <div>
          <h2 className="text-[var(--primary)] font-bold text-xl tracking-wider">FORMULAÇÃO TÉCNICA</h2>
          <p className="text-gray-500 text-sm">Controle de Produção Padronizado</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-400">DATA DE EMISSÃO</p>
          <p className="text-gray-800 font-medium">{recipe.data}</p>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-tight">{recipe.nome_formula}</h1>
        <div className="h-1 w-24 bg-[var(--primary)] mx-auto mt-2"></div>
      </div>

      {/* Ingredients Table */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[var(--primary)] mb-3 uppercase tracking-widest border-l-4 border-[var(--primary)] pl-2">Ingredientes e Composição</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left border-y border-gray-200 print:bg-gray-100">
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Item / Insumo</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase text-right">Qtd.</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase text-center w-20">Unid.</th>
            </tr>
          </thead>
          <tbody>
            {recipe.ingredientes.map((ing, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors print:border-gray-200">
                <td className="py-3 px-4 text-sm text-gray-800">{ing.nome}</td>
                <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">{ing.quantidade}</td>
                <td className="py-3 px-4 text-sm text-gray-500 text-center uppercase font-mono">{ing.unidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Methods */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[var(--primary)] mb-4 uppercase tracking-widest border-l-4 border-[var(--primary)] pl-2">Procedimento Operacional (Modo de Preparo)</h3>
        <div className="space-y-4">
          {recipe.modo_preparo.map((passo, idx) => (
            <div key={idx} className="flex gap-4 items-start break-inside-avoid">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 print:bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
                {idx + 1}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed pt-0.5 text-justify">{passo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Observations */}
      {recipe.observacoes && (
        <div className="mt-auto pt-8 border-t border-gray-100 break-inside-avoid">
          <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Observações Técnicas</h3>
          <p className="text-xs text-gray-500 italic leading-relaxed">{recipe.observacoes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-[10px] text-gray-300 uppercase tracking-widest border-t pt-4 print:mt-auto print:fixed print:bottom-4 print:w-full">
        Documento gerado eletronicamente para uso interno
      </div>
    </div>
  );
};
