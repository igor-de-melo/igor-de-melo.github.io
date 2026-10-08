Généré automatiquement à partir du contenu visible de https://igor-de-melo.github.io/data/.

# Igor Augusto de Melo

**Science des données**

Ingénierie aéronautique, EESC-USP · São Carlos, Brésil

Disponible pour des postes junior en analyse de données, ingénierie des données, science des données ou informatique.

## Résumé

Étudiant en ingénierie aéronautique à l’EESC-USP (en cours), en transition vers la donnée et l’informatique. Expérience d’analyste de données chez Pilea Labs : conception des bases MySQL (sur Google Cloud) et des requêtes SQL derrière les listes, tableaux et graphiques de la plateforme. Cours de Machine Learning et d’apprentissage par renforcement (Data ICMC-USP, 2025) et pratique du calcul scientifique : simulation Monte-Carlo, optimisation et analyse d’incertitude. Développe des projets d’automatisation personnels, dont un système de tri d’e-mails assisté par IA.

De l’ingénierie, j’apporte une pratique du calcul scientifique : simulation de Monte-Carlo, optimisation par un réseau de neurones codé de zéro, analyse d’incertitude et routines numériques en environnement HPC. En informatique, je travaille avec Linux, Git, Bash, Google Cloud et l’intégration d’API, y compris de modèles de langage.

## Compétences

- **Langages de programmation :** Python, SQL (MySQL), Bash, MATLAB, Fortran, C++ (notions), Java (notions)
- **Analyse de données :** Requêtes SQL avec jointures, Agrégations, Modélisation de données, Définition d’indicateurs (KPI), Tableaux de bord, Reporting, Analyses en temps réel
- **Machine learning et statistiques :** Réseaux de neurones, Apprentissage par renforcement (Q-learning), Simulation de Monte-Carlo, Analyse d’incertitude
- **IA appliquée et automatisation :** Intégration de LLM par API (API Claude), Bots Telegram, Pipelines hybrides (règles déterministes et IA), Planification avec cron
- **Cloud et infrastructure :** Google Cloud, Oracle Cloud (VPS), Linux, SSH, Git, GitHub, HPC

## Expérience

### Analyste de données

Pilea Labs · déc. 2024 – mars 2025

Plateforme de marketing d’influence et d’affiliation pour l’e-commerce

- Modélisation et construction, sous MySQL sur Google Cloud, des bases et des requêtes qui alimentaient les listes, tableaux et graphiques des interfaces de la plateforme.
- Croisement des ventes attribuées aux codes promo de chaque influenceur avec des indicateurs de réseaux sociaux, comme les vues et les commentaires.
- Échelle : des dizaines d’influenceurs, des dizaines de codes promo et des milliers de commandes e-commerce.
- Recensement d’environ 15 idées d’indicateurs à transformer en tableaux de bord.
- Analyses mises à jour en temps réel à partir de la base, avec une nouvelle livraison presque chaque jour.
- Versionnage des requêtes avec Git et GitHub et intégration de scripts Python au site web de l’entreprise.

### Chef de projet, drone autonome à voilure fixe

Groupe SEMEAR, pôle de robotique aérienne, EESC-USP · avr. 2025 – aujourd’hui

- Définition de l’architecture système et des exigences techniques.
- Coordination du travail des cinq sous-systèmes (Télécom ; Vision par ordinateur et mission ; GNC et avionique ; Mécanique ; Propulsion, énergie et autonomie).
- Modélisation de la dynamique du vol et simulations orientées commande.

### Charges aérodynamiques instationnaires

Initiation à la recherche, EESC-USP, sous la direction du Prof. Flávio Donizeti Marques · juil. 2023 – déc. 2024

- Modèles semi-empiriques de charges aérodynamiques instationnaires, avec identification et calibration des paramètres à partir de données expérimentales et CFD.
- Réseau de neurones codé de zéro, appliqué à l’optimisation des paramètres.

### Simulation d’écoulements turbulents

