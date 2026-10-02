# Plano de evolução do site — v2 (duas faces: Aeronáutica e TI/Dados)

Documento de continuidade. Quem retomar o trabalho numa nova conversa deve ler este arquivo primeiro,
junto com o `index.html` atual do repositório.

Última atualização: outubro de 2026 (Fases 2 e 3 concluídas).

---

## 1. Contexto

Igor Augusto de Melo, estudante de Engenharia Aeronáutica na EESC-USP (formatura prevista para 12/2027),
está em transição de carreira. Continua candidato a vagas de engenharia aeroespacial e passa a buscar
vagas de **TI e dados** (analista, engenheiro ou cientista de dados; qualquer cargo de entrada).
Cibersegurança permanece como interesse de estudo, não como trilha prioritária.

O site de portfólio existe, está publicado no GitHub Pages em três línguas e hoje atende só à face
aeronáutica. O objetivo da v2 é atender às duas trilhas sem que uma enfraqueça a outra.

### Avaliação honesta do ponto de partida (para o Igor, não para o site)

Evidência real disponível hoje para a face de TI e dados:

- **Bot de triagem de e-mails (projeto próprio, em produção).** Pipeline em Python que classifica
  e-mails de duas contas Gmail (pessoal e institucional) via IMAP/OAuth2, usa a API do Claude para a
  análise, gera resumos diários e semanais com prazos em ordem cronológica e ações sugeridas, e
  entrega por um bot do Telegram que também aceita comandos. Arquitetura híbrida: formatação
  determinística em Python, LLM só na análise estratégica, para reduzir o consumo de tokens. Em
  migração para VPS na Oracle Cloud, com cron, deploy por Git e autenticação SSH.
  **É a peça mais forte da face TI.** Cobre Python, integração de API, LLM, OAuth2, Linux, nuvem,
  agendamento, deploy e decisão de arquitetura com justificativa de custo.
- **Pilea Labs (dez. 2024 – mar. 2025), experiência profissional formal.** A Pilea é uma plataforma
  de gestão e otimização de marketing de influência e afiliados para e-commerce. O trabalho do Igor
  foi a **camada de dados**: modelar e gerar, em MySQL no Google Cloud, as bases e consultas que
  alimentavam as listas, tabelas e gráficos exibidos nas interfaces da plataforma, com Python e Git
  no fluxo. Cruzava vendas atribuídas aos cupons de cada influenciador com métricas de rede social
  (visualizações, comentários). Escala: dezenas de influenciadores, dezenas de cupons, milhares de
  pedidos de e-commerce e cerca de 15 ideias de indicadores levantadas para virar painel. As consultas
  rodavam a cada carregamento, ou seja, os painéis refletiam o estado atual do banco, e havia entrega
  nova praticamente todo dia ao longo dos quatro meses.
- **Cursos do grupo Data ICMC-USP (2025), dois.** Machine Learning
  (`github.com/icmc-data/Curso-de-Machine-Learning-2025`, com aulas, materiais e projetos) e
  Aprendizado por Reforço (`github.com/icmc-data/Curso-RL-2025`, nove aulas). Material público, o que
  permite descrever o conteúdo com precisão no site e no CV.
- **Computação científica vinda da engenharia:** Monte Carlo, algoritmos genéticos, redes neurais,
  otimização, LES em HPC, Fortran, MATLAB, Bash, Linux.

O que falta, sem rodeios:

- **Nada público no GitHub.** Usuário `igor-de-melo`, zero repositórios visíveis. Hoje um recrutador
  de dados não tem uma linha de código sua para olhar. É o maior gargalo, maior que certificado.
- **Nenhum certificado de TI concluído.** Só planejado.
- **Nenhum projeto de análise de dados publicado**, embora seja exatamente o que você fez na Pilea.
- **Cibersegurança:** sem certificado, laboratório ou writeup. Fora do escopo desta versão do site.

Consequência prática: a Fase 4 (publicar evidência) vale mais que qualquer melhoria visual. O bom é
que dois dos três projetos já existem e só precisam ser empacotados.

---

## 2. Decisão de arquitetura

Duas páginas, uma base de código, três idiomas em cada:

