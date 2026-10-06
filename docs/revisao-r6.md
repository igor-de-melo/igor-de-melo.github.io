# Revisão de texto e tipografia (pacote R6)

Feita em 6 out. 2026 sobre o `main` publicado (commit `4c20ecb`). Medição automática de todas as fontes visíveis das
4 páginas em 1280 e 375 px, mais revisão do texto em PT, EN e FR. Regras do `CLAUDE.md` continuam valendo
(três línguas juntas, nunca inventar fato, inglês americano, francês com espaço inseparável).

Legenda: **✔** aplicar · **?** depende de resposta do Igor (seção 4) · os demais itens são opcionais só onde dito.

---

## 1. Tipografia: escala única

### 1.1 Problemas medidos
- **Muitos degraus de tamanho pequeno**: 12 · 12,5 · 13 · 13,5 · 14 · 14,5 px convivem como texto secundário.
- **Títulos de área diferentes**: h1 58,9 px (Aero), 46 (Dados), 42 (TI e Ciber); no celular 28, 32 e 23 px (o de TI e Ciber fica menor que o do Aero e quase igual ao h2).
- **Títulos de item (h3) com quatro tamanhos só em Aero**: 18 (Cursos), 20 (Experiência), 21 (Pesquisa), 24 (Projetos). Dados usa 21; TI e Ciber usa 14–14,5 (igual ao corpo, sem hierarquia).
- **Corpo**: Aero 17–18, Dados 17, TI e Ciber 14,5 (13 no celular, pequeno demais).
- **Código de Dados igual ao corpo** (17 = 17), contrariando a regra "código = corpo + 1 px".
- **Duas fontes monoespaçadas**: IBM Plex Mono (tabela da LASC, valores da simulação, rodapé) e JetBrains Mono (resto).
- **Home**: texto dos cartões 13,5 (Aero/Dados) e 12,5 (TI e Ciber); "Escolha por onde começar" 14; link "Pular para o conteúdo" 18.

### 1.2 Escala proposta (desktop / celular ≤ 760 px)
| Papel | Aero e Dados (serifa / Archivo) | TI e Ciber (mono) | Onde |
|---|---|---|---|
| `--fs-display` (h1 da área) | 56 / 34 | 46 / 28 | título da página |
| `--fs-h2` (seção) | 30 / 24 | 28 / 22 | Sobre, Experiência… |
| `--fs-h3` (item) | 21 / 19 | 17 / 16 (peso 700) | cargos, projetos, pesquisas, grupos, "Cursos e certificados" |
| `--fs-lead` | 19 / 17 | 16 / 15 | descrição da abertura e 1º parágrafo do Sobre |
| `--fs-body` | 17 / 16 | 15 / 14 | parágrafos, listas, saídas |
| `--fs-code` (Dados) | 18 / 17 (= corpo + 1) | — | `pre.cell-in` |
| prompt / título de painel | — | 17 / 16 (corpo + 2) · 16 / 15 (corpo + 1) | `p.pm` · `p.pn-t` |
| `--fs-ui` | 15 / 15 | 14 / 14 | barra, trilho, abas, botões, rótulos `dt`, "Contato:" |
| `--fs-small` | 13 / 13 | 13 / 13 | legendas, contadores, metadados, chips, valores da simulação, "Nesta página" |
| `--fs-xs` | 12 / 12 | 12 / 12 | só a linha © do rodapé |

- Home: hero mantém 64 / 40 (nome) e 21 / 18,5 (frase); título dos cartões 19 / 19 (TI e Ciber 17 mono); texto dos cartões 15 (TI e Ciber 14 mono); "Escolha por onde começar" 15; link "Pular para o conteúdo" 15.
- Alturas de linha: corpo 1,6 · lead 1,55 · código 1,55 · títulos 1,15 (h1) / 1,2 (h2, h3) · small 1,45.
- Pesos: títulos 700 (h1 do Aero 750 como hoje), UI 500/600, corpo 400; no máximo 3 pesos por página.
- **Uma só mono: JetBrains Mono.** Trocar IBM Plex Mono por JetBrains Mono e remover os dois arquivos `ibm-plex-mono-*.woff2`.
- Implementação: variáveis `--fs-*` e `--lh-*` no bloco de tokens (com sobrescrita por área e por media query), e nenhum `font-size` solto fora delas, exceto os do hero da Home e dos desenhos SVG.

