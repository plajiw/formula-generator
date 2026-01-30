# Design System - Ficha Técnica Pro

**Versão**: 1.0.0
**Data**: 29 de janeiro de 2026
**Status**: Oficial

---

## 📐 Visão Geral

O Design System do Ficha Técnica Pro estabelece padrões consistentes de UI/UX em todos os componentes, garantindo coerência visual e funcional.

---

## 🎨 Paleta de Cores

### **Cores Primárias**

| Nome | Valor | Uso |
|------|-------|-----|
| Primary | `#3b82f6` | CTA, hover, focus, accent |
| Primary Light | `#dbeafe` | Backgrounds, hover states |
| Primary Dark | `#1e3a8a` | Text, dark mode accents |

### **Cores Semânticas**

```css
:root {
  /* Success */
  --success: #10b981;
  --success-light: #d1fae5;
  --success-dark: #047857;

  /* Warning */
  --warning: #f59e0b;
  --warning-light: #fef3c7;
  --warning-dark: #d97706;

  /* Danger */
  --danger: #ef4444;
  --danger-light: #fee2e2;
  --danger-dark: #dc2626;

  /* Info */
  --info: #0ea5e9;
  --info-light: #cffafe;
  --info-dark: #0284c7;
}
```

### **Cores Neutras**

#### Light Mode
```css
--surface-0: #f9fafb;    /* Fundo principal */
--surface-1: #f1f5f9;    /* Cards, panels */
--surface-2: #e2e8f0;    /* Borders, dividers */
--ink-0: #0f172a;        /* Text primário */
--ink-1: #334155;        /* Text secundário */
--ink-2: #64748b;        /* Text terciário */
--border: #e2e8f0;       /* Borders */
```

#### Dark Mode
```css
html.dark {
  --surface-0: #0b0b0c;
  --surface-1: #111214;
  --surface-2: #1a1c1f;
  --ink-0: #f8fafc;
  --ink-1: #a1a8b5;
  --ink-2: #8a94a3;
  --border: #2a2d32;
}
```

### **Sombras**

```css
--shadow-1: 0 8px 20px rgba(15, 23, 42, 0.06);
--shadow-2: 0 10px 30px rgba(15, 23, 42, 0.12);
--shadow-lg: 0 20px 50px rgba(15, 23, 42, 0.18);

html.dark {
  --shadow-1: 0 10px 22px rgba(0, 0, 0, 0.35);
  --shadow-2: 0 15px 35px rgba(0, 0, 0, 0.45);
  --shadow-lg: 0 25px 60px rgba(0, 0, 0, 0.55);
}
```

---

## 📝 Tipografia

### **Font Stack**
```css
body {
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
}
```

### **Escala Tipográfica**

| Nome | Tamanho | Peso | Uso |
|------|---------|------|-----|
| **Body XS** | 12px | 400 | Help text, captions |
| **Body SM** | 14px | 400 | Body text, labels |
| **Body Base** | 16px | 400 | Padrão |
| **Body LG** | 18px | 400 | Large body text |
| **Heading SM** | 14px | 700 | Subtítulos |
| **Heading Base** | 16px | 700 | Seção headers |
| **Heading LG** | 20px | 700 | Modal titles |
| **Heading XL** | 24px | 900 | Page titles |
| **Display** | 36px | 900 | Hero headlines |

### **Line Heights**
```css
--leading-tight: 1.25;      /* Títulos */
--leading-normal: 1.5;      /* Body text */
--leading-relaxed: 1.625;   /* Forms, descriptions */
```

### **Letter Spacing**
```css
--tracking-tighter: -0.02em;  /* Compact */
--tracking-tight: -0.01em;
--tracking-normal: 0;
--tracking-wide: 0.025em;     /* Uppercase labels */
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;     /* Small caps */
```

---

## 📦 Espaçamento (4px Base)

```css
:root {
  /* Scale: 4px */
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-7: 1.75rem;    /* 28px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
}
```

### **Padrões de Espaçamento**

```
Horizontal Padding:
- Inputs: 12px
- Buttons: 16px
- Cards: 24px
- Page: 24px (mobile), 32px (tablet), 48px (desktop)

Vertical Padding:
- Inputs/Buttons: 8-10px
- Cards: 24px
- Sections: 48px

Gaps entre items:
- Tight (inline): 8px
- Normal (list): 16px
- Loose (sections): 24-32px
```

---

## 🔲 Componentes Base

### **1. Button**

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}
```

#### Estilos

| Variant | Background | Border | Text |
|---------|-----------|--------|------|
| **Primary** | `--primary` | `--primary` | White |
| **Secondary** | `--surface-2` | `--border` | `--ink-0` |
| **Danger** | `--danger` | `--danger` | White |
| **Ghost** | Transparent | Transparent | `--ink-1` |

#### Sizes

| Size | Height | Padding | Font |
|------|--------|---------|------|
| **SM** | 32px | 8px 12px | 12px |
| **MD** | 40px | 10px 16px | 14px |
| **LG** | 48px | 12px 20px | 16px |

#### Estados

```css
/* Normal */
.button { transition: all 0.2s ease; }