```
/                 index.html          porta de entrada: as duas áreas em destaque
/aero/            aero/index.html     face Aeronáutica
/ti/              ti/index.html       face TI e Dados
/assets/style.css                     CSS compartilhado
/assets/site.js                       simulações, seletor de idioma, seletor de perfil
/assets/fonts/                        fontes locais
cv-igor-de-melo.pdf                   CV aeronáutico
cv-igor-de-melo-ti.pdf                CV de TI e dados
```

A raiz é uma porta de entrada curta, com nome, uma linha de identidade e os dois caminhos lado a lado.
Não é uma tela de abertura vazia: quem cair ali já entende quem é o Igor antes de escolher. Quem
recebe um link de candidatura vai direto para `/aero/` ou `/ti/` e nunca passa pela escolha.

Motivos:

- **Link certo para cada candidatura.** Manda-se `.../aero/` para a Embraer e `.../ti/` para uma vaga de dados.
- **Prévia de link e SEO por página.** Cada face tem título, descrição e imagem próprios.
- **Nada escondido.** Um seletor discreto no topo ("Aeronáutica | TI e Dados") liga as duas. A
  transição deixa de parecer indecisão e passa a parecer amplitude, desde que cada página seja
  coerente sozinha.
- **Manutenção baixa.** CSS e JS compartilhados; só o conteúdo difere.

Alternativa descartada: página única com filtro de conteúdo. Pior para manter, para SEO e para a
prévia do link.

---

## 3. Fases

Cada fase é independente e cabe numa conversa. A ordem é a recomendada.

### Fase 0 — Fechar pendências da v1 `[pendente]`

- Substituir o `index.html` do repositório pela versão trilíngue mais recente, renomear o CV para
  `cv-igor-de-melo.pdf` e apagar o PDF antigo, tudo num commit só.
- Confirmar a data do Certificado de Estudos Especiais em CFD do ICMC (está como "2023 – atual";
  a pesquisa FAPESP terminou em dez. 2024).
- Corrigir no CV: "Curso de Machine Learning" → duas linhas, "Curso de Machine Learning, Data ICMC-USP
  (2025)" e "Curso de Aprendizado por Reforço, Data ICMC-USP (2025)".
- Manter a seção de cursos e certificados no CV, separada de Formação, com nome, instituição e ano;
  sem carga horária quando for curta. Cortar os genéricos quando a página ficar apertada: o que
  sustenta a candidatura é projeto, não certificado.
- Adicionar o link do site em `dados-candidatura.md` e no LinkedIn.
- Corrigir no LinkedIn: papel no SEMEAR ("mentor" → gerente de projeto) e e-mail, para bater com o CV.

**Aceite:** o botão de download funciona no site publicado e as três línguas abrem sem erro.

### Fase 1 — Inventário `[concluída]`

Respostas registradas na seção 1. O posicionamento da Pilea no site e no CV é **engenharia de dados**,
não front-end: o entregável do Igor era a base e a consulta que alimentavam os painéis. Números
citáveis: dezenas de influenciadores, dezenas de cupons, milhares de pedidos, ~15 indicadores
levantados. Nada de faturamento ou dado de cliente.

### Fase 2 — Refatoração técnica `[concluída]`

Preparar a base para duas páginas, sem mudar o conteúdo visível:

- Separar CSS e JS do `index.html` para `assets/`.
- Criar `ti/index.html` com a mesma estrutura e conteúdo de rascunho.
- Seletor de perfil no cabeçalho, ao lado do seletor de idioma, preservando o idioma ao trocar de face.
- Fontes servidas localmente, em vez do Google Fonts.
- Favicon, `og:image`, `og:locale` e `hreflang` por idioma e por página.
- `sitemap.xml` e `robots.txt`.

**Aceite:** as duas páginas carregam sem rede externa, Lighthouse acima de 95 em desempenho e
acessibilidade, e a troca de perfil mantém o idioma.

### Fase 3 — Conteúdo da face TI e Dados `[concluída]`
Entregue: porta de entrada com nome, contato e dois cartões (Aeronáutica; TI e Dados com link secundário
para Cibersegurança); `/ti/` completa e trilíngue com agente de Q-learning num labirinto como abertura
(`assets/maze.js`, validado por `tests/check-maze.mjs`); `/cyber/` com espaços reservados
(estudos, certificados, laboratórios e projetos), `noindex` e fora do sitemap até ter conteúdo; as três
faces ligadas pelo seletor do cabeçalho. URL real do site: `https://igor-de-melo.github.io/`.
Texto original da fase, mantido como referência:

