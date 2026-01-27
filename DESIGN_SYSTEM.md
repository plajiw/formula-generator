# Design System — FormulaPro

Este documento define o padrão visual e comportamental do sistema. Ele é a fonte única de verdade para UI/UX, tokens e uso de componentes.

## 1. Princípios
- **Clareza técnica**: interface deve ser legível e previsível.
- **Consistência**: mesmo padrão entre telas e componentes.
- **Baixa fricção**: fluxo rápido, sem modais ou bloqueios desnecessários.
- **Sobra controlada**: espaço suficiente para leitura longa.

## 2. Tokens (Fonte Única de Verdade)
**Local:** `index.html` (tokens CSS globais)

### Cores (neutros)
- `--surface-0`: fundo geral
- `--surface-1`: superfície principal (cards)
- `--surface-2`: superfície secundária
- `--border`: borda padrão
- `--ink-0`: texto primário
- `--ink-1`: texto secundário

### Brand
- `--primary`: ação principal

### Radius
- `--radius-lg`: containers e cards
- `--radius-md`: inputs
- `--radius-sm`: botões/ícones

### Shadow
- `--shadow-1`: elevação básica

## 3. Tipografia
Fonte base: **Manrope**  
Hierarquia:
- Títulos: `text-2xl` ou `text-xl`, peso `font-black` ou `font-bold`
- Labels: `text-xs`/`text-[10px]` com tracking maior
- Texto normal: `text-sm` / `text-base`

Regras:
- Evitar texto claro em fundo escuro com contraste excessivo.
- Labels sempre menores e discretos, mas legíveis.

## 4. Grid e Espaçamento
Grid base: 12 colunas (desktop)
- Uso consistente entre tabelas e formulários.
- Inputs e ícones devem alinhar pelo mesmo eixo horizontal.

Espaçamentos padrão:
- Cards: `p-6`
- Headers: `p-4`
- Gaps entre blocos: `space-y-6` ou `space-y-8`

## 5. Componentes Core

### 5.1 Botões
Classes padrão:
- **Primário**: `ds-button-primary`
- **Secundário**: `ds-button`
- **Ícone**: `ds-icon-button`

Regras:
- Um botão primário por tela.
- Ícones e textos sempre alinhados.

### 5.2 Inputs
Classes padrão:
- `ds-input`, `ds-input-lg`
- `ds-select`
- `ds-textarea`

Regras:
- `w-full` sempre que possível.
- Altura padrão uniforme (36px / 44px).
- Mensagens/hints devem ter espaço reservado fixo.

### 5.3 Cards e Painéis
Classes padrão:
- `ds-card` (card principal)
- `ds-panel` (bloco interno)

Regras:
- Cards sempre com `ds-card`.
- Painéis internos com `ds-panel`.

### 5.4 Ícones
Biblioteca: **lucide-react** (única).
Tamanho padrão:
- 12–14px em botões compactos
- 16–18px em headers

### 5.5 Validações Silenciosas
Regras:
- Alertas leves (`text-amber-600`).
- Nunca bloquear o fluxo.
- Alinhados ao input, com altura reservada.

## 6. Layout e Preview
Desktop:
- Editor + Preview em 50/50 (ajustável).
- Preview sempre opcional.

Mobile:
- Preview em fullscreen via botão “Ver Preview”.

## 7. Responsividade
Regras gerais:
- Grid de tabelas deve reduzir ou empilhar em telas pequenas.
- Inputs nunca devem ficar estreitos demais.
- Priorizar leitura e preenchimento confortável.

## 8. Manutenção
Regras:
- Evitar valores mágicos no JSX.
- Sempre preferir `ds-*` classes.
- Tokens visuais só em `index.html`.

## 9. Checklist de consistência
- [ ] Inputs com `ds-input` / `ds-select`
- [ ] Botões com `ds-button` / `ds-button-primary`
- [ ] Cards com `ds-card`
- [ ] Ícones apenas lucide-react
- [ ] Preview controlável e não invasivo
