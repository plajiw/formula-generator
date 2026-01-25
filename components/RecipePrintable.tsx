
import React from 'react';
import { Recipe } from '../types';

interface Props {
  recipe: Recipe;
}

const formatDate = (value: string) => {
  if (!value) return '';
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }
  return value;
};

export const RecipePrintable: React.FC<Props> = ({ recipe }) => {
  const fontSizeMap: Record<string, string> = {
    small: '13px',
    medium: '14px',
    large: '15px'
  };
  const baseFontSize = recipe.fontSize ? fontSizeMap[recipe.fontSize] || '14px' : '14px';

  return (
    <div
      className="bg-white p-8 sm:p-12 border border-gray-200 mx-auto max-w-[210mm] min-h-[297mm] print-area"
      style={{
        '--primary': recipe.accentColor || '#F28C28',
        fontFamily: recipe.fontFamily || 'Manrope, sans-serif',
        fontSize: baseFontSize
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[var(--primary)] pb-4 mb-6">
        <div>
          <h2 className="text-[var(--primary)] font-bold text-[1.3em] tracking-wider">FORMULAÇÃO TÉCNICA</h2>
          <p className="text-gray-500 text-[0.9em]">Controle de Produção Padronizado</p>
        </div>
        <div className="text-right">
          <p className="text-[0.75em] font-semibold text-gray-400">DATA DE EMISSÃO</p>
          <p className="text-gray-800 font-medium">{formatDate(recipe.data)}</p>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-[2em] font-bold text-gray-800 uppercase tracking-tight">{recipe.nome_formula}</h1>
        <div className="h-1 w-24 bg-[var(--primary)] mx-auto mt-2"></div>
      </div>

      {/* Ingredients Table */}
      <div className="mb-8">
        <h3 className="text-[0.85em] font-bold text-[var(--primary)] mb-3 uppercase tracking-widest border-l-4 border-[var(--primary)] pl-2">Ingredientes e Composição</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left border-y border-gray-200">
              <th className="py-3 px-4 text-[0.75em] font-bold text-gray-600 uppercase">Item / Insumo</th>
              <th className="py-3 px-4 text-[0.75em] font-bold text-gray-600 uppercase text-right">Qtd.</th>
              <th className="py-3 px-4 text-[0.75em] font-bold text-gray-600 uppercase text-center w-20">Unid.</th>
            </tr>
          </thead>
          <tbody>
            {recipe.ingredientes.map((ing, idx) => {
              const rowBackground = recipe.stripedRows && idx % 2 === 1 ? '#E5E7EB' : undefined;
              return (
                <tr
                  key={idx}
                  className="border-b border-gray-100 transition-colors"
                >
                  <td className="py-3 px-4 text-[0.9em] text-gray-800" style={rowBackground ? { backgroundColor: rowBackground } : undefined}>{ing.nome}</td>
                  <td className="py-3 px-4 text-[0.9em] text-gray-800 text-right font-medium" style={rowBackground ? { backgroundColor: rowBackground } : undefined}>{ing.quantidade}</td>
                  <td className="py-3 px-4 text-[0.9em] text-gray-500 text-center uppercase font-mono" style={rowBackground ? { backgroundColor: rowBackground } : undefined}>{ing.unidade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Methods */}
      {recipe.modo_preparo.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[0.85em] font-bold text-[var(--primary)] mb-4 uppercase tracking-widest border-l-4 border-[var(--primary)] pl-2">Procedimento Operacional (Modo de Preparo)</h3>
          <div className="space-y-4">
            {recipe.modo_preparo.map((passo, idx) => (
              <div key={idx} className="flex gap-4 items-start break-inside-avoid">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
                  {idx + 1}
                </span>
                <p className="text-[0.9em] text-gray-700 leading-relaxed pt-0.5 text-justify">{passo.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observations */}
      {recipe.observacoes && (
        <div className="mt-auto pt-8 border-t border-gray-100 break-inside-avoid">
          <h3 className="text-[0.75em] font-bold text-gray-400 mb-2 uppercase tracking-widest">Observações Técnicas</h3>
          <p className="text-[0.75em] text-gray-500 italic leading-relaxed">{recipe.observacoes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-[0.7em] text-gray-300 uppercase tracking-widest border-t pt-4">
        Documento gerado eletronicamente para uso interno
      </div>
    </div>
  );
};