- **Abertura:** visual próprio no lugar do aerofólio, calculado ao vivo, como o atual. Candidatos:
  agrupamento (k-médias) convergindo sobre pontos, regressão se ajustando a dados, grafo dirigido por
  forças, ou um agente de RL resolvendo um ambiente simples (amarra com o curso do Data ICMC).
- **Sobre:** a transição em três linhas, ancorada no que é verdade — formação quantitativa pesada,
  computação científica, dados em produção na Pilea Labs e automação própria rodando em nuvem.
- **Experiência:** Pilea Labs em primeiro plano, com o detalhamento da Fase 1. Depois, os projetos de
  engenharia relidos pelo lado computacional (Monte Carlo, HPC, Fortran, otimização, redes neurais).
- **Projetos:** os da Fase 4, cada um com link para o repositório.
- **Competências:** linguagens, dados, nuvem e ferramentas. Sem seção de segurança enquanto não
  houver o que mostrar.
- **Formação e certificados:** graduação, curso de RL, certificados conforme forem saindo.
- Tudo em PT, EN e FR, no mesmo padrão da face aeronáutica.

**Porta de entrada (`/`):** nome e contato no topo; abaixo, dois cartões de seleção, um para
Engenharia Aeronáutica e outro para Computação, TI, dados e segurança. Design simples e agradável:
mesma paleta e tipografia do resto do site, cada cartão com título, uma linha do que há dentro e três
ou quatro palavras-chave; área clicável inteira, estado de foco visível pelo teclado, empilhados no
celular. Nas três línguas, com o seletor de idioma também nesta página. Sem redirecionamento
automático, para não atrapalhar quem chega pela busca.

**Aceite:** um recrutador de dados entende em 30 segundos o que o Igor sabe fazer, e a porta de
entrada leva a qualquer uma das faces em um clique.

### Fase 4 — Publicar evidência `[pendente — a mais importante, pode começar já]`

Ordem por retorno sobre esforço:

**Como fica no site até os repositórios existirem:** os cards dos projetos entram com título,
contexto, o que foi construído, decisões de arquitetura e ferramentas, sem link. O botão do
repositório aparece depois, sem mexer no resto do conteúdo. Vale para o bot de e-mails e para o motor
de busca e classificação de vagas.

1. **Bot de triagem de e-mails.** Já existe; falta empacotar. README em inglês com o problema,
   diagrama da arquitetura, decisões (por que híbrido determinístico + LLM, efeito no custo de
   tokens), instruções de execução, `.env.example` e dados de exemplo anonimizados. Zero credenciais
   e zero conteúdo real de e-mail, inclusive no histórico do Git. Imagem de um resumo gerado, com
   dados fictícios.
2. **Projeto de análise de dados.** Um notebook do começo ao fim: pergunta, dados, limpeza, análise,
   gráficos, conclusão. Duas opções boas: dados de voo do VANT ou trajetórias Monte Carlo dos
   foguetes (liga as duas faces e é o argumento direto da transição), ou um conjunto público de
   e-commerce e marketing, que mapeia direto no que você fez na Pilea e no que a vaga costuma pedir.
3. **Agente de aprendizado por reforço.** Aproveita o curso do Data ICMC: um ambiente, um agente,
   curva de aprendizado e um GIF do resultado. Barato de produzir e vistoso.
4. **Pipeline de candidaturas.** Só em versão higienizada e sem dados pessoais. Ver a ressalva na
   seção 4.

**Aceite:** cada repositório tem README em inglês, instrução de execução e um resultado visível
(gráfico, tabela ou relatório). Perfil do GitHub com foto, bio e repositórios fixados.

### Fase 5 — CV de TI e dados `[pendente]`

CV separado, `cv-igor-de-melo-ti.pdf`, uma página, na mesma identidade visual do site. Ordem sugerida:
resumo, competências técnicas, experiência (Pilea Labs primeiro), projetos com link, formação, cursos,
idiomas. A engenharia aeronáutica entra como formação quantitativa e como origem dos projetos
computacionais, não como centro do documento.