---

## 2. Padrões de texto (aplicar no site todo) ✔

**Datas**
- PT `abr. 2025 – atual`; EN `Apr 2025 – present`; FR `avr. 2025 – aujourd’hui`. Meia-risca com espaços só em intervalos; mesmo ano: `fev. – jul. 2023`.
- Num intervalo, os dois extremos com mês ou nenhum (corrigir `2023 – dez. 2024`, ver 4.2).
- Em nomes compostos, sem espaços: `Kutta–Joukowski` (FR `Kutta-Joukowski`).

**Instituições**
- `EESC-USP` e `ICMC-USP` com hífen.
- "Grupo SEMEAR" no cargo, "grupo SEMEAR" no texto corrido (FR "groupe SEMEAR"; Home: "do grupo SEMEAR" / "SEMEAR’s" / "du groupe SEMEAR").
- Pilea Labs com descrição única: PT "plataforma de marketing de influência e afiliados para e-commerce", EN "influencer and affiliate marketing platform for e-commerce", FR "plateforme de marketing d’influence et d’affiliation pour l’e-commerce".
- EN: expandir na 1ª ocorrência de cada página `University of São Paulo (USP)` e `ICMC-USP (Institute of Mathematics and Computer Sciences)`.

**Diploma**
- EN `B.S. in Aeronautical Engineering`.
- FR `Cursus ingénieur en aéronautique (Bacharelado)` e `École d’ingénieurs de São Carlos (EESC), Université de São Paulo`.
- FR: usar sempre "cursus ingénieur" (também "cursus ingénieur généraliste").

**Objetivo e contato**
- Uma fórmula só para o objetivo: PT "estágio ou vaga júnior em …", EN "internships or junior roles in …", FR "un stage ou un poste junior en …".
- Frase do contato no padrão PT "Para estágio, vaga júnior ou projetos de pesquisa, escreva para:", EN "For internships, junior roles or research projects, reach me at:", FR "Pour un stage, un poste junior ou un projet de recherche, écrivez-moi :".
- Adaptar o fim da frase à área (TI e Ciber: "…ou projetos, …").

**Contadores**
- Experiência: PT "experiências", EN "roles", FR "expériences".
- Formação: PT "itens", EN "items", FR "éléments".
- Pesquisa: PT "linhas de pesquisa", EN "research projects", FR "axes de recherche".
- Projetos: PT "projetos", EN "projects", FR "projets".

**Rótulos e nomes**
- Problema / Abordagem / Resultado / Stack; EN Problem / Approach / Result / Stack; FR Problème / Approche / Résultat / Stack.
- "Stack" em maiúscula nas três línguas; em TI e Ciber fica `stack` minúsculo, como chave de terminal.
- Mesma subseção "Cursos e certificados" / "Courses and certificates" / "Cours et certificats" em Aero e Dados.
- Mesmo título para a mesma posição em todas as páginas: IRPHE "Pesquisa em modelagem atmosférica e energia eólica"; SEMEAR com "frentes" (não "equipes").
- Nível de competência: PT "(básico)", EN "(basic)", FR "(notions)".
- Termos: PT "on-line", "painéis" (não "dashboards"), "implantação" (não "deploy"), "aerofólio de Joukowski" em todo o texto, "e-mail"; EN "email" (sem hífen), "oxidizer"; FR "versionnage", "labs" e "challenges" na área de TI e Ciber, "code promo", "chemin" (labirinto).

**Tipografia de texto**
- FR: espaço inseparável antes de `: ; ! ?` e entre número e unidade (`1,7 Mo`), nomes de página e de módulos citados entre « ».
- EN sem contrações, bullets de experiência começando com verbo (passado para cargos encerrados).

