
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || '' });

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
      description: 'Passos do modo de preparo extraídos do input. Retorne [] se não houver preparo explícito.',
    },
    observacoes: {
      type: Type.STRING,
      description: 'Observações técnicas, rendimento ou avisos.',
    },
  },
  required: ['nome_formula', 'ingredientes', 'modo_preparo'],
};

const hasExplicitPreparation = (text: string) => {
  const normalized = text.normalize('NFKC');
  const markers = [
    /modo de preparo/i,
    /modo de fazer/i,
    /procedimento/i,
    /instru[cç][õo]es?/i,
    /\bpreparo\b/i,
    /\bprocedure\b/i,
    /\binstructions?\b/i,
  ];
  if (markers.some((regex) => regex.test(normalized))) return true;
  const stepLines = /(^|\n)\s*(\d+[\).\-\:]|\u2022|[-*])\s+\S+/m;
  if (stepLines.test(normalized)) return true;
  const imperatives = /\b(misture|adicione|adicionar|mexa|bata|bater|aque[çc]a|misturar|incorpore|incorporar|homogene[ií]ze|homogeneizar)\b/i;
  return imperatives.test(normalized);
};

const normalizeSteps = (steps: string[]) => {
  const invalid = new Set(['', 'n/a', 'na', 'não informado', 'nao informado', 'não consta', 'nao consta']);
  return steps
    .map((step) => step?.trim())
    .filter((step) => step && !invalid.has(step.toLowerCase()));
};

export const parseRecipe = async (input: string | { data: string; mimeType: string }): Promise<Recipe> => {
  const model = 'gemini-3-flash-preview';

  const prompt = `ATUE COMO UM SISTEMA DE EXTRAÇÃO DE DADOS ESTRITAMENTE TÉCNICOS.
  OBJETIVO: Extrair APENAS a fórmula/receita do input fornecido. IGNORE qualquer texto introdutório, histórias, notícias ou dados irrelevantes.

  ⚠️ REGRAS CRÍTICAS (ESCOPO CONTROLADO):
  1. IA EXTRAI E NORMALIZA. IA NÃO OPINA. IA NÃO "MELHORA".
  2. NÃO INVENTE modo de preparo.
  3. NÃO COMPLETE dados ausentes. Extraia SOMENTE o que estiver explícito no input.
  4. A ausência de preparo é válida. Se não houver preparo explícito, retorne "modo_preparo": [].
  5. Documentos industriais frequentemente NÃO incluem procedimento.
  6. Normalize unidades para siglas (GR, KG, ML, LT, UN).
  7. NÃO forneça sugestões subjetivas, otimizações, ou comentários que não estejam no input.
  8. Se o texto não contiver uma receita, retorne ingredientes vazios e título "DADOS INVÁLIDOS".

  INPUT PARA ANÁLISE:`;

  // Truncate input if too large to save tokens (approx 10k chars limit safety)
  const safeInput = typeof input === 'string' ? input.slice(0, 15000) : input;

  const contents = typeof input === 'string'
    ? { parts: [{ text: `${prompt}\n\n${safeInput}` }] }
    : { parts: [{ text: prompt }, { inlineData: input }] };

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: RECIPE_SCHEMA,
      }
    });
    const raw = response.text;
    if (!raw) {
      throw new Error('Empty response from AI');
    }
    const parsed = JSON.parse(raw) as Recipe;

    const ingredientsWithIds = (parsed.ingredientes || []).map((ing) => ({
      ...ing,
      id: crypto.randomUUID()
    }));

    const parsedSteps = Array.isArray(parsed.modo_preparo) ? parsed.modo_preparo : [];
    const cleanedSteps = normalizeSteps(parsedSteps);
    const allowSteps = typeof input === 'string' ? hasExplicitPreparation(input) : true;
    const finalSteps = allowSteps ? cleanedSteps : [];
    const stepsWithIds = finalSteps.map((step: string) => ({
      id: crypto.randomUUID(),
      text: step
    }));

    return {
      ...parsed,
      ingredientes: ingredientsWithIds,
      modo_preparo: stepsWithIds,
      id: crypto.randomUUID(),
      data: new Date().toISOString().slice(0, 10),
    } as Recipe;
  } catch (error) {
    throw error;
  }
};
