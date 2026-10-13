Gerado automaticamente do conteúdo visível de https://igor-de-melo.github.io/data/.

# Igor Augusto de Melo

**Ciência de Dados**

Engenharia Aeronáutica, EESC-USP · São Carlos, SP

Disponível para vagas júnior em análise, engenharia ou ciência de dados ou em TI.

## Resumo

Estudante de Engenharia Aeronáutica na EESC-USP (em andamento), em transição para **dados e TI**. Estagiário de análise de dados na Pilea Labs: projetei e construí as bases **MySQL** (no Google Cloud) e as consultas **SQL** por trás das listas, tabelas e gráficos da plataforma. Cursos de Machine Learning e Aprendizado por Reforço (Data ICMC-USP, 2025) e prática de computação científica: simulação Monte Carlo, otimização e análise de incerteza. Desenvolvo projetos próprios de automação com a **API do Claude**, como um sistema de triagem de e-mails com IA.

Da engenharia: simulação de **Monte Carlo**, otimização com uma rede neural implementada sem bibliotecas de ML, análise de incerteza e rotinas numéricas em **HPC**. Em TI: Linux, Git, Bash, Google Cloud e integração de APIs, incluindo as de modelos de linguagem.

## Competências

- **Linguagens de programação:** Python, SQL (MySQL), Bash, MATLAB, Fortran, C++ (básico), Java (básico)
- **Análise de dados:** Consultas SQL com junções, Agregações, Modelagem de dados, Definição de indicadores (KPIs), Painéis, Relatórios, Análises em tempo real
- **Machine learning e estatística:** Redes neurais, Aprendizado por reforço (Q-learning), Simulação de Monte Carlo, Análise de incerteza
- **IA aplicada e automação:** API do Claude, Claude Code, Desenvolvimento assistido por IA, LLMs (Claude), Bots do Telegram, Pipelines híbridos (regras e IA), Agendamento com cron
- **Nuvem e infraestrutura:** Google Cloud, Oracle Cloud (VPS), Linux, SSH, Git, GitHub, HPC

## Experiência

### Estagiário de Análise de Dados

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

Iniciação científica, EESC-USP, orientação do Prof. Flávio Donizeti Marques · set. 2023 – dez. 2024

- Modelos semiempíricos de cargas aerodinâmicas não estacionárias, com identificação e calibração de parâmetros a partir de dados experimentais e de **CFD**.
- **Rede neural** multicamadas, implementada em Python/NumPy e MATLAB sem bibliotecas de ML, com número de camadas e de neurônios configurável, para otimizar os parâmetros dos modelos semiempíricos de Beddoes-Leishman e ONERA.

### Simulação de escoamentos turbulentos

ICMC-USP, bolsa FAPESP · set. 2023 – dez. 2024

- **LES** (simulação de grandes escalas) de escoamento turbulento em canal com força de Coriolis.
- Número de Reynolds de atrito 180, malha de 64 × 64 × 64 e quatro números de rotação (Ro) (0; 0,018; 0,054; 0,091), comparada com **DNS** (simulação numérica direta).
- Artigo no **EPTT 2024**.
- Autores: Igor Augusto de Melo, Livia S. Freire, Leandro Franco de Souza e Matheus Tozo de Araujo.
- Rotinas numéricas desenvolvidas e executadas em HPC.

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

**Abordagem:**

- Uso o **Claude Haiku**, pela API, para transformar e-mails em dados.
- A API lê cada mensagem e devolve um **JSON** com pasta, prioridade de 1 a 5, resumo, prazo, ação sugerida e alerta.
- O prompt traz as pastas, a escala de prioridade e um protocolo de 3 etapas contra falsos positivos de spam.
- O **prompt caching** reduz o custo de entrada.
- O Python faz o resto, sem IA: **OAuth2** em duas contas Gmail, **IMAP**, log JSONL, Telegram e cron.

**Resultado:**

- Triagem a cada 15 minutos, com resumo diário e semanal no Telegram, onde um bot aceita comandos manuais.
- O Python monta os cards e ordena os prazos, e a API escreve só um parágrafo de análise estratégica.
- Roda localmente e em VPS (Oracle Cloud); migração para Raspberry Pi planejada.
- Estimativa: 1 a 3 minutos economizados por e-mail.

Stack: Python, API do Claude, Claude Haiku, IMAP, OAuth2, API de bots do Telegram, Linux, cron, Git, SSH, Oracle Cloud (VPS)

### Triagem de vagas com Claude

Projeto pessoal · Em desenvolvimento

**Abordagem:**

- Uso o **Claude** (Projects e Cowork) com a **extensão do Chrome** para coletar vagas no navegador.
- Com ele, leio cada vaga e dou uma **nota de aderência de 0 a 10** pelos meus critérios, descartando as que ficam fora deles (senioridade, experiência exigida).
- Também redijo rascunhos de carta de apresentação e preencho formulários de candidatura.

**Resultado:**

- O Claude registra o resultado numa planilha de apoio, que organiza as vagas.
- Nenhuma candidatura é enviada sem a minha confirmação: a automação prepara, a decisão é minha.

Stack: Claude (Projects), Cowork, Extensão do Chrome, Planilha de apoio, Automação de navegador

### Portfólio profissional trilíngue

Projeto pessoal

**Abordagem:**

- Site estático em PT, EN e FR, com duas visões (Temático e Simplificado).
- Desenvolvido com **Claude Code**, com testes automatizados (paridade entre idiomas, links, sincronia do CV) e revisão manual.

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

Português (nativo), inglês (avançado), francês (avançado), alemão (básico), espanhol (básico).

## Contato

Para vagas júnior ou projetos em dados e TI, escreva para:

- E-mail: [igor_amelo@usp.br](mailto:igor_amelo@usp.br)
- LinkedIn: [linkedin.com/in/igorademelo](https://www.linkedin.com/in/igorademelo)
- GitHub: [github.com/igor-de-melo](https://github.com/igor-de-melo)
- [Baixar currículo (PDF)](https://igor-de-melo.github.io/assets/docs/cv-igor-de-melo-data-pt.pdf)

São Carlos, SP, Brasil
