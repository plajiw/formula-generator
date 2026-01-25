
import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

import { Recipe, AppState, Ingredient, Step } from './types';
import { parseRecipe } from './services/geminiService';
import { buildRecipeXML, exportToXML, parseXML, parseXMLString } from './services/xmlService';
import { RecipePrintable } from './components/RecipePrintable';

// UI Themes (limited options)
const UI_THEMES = [
  { name: 'Safety Orange', color: '#F28C28' },
  { name: 'Royal Blue', color: '#2563EB' },
  { name: 'Emerald Green', color: '#10B981' },
  { name: 'Slate Dark', color: '#475569' },
];

// Formula accent colors (up to 7 tones)
const FORMULA_THEMES = [
  { name: 'Safety Orange', color: '#F28C28' },
  { name: 'Royal Blue', color: '#2563EB' },
  { name: 'Emerald Green', color: '#10B981' },
  { name: 'Rose Red', color: '#E11D48' },
  { name: 'Violet', color: '#7C3AED' },
  { name: 'Teal', color: '#0D9488' },
  { name: 'Slate', color: '#475569' },
];

const FORMULA_FONTS = [
  { name: 'Manrope', value: 'Manrope, sans-serif' },
  { name: 'Merriweather', value: '"Merriweather", serif' },
  { name: 'Oswald', value: '"Oswald", sans-serif' },
];

const FORMULA_FONT_SIZES = [
  { name: 'Pequena', value: 'small' },
  { name: 'Média', value: 'medium' },
  { name: 'Grande', value: 'large' },
] as const;

const isoToday = () => new Date().toISOString().slice(0, 10);

type ThemeMode = 'light' | 'dark' | 'system';

const isUiThemeColor = (value?: string) =>
  !!value && UI_THEMES.some((theme) => theme.color === value);

const isFormulaThemeColor = (value?: string) =>
  !!value && FORMULA_THEMES.some((theme) => theme.color === value);

const isFormulaFont = (value?: string) =>
  !!value && FORMULA_FONTS.some((font) => font.value === value);

const isFormulaFontSize = (value?: string): value is Recipe['fontSize'] =>
  value === 'small' || value === 'medium' || value === 'large';

const toISODate = (value: string) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return value;
};

const formatDateDisplay = (value: string) => {
  if (!value) return '';
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }
  return value;
};

