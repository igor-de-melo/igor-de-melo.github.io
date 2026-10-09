Gerado automaticamente do conteúdo visível de https://igor-de-melo.github.io/data/.

# Igor Augusto de Melo

**Ciência de Dados**

Engenharia Aeronáutica, EESC-USP · São Carlos, SP

Disponível para vagas júnior em análise, engenharia ou ciência de dados ou em TI.

## Resumo

Estudante de Engenharia Aeronáutica na EESC-USP (em andamento), em transição para **dados e TI**. Analista de dados na Pilea Labs: projetei e construí as bases **MySQL** (no Google Cloud) e as consultas **SQL** por trás das listas, tabelas e gráficos da plataforma. Cursos de Machine Learning e Aprendizado por Reforço (Data ICMC-USP, 2025) e prática de computação científica: simulação Monte Carlo, otimização e análise de incerteza. Desenvolvo projetos próprios de automação com a **API do Claude**, como um sistema de triagem de e-mails com IA.

Da engenharia: simulação de **Monte Carlo**, otimização com uma rede neural implementada do zero, análise de incerteza e rotinas numéricas em **HPC**. Em TI: Linux, Git, Bash, Google Cloud e integração de APIs, incluindo as de modelos de linguagem.

## Competências

- **Linguagens de programação:** Python, SQL (MySQL), Bash, MATLAB, Fortran, C++ (básico), Java (básico)
- **Análise de dados:** Consultas SQL com junções, Agregações, Modelagem de dados, Definição de indicadores (KPIs), Painéis, Relatórios, Análises em tempo real
- **Machine learning e estatística:** Redes neurais, Aprendizado por reforço (Q-learning), Simulação de Monte Carlo, Análise de incerteza
- **IA aplicada e automação:** API do Claude, Claude Code, Desenvolvimento assistido por IA, LLMs (Claude), Bots do Telegram, Pipelines híbridos (regras e IA), Agendamento com cron
- **Nuvem e infraestrutura:** Google Cloud, Oracle Cloud (VPS), Linux, SSH, Git, GitHub, HPC

## Experiência

### Analista de Dados

Pilea Labs · dez. 2024 – mar. 2025

Plataforma de marketing de influência e afiliados para e-commerce

- Modelei e construí, em **MySQL** no **Google Cloud**, as bases e consultas que alimentavam listas, tabelas e gráficos da plataforma.
- Cruzei as vendas atribuídas aos cupons de cada influenciador com métricas de redes sociais (visualizações e comentários).
- Escala: dezenas de influenciadores, dezenas de cupons e **milhares de pedidos** de e-commerce.
- Levantei cerca de **15 indicadores** candidatos a painel.
- Entreguei análises atualizadas em **tempo real** a partir do banco, com uma nova entrega quase todos os dias.
- Versionei código e consultas com **Git** e GitHub e integrei scripts em **Python** ao site da empresa.

### Gerente de projeto, VANT autônomo de asa fixa

Grupo SEMEAR, Núcleo de Robótica Aérea, EESC-USP · abr. 2025 – atual

- Defino a arquitetura do sistema e os requisitos técnicos.
- Coordeno os cinco subsistemas (Telecom; Visão computacional e missão; GNC e Aviônica; Mecânica; Propulsão, Energia e Autonomia).
- Modelo a **dinâmica de voo** e faço simulações para controle.

### Cargas aerodinâmicas não estacionárias

Iniciação científica, EESC-USP, orientação do Prof. Flávio Donizeti Marques · jul. 2023 – dez. 2024

- Modelos semiempíricos de cargas aerodinâmicas não estacionárias, com identificação e calibração de parâmetros a partir de dados experimentais e de **CFD**.
- **Rede neural** implementada do zero para otimizar os parâmetros.

### Simulação de escoamentos turbulentos

ICMC-USP, bolsa FAPESP · jul. 2023 – dez. 2024

**LES** (simulação de grandes escalas) de escoamento turbulento em canal com força de Coriolis: número de Reynolds de atrito 180, malha de 64 × 64 × 64 e quatro números de rotação (Ro) (0; 0,018; 0,054; 0,091), comparada com **DNS** (simulação numérica direta). Artigo no **EPTT 2024**. Autores: Igor Augusto de Melo, Livia S. Freire, Leandro Franco de Souza e Matheus Tozo de Araujo. Rotinas numéricas desenvolvidas e executadas em HPC.

