import { useState, useCallback } from 'react';
import { Recipe, Ingredient, Step } from '../types';
import { arrayMove } from '@dnd-kit/sortable';
import { isoToday } from '../utils/dateUtils';
import { sanitizeIllustrationSvg } from '../utils/svgUtils';

const INITIAL_RECIPE: Recipe = {
    id: '',
    nome_formula: '',
    ingredientes: [{ id: '', nome: '', quantidade: 0, unidade: 'g', porcentagem: 0, custo_unitario: 0, custo_total: 0 }],
    modo_preparo: [{ id: '', text: '' }],
    stripedRows: true,
    exibir_modo_preparo: true,
    exibir_observacoes: true,
    exibir_ilustracao: false,
    status: 'RASCUNHO',
    rendimento_kg: 0,
    rendimento_unidades: 0,
    custo_total_formula: 0,
    data: isoToday(),
    observacoes: '',
    nome_empresa: '',
    ilustracao_svg: '',
    ilustracao_alt: ''
};

export const useRecipeManager = () => {
    const [currentRecipe, setCurrentRecipe] = useState<Recipe>(() => ({
        ...INITIAL_RECIPE,
        data: isoToday(),
        id: crypto.randomUUID(),
        ingredientes: [{ id: crypto.randomUUID(), nome: '', quantidade: 0, unidade: 'g', porcentagem: 0, custo_unitario: 0, custo_total: 0 }],
        modo_preparo: [{ id: crypto.randomUUID(), text: '' }]
    }));
    const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);


    // Helper to ensure IDs exist
    const sanitizeRecipe = (recipe: Recipe): Recipe => {
        const safeSvg = sanitizeIllustrationSvg(recipe.ilustracao_svg);
        return {
            ...recipe,
            id: recipe.id || crypto.randomUUID(),
            ingredientes: recipe.ingredientes.map(ing => ({ ...ing, id: ing.id || crypto.randomUUID(), porcentagem: ing.porcentagem || 0 })),
            modo_preparo: recipe.modo_preparo.map(step => ({ ...step, id: step.id || crypto.randomUUID() })),
            stripedRows: recipe.stripedRows ?? true,
            exibir_modo_preparo: recipe.exibir_modo_preparo ?? true,
            exibir_observacoes: recipe.exibir_observacoes ?? true,
            exibir_ilustracao: recipe.exibir_ilustracao ?? false,
            status: recipe.status ?? 'RASCUNHO',
            data: recipe.data || isoToday(),
            ilustracao_svg: safeSvg || '',
            ilustracao_alt: recipe.ilustracao_alt || ''
        };
    };

    const loadRecipe = (recipe: Recipe) => {
        setCurrentRecipe(sanitizeRecipe(recipe));
        setValidationErrors([]);
    };

    const clearRecipe = () => {
        setCurrentRecipe({
            ...INITIAL_RECIPE,
            data: isoToday(),
            id: crypto.randomUUID(),
            ingredientes: [{ id: crypto.randomUUID(), nome: '', quantidade: 0, unidade: 'g', porcentagem: 0, custo_unitario: 0, custo_total: 0 }],
            modo_preparo: [{ id: crypto.randomUUID(), text: '' }]
        });
        setValidationErrors([]);
    };

    const handleFieldChange = (field: keyof Recipe, value: any) => {
        setCurrentRecipe(prev => ({ ...prev, [field]: value }));
    };

    // Ingredients Logic
    const addIngredient = () => {
        const newId = crypto.randomUUID();
        setCurrentRecipe(prev => ({
            ...prev,
            ingredientes: [...prev.ingredientes, { id: newId, nome: '', quantidade: 0, unidade: 'g', porcentagem: 0, custo_unitario: 0, custo_total: 0 }]
        }));
        setNewlyAddedId(newId);
        setTimeout(() => setNewlyAddedId(null), 2000);
    };

    const removeIngredient = (id: string) => {
        if (currentRecipe.ingredientes.length <= 1) return;
        setCurrentRecipe(prev => ({
            ...prev,
            ingredientes: prev.ingredientes.filter(i => i.id !== id)
        }));
    };

    const updateIngredient = (id: string, field: keyof Ingredient, value: any) => {
        setCurrentRecipe(prev => {
            const updatedIngs = prev.ingredientes.map(ing => {
                if (ing.id === id) {
                    const updated = { ...ing, [field]: value };

                    // Recalculate item total cost
                    const qty = field === 'quantidade' ? Number(value) || 0 : (ing.quantidade || 0);
                    const unitCost = field === 'custo_unitario' ? Number(value) || 0 : (ing.custo_unitario || 0);
                    updated.custo_total = qty * unitCost;

                    return updated;
                }
                return ing;
            });

            const totalWeight = updatedIngs.reduce((sum, ing) => sum + (Number(ing.quantidade) || 0), 0);
            const totalCost = updatedIngs.reduce((sum, ing) => sum + (ing.custo_total || 0), 0);

            const finalIngs = updatedIngs.map(ing => ({
                ...ing,
                porcentagem: totalWeight > 0 ? ((Number(ing.quantidade) || 0) / totalWeight) * 100 : 0
            }));

            return {
                ...prev,
                ingredientes: finalIngs,
                rendimento_kg: totalWeight / 1000,
                custo_total_formula: totalCost
            };
        });
    };

    const moveIngredient = (activeId: string, overId: string) => {
        setCurrentRecipe((prev) => {
            const oldIndex = prev.ingredientes.findIndex((i) => i.id === activeId);
            const newIndex = prev.ingredientes.findIndex((i) => i.id === overId);
            return {
                ...prev,
                ingredientes: arrayMove(prev.ingredientes, oldIndex, newIndex),
            };
        });
    };


    // Steps Logic
    const addStep = () => {
        const newId = crypto.randomUUID();
        setCurrentRecipe(prev => ({
            ...prev,
            modo_preparo: [...prev.modo_preparo, { id: newId, text: '' }]
        }));
        setNewlyAddedId(newId);
        setTimeout(() => setNewlyAddedId(null), 2000);
    };

    const removeStep = (id: string) => {
        if (currentRecipe.modo_preparo.length <= 1) return;
        setCurrentRecipe(prev => ({
            ...prev,
            modo_preparo: prev.modo_preparo.filter(s => s.id !== id)
        }));
    };

    const updateStep = (id: string, value: string) => {
        setCurrentRecipe(prev => ({
            ...prev,
            modo_preparo: prev.modo_preparo.map(s => s.id === id ? { ...s, text: value } : s)
        }));
    };

    const moveStep = (activeId: string, overId: string) => {
        setCurrentRecipe((prev) => {
            const oldIndex = prev.modo_preparo.findIndex((s) => s.id === activeId);
            const newIndex = prev.modo_preparo.findIndex((s) => s.id === overId);
            return {
                ...prev,
                modo_preparo: arrayMove(prev.modo_preparo, oldIndex, newIndex),
            };
        });
    };

    const validateRecipe = () => {
        const errors: string[] = [];
        if (!currentRecipe.nome_formula.trim()) errors.push('Nome da receita é obrigatório');
        currentRecipe.ingredientes.forEach((ing, index) => {
            if (!ing.nome.trim()) errors.push(`Ingrediente ${index + 1}: Nome é obrigatório`);
            if (ing.quantidade <= 0) errors.push(`Ingrediente ${index + 1}: Quantidade deve ser maior que zero`);
        });
        setValidationErrors(errors);
        return errors.length === 0;
    };

    const calculateTotalWeight = useCallback(() => {
        return currentRecipe.ingredientes.reduce((sum, ing) => sum + (Number(ing.quantidade) || 0), 0);
    }, [currentRecipe.ingredientes]);

    return {
        currentRecipe,
        setCurrentRecipe,
        newlyAddedId,
        validationErrors,
        sanitizeRecipe,
        loadRecipe,
        clearRecipe,
        handleFieldChange,
        addIngredient,
        removeIngredient,
        updateIngredient,
        moveIngredient,
        addStep,
        removeStep,
        updateStep,
        moveStep,
        validateRecipe,
        calculateTotalWeight
    };
};