**Metadados**
- As meta descriptions EN e FR da Home estão em português: traduzir.
  - EN "Portfolio of Igor Augusto de Melo: Aeronautical Engineering, Data Science, IT and Cybersecurity."
  - FR "Portfolio d’Igor Augusto de Melo : ingénierie aéronautique, science des données, informatique et cybersécurité."
- Conferir também as meta descriptions FR de Aero, Dados e TI e Ciber (falta espaço inseparável antes de « : »).

---

## 3. Correções por página ✔

### 3.1 Home
| Língua | Atual | Proposta |
|---|---|---|
| PT | ENGENHARIA AERONÁUTICA, EESC-USP / SÃO CARLOS, SP | manter, mas usar o mesmo separador nas páginas de área (hoje elas quebram linha): "Engenharia Aeronáutica, EESC-USP · São Carlos, SP" em todas |
| PT | Do VANT autônomo de asa fixa da SEMEAR | Do VANT autônomo de asa fixa do grupo SEMEAR |
| EN | Aeronautical Engineering student at USP. | Aeronautical Engineering student at the University of São Paulo (USP). |
| EN | three fronts of the same engineering chain | three links in one engineering chain |
| EN | In progress: only what I have actually completed. | Work in progress: I only list what I have actually completed. |
| FR | Choisissez par où commencer : | espaço inseparável antes de « : » |
| FR | Du drone autonome à voilure fixe de SEMEAR | Du drone autonome à voilure fixe du groupe SEMEAR |
| FR | En cours : uniquement ce que j’ai réellement terminé. | En construction : je n’y publie que ce que j’ai réellement terminé. |

### 3.2 Engenharia Aeronáutica
**PT**
| Atual | Proposta |
|---|---|
| leva um círculo deslocado do centro num perfil | transforma um círculo deslocado da origem num perfil |
| e recebe a cor de Cp = 1 − (V/U)² | e é colorida conforme Cp = 1 − (V/U)² |
| no campus 2 da USP São Carlos | no Campus 2 da USP em São Carlos |
| sustenta meu trabalho na página de Ciência de Dados | sustenta os trabalhos apresentados na página de Ciência de Dados |
| Também no subsistema de Aerodinâmica e Dinâmica de Voo: … | Também atuo no subsistema de Aerodinâmica e Dinâmica de Voo: … |
| Análise e manipulação de dados de e-commerce com SQL, com execução de consultas no Google Cloud. | Análise e manipulação de dados de e-commerce em SQL, com consultas executadas no Google Cloud. |
| Versionamento e automação de consultas com Git e GitHub. | Versionamento de código e consultas com Git e GitHub. (mesma frase em Dados e TI e Ciber) |
| suporte a dashboards on-line | suporte a painéis on-line |
| projeto de motor-foguete sólido | projeto de motor-foguete a propelente sólido |
| Resultado: Em andamento desde 2025. | Resultado: Em andamento. |
| Três títulos em três edições (tabela abaixo). + legenda "Três títulos em três edições" | manter o Resultado; legenda da tabela: "Resultados na LASC" |
| realizei simulações de CFD 2D e 3D para buscar o melhor desempenho aerodinâmico | realizei simulações de CFD 2D e 3D para otimizar o desempenho aerodinâmico |
| CFX | ANSYS CFX |
| Sistemas de controle (fundamentos) | Sistemas de controle (básico) |
| Engenharia de sistemas pelo NASA Systems Engineering Handbook | Engenharia de sistemas segundo o NASA Systems Engineering Handbook |
| Para vagas de estágio ou júnior e projetos de pesquisa, escreva para: | Para estágio, vaga júnior ou projetos de pesquisa, escreva para: |
| contador "3 etapas" | "3 itens" |
| Minicurso on-line … / "Cursos e certificados" | manter (já no padrão) |