ICMC-USP, bourse FAPESP · juil. 2023 – déc. 2024

Simulation des grandes échelles (LES) d’un écoulement turbulent en canal avec force de Coriolis, à un nombre de Reynolds de frottement de 180, avec un maillage LES de 64 × 64 × 64 et quatre nombres de rotation (Ro) (0 ; 0,018 ; 0,054 ; 0,091), comparée à la simulation numérique directe (DNS). Article à l’EPTT 2024. Auteurs : Igor Augusto de Melo, Livia S. Freire, Leandro Franco de Souza et Matheus Tozo de Araujo. Développement et exécution de routines numériques en environnement HPC.

### Recherche en modélisation atmosphérique et énergie éolienne

IRPHE, École Centrale de Marseille · févr. – juil. 2023

Configuration et exécution de simulations avec le modèle météorologique WRF, avec trois domaines imbriqués, pour l’étude des performances d’une éolienne dans des conditions atmosphériques variables.

Stack : Outils : WRF, Python, scripts Bash, Linux.

### Membre de l’équipe, simulation et modélisation

TOPUS Projetos Aeroespaciais · mars 2020 – déc. 2023

- Modèle de dynamique du vol à 6 degrés de liberté sous MATLAB et simulations de Monte-Carlo pour la dispersion des trajectoires et l’analyse de sécurité.
- Modélisation numérique et CFD des systèmes de propulsion et d’alimentation en oxydant.

## Projets

### Tri intelligent d’e-mails

Projet personnel · En développement

**Problème :** Suivre deux comptes Gmail, l’un personnel et l’autre institutionnel de l’USP, sans manquer d’échéances ni d’actions en attente.

**Approche :** Un pipeline Python classe et organise les e-mails avec l’API Claude (un modèle de langage), via un accès IMAP et OAuth2. L’architecture est hybride : la mise en forme déterministe reste en Python et l’IA n’intervient que pour l’analyse stratégique, ce qui réduit la consommation de tokens.

**Résultat :** Des synthèses quotidiennes et hebdomadaires avec les échéances dans l’ordre chronologique et les actions suggérées, envoyées via Telegram, où un bot accepte aussi des commandes manuelles. Le système s’exécute en local et sur un VPS (Oracle Cloud), avec planification par cron, et traite un nombre quelconque d’e-mails, sans limite fixe (selon la boîte de réception). Estimation : 1 à 3 minutes gagnées par e-mail. Prévu : migration vers un serveur local 24 h/24 sur Raspberry Pi.

Stack : Python, API Claude, IMAP, OAuth2, API Telegram Bot, Linux, cron, Git, SSH, Oracle Cloud (VPS)

### Moteur de recherche et de classement d’offres

Projet personnel · En développement

**Problème :** Trouver et trier des offres de stage et d’emploi réparties sur de nombreuses sources.

**Approche :** Un pipeline parcourt des sources enregistrées, supprime les doublons et attribue à chaque offre une note d’adéquation de 0 à 10 selon des critères définis : type de poste, localisation et conditions d’éligibilité.

**Résultat :** Un tableau de suivi avec un résumé des exigences et des missions de chaque offre. Aucune candidature n’est envoyée sans ma relecture et ma confirmation : l’automatisation prépare, la décision m’appartient.

Stack : Claude, Claude Code, Automatisation du navigateur

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

Portugais (langue maternelle), anglais (avancé), français (avancé), allemand (notions).

## Contact

Pour un poste junior ou un projet en données et informatique, écrivez-moi :

- E-mail : [igor_amelo@usp.br](mailto:igor_amelo@usp.br)
- LinkedIn : [linkedin.com/in/igorademelo](https://www.linkedin.com/in/igorademelo)
- GitHub : [github.com/igor-de-melo](https://github.com/igor-de-melo)
- [Télécharger le CV (PDF)](https://igor-de-melo.github.io/assets/docs/cv-igor-de-melo.pdf)

São Carlos, État de São Paulo, Brésil