/* Hover */
.button:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
  transform: translateY(-1px);
}

/* Active */
.button:active {
  transform: scale(0.98);
}

/* Disabled */
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Focus */
.button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### **2. Input**

```tsx
interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'date';
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  helpText?: string;
}
```

#### Estilos

```css
.input {
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-1);
  font-size: 14px;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input.error {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

#### Variantes

```tsx
// Text
<Input type="text" label="Nome" />

// Number (com spinners)
<Input type="number" step="0.01" label="Preço" />

// Date
<Input type="date" label="Data" />

// Email (com validação)
<Input type="email" label="E-mail" />

// Com erro
<Input error="Campo obrigatório" />
```

### **3. Card**

```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  hoverable?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Estilos

```css
.card {
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface-1);
  box-shadow: var(--shadow-1);
  overflow: hidden;
}

.card.hoverable:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-2);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

.card.interactive {
  cursor: pointer;
}

.card.elevated {
  box-shadow: var(--shadow-lg);
}

.card.outlined {
  border: 2px solid var(--border);
  box-shadow: none;
}
```

### **4. Select**

```tsx
interface SelectProps {
  label?: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}
```

#### Estilos

```css
.select {
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-1);
  cursor: pointer;
  appearance: none;
  padding-right: 32px;  /* Espaço para arrow */
  background-image: url("data:image/svg+xml...");  /* Custom arrow */
}

.select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### **5. Modal / Dialog**

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

#### Estilos

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 40;
}

.modal-content {
  border-radius: 16px;
  background: var(--surface-1);
  box-shadow: var(--shadow-lg);
  max-width: 500px;  /* MD */
}

/* Sizes */
.modal-sm { max-width: 350px; }
.modal-lg { max-width: 700px; }
```

---

## 📐 Border Radius

```css
--radius-sm: 8px;     /* Buttons, small elements */
--radius-md: 12px;    /* Inputs, cards pequenos */
--radius-lg: 14px;    /* Cards, modals */
--radius-xl: 16px;    /* Large containers */
```

---

## ⏱️ Transições & Animações

### **Durations**
```css
--duration-fast: 0.15s;
--duration-normal: 0.2s;
--duration-slow: 0.3s;
--duration-slower: 0.5s;
```

### **Easing**
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### **Padrões Comuns**

```css
/* Hover elevation */
.hoverable {
  transition: all 0.2s ease-out;
}
.hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-2);
}

/* Focus state */
.focusable:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Loading spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide in */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 📱 Responsividade

### **Breakpoints**

```css
/* Mobile First */
xs:   0px      (default)
sm:   640px    (tablets)
md:   768px    (small desktops)
lg:   1024px   (desktops)
xl:   1280px   (large desktops)
2xl:  1536px   (extra large)
```

### **Padrões de Layout**

```css
/* Full width em mobile, grid em desktop */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;  /* Mobile */
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Usando Tailwind (recomendado) */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## ♿ Acessibilidade (WCAG 2.1 AA)

### **Cores**
- ✅ Contraste mínimo 4.5:1 para texto normal
- ✅ Contraste 3:1 para texto grande (18px+)
- ✅ Não depender apenas de cor

### **Teclado**
- ✅ Todos os elementos interativos acessíveis por tab
- ✅ Focus indicator visível (outline ou box-shadow)
- ✅ Tab order lógico

### **Semantic HTML**
```tsx
✅ <button>Ação</button>
❌ <div onClick={...}>Ação</div>

✅ <input type="number" aria-label="Quantidade" />
❌ <input type="text" placeholder="Qtd" />

✅ <h1>Título</h1>
❌ <div style={{fontSize: '32px'}}>Título</div>
```

### **ARIA Labels**
```tsx
<button aria-label="Deletar item">
  <Trash2 />
</button>

<input
  type="email"
  aria-label="Endereço de email"
  aria-required="true"
/>

<div role="status" aria-live="polite">
  Carregando...
</div>
```

---

## 🧪 Testing

### **Unit Tests**
```tsx
describe('Button', () => {
  it('should render with primary variant', () => {
    const { container } = render(<Button variant="primary">Click</Button>);
    expect(container.querySelector('.button-primary')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### **Visual Regression**
```tsx
// Usando Chromatic ou Percy
test('Button looks correct', async () => {
  const { container } = render(<Button>Click</Button>);
  expect(container).toMatchSnapshot();
});
```

---

## 📋 Checklist de Implementação

- [ ] Implementar componente Button
- [ ] Implementar componente Input
- [ ] Implementar componente Card
- [ ] Implementar componente Select
- [ ] Implementar componente Modal
- [ ] Adicionar testes para cada componente
- [ ] Documentar variantes e estados
- [ ] Validar contrast ratio (WebAIM)
- [ ] Testar keyboard navigation
- [ ] Criar Storybook para documentação
- [ ] Setup visual regression testing

---

## 🔗 Referências

- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Headless UI](https://headlessui.com/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

*Design System Version 1.0.0 - 29/01/2026*
