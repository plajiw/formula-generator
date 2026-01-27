
import { Recipe } from '../types';

export const buildRecipeXML = (recipe: Recipe) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<recipe>
  <id>${recipe.id}</id>
  <name>${recipe.nome_formula}</name>
  <date>${recipe.data}</date>
  <accentColor>${recipe.accentColor || ''}</accentColor>
  <fontFamily>${recipe.fontFamily || ''}</fontFamily>
  <fontSize>${recipe.fontSize || ''}</fontSize>
  <stripedRows>${recipe.stripedRows ? 'true' : 'false'}</stripedRows>
  <ingredients>
    ${recipe.ingredientes.map(ing => `
    <ingredient>
      <id>${ing.id}</id>
      <name>${ing.nome}</name>
      <quantity>${ing.quantidade}</quantity>
      <unit>${ing.unidade}</unit>
    </ingredient>`).join('')}
  </ingredients>
  <steps>
    ${recipe.modo_preparo.map(step => `
    <step>
      <id>${step.id}</id>
      <text>${step.text}</text>
    </step>`).join('')}
  </steps>
  <notes>${recipe.observacoes || ''}</notes>
</recipe>`;
};

const parseXMLContent = (text: string): Recipe => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid XML file');
    }

    const getVal = (tag: string, parent: Element | Document = xmlDoc) =>
        parent.querySelector(tag)?.textContent || '';

    const ingredients = Array.from(xmlDoc.querySelectorAll('ingredient')).map(el => ({
        id: getVal('id', el) || crypto.randomUUID(),
        nome: getVal('name', el),
        quantidade: parseFloat(getVal('quantity', el)) || 0,
        unidade: getVal('unit', el) || 'GR'
    }));

    const steps = Array.from(xmlDoc.querySelectorAll('step')).map(el => ({
        id: getVal('id', el) || crypto.randomUUID(),
        text: getVal('text', el)
    }));

    return {
        id: getVal('id') || crypto.randomUUID(),
        nome_formula: getVal('name'),
        data: getVal('date') || new Date().toISOString().slice(0, 10),
        ingredientes: ingredients,
        modo_preparo: steps,
        observacoes: getVal('notes'),
        accentColor: getVal('accentColor') || undefined,
        fontFamily: getVal('fontFamily') || undefined,
        fontSize: (getVal('fontSize') as Recipe['fontSize']) || undefined,
        stripedRows: getVal('stripedRows') === 'true'
    };
};

export const exportToXML = (recipe: Recipe) => {
    const xmlContent = buildRecipeXML(recipe);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.nome_formula.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const parseXML = async (file: File): Promise<Recipe> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                resolve(parseXMLContent(text));
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsText(file);
    });
};

export const parseXMLString = async (text: string): Promise<Recipe> => {
    return Promise.resolve(parseXMLContent(text));
};
