
export interface Ingredient {
  nome: string;
  quantidade: number;
  unidade: string;
}

export interface Recipe {
  id: string;
  nome_formula: string;
  data: string;
  ingredientes: Ingredient[];
  modo_preparo: string[];
  observacoes?: string;
}

export type AppState = 'IDLE' | 'PROCESSING' | 'EDITING' | 'PREVIEW' | 'HISTORY';
