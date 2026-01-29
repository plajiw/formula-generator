# Documentacao Funcional do Sistema

## 1. Visao geral do sistema
Este sistema organiza fichas tecnicas de formulacao industrial para uso pessoal. Ele prioriza controle, previsibilidade e clareza, com uma IA deliberadamente nao-criativa.

Problema que resolve:
- Centralizar fichas tecnicas com estrutura consistente.
- Garantir visualizacao A4 previsivel (preview e PDF).
- Reduzir retrabalho ao extrair dados via IA sem perder controle humano.

Para quem existe:
- Uso pessoal, com foco em consistencia e confianca do documento final.

O que o sistema NAO pretende ser:
- Um gerador criativo de receitas ou de conteudo.
- Um editor grafico livre ou WYSIWYG.
- Um produto multiusuario ou uma plataforma de publicacao.

Filosofia geral:
- Simplicidade: menos opcoes, mais previsibilidade.
- Controle: usuario decide o que entra e o que sai.
- Previsibilidade: preview e PDF seguem regras estaveis.
- IA como extratora, nao como autora.

## 2. Fluxo principal (happy path)
1) Criar nova ficha
- Estado inicial: RASCUNHO.
- Campos vazios e prontos para edicao.

2) Inserir dados
- Manualmente no editor OU via IA.
- Validacoes silenciosas aparecem como hints, sem bloqueio.

3) Usar o preview
- Verificacao visual do documento A4.
- Ajustar conteudo antes de finalizar.

4) Marcar como FINAL
- Confirma que o documento esta pronto para uso.
- Preview fica limpo, sem watermark.

5) Exportar ou imprimir
- Exportar PDF como fluxo recomendado.
- Impressao via navegador continua disponivel.

Onde o usuario decide:
- Quando usar IA.
- Quando marcar como FINAL.
- Quando exportar ou imprimir.

Onde o sistema ajuda:
- Validacoes silenciosas e indicacoes visuais.
- Preview A4 controlavel.

Onde nada e automatico:
- Nao ha mudanca de estado automatica.
- Nao ha edicao silenciosa de conteudo pela IA.
- Nao ha exportacao sem confirmacao explicita.

## 3. Estado da ficha: RASCUNHO vs FINAL
### RASCUNHO
- Estado padrao de qualquer ficha nova.
- Indicado para testes, ajustes e uso da IA.
- Pode conter inconsistencias ou campos incompletos.
- Preview com watermark de rascunho.
- Exportacao desaconselhada (alerta ao tentar).

### FINAL
- Documento considerado oficial.
- Preview limpo, sem watermark.
- Exportacao liberada.
- Base para impressao e arquivamento.

Por que esse estado existe:
- Evita exportacao acidental de algo incompleto.
- Torna explicito o nivel de confianca do documento.
- Permite iteracao rapida sem medo de “estragar” a versao oficial.

Comportamento esperado vs excecao:
- Esperado: fichas rascunho sao revisadas antes de virar final.
- Excecao: usuario pode forcar exportacao em rascunho, mas o sistema sinaliza o risco.

## 4. Preview: comportamento e intencao
O preview e um painel auxiliar, nao um editor. Ele serve para inspecionar layout, paginacao e legibilidade antes de finalizar.

### Desktop
- Layout inicial 50/50 (Editor/Preview).
- Pode ocultar ou mostrar o preview.
- Divisor arrastavel com largura persistida.
- Zoom afeta apenas o preview.

### Mobile
- Preview em fullscreen via botao dedicado.
- Nao fica fixo ao lado do editor.

Diferenca entre preview e PDF final:
- Preview e para inspecao rapida.
- PDF e o output final para uso oficial.

Comportamento esperado vs excecao:
- Esperado: preview usado para validar antes de marcar FINAL.
- Excecao: usuario pode ignorar preview e exportar diretamente (nao recomendado).

## 5. IA: o que faz e o que NAO faz
A IA tem escopo tecnico controlado.

A IA FAZ:
- Extrai dados do input (texto/imagem/PDF).
- Normaliza estrutura (campos esperados).
- Preenche campos quando o dado esta presente no material de entrada.

A IA NAO FAZ:
- Nao opina nem melhora texto.
- Nao cria receitas ou etapas.
- Nao altera dados sem pedido explicito.
- Nao “corrige” automaticamente informacoes duvidosas.

Intencao:
- Proteger o sistema contra deriva criativa.
- Manter a autoria humana do conteudo.
- Evitar mudancas silenciosas que possam comprometer a ficha.

## 6. Personalizacao de formula
Personalizacao afeta a apresentacao do documento, nao o conteudo tecnico.

O que pode ser personalizado:
- Cor de destaque do documento.
- Tipografia.
- Linhas zebradas na tabela.

Presets:
- Preset cria uma ficha base (JSON parcial).
- Serve para acelerar a criacao.
- Usuario edita livremente depois.

Diferenca entre aparencia e conteudo:
- Aparencia: estilo visual do documento.
- Conteudo: dados tecnicos da formula.

Impacto no preview e no PDF:
- Preview e PDF refletem as escolhas visuais.
- Conteudo permanece o mesmo, apenas a forma de exibicao muda.

## 7. Validacoes silenciosas
Validacoes sao informativas e nunca bloqueiam o fluxo.

Exemplos comuns:
- Quantidade = 0.
- Ingredientes preenchidos + peso total = 0.
- Unidade possivelmente incompatível.

Como interpretar feedbacks visuais:
- Hints discretos sinalizam inconsistencias.
- O usuario decide se corrige ou segue adiante.

Por que nao bloqueiam:
- O sistema prioriza fluidez e autonomia.
- Em rascunho, inconsistencias sao aceitaveis.

## 8. Atalhos de teclado
Atalhos funcionam apenas no contexto correto.

Lista de atalhos:
- Enter: adicionar novo ingrediente.
- Ctrl + Enter: salvar ficha.
- Ctrl + P: abrir preview.
- Esc: fechar modal / sair do preview.

Contexto e limitacoes:
- Nao conflitam com inputs de texto.
- Desativados quando um modal bloqueante esta aberto.
- Dependem do foco atual (editor vs preview).

## 9. Exportacao e impressao
### Exportar PDF (recomendado)
- Nome padrao: Ficha_<NomeDaFormula>_<Status>_<Data>.pdf
- Ex: Ficha_Chimichurri_FINAL_2026-01-27.pdf
- Somente permitido quando status = FINAL.

### Imprimir (Ctrl+P)
- Continua disponivel.
- Menos previsivel que PDF.

Prioridade de uma pagina:
- A tabela tenta permanecer em uma pagina.
- Se exceder, quebra entre linhas.
- O preview ajuda a antecipar essas quebras.

Comportamento esperado vs excecao:
- Esperado: exportar PDF apos revisar em preview.
- Excecao: imprimir diretamente para rascunhos rapidos.

## 10. i18n e idiomas
- Idioma global unico (pt-BR, en, es).
- Troca imediata sem reload.
- UI e estrutura do documento sao traduzidas.
- Conteudo do usuario NAO e traduzido.
- Preview e PDF respeitam o idioma ativo.

O que e traduzido:
- Labels, titulos, cabecalhos e mensagens do sistema.

O que nao e traduzido:
- Campos de texto do usuario.
- Conteudos importados via IA (ja chegam no idioma de origem).

Impacto:
- Mudanca de idioma afeta a interface e o template.
- Dados do usuario permanecem identicos.
