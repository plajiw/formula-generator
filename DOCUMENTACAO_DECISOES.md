# Documentacao de Decisoes Tecnicas

Objetivo: registrar mudancas estruturais relevantes de forma curta, para manter memoria tecnica sem burocracia.

## 2026-01-28
- O que foi feito: presets centralizados em `src/constants/presets.ts` e removidos de `src/App.tsx`.
- Por que: reduzir acoplamento do App e tornar presets reutilizaveis sem duplicacao.
- O que NAO mudou: formato dos dados, comportamento da aplicacao e UX.
