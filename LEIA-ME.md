# Estudos PMPE 2027 - Soldado (Praca PM, QPMG, cod. 201)

## Como abrir
Dois cliques em `iniciar.bat` (abre http://localhost:3000). Precisa do Node.js. Ou, na pasta: `node server.js`.
O progresso fica em `data/progress.json`.

## O que tem
Painel, Plano de estudos ate 27/02/2027, Escopo (181 topicos), Flashcards com revisao espacada, 826 questoes (A-E) com passo a passo, Simulados (60 questoes, 5h, minimos do edital), Caderno de erros e duvidas, Redacao (15-20 linhas), Treino fisico do TAF (plano de 42 semanas e registro dos testes), e paginas do edital, classificacao/desempate, exames medicos, avaliacao psicologica, investigacao social e curso de formacao.

## Importante
- Conteudo escrito por IA: confira os trechos marcados [VERIFICAR] nas fontes oficiais.
- O Estatuto dos Policiais Militares de PE (Lei 6.783/1974) precisa ser lido no texto oficial.
- Confira retificacoes do edital no site do Instituto AOCP.

## Versão online (GitHub Pages)
O site estático fica na pasta `docs/`. Para atualizar depois de mudar conteúdo: `node build-static.js`, depois `git add -A`, `git commit` e `git push`.
No site, o progresso de cada pessoa fica salvo só no navegador dela (localStorage). Abrir em outro aparelho ou navegador começa do zero.
