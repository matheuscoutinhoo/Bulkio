# Modelo corporal do dashboard

`muscle-body.glb` é uma malha humana local de 474 KiB, com 26.756 triângulos,
normais suaves e materiais nomeados pelos grupos musculares da API. Não usa
texturas, CDN, serviços externos ou downloads em tempo de execução fora da
origem da aplicação.

Fonte: [MakeHuman Community](https://github.com/makehumancommunity/makehuman),
revisão `a8bc2d54ff0ac92e78ff71431b1023eda42bf482`.

Assets gráficos utilizados:

- `makehuman/data/3dobjs/base.obj`
- `makehuman/data/targets/macrodetails/caucasian-male-young.target`
- `makehuman/data/targets/macrodetails/universal-male-young-maxmuscle-averageweight.target`

Os assets gráficos são [CC0 1.0](https://github.com/makehumancommunity/makehuman/blob/a8bc2d54ff0ac92e78ff71431b1023eda42bf482/LICENSE.md).
O texto da licença está em `LICENSE-CC0.txt`. Nenhum código do MakeHuman é usado.

O script próprio `scripts/build-muscle-model.mjs` aplica os ajustes de proporção,
remove os helpers da malha, normaliza a altura para duas unidades e identifica
regiões esquemáticas na superfície. As regiões não representam anatomia clínica
nem estimam ativação de músculos secundários. Pernas correspondem às coxas;
glúteos e panturrilhas têm seus próprios grupos. Cabeça, mãos, pés e articulações
sem grupo ficam neutros. Cardio e Full Body não são regiões anatômicas.

Para regenerar, execute na raiz (requer as dependências do frontend e acesso à
rede no primeiro uso):

```sh
node scripts/build-muscle-model.mjs
```

O cache padrão é `.tmp/muscle-model`; um caminho alternativo pode ser passado
como primeiro argumento. O GLB e a licença são versionados; o build normal da
aplicação não executa este script nem depende da disponibilidade do GitHub.

As fronteiras são classificadas por triângulo. A região de panturrilha usa
também a orientação da superfície para não selecionar a canela. O toque usa
somente o triângulo visível mais próximo; regiões neutras bloqueiam seleções
através do corpo. Movimentos de rotação, rolagem e multitoque não selecionam grupos.
