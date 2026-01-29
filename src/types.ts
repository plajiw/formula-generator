
export interface Ingredient {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  porcentagem?: number;
  custo_unitario?: number;
  custo_total?: number;
}

export interface Step {
  id: string;
  text: string;
}

export interface Recipe {
  id: string;
  nome_formula: string;
  data: string;
  status?: 'RASCUNHO' | 'FINAL';
  accentColor?: string;
  fontFamily?: string;
  fontSize?: 'small' | 'medium' | 'large';
  stripedRows?: boolean;
  exibir_modo_preparo?: boolean;
  exibir_observacoes?: boolean;
  ingredientes: Ingredient[];
  modo_preparo: Step[];
  observacoes?: string;
  rendimento_kg?: number;
  rendimento_unidades?: number;
  custo_total_formula?: number;
  nome_empresa?: string;
  exibir_ilustracao?: boolean;
  ilustracao_svg?: string;
  ilustracao_alt?: string;
}

export type AppState = 'HOME' | 'IDLE' | 'XML' | 'PROCESSING' | 'EDITING' | 'PREVIEW' | 'HISTORY';