### Pesquisa em modelagem atmosférica e energia eólica

IRPHE, École Centrale de Marseille · fev. – jul. 2023

Configurei e executei simulações com o modelo meteorológico **WRF**, em três domínios aninhados, para estudar o desempenho de uma turbina eólica sob condições atmosféricas variáveis.

Stack: Ferramentas: WRF, Python, scripts em Bash, Linux.

### Membro da equipe, simulação e modelagem

TOPUS Projetos Aeroespaciais · mar. 2020 – dez. 2023

- Modelo de dinâmica de voo com 6 graus de liberdade em **MATLAB** e simulações de **Monte Carlo** para dispersão de trajetória e análise de segurança.
- Modelagem numérica e **CFD** de sistemas de propulsão e de alimentação de oxidante.

## Projetos

### Triagem inteligente de e-mails

Projeto pessoal · Em desenvolvimento

**Abordagem:** Pipeline em **Python** que classifica e organiza os e-mails com a **API do Claude** (modelo de linguagem), com acesso por IMAP e **OAuth2**. Arquitetura híbrida: formatação determinística no Python e IA só na análise estratégica, o que reduz o consumo de tokens.

**Resultado:** Resumos diários e semanais com prazos em ordem cronológica e ações sugeridas, entregues pelo **Telegram**, onde um bot aceita comandos manuais. Executa localmente e em um **VPS (Oracle Cloud)** com cron; processa qualquer quantidade de e-mails, sem limite fixo (depende da caixa de entrada). Estimativa: de 1 a 3 minutos economizados por e-mail. Planejado: migração para um servidor local 24 h em Raspberry Pi.

Stack: Python, API do Claude, IMAP, OAuth2, API de bots do Telegram, Linux, cron, Git, SSH, Oracle Cloud (VPS)

### Motor de busca e classificação de vagas

Projeto pessoal · Em desenvolvimento

**Abordagem:** Pipeline que percorre fontes cadastradas, remove duplicatas e dá a cada vaga uma **nota de aderência de 0 a 10** por critérios definidos: tipo de vaga, localização e requisitos de elegibilidade. A triagem usa o Claude, pela **API do Claude**.

**Resultado:** Planilha de controle com o resumo dos requisitos e das atividades de cada vaga. Nenhuma candidatura é enviada sem a minha revisão: a automação prepara, a decisão é minha.

Stack: API do Claude, Automação de navegador

### Portfólio profissional trilíngue

Projeto pessoal

**Abordagem:** Site estático em PT, EN e FR, com duas visões (Temático e Simplificado). Desenvolvido com **Claude Code**, com testes automatizados (paridade entre idiomas, links, sincronia do CV) e revisão manual.

**Resultado:** Publicado no **GitHub Pages**, com Markdown gerado automaticamente a partir do HTML, e **JSON-LD** e llms.txt para leitura por máquinas.

Stack: HTML, CSS, JavaScript, Node.js, GitHub Pages, JSON-LD, Claude Code

- [github.com/igor-de-melo/igor-de-melo.github.io](https://github.com/igor-de-melo/igor-de-melo.github.io)

## Formação

### Certificado de Estudos Especiais em Dinâmica dos Fluidos Computacional

ICMC-USP · 2023 – atual

### Intercâmbio acadêmico, engenharia generalista

École Centrale de Marseille · 2022 – 2023

### Graduação em Engenharia Aeronáutica (em andamento)

Escola de Engenharia de São Carlos, USP · 2020 – atual

### Cursos e certificados

- [Curso de Machine Learning](https://github.com/icmc-data/Curso-de-Machine-Learning-2025) — Data ICMC-USP · 2025
- [Curso de Aprendizado por Reforço](https://github.com/icmc-data/Curso-RL-2025) — Data ICMC-USP · 2025

## Idiomas

Português (nativo), inglês (avançado), francês (avançado), alemão (básico).

## Contato

Para vagas júnior ou projetos em dados e TI, escreva para:

- E-mail: [igor_amelo@usp.br](mailto:igor_amelo@usp.br)
- LinkedIn: [linkedin.com/in/igorademelo](https://www.linkedin.com/in/igorademelo)
- GitHub: [github.com/igor-de-melo](https://github.com/igor-de-melo)
- [Baixar currículo (PDF)](https://igor-de-melo.github.io/assets/docs/cv-igor-de-melo.pdf)

São Carlos, SP, Brasil
