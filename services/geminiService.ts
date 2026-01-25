
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
      description: 'Passos detalhados do modo de preparo.',
    },
    observacoes: {
      type: Type.STRING,
      description: 'Observações técnicas, rendimento ou avisos.',
    },
  },
  required: ['nome_formula', 'ingredientes', 'modo_preparo'],
};

export const parseRecipe = async (input: string | { data: string; mimeType: string }): Promise<Recipe> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Você é um engenheiro de alimentos e mestre em padronização de fichas técnicas.
  Sua missão é ler o conteúdo (texto, imagem ou PDF) e extrair TODOS os dados para uma estrutura técnica rigorosa.
  
  DIRETRIZES:
  1. NOME: Identifique o título principal da fórmula.
  2. INGREDIENTES: Extraia cada item, separando nome, quantidade numérica e unidade. 
     - Se a unidade for "gramas", use "GR". 
     - Se for "litros", use "LT". 
     - Se for "unidades", use "UN".
  3. MODO DE PREPARO: Transforme o texto em uma lista de passos claros e sequenciais.
  4. NUNCA invente dados. Se não houver ingredientes, deixe a lista vazia.
  
  Retorne rigorosamente o JSON solicitado.`;

  const contents = typeof input === 'string' 
    ? { parts: [{ text: `${prompt}\n\nCONTEÚDO PARA ANÁLISE:\n${input}` }] }
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
  if (!rawText) throw new Error("A IA não retornou dados válidos.");
  
  const parsed = JSON.parse(rawText);
  
  return {
    ...parsed,
    id: crypto.randomUUID(),
    data: new Date().toLocaleDateString('pt-BR'),
  } as Recipe;
};
