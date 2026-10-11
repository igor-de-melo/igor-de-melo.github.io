Généré automatiquement à partir du contenu visible de https://igor-de-melo.github.io/data/.

# Igor Augusto de Melo

**Science des données**

Ingénierie aéronautique, EESC-USP · São Carlos, Brésil

Disponible pour des postes junior en analyse de données, ingénierie des données, science des données ou informatique.

## Résumé

Étudiant en ingénierie aéronautique à l’EESC-USP (en cours), en transition vers **la donnée et l’informatique**. Stagiaire analyste de données chez Pilea Labs : conception des bases **MySQL** (sur Google Cloud) et des requêtes **SQL** derrière les listes, tableaux et graphiques de la plateforme. Cours de Machine Learning et d’apprentissage par renforcement (Data ICMC-USP, 2025) et pratique du calcul scientifique : simulation Monte-Carlo, optimisation et analyse d’incertitude. Je développe des projets d’automatisation personnels avec l’**API Claude**, dont un système de tri d’e-mails assisté par IA.

De l’ingénierie : simulation de **Monte-Carlo**, optimisation par un réseau de neurones codé de zéro, analyse d’incertitude et routines numériques en **HPC**. En informatique : Linux, Git, Bash, Google Cloud et intégration d’API, y compris de modèles de langage.

## Compétences

- **Langages de programmation :** Python, SQL (MySQL), Bash, MATLAB, Fortran, C++ (notions), Java (notions)
- **Analyse de données :** Requêtes SQL avec jointures, Agrégations, Modélisation de données, Définition d’indicateurs (KPI), Tableaux de bord, Reporting, Analyses en temps réel
- **Machine learning et statistiques :** Réseaux de neurones, Apprentissage par renforcement (Q-learning), Simulation de Monte-Carlo, Analyse d’incertitude
- **IA appliquée et automatisation :** API Claude, Claude Code, Développement assisté par IA, LLM (Claude), Bots Telegram, Pipelines hybrides (règles et IA), Planification avec cron
- **Cloud et infrastructure :** Google Cloud, Oracle Cloud (VPS), Linux, SSH, Git, GitHub, HPC

## Expérience

### Stagiaire analyste de données

Pilea Labs · déc. 2024 – mars 2025

Plateforme de marketing d’influence et d’affiliation pour l’e-commerce

- Conception et construction, sous **MySQL** sur **Google Cloud**, des bases et requêtes alimentant les listes, tableaux et graphiques de la plateforme.
- Croisement des ventes attribuées aux codes promo de chaque influenceur avec des indicateurs de réseaux sociaux (vues et commentaires).
- Échelle : des dizaines d’influenceurs, des dizaines de codes promo et **des milliers de commandes** e-commerce.
- Recensement d’environ **15 indicateurs** candidats à un tableau de bord.
- Livraison d’analyses mises à jour en **temps réel** à partir de la base, avec une nouvelle livraison presque chaque jour.
- Versionnage du code et des requêtes avec **Git** et GitHub et intégration de scripts **Python** au site de l’entreprise.

### Chef de projet, drone autonome à voilure fixe

Groupe SEMEAR, pôle de robotique aérienne, EESC-USP · avr. 2025 – aujourd’hui

- Définition de l’architecture système et des exigences techniques.
- Coordination des cinq sous-systèmes (Télécom ; Vision par ordinateur et mission ; GNC et avionique ; Mécanique ; Propulsion, énergie et autonomie).
- Modélisation de la **dynamique du vol** et simulations orientées commande.

### Charges aérodynamiques instationnaires

Initiation à la recherche, EESC-USP, sous la direction du Prof. Flávio Donizeti Marques · sept. 2023 – déc. 2024

- Modèles semi-empiriques de charges aérodynamiques instationnaires, avec identification et calibration des paramètres à partir de données expérimentales et **CFD**.
- **Réseau de neurones** codé de zéro pour optimiser les paramètres.

### Simulation d’écoulements turbulents

ICMC-USP, bourse FAPESP · sept. 2023 – déc. 2024

- **LES** (simulation des grandes échelles) d’un écoulement turbulent en canal avec force de Coriolis.
- Nombre de Reynolds de frottement de 180, maillage de 64 × 64 × 64 et quatre nombres de rotation (Ro) (0 ; 0,018 ; 0,054 ; 0,091), comparée à la **DNS** (simulation numérique directe).
- Article à l’**EPTT 2024**.
- Auteurs : Igor Augusto de Melo, Livia S. Freire, Leandro Franco de Souza et Matheus Tozo de Araujo.
- Routines numériques développées et exécutées en HPC.

### Recherche en modélisation atmosphérique et énergie éolienne

IRPHE, École Centrale de Marseille · févr. – juil. 2023