**EN**
| Current | Proposed |
|---|---|
| with an exchange in the general engineering program at École Centrale de Marseille | including an exchange year in the general engineering program at École Centrale de Marseille |
| combines an Aeronautical Engineering degree at EESC-USP | combines undergraduate studies in Aeronautical Engineering at EESC-USP |
| on campus 2 of USP São Carlos | on Campus 2 of USP São Carlos |
| for a neutering, care and release program | for its spay/neuter, care and release program |
| underpins my work on the Data Science page | underpins the work shown on the Data Science page |
| using NASA systems engineering methodology / following NASA systems engineering methodology | using / following the NASA systems engineering methodology |
| Also in the Aerodynamics and Flight Dynamics subsystem: | Also contributing to the Aerodynamics and Flight Dynamics subsystem: |
| Oxidiser injection for a hybrid motor | Oxidizer injection for a hybrid motor |
| Team member / Team member, structures | Team Member / Team Member, structures |
| Endurance comes from optimizing the electric propulsion system. | Endurance is driven by optimizing the electric propulsion system. |
| reach their category apogee | reach their category’s target apogee |
| I worked in the propulsion and flight mechanics subsystems. | I worked on the propulsion and flight mechanics subsystems. |
| Three titles in three editions (table below). | First place in all three editions (table below). |
| 3 research lines | 3 research projects |
| 3 stages | 3 items |
| BSc in Aeronautical Engineering | B.S. in Aeronautical Engineering |
| Systems engineering following the NASA Systems Engineering Handbook | Systems engineering (NASA Systems Engineering Handbook) |
| For internships, junior roles or research projects, write to: | For internships, junior roles or research projects, reach me at: |

**FR**
| Actuel | Proposition |
|---|---|
| avec un échange académique dans le cursus ingénieur généraliste | dont un échange académique au sein du cursus ingénieur généraliste |
| dépression / surpression (légende Cp) | dépression / point d’arrêt |
| envoie un cercle décentré sur un profil avec épaisseur et cambrure | transforme un cercle décentré en un profil épais et cambré |
| un cursus d’ingénierie aéronautique à l’EESC-USP | un cursus ingénieur en aéronautique à l’EESC-USP |
| des études spécialisées en CFD à l’ICMC-USP | un certificat d’études spéciales en CFD à l’ICMC-USP |
| la logistique des sauvetages du programme de stérilisation | la logistique des sauvetages du programme de capture, stérilisation, soins et remise en liberté des chats du campus |
| sur la page Science des données | sur la page « Science des données » |
| Également dans le sous-système Aérodynamique et dynamique du vol | Également membre du sous-système aérodynamique et dynamique du vol |
| données e-commerce | données d’e-commerce |
| suivi de tableaux de bord en ligne | support aux tableaux de bord en ligne |
| et volent en sécurité | et volent en toute sécurité |
| Vainqueur (tableau LASC) | 1re place |
| les dossiers de fabrication de la coiffe | les dossiers de fabrication de l’ogive |
| une bourse de banc d’essai de l’Agence spatiale brésilienne (AEB) | un financement « Banc d’essai » de l’Agence spatiale brésilienne (AEB) |
| 1,7 Mo / 4,8 Mo | 1,7 Mo / 4,8 Mo com espaço inseparável |
| Cours de Machine Learning | Cours d’apprentissage automatique (machine learning) |
| modules Diagnostic de fonctionnement d’un système et Planification avancée | modules « Diagnostic de fonctionnement d’un système » et « Planification avancée » |
| (bases) | (notions) |
| 4 postes / 3 étapes | 4 expériences / 3 éléments |