### Fase 6 — Certificações `[pendente]`

Definir dois ou três alvos realistas até a formatura, na trilha de dados e nuvem. Entram no site só
quando concluídos. A escolha depende do tipo de vaga que aparecer com mais frequência nas buscas.

### Fase 7 — Imagens e prévia de link `[pendente]`

- Fotos reais dos projetos aeronáuticos (foguete, bancada, VANT) e imagens de resultado de CFD.
- Capturas dos projetos de dados.
- `og:image` por face, para o link renderizar bem no LinkedIn e no WhatsApp.
- Imagens otimizadas (WebP, tamanhos responsivos, `loading="lazy"`).

### Fase 8 — Páginas de projeto `[opcional]`

Uma página por projeto, com contexto, método, resultado e o papel do Igor. Só depois das Fases 4 e 7.

### Fase 9 — Manutenção `[contínuo]`

- Checklist de atualização a cada semestre.
- Dois CVs versionados, com nome de arquivo fixo para não quebrar links.
- Revisão de ortografia e coesão nas três línguas a cada mudança de conteúdo.

---

## 4. Decisões pendentes

1. ~~Qual face abre na raiz~~ **decidido:** a raiz é uma porta de entrada com as duas áreas, e o
   visitante escolhe. O link ainda não foi enviado a ninguém, então não há URL antiga a preservar.
2. ~~Publicar o pipeline de candidaturas~~ **decidido:** por ora só o espaço no site, com a descrição
   do motor de busca e classificação, sem link. Quando for publicado, publicar higienizado: só o motor
   de coleta, deduplicação e pontuação, com critérios genéricos e dados de exemplo, sem CV, sem cartas
   e sem a planilha. Mesma regra para o bot de e-mails, que entra descrito e ganha o link depois.
3. Detalhes da Pilea Labs listados na Fase 1.
4. Existem fotos dos projetos aeronáuticos?

---

## 5. Convenções técnicas do site (não quebrar)

- **Trilíngue por atributo:** cada trecho existe três vezes, em elementos com `lang="pt-BR"`,
  `lang="en"` e `lang="fr"`. O CSS esconde os que não correspondem ao `lang` do `<html>`:
  `html:not([lang="pt-BR"]) [lang="pt-BR"], ...{display:none!important}`.
- **Troca de idioma:** botões PT/EN/FR no cabeçalho; parâmetros `?lang=en` e `?lang=fr`; o JS troca
  `document.documentElement.lang`, o `<title>`, o `aria-label` do canvas e o formato numérico
  (vírgula em PT e FR, ponto em EN).
- **Paridade:** ao editar conteúdo, editar as três línguas na mesma passada. Existe um script que
  compara a contagem de elementos por idioma em cada elemento pai.
- **Simulação da abertura (face aeronáutica):** escoamento potencial em torno de um aerofólio de
  Joukowski com condição de Kutta, calculado em tempo real. Parâmetros: `MU = (-0.09, 0.07)`,
  `R = |1 - MU|`, `BETA = atan2(MU_y, 1 - MU_x)`, `Γ = 4πUR·sin(α+β)`, `C_L = 8πR·sin(α+β)/corda`.
  Respeita `prefers-reduced-motion` (linhas de corrente estáticas) e pausa fora da tela.
- **Paleta:** fundo `#E9EDF0`, tinta `#16233A`, sucção `#2F45B5`, estagnação `#B0232F`,
  neutro `#8792A2`, régua `#C5CDD6`. As cores da simulação são o mapa de Cp e têm significado.
- **Tipografia:** Archivo (display, largura expandida no nome) e Source Serif 4 (texto).
- **CV:** link fixo `cv-igor-de-melo.pdf` com `download="Igor_de_Melo_CV.pdf"`, para trocar o PDF sem
  mexer no HTML. A face TI usará `cv-igor-de-melo-ti.pdf` no mesmo padrão.
- **Inglês:** grafia britânica, igual à do CV (optimisation, modelling, programme).
- **Francês:** espaço inseparável antes de dois-pontos, apóstrofo tipográfico.
- **Hospedagem:** GitHub Pages, caminhos relativos. Confirmar o nome real do repositório, que precisa
  ser `<usuário>.github.io` para o site ficar na raiz.

---

## 6. Dados fixos

