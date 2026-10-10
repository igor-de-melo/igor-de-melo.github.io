Automatically generated from the visible content of https://igor-de-melo.github.io/data/.

# Igor Augusto de Melo

**Data Science**

Aeronautical Engineering, EESC-USP · São Carlos, Brazil

Available for junior roles in data analysis, data engineering, data science or IT.

## Summary

Aeronautical Engineering student at EESC-USP (in progress), transitioning into **data and IT**. Data Analyst at Pilea Labs: designed and built the **MySQL** databases (on Google Cloud) and the **SQL** queries behind the platform’s lists, tables and charts. Machine Learning and Reinforcement Learning courses (Data ICMC-USP, 2025) and hands-on scientific computing: Monte Carlo simulation, optimization and uncertainty analysis. I build personal automation projects with the **Claude API**, such as an AI-assisted email triage system.

From engineering: **Monte Carlo** simulation, optimization with a neural network implemented from scratch, uncertainty analysis and numerical routines on **HPC**. In IT: Linux, Git, Bash, Google Cloud and API integration, including language models.

## Skills

- **Programming languages:** Python, SQL (MySQL), Bash, MATLAB, Fortran, C++ (basic), Java (basic)
- **Data analysis:** SQL queries with joins, Aggregations, Data modeling, KPI definition, Dashboards, Reporting, Real-time analytics
- **Machine learning and statistics:** Neural networks, Reinforcement learning (Q-learning), Monte Carlo simulation, Uncertainty analysis
- **Applied AI and automation:** Claude API, Claude Code, AI-assisted development, LLMs (Claude), Telegram bots, Hybrid pipelines (rules and AI), Scheduling with cron
- **Cloud and infrastructure:** Google Cloud, Oracle Cloud (VPS), Linux, SSH, Git, GitHub, HPC

## Experience

### Data Analyst

Pilea Labs · Dec 2024 – Mar 2025

Influencer and affiliate marketing platform for e-commerce

- Designed and built, in **MySQL** on **Google Cloud**, the databases and queries behind the platform’s lists, tables and charts.
- Joined sales attributed to each influencer’s coupons with social media metrics (views and comments).
- Scale: dozens of influencers, dozens of coupons and **thousands of orders** in e-commerce.
- Proposed about **15 KPIs** as dashboard candidates.
- Delivered analyses updated in **real time** from the database, shipping something new almost every day.
- Versioned code and queries with **Git** and GitHub and integrated **Python** scripts into the company website.

### Project Manager, autonomous fixed-wing UAV

SEMEAR Aerial Robotics Group, EESC-USP · Apr 2025 – present

- Define the system architecture and the technical requirements.
- Coordinate the five subsystems (Telecom; Computer vision and mission; GNC and Avionics; Mechanics; Propulsion, Power and Endurance).
- Model the **flight dynamics** and run control-oriented simulations.

### Unsteady aerodynamic loads

Undergraduate research, EESC-USP, advised by Prof. Flávio Donizeti Marques · Jul 2023 – Dec 2024

- Semi-empirical models of unsteady aerodynamic loads, with parameter identification and calibration against experimental and **CFD** data.
- **Neural network** implemented from scratch to optimize the parameters.

### Turbulent flow simulation

ICMC-USP (Institute of Mathematics and Computer Sciences), FAPESP grant · Jul 2023 – Dec 2024

- **LES** (large-eddy simulation) of turbulent channel flow with Coriolis force.
- Friction Reynolds number 180, 64 × 64 × 64 grid and four rotation numbers (Ro) (0, 0.018, 0.054, 0.091), compared with **DNS** (direct numerical simulation).
- Paper at **EPTT 2024**.
- Authors: Igor Augusto de Melo, Livia S. Freire, Leandro Franco de Souza and Matheus Tozo de Araujo.
- Numerical routines developed and run on HPC.

### Atmospheric modeling and wind energy research

IRPHE, École Centrale de Marseille · Feb – Jul 2023