### 3.3 Ciência de Dados
**PT**
| Atual | Proposta |
|---|---|
| Também desenvolvi um sistema próprio de triagem de e-mails com IA e trago da engenharia a prática de computação científica: … | Também desenvolvi um sistema próprio de triagem de e-mails com IA. Da engenharia, trago a prática de computação científica: … |
| …em análise, engenharia ou ciência de dados e em TI. | …em análise, engenharia ou ciência de dados, ou em TI. |
| Sobre §1 "Estou direcionando a carreira da engenharia aeronáutica para TI e dados." | "Minha transição para TI e dados parte de três bases: …" (não repetir a abertura) |
| Sobre §2 "Da engenharia, trago prática de computação científica" | manter só aqui; tirar a mesma ideia da abertura e do §4 |
| integração de APIs, incluindo modelos de linguagem | integração de APIs, incluindo as de modelos de linguagem |
| Os métodos quantitativos que uso com dados vêm da engenharia: simulação de trajetória, Monte Carlo e CFD estão na página… | Os projetos de engenharia de onde vêm esses métodos (simulação de trajetória, Monte Carlo, CFD) estão na página de Engenharia Aeronáutica. |
| O atalho pelas armadilhas é mais curto, e o agente aprende que não compensa. | O caminho pelas armadilhas é mais curto, mas o agente aprende que não compensa. |
| Recompensa: +1 na meta… | Recompensas: +1 na meta… |
| Rota aprendida – passos | Rota aprendida (passos) |
| Exploração ε-gulosa: com probabilidade ε o agente sorteia uma ação | …com probabilidade ε, o agente sorteia uma ação |
| quando a rota gulosa é a ótima segura por 15 episódios seguidos | quando a rota gulosa coincide com a rota ótima segura por 15 episódios seguidos |
| contador "6 posições" / "5 itens" | "6 experiências" / "5 itens" |
| Escala: … Levantamento de cerca de 15 ideias de indicadores para virar painel. | separar em dois itens; "Levantamento de cerca de 15 indicadores candidatos a painel." |
| com uma entrega nova quase todos os dias | com uma nova entrega quase todos os dias |
| com contato com abordagens de modelagem de turbulência | ver 4.3 (nível de envolvimento em LES) |
| análise de incerteza… e análise do desempenho de turbinas | …e avaliação do desempenho de turbinas |
| deploy por Git | implantação por Git |
| Item "[1]" no trilho (nome da seção de simulações) | dar nome: "Simulações" / "Simulations" / "Simulations" |
| "Cursos" | "Cursos e certificados" |

**EN**
| Current | Proposed |
|---|---|
| Aeronautical Engineering student at USP, moving my career toward IT and data. | Aeronautical Engineering student at the University of São Paulo (USP), transitioning into IT and data. |
| and I bring hands-on scientific computing from engineering: | and I bring hands-on scientific computing experience from engineering: |
| I am looking for internships and junior roles in data analysis, data engineering or data science, and in IT. | I am looking for internships and junior roles in data analysis, data engineering, data science or IT. |
| # e-mail, LinkedIn, GitHub | # email, LinkedIn, GitHub |
| From engineering, I bring hands-on scientific computing: | From engineering, I bring hands-on scientific computing experience: |
| trajectory simulation, Monte Carlo and CFD are on the Aeronautical Engineering page. | see trajectory simulation, Monte Carlo and CFD work on the Aeronautical Engineering page. |
| The shortcut through the traps is shorter, and the agent learns it does not pay off. | The path through the traps is shorter, but the agent learns it does not pay off. |
| Modeled and built, in MySQL on Google Cloud, the databases and queries that fed … | Designed and built the MySQL databases (on Google Cloud) and queries that powered the lists, tables and charts in the platform’s interface. |
| Drew up about 15 indicator ideas to turn into dashboards. | Proposed about 15 KPIs to be turned into dashboards. |
| Analyses that updated in real time from the database, with something new delivered almost every day. | Delivered analyses that updated in real time from the database, shipping something new almost every day. |
| Development and execution of numerical routines in HPC environments. | Developed and ran numerical routines in HPC environments. |
| and analysis of wind turbine performance | and assessment of wind turbine performance |
| without missing deadlines or pending actions | without missing deadlines or action items |
| with the Claude API (a language model), with IMAP and OAuth2 access | using the Claude API (a large language model), accessing mailboxes via IMAP with OAuth2 |
| Repository: to be published soon. / …, in a version without personal data. | Repository: coming soon. / Repository: coming soon, with personal data removed. |
| A pipeline goes through registered sources | A pipeline scans a predefined list of sources |
| the automation prepares, and the decision is mine. | the automation does the prep work; I make the decisions. |
| 6 positions | 6 roles |
| q_learning: comentário `alpha = 0,5; gamma = 0,96` | `alpha = 0.5; gamma = 0.96` (ponto decimal em EN) |