- Nome: Igor Augusto de Melo. E-mail: `igor_amelo@usp.br`. São Carlos, SP.
- LinkedIn: `linkedin.com/in/igorademelo`. GitHub: `github.com/igor-de-melo`.
- Idiomas: português nativo, inglês avançado, francês avançado, alemão básico.
- Formatura prevista: dez. 2027.

---

## 7. Como retomar numa nova conversa

1. Enviar este plano e o `index.html` atual do repositório.
2. Dizer em que fase o trabalho está e o que mudou desde a última vez.
3. Pedir a fase seguinte. Uma fase por conversa evita arquivos gigantes e retrabalho.
4. Ao terminar, atualizar a marcação de estado das fases neste arquivo.

**Onde trabalhar cada coisa.** A partir da Fase 2 o trabalho vira multiarquivo e ligado ao
repositório, então o Claude Code no computador do Igor é o lugar natural: ele edita, roda e faz o
commit sem vaivém de arquivos. Vale manter este plano dentro do repositório, como `PLANO.md`, para o
Claude Code lê-lo a cada sessão. A escrita de conteúdo nas três línguas e o julgamento visual rendem
mais numa conversa com projeto de candidaturas carregado, onde o CV, o LinkedIn e o histórico estão
disponíveis e é possível abrir a página num navegador sem instalar nada.

Regras que valem sempre: não inventar informação sobre o Igor; perguntar quando faltar dado; manter as
três línguas em paridade; avaliar vagas com honestidade e escrever cartas sem apontar lacunas.

---

## 6. Revisão de estrutura (out. 2026) — executar por pacotes

Decisões do Igor:
- Inglês americano em todo o site (CV e demais materiais ele ajusta depois).
- Conteúdo baseado na formação e trajetória; o CV será adaptado por caso depois.
- Cibersegurança tem página própria e cartão próprio na Home (três cartões: Aero, TI e Dados, Cibersegurança).
- Nome da área no site: "Cibersegurança" / "Cybersecurity" / "Cybersécurité" (nunca só "Cyber").
- Botão "Início / Home / Accueil" no seletor de páginas, além do nome.
- Design (cores, posição, animações, efeitos) fica para depois; a arquitetura já está pronta.
- Texto para ATS/IA de recrutamento (palavras-chave padrão) e direto para humanos.
- Simulações: várias por página, escolhidas por abas (uma visível por vez), nunca lado a lado.

Termos: "Home" = página inicial (/). "Abertura" (hero) = bloco do topo de cada página: nome,
cargo-alvo, resumo, contatos e simulação.

Esqueleto comum das três páginas:
Abertura → Sobre → Experiência → Projetos → Formação → Competências → Contato.
Específico de cada área: Aero tem "Pesquisa" como seção própria (entre Projetos e Formação);
Cibersegurança tem "Estudos e laboratórios" (entre Experiência e Projetos) e certificados dentro de Formação.

Pacotes:
- P1 Estrutura `[concluído]`: esqueleto comum, botão Início, três cartões na Home, inglês americano
  (`tools/to-american.py`), `body[data-area]` com token `--accent` por área, cabeçalho em duas linhas,
  seletor de simulações (`assets/sims.js`, painéis `.sim-panel` dentro de `[data-sims]`).
- P2 Texto e palavras-chave `[concluído]`: cargo-alvo na abertura de cada página, resumo com termos
  padrão de vaga, Competências agrupadas por termos de mercado, JSON-LD `Person` com `knowsAbout`,
  meta descriptions por idioma.
- P3 Simulação de Cibersegurança: propagação de malware numa rede (modelo SIR) com defensor isolando nós.
- P4 Melhorias aprovadas: B, C, E, G, H (lista abaixo).
- P5 Design visual (fase separada).

## 7. Melhorias aprovadas (P4)

- B. Caixa "Como funciona" sob cada simulação, com a equação ou o algoritmo em 4 a 5 linhas.
- C. Projetos em cartões Problema / Abordagem / Resultado / Stack.
- E. Botão de CV por área (depende da Fase 5).
- G. Pontes entre áreas ("a modelagem do CFD reaparece na análise de dados").
- H. og:image por área (Fase 7).
Recusadas: A (linha de disponibilidade), D (faixa de números), F (folha de impressão).
