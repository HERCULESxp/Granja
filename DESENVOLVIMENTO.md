# Produção e testes

- Produção: https://herculesxp.github.io/Granja/ — arquivos da branch `main`.
- Testes: https://herculesxp.github.io/Granja/dev/ — arquivos da branch `desenvolvimento`.

O link de testes só existirá após a configuração e o primeiro deploy. O GitHub Pages tem uma fonte de publicação por repositório. O workflow na branch desenvolvimento monta um único site com as duas versões; a raiz vem sempre da main. A fonte do Pages precisa ser **GitHub Actions** para uma publicação não sobrescrever a outra.

## Configuração inicial

1. Aplicar na main somente o commit da branch `fix/cache-isolation`, que altera o service worker. Ele impede apagar caches de outras versões e evita servir o app principal no caminho de testes.
2. Enviar a branch `desenvolvimento` ao GitHub.
3. Em Settings → Pages → Build and deployment, selecionar **GitHub Actions**.
4. Em Settings → Environments → github-pages, permitir deployments da branch `desenvolvimento` e da main, se houver restrição de branches.
5. Fazer um push em desenvolvimento para iniciar o workflow. Para reexecutar sem mudar código: `git commit --allow-empty -m "deploy: atualizar produção e testes" && git push origin desenvolvimento`.
6. Antes de testar, abrir o app principal online, fechar suas abas/janelas PWA e abri-lo novamente para que o novo service worker assuma. Clientes com a versão antiga do worker ainda podem apagar caches até receberem a correção. O armazenamento de registros não é apagado por essa atualização.

Não executar a publicação antes da correção mínima da main: o workflow verifica esse pré-requisito.

## Isolamento

Os dois links compartilham a origem GitHub Pages, mas cada service worker usa seu próprio escopo e prefixo de cache. A produção não intercepta `/Granja/dev/`. Nenhum dos workers novos apaga caches de outros escopos.

- Produção mantém a chave existente `granja_caixa_v1`.
- Desenvolvimento usa `granja_caixa_dev_v1` e começa vazio.
- Backups e a cópia anterior à importação têm chaves separadas por ambiente.
- O manifesto do deploy dá nome e identidade próprios ao PWA de testes.

Não há sincronização automática. Para testar com dados reais, exportar um backup da produção e importar uma cópia no desenvolvimento. Isso não altera a produção. A separação de armazenamento é lógica; não é uma barreira de segurança contra código malicioso, pois os links compartilham a mesma origem.

## Atualizações e merge

Pushes em desenvolvimento republicam as duas versões. Enquanto o workflow existir apenas nessa branch, após atualizar a main será preciso fazer um push em desenvolvimento para atualizar o site também. Após o merge do workflow na main, pushes em qualquer uma das duas branches disparam a publicação.

O workflow lê as duas branches em cada execução; preserve a branch desenvolvimento após o merge enquanto o preview for usado. Ao fazer merge das correções, a produção continuará usando sua chave original; os dados de teste não serão transferidos para ela.

## Verificação local

Executar `node --test tests/*.test.cjs` para testar regras e isolamento do service worker. Os testes de navegador usam Playwright disponível no ambiente e Chromium do sistema: `node tests/browser.cjs`. Eles executam um servidor temporário local e usam somente dados fictícios.

## Relatório mensal e PDF

A aba Relatórios mostra produção, vendidos, ovos quebrados, consumo próprio, faturamento, gastos, lucro e estoque atual. Quebras e consumo respeitam o mês selecionado; o estoque atual continua considerando todo o histórico.

O botão Exportar PDF baixa um documento A4 com cabeçalho, período, data/hora de emissão do dispositivo, cartões, indicadores, categorias de gastos, total e páginas numeradas. O arquivo é gerado localmente e funciona offline após atualizar o app. A produção só recebe o gerador após o merge na main.

Verificação adicional: `node tests/report-browser.cjs` testa o download no Chromium, o relatório no tamanho de tela de celular e o funcionamento offline. Os PDFs salvos por esse teste contêm somente dados fictícios.
