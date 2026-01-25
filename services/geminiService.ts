
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

  const prompt = `ATUE COMO UM SISTEMA DE EXTRAÇÃO DE DADOS ESTRITAMENTE TÉCNICOS.
  OBJETIVO: Extrair APENAS a fórmula/receita do input fornecido. IGNORE qualquer texto introdutório, histórias, notícias ou dados irrelevantes.

  ⚠️ REGRAS CRÍTICAS DE ECONOMIA:
  1. SE O TEXTO NÃO CONTIVER UMA RECEITA, RETORNE UMA LISTA VAZIA DE INGREDIENTES E UM TÍTULO "DADOS INVÁLIDOS".
  2. Normalize unidades para siglas (GR, KG, ML, LT, UN).
  3. Resuma o modo de preparo em passos curtos e diretos (imperativo).
  4. Extraia apenas informações essenciais.

  INPUT PARA ANÁLISE:`;

  // Truncate input if too large to save tokens (approx 10k chars limit safety)
  const safeInput = typeof input === 'string' ? input.slice(0, 15000) : input;

  const contents = typeof input === 'string'
    ? { parts: [{ text: `${prompt}\n\n${safeInput}` }] }
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
