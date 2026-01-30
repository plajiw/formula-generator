# 🔧 PLANO DE REFATORAÇÃO COMPLETA - Ficha Técnica Pro

**Data**: 29 de janeiro de 2026
**Status**: 🎯 Em Planejamento
**Escopo**: Grande refatoração de UX/UI + Performance + Modularização

---

## 📊 DIAGNÓSTICO

### ❌ Problemas Identificados

#### 1. **Tema de Cores**
- Dark mode muito azulado (tons de blue: `#111214`, `#1a1c1f`, `#cbd5f5`)
- Precisa: Tons de cinza neutro (`#1a1a1a`, `#2a2a2a`, `#ffffff`)
- Impacto: Visual menos profissional, menos "sério"

#### 2. **Componentes Não Modularizados**
- Inputs espalhados em `RecipeEditor.tsx` (1000+ linhas)
- Sem componentes reutilizáveis (InputField, QuantityInput, etc)
- Impacto: Difícil manutenção, inconsistência visual

#### 3. **Layout Desalinhado**
- Texto em inputs com "muita informação"
- Headers desalinhados com conteúdo
- Grid inconsistente
- Impacto: UX confusa, menos profissional

#### 4. **Preview do PDF**
- Não responsivo
- Sem controle de zoom
- Impacto: Experiência ruim em mobile/tablet

#### 5. **Performance**
- `RecipeEditor.tsx`: 726 linhas (componente gigante)
- Sem lazy loading
- Sem memoização adequada
- Impacto: Re-renders desnecessários

#### 6. **Personalização Limitada**
- Poucas opções de customização
- Themes estáticos
- Impacto: Formulários não únicos

---

## 🎯 OBJETIVOS

✅ **Design System Profissional**
- Tema cinza neutro (não azulado)
- Padrão visual consistente
- Fácil para olhar (profissional)

✅ **Modularização Completa**
- Componentes reutilizáveis
- Sem código duplicado
- Fácil de manter

✅ **UX Intuitiva**
- Campos bem alinhados
- Informação clara e concisa
- Fluxo visual óbvio

✅ **Responsividade**
- Preview 50% desktop
- Oculto em mobile (com toggle)
- Sem scroll desnecessário

✅ **Performance**
- Lazy loading
- Memoização
- Bundle size reduzido

✅ **Profissionalismo**
- Visual "sério" para profissionais
- Nichado na área industrial/técnica
- Fácil de identificar

---

## 📋 TAREFAS PRIORIZADAS

### **FASE 1: Design System & Cores** (2-3h)
```
1. Atualizar paleta de cores (dark: cinza em vez de azul)
2. Refatorar index.html <style>
3. Testar dark mode novo
4. Atualizar DESIGN_SYSTEM.md
```

### **FASE 2: Modularização** (6-8h)
```
1. Criar componente InputField.tsx
2. Criar componente QuantityInput.tsx
3. Criar componente SelectField.tsx
4. Criar componente PriceInput.tsx
5. Criar componente RecipeStep.tsx
6. Criar componente IngredientRow.tsx
```

### **FASE 3: Reformular Campos** (4-5h)
```
1. Simplificar layout inputs
2. Alinhar verticalmente
3. Reduzir informação visual
4. Melhorar feedback visual
```

### **FASE 4: Reescrever RecipeEditor** (8-10h)
```
1. Novo layout com grid
2. Preview PDF integrado
3. Melhor organização visual
4. Responsividade melhorada
```

### **FASE 5: Preview PDF** (3-4h)
```
1. Responsive (50% desktop, oculto mobile)
2. Sem zoom além de 50%
3. Toggle show/hide mobile
```

### **FASE 6: Personalização Avançada** (4-5h)
```
1. Adicionar mais temas
2. Opções de customização
3. Templates de formulários
```

### **FASE 7: Performance** (3-4h)
```
1. Lazy loading componentes
2. Memoização
3. Code splitting
```

### **FASE 8: QA & Testes** (2-3h)
```
1. Verificar erros
2. Console warnings
3. Edge cases
```

---

## 🎨 NOVA PALETA DE CORES

