
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || '' });

const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    nome_formula: {
      type: Type.STRING,
      description: 'Nome da receita ou fórmula técnica (corrigido e padronizado).',
    },
    ingredientes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          nome: { type: Type.STRING },
          quantidade: { type: Type.NUMBER },
          unidade: { type: Type.STRING, description: 'Unidade normalizada (Ex: g, kg, ml, L, un)' },
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

export const parseRecipe = async (input: string | { data: string; mimeType: string }, locale: string): Promise<Recipe> => {
  const model = 'gemini-3-flash-preview';
  const localeLabel = locale === 'en' ? 'English' : locale === 'es' ? 'Español' : 'Português (Brasil)';
  const invalidTitle = locale === 'en' ? 'INVALID DATA' : locale === 'es' ? 'DATOS INVÁLIDOS' : 'DADOS INVÁLIDOS';

  const prompt = `VOCÊ É UM TÉCNICO EM FORMULAÇÃO DE ALIMENTOS E PROCESSOS INDUSTRIAIS.
  OBJETIVO: ORGANIZAR e NORMALIZAR a fórmula/receita do input em uma ficha técnica estruturada,
  corrigindo gramática/ortografia e reorganizando o modo de preparo sem alterar a intenção.
  IGNORE texto introdutório, histórias, notícias e qualquer conteúdo irrelevante.

  ✅ REGRAS ABSOLUTAS:
  1. NÃO invente ingredientes, quantidades ou etapas.
  2. NÃO remova ingredientes existentes.
  3. NÃO altere valores numéricos.
  4. CORRIJA gramática, ortografia e clareza técnica do idioma.
  5. PADRONIZE nomes de ingredientes (termos técnicos) mantendo o significado.
  6. PADRONIZE unidades exclusivamente para: g, kg, ml, L, un.
  7. REORGANIZE o modo de preparo em passos claros, numerados e objetivos.
  8. Se algo estiver ambíguo/confuso, ajuste de forma lógica SEM alterar a intenção original.
  9. Se NÃO houver preparo explícito, retorne "modo_preparo": [].
  10. Se o texto NÃO contiver uma receita, retorne ingredientes vazios e título "${invalidTitle}".
  11. Responda no idioma: ${localeLabel}.

  ✅ FORMATAÇÃO DO MODO DE PREPARO:
  - Retorne cada passo como texto completo e já numerado: "Passo 1 — ...", "Passo 2 — ...".
  - Use linguagem técnica, direta e profissional.
  - Quando houver tempo/condição (ex: "bater por 5 minutos"), inclua no passo correspondente.
  - Corrija passos de ingredientes/etapas que estejam escritos de forma errada, mantendo o sentido.

  FORMATO DE SAÍDA:
  - Somente JSON válido, respeitando rigorosamente o schema.

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
        temperature: 0.1,
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
