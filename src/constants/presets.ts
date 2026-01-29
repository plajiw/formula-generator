type PresetIngredient = {
    nome: string;
    quantidade: number;
    unidade: string;
};

type PresetStep = { text: string } | string;

export type PresetData = {
    ingredientes?: PresetIngredient[];
    modo_preparo?: PresetStep[];
    observacoes?: string;
    observacoesKey?: string;
    exibir_modo_preparo?: boolean;
    exibir_observacoes?: boolean;
};

export type PresetDefinition = {
    id: string;
    nameKey: string;
    descriptionKey: string;
    nameValueKey?: string;
    data: PresetData;
};

export const PRESETS: PresetDefinition[] = [
    {
        id: 'chimichurri-base',
        nameKey: 'presets.chimichurri',
        descriptionKey: 'presets.chimichurriDesc',
        nameValueKey: 'presets.chimichurri',
        data: {
            ingredientes: [
                { nome: 'Salsa desidratada', quantidade: 10, unidade: 'KG' },
                { nome: 'Alho granulado', quantidade: 5, unidade: 'KG' },
                { nome: 'Cebola granulada', quantidade: 4, unidade: 'KG' },
                { nome: 'Pimenta do reino', quantidade: 1, unidade: 'KG' },
                { nome: 'Sal refinado', quantidade: 8, unidade: 'KG' }
            ],
            modo_preparo: [],
            observacoesKey: 'presets.chimichurriDesc'
        }
    },
    {
        id: 'lemon-pepper-base',
        nameKey: 'presets.lemon',
        descriptionKey: 'presets.lemonDesc',
        nameValueKey: 'presets.lemon',
        data: {
            ingredientes: [
                { nome: 'Sal refinado', quantidade: 12, unidade: 'KG' },
                { nome: 'Pimenta do reino moída', quantidade: 2, unidade: 'KG' },
                { nome: 'Aroma de limão em pó', quantidade: 0.5, unidade: 'KG' }
            ],
            modo_preparo: [],
            observacoesKey: 'presets.lemonDesc'
        }
    },
    {
        id: 'sem-modo-preparo',
        nameKey: 'presets.noPrep',
        descriptionKey: 'presets.noPrepDesc',
        nameValueKey: 'presets.noPrep',
        data: {
            ingredientes: [],
            modo_preparo: [],
            exibir_modo_preparo: false,
            observacoes: ''
        }
    },
    {
        id: 'industrial-seco',
        nameKey: 'presets.dry',
        descriptionKey: 'presets.dryDesc',
        nameValueKey: 'presets.dry',
        data: {
            ingredientes: [],
            modo_preparo: [],
            observacoesKey: 'presets.dryDesc',
            exibir_modo_preparo: false
        }
    }
];