**FR**
| Actuel | Proposition |
|---|---|
| j’ai construit les bases et les requêtes SQL / des bases et des requêtes | j’ai conçu les bases de données et les requêtes SQL |
| et j’apporte de l’ingénierie une pratique du calcul scientifique : | et l’ingénierie m’a donné une pratique du calcul scientifique : |
| mon expérience de SQL et de Python | mon expérience en SQL et en Python |
| les projets d’automatisation que je construis par moi-même | les projets d’automatisation que je développe de ma propre initiative |
| que je compléterai avec des certificats, des laboratoires et des études au fur et à mesure | que je compléterai avec des certificats, des labs et des études, au fur et à mesure que je les terminerai |
| route sûre / Route apprise / routes courtes / route gloutonne… route sûre optimale | chemin sûr / Chemin appris / chemins courts / chemin glouton… chemin sûr optimal |
| Apprentissage (état) | Apprentissage en cours |
| 6 postes | 6 expériences |
| coupons | codes promo |
| avec une exposition aux approches de modélisation de la turbulence | voir 4.3 |
| avec l’API Claude (un modèle de langage), avec un accès par IMAP | avec l’API Claude (un modèle de langage), via un accès IMAP |
| livrées par Telegram / API Bot de Telegram | envoyées via Telegram / API Telegram Bot |
| Pipelines hybrides règles déterministes et IA | Pipelines hybrides (règles déterministes et IA) |
| Récompense :, Échelle :, Dépôt :, calcul scientifique : … | espace insécable avant « : » partout |

### 3.4 TI e Cibersegurança
**PT**
| Atual | Proposta |
|---|---|
| construindo base em cibersegurança | construindo uma base em cibersegurança |
| automação em Python em servidores na nuvem | automação em Python executada em servidores na nuvem |
| Esta página reúne os estudos, laboratórios e certificados conforme os concluo. | Esta página vai reunir estudos, laboratórios e certificados à medida que eu os concluir. |
| As seções de estudos, projetos e certificados serão preenchidas aos poucos. | As seções de estudos, laboratórios, projetos e certificados serão preenchidas aos poucos. |
| A cada passo, uma máquina infectada (vermelho) contamina… | A cada passo, cada máquina infectada (vermelho) contamina… |
| Acima de 1 o surto tende a crescer | Acima de 1, o surto tende a crescer |
| e β, a superfície de ataque (correções, segmentação, menor privilégio) | e β, a superfície de ataque, que se reduz com correções, segmentação e menor privilégio |
| executar e processar simulações WRF | executar e processar simulações no WRF |
| Laboratórios práticos e desafios, com relatos do que foi feito e aprendido. | Laboratórios práticos e desafios aparecerão aqui, com relatos do que foi feito e aprendido. |
| Dar a um bot automatizado acesso seguro… | Dar a um bot acesso seguro… |
| Os certificados online de cibersegurança | Os certificados on-line de cibersegurança |
| "Scripts em Bash" e "Bash" no mesmo bloco de competências | deixar só um |
| "2 posições" | "2 experiências" |

**EN**
| Current | Proposed |
|---|---|
| I prefer to show here only what I actually complete. | I prefer to show here only what I have actually completed. |
| Version control of code and queries with Git and GitHub. | Version-controlled code and queries with Git and GitHub. |
| Daily use of Linux and the command line, with Bash and Python scripts … | Used Linux and the command line daily, writing Bash and Python scripts to run and post-process WRF simulations. |
| with write-ups of what was done and learned. | with write-ups of what I did and learned. |
| Daily summaries over Telegram | Daily summaries via Telegram (como em Dados) |
| To talk about internships, junior roles or projects, write to: | To discuss internships, junior roles or projects, reach me at: |
| 2 positions | 2 roles |

