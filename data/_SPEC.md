# Especificação de conteúdo (todos os módulos seguem isto)

Contexto: **Concurso PMPE (Polícia Militar de Pernambuco) – Soldado (Praça PM, QPMG, cód. 201)**, edital de 29/09/2026, banca **Instituto AOCP**. Prova objetiva + redação em **28/02/2027** (5 horas). Hoje é 03/10/2026.
O texto integral do edital está em `C:\Users\gridw\Downloads\out\raw.txt` (pdftotext -raw, codificação latin1/ISO-8859-1; o edital do Soldado é a primeira metade, linhas ~1–3070; o Anexo II com os conteúdos do Soldado começa na linha ~3074). Leia o trecho que lhe interessa com `iconv -f latin1 -t utf-8`.

Candidato: concurseiro, forte em lógica e em redação, **fraco em Português puro e em matemática**. Quer ver, ao errar, **o passo a passo de como se resolve**.

## Prova objetiva (60 questões, 1 ponto cada, 5 alternativas A–E, uma correta)
- Bloco I: Língua Portuguesa (10) + História de Pernambuco (10)
- Bloco II: Raciocínio Lógico (10) + Informática (10)
- Bloco III: Direito Constitucional (10) + Direitos Humanos e Legislação Extravagante (10)
- Mínimo: 30% em cada bloco (6 de 20), não zerar nenhuma área, 30% do total (18 de 60). Mais **Redação** (dissertação, 40 pts, 15 a 20 linhas, mínimo 12 pts), corrigida só para os melhores classificados na objetiva. Nota final = objetiva + redação (máx. 100).
- Depois: exames médicos, TAF (2 dias), avaliação psicológica, investigação social, curso de formação.

## Formato: UM arquivo JSON por módulo (ou vários com o mesmo `id`) em `data/modules/`

```json
{
  "id": "slug-do-modulo",
  "titulo": "Título do módulo",
  "disciplina": "portugues | historia | raciocinio | informatica | constitucional | dh | redacao | fisico",
  "descricao": "1-2 frases: o que cobre e como a AOCP costuma cobrar",
  "topicos": [
    {
      "id": "slug-unico-global (prefixe com o id do módulo)",
      "titulo": "Nome do tópico (use a numeração/nome do edital quando existir)",
      "prioridade": 1,
      "horas": 3,
      "resumo_md": "Resumo COMPLETO em Markdown (mín. 250 palavras por tópico relevante; tabelas, listas, fórmulas, comparações). Deve bastar para acertar questões da prova, escrito para quem é iniciante. ## subtítulos, **negrito** nos termos-chave, tabelas | markdown | para comparar.",
      "dicas": ["dicas curtas de memorização/prova"],
      "pegadinhas": ["pegadinhas típicas da AOCP (afirmação falsa que parece certa)"],
      "flashcards": [ {"q": "pergunta curta", "a": "resposta curta"} ]
    }
  ],
  "questoes": [
    {
      "id": "slug-q01",
      "topico": "id do tópico",
      "dificuldade": 1,
      "enunciado": "texto no estilo AOCP (inclui 'Assinale a alternativa INCORRETA', 'Considerando o disposto na Lei..., é correto afirmar que', itens I, II, III com combinações, etc.)",
      "alternativas": {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."},
      "gabarito": "C",
      "explicacao": "por que a certa está certa E por que cada errada está errada (curto)",
      "resolucao_md": "PASSO A PASSO DIDÁTICO (veja abaixo)"
    }
  ]
}
```

- `prioridade`: 1 = cai muito / essencial; 2 = importante; 3 = baixa. `horas` = tempo realista para um iniciante dominar o tópico.
- **Todas as questões novas têm 5 alternativas (A–E)**. Distribua o gabarito de forma equilibrada entre A, B, C, D e E.
- Mínimos: **todos os itens do edital do seu escopo cobertos**, ≥ 8 flashcards por tópico, ≥ 4 pegadinhas por tópico importante, ≥ 6 questões por tópico de prioridade 1 e ≥ 3 por tópico de prioridade 2.
- **`resolucao_md`** (obrigatório em toda questão que envolva cálculo, procedimento, aplicação de regra, interpretação de texto, ou que mereça ensino — na prática, na maioria): Markdown com **O que a questão pede**; **Conceito/Regra rápida** (explicada do zero); **Passo a passo** numerado (contas em bloco de código, tabelas quando couber, mostrando CADA passo e a conferência); **Pegadinha** (se houver); **Macete** de 1 linha. Professor paciente. Confira todas as contas duas vezes. Questões de pura memorização trivial podem ficar sem.
- Questões 100% ORIGINAIS (não copie provas nem textos protegidos), estilo de concurso da AOCP, alternativas plausíveis.
- Escreva em português do Brasil. Seja exato: leis, artigos, siglas, números, prazos. Em legislação com redação alterada recentemente ou fato posterior a 2025, marque **[VERIFICAR]** no texto. Nunca invente número de artigo, lei ou súmula.
- JSON válido (aspas escapadas, `\n` nas quebras). **Grave em lotes** (vários arquivos `<id>-parte2.json` etc., mesmo `id`; o app junta) para não perder trabalho se algo falhar. VALIDE cada arquivo com: `node -e "JSON.parse(require('fs').readFileSync('data/modules/<arquivo>.json','utf8'));console.log('ok')"` no diretório do projeto e corrija até dar ok.
- Escreva com a ferramenta Write em `C:\Users\gridw\OneDrive\Desktop\code\estudo-pmpe\data\modules\`. Não mexa em nenhum outro arquivo do projeto. Ids de tópico e de questão devem ser **únicos globalmente** (prefixe com o id do módulo).
- Ao terminar, responda só com: arquivos criados, nº de tópicos, nº de questões, nº de questões com resolucao_md e pontos marcados [VERIFICAR].
