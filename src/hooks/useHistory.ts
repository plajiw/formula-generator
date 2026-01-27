import { useState, useCallback, useEffect } from 'react';
import { Recipe } from '../types';
import { toISODate } from '../utils/dateUtils';

export const useHistory = () => {
    const [history, setHistory] = useState<Recipe[]>([]);
    const [historySelection, setHistorySelection] = useState<string[]>([]);
    const [historyFilterStart, setHistoryFilterStart] = useState('');
    const [historyFilterEnd, setHistoryFilterEnd] = useState('');

    useEffect(() => {
        const savedHistory = localStorage.getItem('ficha_tecnica_history');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
    }, []);

    useEffect(() => {
        setHistorySelection((prev) => prev.filter((id) => history.some((recipe) => recipe.id === id)));
    }, [history]);

    const saveToHistory = useCallback((recipe: Recipe) => {
        const updated = [recipe, ...history.filter(h => h.id !== recipe.id)];
        setHistory(updated);
        localStorage.setItem('ficha_tecnica_history', JSON.stringify(updated));
    }, [history]);

    const deleteRecipe = (id: string) => {
        const updated = history.filter(h => h.id !== id);
        setHistory(updated);
        localStorage.setItem('ficha_tecnica_history', JSON.stringify(updated));
    };

    const toggleHistorySelection = (id: string) => {
        setHistorySelection((prev) => (
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        ));
    };

    const clearHistorySelection = () => {
        setHistorySelection([]);
    };

    const filteredHistory = history.filter((recipe) => {
        if (!historyFilterStart && !historyFilterEnd) return true;
        const recipeDate = toISODate(recipe.data);
        const isIso = /^\d{4}-\d{2}-\d{2}$/.test(recipeDate);
        if (!isIso) return false;
        if (historyFilterStart && recipeDate < historyFilterStart) return false;
        if (historyFilterEnd && recipeDate > historyFilterEnd) return false;
        return true;
    });

    const getSelectedRecipes = () => {
        return history.filter((recipe) => historySelection.includes(recipe.id));
    };


    return {
        history,
        historySelection,
        historyFilterStart,
        setHistoryFilterStart,
        historyFilterEnd,
        setHistoryFilterEnd,
        saveToHistory,
        deleteRecipe,
        toggleHistorySelection,
        clearHistorySelection,
        filteredHistory,
        getSelectedRecipes
    };
};