const makeRecipeFilename = (recipe: Recipe) => {
  const base = recipe.nome_formula || 'ficha_tecnica';
  return base.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Sortable Item Components
const SortableItem = ({ id, children, newlyAddedId, animationsEnabled }: { id: string, children: React.ReactNode, newlyAddedId: string | null, animationsEnabled: boolean }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const isNew = id === newlyAddedId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? '' : 'transition-shadow duration-150'} ${isNew ? `ring-2 ring-[var(--primary)] ring-offset-2 rounded-xl ${animationsEnabled ? 'animate-pulse' : ''}` : ''}`}
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-[var(--primary)] text-slate-300 dark:text-slate-500 p-2 touch-none">
          <i className="fas fa-grip-vertical"></i>
        </div>
        {children}
      </div>
    </div>
  );
};

const ContextHeader = ({
  title,
  subtitle,
  badge,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`no-print bg-white/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 ${className || ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
            {badge && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('HOME');
  const [navStack, setNavStack] = useState<AppState[]>([]);
  const [processingFrom, setProcessingFrom] = useState<AppState>('HOME');
  const [inputText, setInputText] = useState('');
  const [draftDate, setDraftDate] = useState(isoToday());
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [includeProcedure, setIncludeProcedure] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [history, setHistory] = useState<Recipe[]>([]);
  const [historySelection, setHistorySelection] = useState<string[]>([]);
  const [historyFilterStart, setHistoryFilterStart] = useState('');
  const [historyFilterEnd, setHistoryFilterEnd] = useState('');
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isHistoryDownloading, setIsHistoryDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#F28C28');
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [xmlText, setXmlText] = useState('');
  const [processingTitle, setProcessingTitle] = useState('Analisando Ingredientes...');
  const [processingSubtitle, setProcessingSubtitle] = useState('A IA está estruturando sua ficha técnica.');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const savedPrefs = localStorage.getItem('ficha_tecnica_prefs');
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.themeMode === 'light' || parsed.themeMode === 'dark' || parsed.themeMode === 'system') {
          return parsed.themeMode;
        }
        if (typeof parsed.isDarkMode === 'boolean') {
          return parsed.isDarkMode ? 'dark' : 'light';
        }
        if (typeof parsed.isDarkMode === 'string') {
          return parsed.isDarkMode === 'true' ? 'dark' : 'light';
        }
      }
    } catch {
      // Ignore storage errors
    }
    return 'system';
  });
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showBackgroundPattern, setShowBackgroundPattern] = useState(true);
  const [previewContext, setPreviewContext] = useState<'edit' | 'final'>('final');

  // Sensors for DND
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load history and theme
  useEffect(() => {
    const savedHistory = localStorage.getItem('ficha_tecnica_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedPrefs = localStorage.getItem('ficha_tecnica_prefs');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (isUiThemeColor(parsed.primaryColor)) setPrimaryColor(parsed.primaryColor);
        if (parsed.themeMode === 'light' || parsed.themeMode === 'dark' || parsed.themeMode === 'system') {
          setThemeMode(parsed.themeMode);
        } else if (typeof parsed.isDarkMode === 'boolean') {
          setThemeMode(parsed.isDarkMode ? 'dark' : 'light');
        } else if (typeof parsed.isDarkMode === 'string') {
          setThemeMode(parsed.isDarkMode === 'true' ? 'dark' : 'light');
        }
        if (typeof parsed.animationsEnabled === 'boolean') setAnimationsEnabled(parsed.animationsEnabled);
        if (typeof parsed.showBackgroundPattern === 'boolean') setShowBackgroundPattern(parsed.showBackgroundPattern);
      } catch {
        // Ignore invalid localStorage payloads
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const useDark = themeMode === 'dark' || (themeMode === 'system' && media.matches);
      root.classList.toggle('dark', useDark);
      document.body.classList.toggle('dark', useDark);
      root.dataset.theme = useDark ? 'dark' : 'light';
      root.dataset.themeMode = themeMode;
      root.style.colorScheme = useDark ? 'dark' : 'light';
    };

    apply();

    const handler = () => {
      if (themeMode === 'system') {
        apply();
      }
    };

    if (media.addEventListener) {
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }
    media.addListener(handler);
    return () => media.removeListener(handler);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('ficha_tecnica_prefs', JSON.stringify({
      primaryColor,
      themeMode,
      animationsEnabled,
      showBackgroundPattern,
    }));
  }, [primaryColor, themeMode, animationsEnabled, showBackgroundPattern]);

  const navigate = useCallback((next: AppState, options?: { reset?: boolean }) => {
    if (next === state) return;
    setNavStack((prev) => (options?.reset ? [] : [...prev, state === 'PROCESSING' ? processingFrom : state]));
    setState(next);
  }, [state, processingFrom]);

  const goHome = () => {
    setError(null);
    setInputText('');
    setXmlText('');
    setNavStack([]);
    setState('HOME');
  };

  const goBack = () => {
    setError(null);
    setNavStack((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[prev.length - 1];
      setState(next);
      return prev.slice(0, -1);
    });
  };

  const motionClass = (classes: string) => (animationsEnabled ? classes : '');

  const openEditPreview = () => {
    setPreviewContext('edit');
    navigate('PREVIEW');
  };

  const openFinalPreview = () => {
    setPreviewContext('final');
    navigate('PREVIEW');
  };

  useEffect(() => {
    setHistorySelection((prev) => prev.filter((id) => history.some((recipe) => recipe.id === id)));
  }, [history]);

  const getSelectedRecipes = () => {
    return history.filter((recipe) => historySelection.includes(recipe.id));
  };

  const renderRecipeToCanvas = async (recipe: Recipe) => {
    const html2canvas = window.html2canvas;
    if (!html2canvas) {
      throw new Error('html2canvas não carregado.');
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.background = '#ffffff';
    container.style.zIndex = '-1';
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<RecipePrintable recipe={recipe} />);

    try {
      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
      const canvas = await html2canvas(container, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      return canvas;
    } finally {
      root.unmount();
      document.body.removeChild(container);
    }
  };

  const buildRecipePdfBuffer = async (recipe: Recipe) => {
    const jspdf = window.jspdf?.jsPDF;
    if (!jspdf) {
      throw new Error('jsPDF não carregado.');
    }

    const canvas = await renderRecipeToCanvas(recipe);
    const imgData = canvas.toDataURL('image/jpeg', 0.85);

    const doc = new jspdf({ unit: 'pt', format: 'a4', compress: true });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      doc.addPage();
      doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    return doc.output('arraybuffer') as ArrayBuffer;
  };

  const handleBulkDownload = async (format: 'xml' | 'pdf') => {
    const selected = getSelectedRecipes();
    if (selected.length === 0) return;

    const JSZip = window.JSZip;
    if (!JSZip) {
      setHistoryError('Biblioteca de ZIP não carregada.');
      return;
    }

    setHistoryError(null);
    setIsHistoryDownloading(true);
    try {
      const zip = new JSZip();

      if (format === 'xml') {
        selected.forEach((recipe) => {
          const normalized = sanitizeRecipe(recipe);
          zip.file(`${makeRecipeFilename(normalized)}.xml`, buildRecipeXML(normalized));
        });
      } else {
        for (const recipe of selected) {
          const normalized = sanitizeRecipe(recipe);
          const pdfBuffer = await buildRecipePdfBuffer(normalized);
          zip.file(`${makeRecipeFilename(normalized)}.pdf`, pdfBuffer);
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const suffix = format === 'xml' ? 'xml' : 'pdf';
      downloadBlob(blob, `fichas_${suffix}.zip`);
    } catch (err) {
      setHistoryError('Não foi possível gerar o ZIP. Verifique sua conexão com as bibliotecas.');
    } finally {
      setIsHistoryDownloading(false);
    }
  };

  const toggleHistorySelection = (id: string) => {
    setHistorySelection((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const selectAllFiltered = () => {
    setHistorySelection(filteredIds);
  };

  const clearHistorySelection = () => {
    setHistorySelection([]);
  };

  // Clear "New Item" glow on interaction
  useEffect(() => {
    if (newlyAddedId) {
      const timer = setTimeout(() => setNewlyAddedId(null), 3000); // Auto remove after 3s
      return () => clearTimeout(timer);
    }
  }, [newlyAddedId]);

  const saveToHistory = useCallback((recipe: Recipe) => {
    const updated = [recipe, ...history.filter(h => h.id !== recipe.id)];
    setHistory(updated);
    localStorage.setItem('ficha_tecnica_history', JSON.stringify(updated));
  }, [history]);

  const buildOutputRecipe = (recipe: Recipe) => {
    return sanitizeRecipe(recipe, {
      modo_preparo: includeProcedure ? recipe.modo_preparo : [],
      observacoes: includeNotes ? recipe.observacoes : ''
    });
  };

  const sanitizeRecipe = (rawRecipe: Recipe, overrides?: Partial<Recipe>): Recipe => {
    const merged = { ...rawRecipe, ...overrides };
    // Ensure IDs exist (mostly for old history compatibility or raw AI data)
    return {
      ...merged,
      id: merged.id || crypto.randomUUID(),
      nome_formula: merged.nome_formula || 'Nova Receita sem Título',
      data: toISODate(merged.data || isoToday()),
      accentColor: isFormulaThemeColor(merged.accentColor) ? merged.accentColor : primaryColor,
      fontFamily: isFormulaFont(merged.fontFamily) ? merged.fontFamily : FORMULA_FONTS[0].value,
      fontSize: isFormulaFontSize(merged.fontSize) ? merged.fontSize : 'medium',
      stripedRows: typeof merged.stripedRows === 'boolean' ? merged.stripedRows : false,
      ingredientes: (merged.ingredientes && merged.ingredientes.length > 0)
        ? merged.ingredientes.map(i => ({ ...i, id: i.id || crypto.randomUUID() }))
        : [{ id: crypto.randomUUID(), nome: '', quantidade: 0, unidade: 'GR' }],
      modo_preparo: (merged.modo_preparo && merged.modo_preparo.length > 0)
        ? merged.modo_preparo.map(s => typeof s === 'string' ? { id: crypto.randomUUID(), text: s } : { ...s, id: s.id || crypto.randomUUID() })
        : [],
      observacoes: merged.observacoes || ''
    };
  };

  const applyRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setIncludeProcedure(recipe.modo_preparo.length > 0);
    setIncludeNotes(!!recipe.observacoes?.trim());
  };

  const sanitizeAndSetRecipe = (rawRecipe: Recipe, overrides?: Partial<Recipe>) => {
    const sanitized = sanitizeRecipe(rawRecipe, overrides);
    applyRecipe(sanitized);
    navigate('EDITING');
  };

  const createBlankRecipe = () => {
    const blank: Recipe = {
      id: crypto.randomUUID(),
      nome_formula: '',
      data: isoToday(),
      accentColor: primaryColor,
      fontFamily: FORMULA_FONTS[0].value,
      fontSize: 'medium',
      stripedRows: false,
      ingredientes: [{ id: crypto.randomUUID(), nome: '', quantidade: 0, unidade: 'GR' }],
      modo_preparo: [],
      observacoes: ''
    };
    const sanitized = sanitizeRecipe(blank);
    applyRecipe(sanitized);
    navigate('EDITING');
  };

  const startProcessing = (fromState: AppState, title: string, subtitle: string) => {
    setProcessingFrom(fromState);
    setProcessingTitle(title);
    setProcessingSubtitle(subtitle);
    setState('PROCESSING');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startProcessing('IDLE', 'Analisando Ingredientes...', 'A IA está estruturando sua ficha técnica.');
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const mimeType = file.type;
          const result = await parseRecipe({ data: base64, mimeType });
          sanitizeAndSetRecipe(result, { data: draftDate, accentColor: primaryColor });
        } catch (err) {
          setError('Não foi possível ler este arquivo. Verifique se é uma imagem ou PDF válido.');
          setState('IDLE');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Erro ao ler o arquivo.');
      setState('IDLE');
    }
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;
    startProcessing('IDLE', 'Analisando Ingredientes...', 'A IA está estruturando sua ficha técnica.');
    setError(null);
    try {
      const result = await parseRecipe(inputText);
      sanitizeAndSetRecipe(result, { data: draftDate, accentColor: primaryColor });
    } catch (err) {
      setError('Erro ao processar. Verifique sua chave API no .env.local');
      setState('IDLE');
    }
  };

  const handleXmlFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startProcessing('XML', 'Importando XML...', 'Validando e carregando sua ficha.');
    setError(null);
    try {
      const result = await parseXML(file);
      const sanitized = sanitizeRecipe(result);
      applyRecipe(sanitized);
      saveToHistory(sanitized);
      openFinalPreview();
    } catch (err) {
      setError('Não foi possível importar este XML. Verifique o formato.');
      setState('XML');
    }
  };

  const handleXmlTextImport = async () => {
    if (!xmlText.trim()) return;
    startProcessing('XML', 'Importando XML...', 'Validando e carregando sua ficha.');
    setError(null);
    try {
      const result = await parseXMLString(xmlText.trim());
      const sanitized = sanitizeRecipe(result);
      applyRecipe(sanitized);
      saveToHistory(sanitized);
      setXmlText('');
      openFinalPreview();
    } catch (err) {
      setError('Não foi possível importar este XML. Verifique o formato.');
      setState('XML');
    }
  };

  const handleSaveEdit = () => {
    if (!currentRecipe) return;

    // Validation
    const invalidIng = currentRecipe.ingredientes.some(i => !i.nome.trim() || i.quantidade <= 0);
    const invalidStep = includeProcedure && currentRecipe.modo_preparo.some(s => !s.text.trim());

    if (invalidIng || invalidStep) {
      setError('Atenção: Existem campos vazios ou quantidades zeradas. Por favor, corrija antes de finalizar.');
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
      return;
    }
    setError(null);

    const normalizedRecipe = buildOutputRecipe(currentRecipe);
    applyRecipe(normalizedRecipe);
    saveToHistory(normalizedRecipe);
    openFinalPreview();
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    if (!currentRecipe) return;
    setNewlyAddedId(null); // Clear highlight on interact
    const newIngs = currentRecipe.ingredientes.map(ing =>
      ing.id === id ? { ...ing, [field]: value } : ing
    );
    setCurrentRecipe({ ...currentRecipe, ingredientes: newIngs });
  };

  const addIngredient = () => {
    if (!currentRecipe) return;
    const newId = crypto.randomUUID();
    setNewlyAddedId(newId);
    setCurrentRecipe({
      ...currentRecipe,
      ingredientes: [...currentRecipe.ingredientes, { id: newId, nome: '', quantidade: 0, unidade: 'GR' }]
    });
  };

  const removeIngredient = (id: string) => {
    if (!currentRecipe) return;
    const newIngs = currentRecipe.ingredientes.filter(i => i.id !== id);
    setCurrentRecipe({ ...currentRecipe, ingredientes: newIngs.length > 0 ? newIngs : [{ id: crypto.randomUUID(), nome: '', quantidade: 0, unidade: 'GR' }] });
  };

  const addStep = () => {
    if (!currentRecipe) return;
    if (!includeProcedure) {
      setIncludeProcedure(true);
    }
    const newId = crypto.randomUUID();
    setNewlyAddedId(newId);
    setCurrentRecipe({
      ...currentRecipe,
      modo_preparo: [...currentRecipe.modo_preparo, { id: newId, text: '' }]
    });
  };

  const removeStep = (id: string) => {
    if (!currentRecipe) return;
    const newSteps = currentRecipe.modo_preparo.filter(s => s.id !== id);
    setCurrentRecipe({ ...currentRecipe, modo_preparo: newSteps });
  };

  const updateStep = (id: string, value: string) => {
    if (!currentRecipe) return;
    setNewlyAddedId(null); // Clear highlight
    const newSteps = currentRecipe.modo_preparo.map(step =>
      step.id === id ? { ...step, text: value } : step
    );
    setCurrentRecipe({ ...currentRecipe, modo_preparo: newSteps });
  };

  const toggleProcedure = (enabled: boolean) => {
    setIncludeProcedure(enabled);
    if (!currentRecipe) return;
    if (enabled) {
      if (currentRecipe.modo_preparo.length === 0) {
        const newId = crypto.randomUUID();
        setCurrentRecipe({
          ...currentRecipe,
          modo_preparo: [{ id: newId, text: '' }]
        });
      }
    } else {
      setCurrentRecipe({ ...currentRecipe, modo_preparo: [] });
    }
  };

  const toggleNotes = (enabled: boolean) => {
    setIncludeNotes(enabled);
    if (!currentRecipe) return;
    if (!enabled) {
      setCurrentRecipe({ ...currentRecipe, observacoes: '' });
    }
  };

  const deleteRecipe = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('ficha_tecnica_history', JSON.stringify(updated));
  };

  // Drag End Handlers
  const handleDragEndIngredients = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!currentRecipe || !over || active.id === over.id) return;

    const oldIndex = currentRecipe.ingredientes.findIndex((i) => i.id === active.id);
    const newIndex = currentRecipe.ingredientes.findIndex((i) => i.id === over.id);

    setCurrentRecipe({
      ...currentRecipe,
      ingredientes: arrayMove(currentRecipe.ingredientes, oldIndex, newIndex)
    });
  };

  const handleDragEndSteps = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!currentRecipe || !over || active.id === over.id) return;

    const oldIndex = currentRecipe.modo_preparo.findIndex((s) => s.id === active.id);
    const newIndex = currentRecipe.modo_preparo.findIndex((s) => s.id === over.id);

    setCurrentRecipe({
      ...currentRecipe,
      modo_preparo: arrayMove(currentRecipe.modo_preparo, oldIndex, newIndex)
    });
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

  const selectedCount = historySelection.length;
  const filteredIds = filteredHistory.map((recipe) => recipe.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => historySelection.includes(id));
  const previewRecipe = currentRecipe
    ? (previewContext === 'edit' ? buildOutputRecipe(currentRecipe) : currentRecipe)
    : null;


  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 selection:bg-[var(--primary)] selection:text-white" style={{ '--primary': primaryColor } as React.CSSProperties}>

      {/* Dynamic Background Pattern */}
      {showBackgroundPattern && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.08]"
          style={{ backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`, backgroundSize: '32px 32px' }}>
        </div>
      )}

      {/* Navigation */}
      <nav className="no-print bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {navStack.length > 0 && (
                <button
                  onClick={goBack}
                  className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition"
                  title="Voltar"
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
              )}

              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={goHome}
              >
                <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center transform group-hover:rotate-6 transition-all shadow-lg shadow-[var(--primary)]/30">
                  <i className="fas fa-flask text-lg"></i>
                </div>
                <div>
                  <h1 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Ficha Técnica <span className="text-[var(--primary)]">Pro</span></h1>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Industrial Standard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('HISTORY')}
                className={`w-9 h-9 rounded-full border transition ${state === 'HISTORY' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/40' : 'text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'}`}
                title="Histórico"
              >
                <i className="fas fa-history"></i>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition"
                title="Configurações"
              >
                <i className="fas fa-gear"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-8">
        {state === 'HOME' && (
          <div className={`max-w-5xl mx-auto mt-8 sm:mt-16 space-y-8 ${motionClass('animate-in slide-in-from-bottom-4 fade-in duration-700')}`}>
            <ContextHeader
              title="Início"
              subtitle="Escolha como deseja criar ou importar suas fichas técnicas."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => { setError(null); setInputText(''); createBlankRecipe(); }}
                className="text-left bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-4">
                  <i className="fas fa-file-circle-plus text-lg"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Criar em Branco</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">Inicie uma ficha do zero e personalize.</p>
              </button>
              <button
                onClick={() => { setError(null); setInputText(''); setDraftDate(isoToday()); navigate('IDLE'); }}
                className="text-left bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-4">
                  <i className="fas fa-wand-magic-sparkles text-lg"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Gerar por IA</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">Texto, imagem ou PDF com extração automática.</p>
              </button>

              <button
                onClick={() => { setError(null); navigate('XML'); }}
                className="text-left bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-4">
                  <i className="fas fa-file-code text-lg"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Gerar por XML</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">Importe XML e armazene no histórico.</p>
              </button>

              <button
                onClick={() => { setError(null); navigate('HISTORY'); }}
                className="text-left bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-4">
                  <i className="fas fa-history text-lg"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Histórico</h3>
                <p className="text-sm text-slate-500 dark:text-slate-300">Acesse e exporte fichas já salvas.</p>
              </button>
            </div>
          </div>
        )}

        {state === 'IDLE' && (
          <div className={`max-w-3xl mx-auto mt-8 sm:mt-16 space-y-8 ${motionClass('animate-in slide-in-from-bottom-4 fade-in duration-700')}`}>
            <ContextHeader
              title="Gerar por IA"
              subtitle="Transforme texto, imagens ou PDFs em fichas técnicas formatadas."
              className="mt-6 sm:mt-8"
            />

            <div className="glass-panel bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-white/80 dark:border-slate-800 overflow-hidden backdrop-blur-xl">
              <div className="p-1">
                <div className="bg-slate-50/60 dark:bg-slate-950/40 rounded-[22px] p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Data da Fórmula</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-100 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30 outline-none transition"
                        value={draftDate}
                        onChange={(e) => setDraftDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 ml-1">Descreva sua receita ou cole o texto</label>
                  <div className="relative group">
                    <textarea
                      className="w-full h-48 sm:h-56 p-6 bg-white dark:bg-slate-900 border-0 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-[var(--primary)] transition-all resize-none text-slate-700 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-500 text-lg leading-relaxed"
                      placeholder="Ex: Bolo de Chocolate Industrial. 20kg de farinha, 10kg de açúcar... Misture os secos, adicione os líquidos..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        disabled={!inputText}
                        onClick={handleTextSubmit}
                        className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2"
                      >
                        <i className="fas fa-wand-magic-sparkles"></i> Gerar Ficha
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 my-8">
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ou envie um arquivo</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col items-center justify-center h-32 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group">
                      <i className="fas fa-file-pdf text-3xl text-slate-300 group-hover:text-[var(--primary)] mb-3 transition-colors"></i>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-[var(--primary)]">PDF / DOC</span>
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                    </label>
                    <label className="flex flex-col items-center justify-center h-32 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group">
                      <i className="fas fa-camera text-3xl text-slate-300 group-hover:text-[var(--primary)] mb-3 transition-colors"></i>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-[var(--primary)]">Foto / Imagem</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className={`mt-6 flex items-center gap-3 p-4 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-500/30 ${motionClass('animate-in slide-in-from-top-2')}`}>
                <i className="fas fa-exclamation-circle text-xl"></i>
                <p className="font-medium">{error}</p>
              </div>
            )}
          </div>
        )}

        {state === 'XML' && (
          <div className={`max-w-3xl mx-auto mt-8 sm:mt-16 space-y-8 ${motionClass('animate-in slide-in-from-bottom-4 fade-in duration-700')}`}>
            <ContextHeader
              title="Importar por XML"
              subtitle="Faça upload do XML ou cole o conteúdo para importar direto no histórico."
              className="mt-6 sm:mt-8"
            />

            <div className="glass-panel bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-white/80 dark:border-slate-800 overflow-hidden backdrop-blur-xl">
              <div className="p-1">
                <div className="bg-slate-50/60 dark:bg-slate-950/40 rounded-[22px] p-6 sm:p-8 space-y-6">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 ml-1">Arquivo XML</label>
                  <label className="flex flex-col items-center justify-center h-32 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group">
                    <i className="fas fa-file-code text-3xl text-slate-300 group-hover:text-[var(--primary)] mb-3 transition-colors"></i>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-[var(--primary)]">Selecionar XML</span>
                    <input type="file" className="hidden" accept=".xml" onChange={handleXmlFileUpload} />
                  </label>

                  <div className="flex items-center gap-4">
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ou cole o XML</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                  </div>

                  <div className="relative group">
                    <textarea
                      className="w-full h-72 sm:h-80 p-6 bg-slate-950 text-emerald-200 border border-slate-800 rounded-2xl shadow-lg shadow-black/30 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30 transition-all resize-none placeholder:text-slate-500 text-sm leading-relaxed font-mono tracking-tight"
                      placeholder="<recipe>...</recipe>"
                      value={xmlText}
                      onChange={(e) => setXmlText(e.target.value)}
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-slate-800/60"></div>
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        disabled={!xmlText.trim()}
                        onClick={handleXmlTextImport}
                        className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2"
                      >
                        <i className="fas fa-upload"></i> Importar XML
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className={`mt-6 flex items-center gap-3 p-4 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-500/30 ${motionClass('animate-in slide-in-from-top-2')}`}>
                <i className="fas fa-exclamation-circle text-xl"></i>
                <p className="font-medium">{error}</p>
              </div>
            )}
          </div>
        )}

        {state === 'PROCESSING' && (
          <div className={`flex flex-col items-center justify-center min-h-[60vh] ${motionClass('animate-in fade-in duration-1000')}`}>
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
              <div className={`absolute inset-0 rounded-full border-4 border-[var(--primary)] border-t-transparent ${animationsEnabled ? 'animate-spin' : ''}`}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className={`fas fa-brain text-4xl text-[var(--primary)] ${animationsEnabled ? 'animate-pulse' : ''}`}></i>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{processingTitle}</h2>
            <p className={`text-slate-500 dark:text-slate-300 ${animationsEnabled ? 'animate-pulse' : ''}`}>{processingSubtitle}</p>
          </div>
        )}

        {state === 'EDITING' && currentRecipe && (
          <div className={`max-w-5xl mx-auto ${motionClass('animate-in slide-in-from-bottom-8 duration-700')}`}>

            {/* Validation Alert */}
            {error && (
              <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] ${animationsEnabled ? 'animate-bounce' : ''}`}>
                <div className="bg-red-500 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-red-400">
                  <i className="fas fa-exclamation-circle text-2xl"></i>
                  <span className="font-bold">{error}</span>
                </div>
              </div>
            )}

            <ContextHeader
              title="Revisão Técnica"
              subtitle="Ajuste os dados antes de finalizar a ficha."
              className="mt-6 sm:mt-8"
              actions={(
                <>
                  <button
                    onClick={goBack}
                    className="px-6 py-2.5 rounded-xl font-bold text-slate-500 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={openEditPreview}
                    className="px-6 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
                  >
                    Prévia
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 sm:flex-none px-8 py-2.5 bg-[var(--primary)] text-white rounded-xl font-bold shadow-lg shadow-[var(--primary)]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-check"></i> Finalizar
                  </button>
                </>
              )}
            />

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200/70 dark:border-slate-800 overflow-hidden">
              <div className="p-8 space-y-12">
                {/* Nome e Dados Básicos */}
                <div className="group">
                  <label className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest mb-2 block">Identificação do Produto</label>
                  <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                    <div className="flex-1">
                      <input
                        className="w-full text-4xl font-black text-slate-800 dark:text-white border-b-2 border-transparent focus:border-[var(--primary)] placeholder-slate-300 dark:placeholder-slate-600 outline-none bg-transparent transition-colors pb-2"
                        value={currentRecipe.nome_formula}
                        onChange={(e) => setCurrentRecipe({ ...currentRecipe, nome_formula: e.target.value })}
                        placeholder="Nome da Receita"
                      />
                    </div>
                    <div className="w-full sm:w-72 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Data</label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-100 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30 outline-none transition"
                          value={toISODate(currentRecipe.data)}
                          onChange={(e) => setCurrentRecipe({ ...currentRecipe, data: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personalização */}
                <div className="bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm"><i className="fas fa-sliders"></i></span>
                      Personalização da Fórmula
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cor da Fórmula</label>
                      <div className="flex flex-wrap gap-2">
                        {FORMULA_THEMES.map((theme) => (
                          <button
                            key={theme.name}
                            type="button"
                            onClick={() => setCurrentRecipe({ ...currentRecipe, accentColor: theme.color })}
                            className={`w-9 h-9 rounded-full border transition ${currentRecipe.accentColor === theme.color ? 'ring-2 ring-[var(--primary)] border-[var(--primary)]' : 'border-slate-200 dark:border-slate-800'}`}
                            style={{ backgroundColor: theme.color }}
                            title={theme.name}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Fonte</label>
                      <select
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-100 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30 outline-none transition"
                        value={currentRecipe.fontFamily || FORMULA_FONTS[0].value}
                        onChange={(e) => setCurrentRecipe({ ...currentRecipe, fontFamily: e.target.value })}
                      >
                        {FORMULA_FONTS.map((font) => (
                          <option key={font.value} value={font.value}>{font.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tamanho da Fonte</label>
                      <div className="flex flex-wrap gap-2">
                        {FORMULA_FONT_SIZES.map((size) => (
                          <button
                            key={size.value}
                            type="button"
                            onClick={() => setCurrentRecipe({ ...currentRecipe, fontSize: size.value })}
                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition ${currentRecipe.fontSize === size.value ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tabela</label>
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 dark:border-slate-800 px-5 py-4 bg-white/70 dark:bg-slate-900/60">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Linhas alternadas em cinza</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Realce visual na listagem.</p>
                        </div>
                        <div className="relative">
                          <input
                            id="striped-rows-toggle"
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!currentRecipe.stripedRows}
                            onChange={(e) => setCurrentRecipe({ ...currentRecipe, stripedRows: e.target.checked })}
                          />
                          <label
                            htmlFor="striped-rows-toggle"
                            className="relative block w-11 h-6 rounded-full bg-slate-200 dark:bg-slate-800 peer-checked:bg-[var(--primary)] transition cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
                          >
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ingredientes - DND */}
                <div className="bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm"><i className="fas fa-balance-scale"></i></span>
                      Composição
                    </h3>
                    <button onClick={addIngredient} className="text-[var(--primary)] font-bold text-sm hover:underline">+ Adicionar Item</button>
                  </div>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndIngredients} modifiers={[restrictToVerticalAxis]}>
                    <SortableContext items={currentRecipe.ingredientes} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {currentRecipe.ingredientes.map((ing, idx) => (
                          <SortableItem key={ing.id} id={ing.id} newlyAddedId={newlyAddedId} animationsEnabled={animationsEnabled}>
                            <div className="w-6 text-center text-xs font-bold text-slate-300 dark:text-slate-500 select-none">{idx + 1}</div>
                            <input
                              className="flex-1 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition font-medium text-slate-700 dark:text-slate-100"
                              value={ing.nome}
                              onChange={(e) => updateIngredient(ing.id, 'nome', e.target.value)}
                              placeholder="Ingrediente..."
                            />
                            <input
                              type="number"
                              className="w-24 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition font-mono text-right text-slate-700 dark:text-slate-100"
                              value={ing.quantidade}
                              onChange={(e) => updateIngredient(ing.id, 'quantidade', parseFloat(e.target.value) || 0)}
                            />
                            <select
                              className="w-24 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition font-bold text-xs uppercase cursor-pointer text-slate-700 dark:text-slate-100"
                              value={ing.unidade}
                              onChange={(e) => updateIngredient(ing.id, 'unidade', e.target.value)}
                            >
                              {['GR', 'KG', 'ML', 'LT', 'UN', 'PC'].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <button onClick={() => removeIngredient(ing.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 dark:text-slate-500 hover:text-red-500 transition">
                              <i className="fas fa-times"></i>
                            </button>
                          </SortableItem>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                {/* Procedimento Toggle */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 dark:border-slate-800 px-5 py-4 bg-white/70 dark:bg-slate-900/60">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Incluir procedimento</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ative quando quiser descrever o modo de preparo.</p>
                  </div>
                  <div className="relative">
                    <input
                      id="include-procedure-toggle"
                      type="checkbox"
                      className="sr-only peer"
                      checked={includeProcedure}
                      onChange={(e) => toggleProcedure(e.target.checked)}
                    />
                    <label
                      htmlFor="include-procedure-toggle"
                      className="relative block w-11 h-6 rounded-full bg-slate-200 dark:bg-slate-800 peer-checked:bg-[var(--primary)] transition cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
                    >
                    </label>
                  </div>
                </div>

                {/* Modo de Preparo - DND */}
                {includeProcedure && (
                  <div className="bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm"><i className="fas fa-list-ol"></i></span>
                        Procedimento
                      </h3>
                      <button onClick={addStep} className="text-[var(--primary)] font-bold text-sm hover:underline">+ Adicionar Passo</button>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSteps} modifiers={[restrictToVerticalAxis]}>
                      <SortableContext items={currentRecipe.modo_preparo} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                          {currentRecipe.modo_preparo.map((step, idx) => (
                            <SortableItem key={step.id} id={step.id} newlyAddedId={newlyAddedId} animationsEnabled={animationsEnabled}>
                              <span className="flex-shrink-0 w-8 h-8 bg-white dark:bg-slate-900 rounded-full border-2 border-slate-200 dark:border-slate-800 text-slate-400 font-bold flex items-center justify-center group-hover:border-[var(--primary)] group-hover:text-[var(--primary)] transition-colors select-none">
                                {idx + 1}
                              </span>
                              <textarea
                                className="flex-1 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition text-slate-700 dark:text-slate-100 resize-none"
                                rows={2}
                                value={step.text}
                                onChange={(e) => updateStep(step.id, e.target.value)}
                                placeholder="Descreva este passo..."
                              />
                              <button onClick={() => removeStep(step.id)} className="mt-2 text-slate-300 dark:text-slate-500 hover:text-red-500 transition">
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </SortableItem>
                          ))}
                          {currentRecipe.modo_preparo.length === 0 && (
                            <div className="text-sm text-slate-400 dark:text-slate-500">
                              Nenhum passo adicionado. Use “Adicionar Passo” para começar.
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}

                {/* Observações */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 dark:border-slate-800 px-5 py-4 bg-white/70 dark:bg-slate-900/60">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Incluir observações</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Notas técnicas ou instruções extras.</p>
                    </div>
                    <div className="relative">
                      <input
                        id="include-notes-toggle"
                        type="checkbox"
                        className="sr-only peer"
                        checked={includeNotes}
                        onChange={(e) => toggleNotes(e.target.checked)}
                      />
                      <label
                        htmlFor="include-notes-toggle"
                        className="relative block w-11 h-6 rounded-full bg-slate-200 dark:bg-slate-800 peer-checked:bg-[var(--primary)] transition cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
                      >
                      </label>
                    </div>
                  </div>
                  {includeNotes && (
                    <textarea
                      className="w-full p-4 bg-amber-50/60 dark:bg-slate-900 border-l-4 border-amber-200 dark:border-slate-700 rounded-r-xl outline-none text-slate-600 dark:text-slate-200 focus:bg-amber-50 transition"
                      placeholder="Observações de qualidade, validade ou armazenamento..."
                      value={currentRecipe.observacoes}
                      onChange={(e) => setCurrentRecipe({ ...currentRecipe, observacoes: e.target.value })}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {state === 'PREVIEW' && previewRecipe && (
          <div className={`max-w-5xl mx-auto flex flex-col gap-8 items-stretch ${motionClass('animate-in zoom-in-95 duration-500')}`}>
            <ContextHeader
              title={previewContext === 'edit' ? 'Prévia da Fórmula' : 'Ficha Final'}
              subtitle={previewContext === 'edit' ? 'Confira a visualização antes de finalizar.' : 'Exportar ou imprimir a ficha técnica.'}
              className="mt-6 sm:mt-8"
              actions={previewContext === 'edit' ? (
                <>
                  <button
                    onClick={goBack}
                    className="px-6 py-2.5 rounded-xl font-bold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 hover:bg-[var(--primary)]/15 transition"
                  >
                    Edição
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 sm:flex-none px-8 py-2.5 bg-[var(--primary)] text-white rounded-xl font-bold shadow-lg shadow-[var(--primary)]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-check"></i> Finalizar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => exportToXML(previewRecipe)}
                    className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-file-code"></i> Exportar XML
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-[var(--primary)]/30 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-print"></i> Imprimir Ficha
                  </button>
                </>
              )}
            />
            <div className="w-full max-w-[210mm] mx-auto">
              <RecipePrintable recipe={previewRecipe} />
            </div>
          </div>
        )}

        {state === 'HISTORY' && (
          <div className={`max-w-6xl mx-auto ${motionClass('animate-in fade-in duration-500')}`}>
            <div className="space-y-6 mb-8">
              <ContextHeader
                title="Histórico"
                subtitle="Selecione fichas para exportar em lote."
                badge={`${history.length} itens`}
                className="mt-6 sm:mt-8"
                actions={(
                  <>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{selectedCount} selecionado(s)</span>
                    <button
                      onClick={() => handleBulkDownload('xml')}
                      disabled={selectedCount === 0 || isHistoryDownloading}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-[var(--primary)] hover:text-[var(--primary)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Baixar XML
                    </button>
                    <button
                      onClick={() => handleBulkDownload('pdf')}
                      disabled={selectedCount === 0 || isHistoryDownloading}
                      className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white font-semibold shadow-lg shadow-[var(--primary)]/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Baixar PDF
                    </button>
                  </>
                )}
              />

              <div className="no-print bg-white/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-end gap-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">De</label>
                    <input
                      type="date"
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100"
                      value={historyFilterStart}
                      onChange={(e) => setHistoryFilterStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Até</label>
                    <input
                      type="date"
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100"
                      value={historyFilterEnd}
                      onChange={(e) => setHistoryFilterEnd(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => { setHistoryFilterStart(''); setHistoryFilterEnd(''); }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
                  >
                    Limpar filtro
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={allFilteredSelected ? clearHistorySelection : selectAllFiltered}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
                  >
                    {allFilteredSelected ? 'Limpar seleção' : 'Selecionar tudo'}
                  </button>
                </div>
              </div>

              {historyError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-500/30">
                  <i className="fas fa-exclamation-circle text-xl"></i>
                  <p className="font-medium">{historyError}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHistory.map(recipe => (
                <div
                  key={recipe.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[data-history-select]')) return;
                    applyRecipe(sanitizeRecipe(recipe));
                    openFinalPreview();
                  }}
                >

                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)]/5 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none group-hover:bg-[var(--primary)]/10 transition-colors"></div>
                  <div className="absolute top-4 left-4 z-10" data-history-select>
                    <label
                      className="flex items-center justify-center w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={historySelection.includes(recipe.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); toggleHistorySelection(recipe.id); }}
                      />
                      <i className={`fas fa-check text-xs ${historySelection.includes(recipe.id) ? 'text-[var(--primary)]' : 'text-transparent'}`}></i>
                    </label>
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/5 px-2 py-1 rounded ml-10">{formatDateDisplay(recipe.data)}</span>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); applyRecipe(sanitizeRecipe(recipe)); navigate('EDITING'); }} className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-[var(--primary)] hover:text-white transition flex items-center justify-center text-slate-400">
                        <i className="fas fa-pen text-xs"></i>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); exportToXML(recipe); }} className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-[var(--primary)] hover:text-white transition flex items-center justify-center text-slate-400">
                        <i className="fas fa-file-code text-xs"></i>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }} className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-red-500 hover:text-white transition flex items-center justify-center text-slate-400">
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xl mb-2 line-clamp-1">{recipe.nome_formula}</h3>
                  <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <span>{recipe.ingredientes.length} Insumos</span>
                    <span>{recipe.modo_preparo.length} Passos</span>
                  </div>
                </div>
              ))}

              {filteredHistory.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400">
                  <i className="fas fa-inbox text-5xl mb-4 opacity-20"></i>
                  <p>{history.length === 0 ? 'Nenhuma ficha salva ainda.' : 'Nenhuma ficha encontrada para este filtro.'}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          ></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configurações</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Preferências visuais e fluxo de trabalho.</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition"
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 p-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Tema</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tema da interface</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Escolha claro ou escuro.</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setThemeMode('light')}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${themeMode === 'light' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'}`}
                      >
                        Claro
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('dark')}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${themeMode === 'dark' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'}`}
                      >
                        Escuro
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('system')}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${themeMode === 'system' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'}`}
                      >
                        Sistema
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cor do tema</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {UI_THEMES.map((theme) => (
                        <button
                          key={theme.name}
                          onClick={() => setPrimaryColor(theme.color)}
                          className={`w-9 h-9 rounded-full border transition ${primaryColor === theme.color ? 'ring-2 ring-[var(--primary)] border-[var(--primary)]' : 'border-slate-200 dark:border-slate-800'}`}
                          style={{ backgroundColor: theme.color }}
                          title={theme.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 p-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Interface</p>
                <div className="space-y-4">
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Animações</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Controla transições e efeitos.</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={animationsEnabled}
                        onChange={(e) => setAnimationsEnabled(e.target.checked)}
                      />
                      <label className="block w-11 h-6 rounded-full bg-slate-200 dark:bg-slate-800 peer-checked:bg-[var(--primary)] transition cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"></label>
                    </div>
                  </label>

                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Fundo com padrão</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Mostra textura sutil no background.</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={showBackgroundPattern}
                        onChange={(e) => setShowBackgroundPattern(e.target.checked)}
                      />
                      <label className="block w-11 h-6 rounded-full bg-slate-200 dark:bg-slate-800 peer-checked:bg-[var(--primary)] transition cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"></label>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