```css
:root {
  /* Cores Neutras - Cinza (não azul!) */
  --surface-0: #ffffff;      /* Branco */
  --surface-1: #f5f5f5;      /* Cinza muito claro */
  --surface-2: #e8e8e8;      /* Cinza claro */
  --surface-3: #d3d3d3;      /* Cinza médio */

  --ink-0: #1a1a1a;          /* Quase preto */
  --ink-1: #4a4a4a;          /* Cinza escuro */
  --ink-2: #757575;          /* Cinza médio */

  --border: #d9d9d9;         /* Cinza border */
}

html.dark {
  /* Dark mode - Cinza puro (não azul!) */
  --surface-0: #0f0f0f;      /* Quase preto puro */
  --surface-1: #1a1a1a;      /* Cinza muito escuro */
  --surface-2: #2a2a2a;      /* Cinza escuro */
  --surface-3: #3a3a3a;      /* Cinza médio */

  --ink-0: #f5f5f5;          /* Branco */
  --ink-1: #d0d0d0;          /* Cinza claro */
  --ink-2: #a0a0a0;          /* Cinza médio */

  --border: #3a3a3a;         /* Cinza border */
}

/* Primary color mantém */
--primary: #3b82f6;          /* Azul (CTA, accents) */
```

---

## 📐 NOVA ESTRUTURA DE COMPONENTES

```
src/components/
├── ui/
│   ├── form/
│   │   ├── InputField.tsx          (novo)
│   │   ├── QuantityInput.tsx       (novo)
│   │   ├── SelectField.tsx         (novo)
│   │   ├── PriceInput.tsx          (novo)
│   │   ├── TextAreaField.tsx       (novo)
│   │   └── FormRow.tsx             (novo)
│   │
│   ├── layout/
│   │   ├── EditorPanel.tsx         (novo)
│   │   ├── PreviewPanel.tsx        (novo)
│   │   └── ResponsiveGrid.tsx      (novo)
│   │
│   └── others/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Loader.tsx
│
├── features/
│   ├── Editor/
│   │   ├── RecipeEditor.tsx        (refatorado)
│   │   ├── IngredientsTable.tsx    (novo)
│   │   ├── StepsSection.tsx        (novo)
│   │   └── PreviewSection.tsx      (novo)
│   │
│   ├── Wizard/
│   └── History/
│
└── common/
    ├── SortableItem.tsx
    └── ...
```

---

## ✨ EXEMPLO: Novo Input Field

```tsx
// src/components/ui/form/InputField.tsx
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  icon,
  size = 'md',
  fullWidth = true
}) => (
  <div className={`form-field ${fullWidth ? 'w-full' : ''}`}>
    <label className="form-label">{label}</label>
    <div className="form-input-wrapper">
      {icon && <div className="form-icon">{icon}</div>}
      <input
        className={`form-input form-input-${size} ${error ? 'form-input-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
    {error && <p className="form-error">{error}</p>}
  </div>
);
```

---

## 🎯 CHECKPOINTS

- [ ] **Fase 1 ✓**: Cores atualizadas (cinza)
- [ ] **Fase 2 ✓**: Componentes modulares criados
- [ ] **Fase 3 ✓**: Campos reformulados
- [ ] **Fase 4 ✓**: RecipeEditor reescrito
- [ ] **Fase 5 ✓**: Preview PDF responsivo
- [ ] **Fase 6 ✓**: Personalização avançada
- [ ] **Fase 7 ✓**: Performance otimizada
- [ ] **Fase 8 ✓**: QA & testes

---

## ⏱️ ESTIMATIVA

| Fase | Tempo | Prioridade |
|------|-------|-----------|
| 1 | 2-3h | 🔴 Alta |
| 2 | 6-8h | 🔴 Alta |
| 3 | 4-5h | 🔴 Alta |
| 4 | 8-10h | 🔴 Alta |
| 5 | 3-4h | 🟡 Média |
| 6 | 4-5h | 🟡 Média |
| 7 | 3-4h | 🟡 Média |
| 8 | 2-3h | 🔴 Alta |
| **TOTAL** | **35-42h** | |

---

## 🚀 PRÓXIMO PASSO

Confirmar plano e começar pela **Fase 1: Design System & Cores**

---

*Plano criado: 29/01/2026*
