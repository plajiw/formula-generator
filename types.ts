
export interface Ingredient {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
}

export interface Step {
  id: string;
  text: string;
}

export interface Recipe {
  id: string;
  nome_formula: string;
  data: string;
  accentColor?: string;
  fontFamily?: string;
  fontSize?: 'small' | 'medium' | 'large';
  stripedRows?: boolean;
  ingredientes: Ingredient[];
  modo_preparo: Step[]; // Changed from string[] to Step[]
  observacoes?: string;
}

export type AppState = 'HOME' | 'IDLE' | 'XML' | 'PROCESSING' | 'EDITING' | 'PREVIEW' | 'HISTORY';
