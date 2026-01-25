
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    nome_formula: {
      type: Type.STRING,
      description: 'Nome da receita ou fórmula técnica.',
    },
    ingredientes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          nome: { type: Type.STRING },
          quantidade: { type: Type.NUMBER },
          unidade: { type: Type.STRING, description: 'Unidade normalizada (Ex: GR, KG, ML, LT, UN)' },
        },
        required: ['nome', 'quantidade', 'unidade'],
      },
    },
    modo_preparo: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Passos numerados do modo de preparo.',
    },
    observacoes: {
      type: Type.STRING,
      description: 'Qualquer observação técnica ou aviso encontrado.',
    },
  },
  required: ['nome_formula', 'ingredientes', 'modo_preparo'],
};

export const parseRecipe = async (input: string | { data: string; mimeType: string }): Promise<Recipe> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Você é um especialista em padronização de fórmulas industriais e gastronômicas.
  Sua tarefa é extrair os dados do conteúdo fornecido e estruturá-los em uma ficha técnica.
  
  Regras Críticas:
  1. Extraia o nome da fórmula com precisão.
  2. Normalize as unidades: gramas -> GR, quilogramas -> KG, mililitros -> ML, litros -> LT, unidades -> UN.
  3. Se a quantidade for aproximada, use o valor numérico mais provável.
  4. Organize o modo de preparo em passos lógicos e sequenciais.
  5. Se houver informações confusas, tente interpretá-las tecnicamente.
  
  Retorne APENAS o JSON estruturado conforme o esquema.`;

  const contents = typeof input === 'string' 
    ? { parts: [{ text: `${prompt}\n\nConteúdo:\n${input}` }] }
    : { parts: [{ text: prompt }, { inlineData: input }] };

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: RECIPE_SCHEMA,
    },
  });

  const rawText = response.text;
  const parsed = JSON.parse(rawText || '{}');
  
  return {
    ...parsed,
    id: crypto.randomUUID(),
    data: new Date().toLocaleDateString('pt-BR'),
  } as Recipe;
};