Configuration et exécution de simulations avec le modèle météorologique **WRF**, sur trois domaines imbriqués, pour étudier les performances d’une éolienne dans des conditions atmosphériques variables.

Stack : Outils : WRF, Python, scripts Bash, Linux.

### Membre de l’équipe, simulation et modélisation

TOPUS Projetos Aeroespaciais · mars 2020 – déc. 2023

- Modèle de dynamique du vol à 6 degrés de liberté sous **MATLAB** et simulations de **Monte-Carlo** pour la dispersion des trajectoires et l’analyse de sécurité.
- Modélisation numérique et **CFD** des systèmes de propulsion et d’alimentation en oxydant.

## Projets

### Tri intelligent d’e-mails

Projet personnel · En développement

**Approche :**

- J’utilise **Claude Haiku**, via l’API, pour transformer les e-mails en données.
- L’API lit chaque message et renvoie un **JSON** avec dossier, priorité de 1 à 5, résumé, échéance, action suggérée et alerte.
- Le prompt fixe les dossiers, l’échelle de priorité et un protocole en 3 étapes contre les faux positifs de spam.
- Le **prompt caching** réduit le coût d’entrée.
- Python fait le reste, sans IA : **OAuth2** sur deux comptes Gmail, **IMAP**, journal JSONL, Telegram et cron.

**Résultat :**

- Tri toutes les 15 minutes, avec synthèses quotidienne et hebdomadaire sur Telegram, où un bot accepte des commandes manuelles.
- Python construit les cartes et trie les échéances, et l’API n’écrit qu’un paragraphe d’analyse stratégique.
- S’exécute en local et sur un VPS (Oracle Cloud) ; migration vers un Raspberry Pi prévue.
- Estimation : 1 à 3 minutes gagnées par e-mail.

Stack : Python, API Claude, Claude Haiku, IMAP, OAuth2, API Telegram Bot, Linux, cron, Git, SSH, Oracle Cloud (VPS)

### Tri d’offres avec Claude

Projet personnel · En développement

**Approche :**

- J’utilise **Claude** (Projects et Cowork) avec l’**extension Chrome** pour collecter des offres dans le navigateur.
- Avec lui, je lis chaque offre et lui attribue une **note d’adéquation de 0 à 10** selon mes critères, en écartant celles qui en sortent (séniorité, expérience exigée).
- Je rédige aussi des brouillons de lettre de motivation et remplis les formulaires de candidature.

**Résultat :**

- Claude consigne le résultat dans un tableau de suivi qui organise les offres.
- Aucune candidature n’est envoyée sans ma confirmation : l’automatisation prépare, la décision me revient.

Stack : Claude (Projects), Cowork, Extension Chrome, Tableau de suivi, Automatisation du navigateur

### Portfolio professionnel trilingue

Projet personnel

**Approche :**

- Site statique en PT, EN et FR, avec deux affichages (Thématique et Simplifié).
- Développé avec **Claude Code**, avec tests automatisés (parité entre langues, liens, synchronisation du CV) et relecture manuelle.

**Résultat :** Publié sur **GitHub Pages**, avec un Markdown généré automatiquement à partir du HTML, ainsi que **JSON-LD** et llms.txt pour la lecture par les machines.

Stack : HTML, CSS, JavaScript, Node.js, GitHub Pages, JSON-LD, Claude Code

- [github.com/igor-de-melo/igor-de-melo.github.io](https://github.com/igor-de-melo/igor-de-melo.github.io)

## Formation

### Certificat d’études spéciales en dynamique des fluides numérique

ICMC-USP · 2023 – aujourd’hui

### Échange académique, cursus ingénieur généraliste

École Centrale de Marseille · 2022 – 2023

### Cursus ingénieur en aéronautique (en cours)

École d’ingénieurs de São Carlos (EESC), Université de São Paulo · 2020 – aujourd’hui

### Cours et certificats

- [Cours d’apprentissage automatique (machine learning)](https://github.com/icmc-data/Curso-de-Machine-Learning-2025) — Data ICMC-USP · 2025
- [Cours d’apprentissage par renforcement](https://github.com/icmc-data/Curso-RL-2025) — Data ICMC-USP · 2025

## Langues

Portugais (langue maternelle), anglais (avancé), français (avancé), allemand (notions), espagnol (notions).

## Contact

Pour un poste junior ou un projet en données et informatique, écrivez-moi :

- E-mail : [igor_amelo@usp.br](mailto:igor_amelo@usp.br)
- LinkedIn : [linkedin.com/in/igorademelo](https://www.linkedin.com/in/igorademelo)
- GitHub : [github.com/igor-de-melo](https://github.com/igor-de-melo)
- [Télécharger le CV (PDF)](https://igor-de-melo.github.io/assets/docs/cv-igor-de-melo-fr.pdf)

São Carlos, État de São Paulo, Brésil