**FR**
| Actuel | Proposition |
|---|---|
| Python et automatisation de serveurs cloud. (meta) | …Python et automatisation sur des serveurs cloud. (+ insécable avant « : ») |
| je construis une base en cybersécurité | je consolide mes bases en cybersécurité |
| réunit études, laboratoires et certificats au fur et à mesure. | réunit mes études, labs et certificats au fur et à mesure que je les termine. |
| Études et laboratoires / Laboratoires / Laboratoires pratiques et défis | Études et labs / Labs / Labs pratiques et challenges |
| En pratique, γ représente | En sécurité, concrètement, γ représente |
| 2 postes | 2 expériences |
| Gestion de versions du code et des requêtes | Versionnage du code et des requêtes |
| deux boîtes e-mail | deux boîtes de messagerie |
| accessible par SSH, mis à jour via Git et planifié avec cron | accessible par SSH, avec mise à jour via Git et exécution planifiée par cron |
| Les projets de sécurité sur GitHub apparaîtront ici. | Mes projets de sécurité publiés sur GitHub apparaîtront ici. |

---

## 4. Pontos para o Igor decidir ou confirmar (não aplicar antes da resposta)
1. **Keep Flying (mar. 2017 – jan. 2018)**: é anterior ao início do bacharelado (2020). As datas e o vínculo estão certos? Se foi em outro curso da USP, vale dizer qual.
2. **Pesquisa no ICMC-USP (FAPESP) "2023 – dez. 2024"**: qual o mês de início? (Também se sobrepõe ao intercâmbio, que vai até 2023.)
3. **Nível de envolvimento em LES**: Aero diz "LES aplicada à análise de estruturas coerentes na turbulência atmosférica"; Dados diz "contato com abordagens… incluindo conceitos de LES". O artigo do EPTT 2024 (você como 1º autor) usa LES diretamente em canal turbulento com força de Coriolis. Sugestão: nas duas páginas, "Simulação de grandes escalas (LES) de escoamento turbulento em canal com força de Coriolis, com artigo no EPTT 2024". Confirma?
4. **Iniciação científica (cargas não estacionárias, jul. 2023 – dez. 2024)**: em qual instituição/unidade e com qual orientação (se quiser citar)?
5. **VANT "desenvolver do zero"** × fuselagem Talon 1400 como base: trocar por "Desenvolver um VANT autônomo de asa fixa, a partir da plataforma Talon 1400, maximizando…"?
6. **Pilea Labs**: o título formal do cargo (ex.: "Analista de dados") e o escopo. Aero fala em "suporte a painéis"; Dados diz que você modelou e construiu as bases e consultas. Qual descrição vale para as duas?
7. **Nome do certificado do ICMC-USP**: "Mecânica dos Fluidos Computacional" é o nome oficial ou é "Dinâmica dos Fluidos Computacional"?
8. **Slides do IRPHE**: são de defesa de estágio de pesquisa/projeto? Proposta: PT "Apresentação de defesa do estágio de pesquisa", EN "Research internship defense slides", FR "Soutenance de stage de recherche".
9. **Triagem de e-mails**: a migração para o VPS já terminou? E os resumos são "diários" ou "diários e semanais"? (as páginas divergem)
10. **TI e Ciber, "ainda não tenho certificados nem projetos nela"**: a página lista 1 projeto (triagem de e-mails). Mudar para "ainda não tenho certificados nem projetos dedicados à segurança"?
11. **TI e Ciber, "Busco estágio em cibersegurança e TI"**: incluir "ou vaga júnior", como nas outras páginas?
12. **Botão em EN**: "Download CV (PDF)" ou "Download résumé (PDF)"? Recomendo "résumé" (público americano); em FR fica "CV".
13. **Simulações 2 e 3**: continuam com o nome provisório ("Simulação 2/3") ou ficam ocultas até existirem?
14. **Título do artigo do EPTT**: "Turbulent Channel flow with Coriolis force using Large-Eddy Simulation" confere com o PDF publicado (capitalização irregular é do original). Manter igual.

---

## 5. Ordem de execução sugerida
1. **R6a – tipografia** (seção 1): tokens `--fs-*`, troca da IBM Plex Mono, verificação 1280/375 nos dois temas.
2. **R6b – texto** (seções 2 e 3): aplicar ✔ nas três línguas; manter `check-parity` verde.
3. **R6c – fatos** (seção 4): depois das respostas do Igor.
4. Depois: R7 (imagens, PDFs, SVGs pesados, fontes) e R8 (verificação final: Lighthouse, teclado, leitor de tela, links externos).