Set up and ran simulations with the **WRF** weather model, on three nested domains, to study wind turbine performance under varying atmospheric conditions.

Stack: Tools: WRF, Python, Bash scripting, Linux.

### Team member, simulation and modeling

TOPUS Projetos Aeroespaciais · Mar 2020 – Dec 2023

- 6-DOF flight dynamics model in **MATLAB** and **Monte Carlo** simulations for trajectory dispersion and safety analysis.
- Numerical modeling and **CFD** of propulsion and oxidizer feed systems.

## Projects

### Intelligent email triage

Personal project · In development

**Approach:**

- I use **Claude Haiku**, through the API, to turn emails into data.
- The API reads each message and returns **JSON** with folder, priority from 1 to 5, summary, deadline, suggested action and alert flag.
- The prompt defines the folders, the priority scale and a 3-step protocol against spam false positives.
- **Prompt caching** lowers input cost.
- Python does the rest, without AI: **OAuth2** on two Gmail accounts, **IMAP**, JSONL log, Telegram and cron.

**Result:**

- Triage every 15 minutes, with daily and weekly summaries on Telegram, where a bot accepts manual commands.
- Python builds the cards and sorts deadlines, and the API writes only one paragraph of strategic analysis.
- Runs locally and on a VPS (Oracle Cloud); migration to a Raspberry Pi planned.
- Estimate: 1 to 3 minutes saved per email.

Stack: Python, Claude API, Claude Haiku, IMAP, OAuth2, Telegram Bot API, Linux, cron, Git, SSH, Oracle Cloud (VPS)

### Job triage with Claude

Personal project · In development

**Approach:**

- I use **Claude** (Projects and Cowork) with the **Chrome extension** to collect job listings in the browser.
- With it, I read each listing and give it a **fit score from 0 to 10** against my criteria, discarding those outside them (seniority, required experience).
- I also draft cover letters and fill in application forms.

**Result:**

- Claude records the output in a tracking spreadsheet that organizes the listings.
- No application is sent without my confirmation: the automation prepares, the decision is mine.

Stack: Claude (Projects), Cowork, Chrome extension, Tracking spreadsheet, Browser automation

### Trilingual professional portfolio

Personal project

**Approach:**

- Static site in PT, EN and FR, with two views (Themed and Simple).
- Built with **Claude Code**, with automated tests (language parity, links, résumé sync) and manual review.

**Result:** Published on **GitHub Pages**, with Markdown generated automatically from the HTML, plus **JSON-LD** and llms.txt for machine reading.

Stack: HTML, CSS, JavaScript, Node.js, GitHub Pages, JSON-LD, Claude Code

- [github.com/igor-de-melo/igor-de-melo.github.io](https://github.com/igor-de-melo/igor-de-melo.github.io)

## Education

### Special Studies Certificate in Computational Fluid Dynamics

ICMC-USP · 2023 – present

### Academic exchange, general engineering program

École Centrale de Marseille · 2022 – 2023

### Aeronautical Engineering, undergraduate studies (in progress)

São Carlos School of Engineering, University of São Paulo · 2020 – present

### Courses and certificates

- [Machine Learning course](https://github.com/icmc-data/Curso-de-Machine-Learning-2025) — Data ICMC-USP · 2025
- [Reinforcement Learning course](https://github.com/icmc-data/Curso-RL-2025) — Data ICMC-USP · 2025

## Languages

Portuguese (native), English (advanced), French (advanced), German (basic).

## Contact

For junior roles or projects in data and IT, reach me at:

- Email: [igor_amelo@usp.br](mailto:igor_amelo@usp.br)
- LinkedIn: [linkedin.com/in/igorademelo](https://www.linkedin.com/in/igorademelo)
- GitHub: [github.com/igor-de-melo](https://github.com/igor-de-melo)
- [Download résumé (PDF)](https://igor-de-melo.github.io/assets/docs/cv-igor-de-melo.pdf)

São Carlos, São Paulo, Brazil
