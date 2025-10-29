# Cygnis AI Studio

Bienvenue sur Cygnis AI Studio, une application web complète servant de terrain de jeu et de plateforme de déploiement pour les modèles d'IA Cygnis. Ce projet a été conçu pour être à la fois une interface de test interactive et une API robuste pour des intégrations externes.

## ✨ Fonctionnalités

-   **Playground IA :** Une interface de chat pour interagir directement avec le modèle Cygnis A1, un agent conversationnel avancé basé sur Google Gemini et doté de capacités RAG (Retrieval-Augmented Generation).
-   **API REST Sécurisée :** Un point d'entrée (`/api/ask`) sécurisé par clé API pour intégrer la puissance de Cygnis A1 dans d'autres applications.
-   **Documentation Développeur :** Une page de documentation complète expliquant comment utiliser l'API, avec des exemples de code en cURL, JavaScript et Python.
-   **Tableau de Bord Analytique :** Une page "Analytics" qui fournit des statistiques visuelles sur l'utilisation et les performances de l'IA (données simulées).

## 🚀 Stack Technique

-   **Framework :** [Next.js](https://nextjs.org/) (App Router)
-   **Langage :** [TypeScript](https://www.typescriptlang.org/)
-   **Styling :** [Tailwind CSS](https://tailwindcss.com/) avec la bibliothèque de composants [shadcn/ui](https://ui.shadcn.com/)
-   **IA & Orchestration :** [Genkit](https://firebase.google.com/docs/genkit) pour la création et la gestion des flux d'IA
-   **Modèle d'IA :** [Google Gemini](https://deepmind.google/technologies/gemini/)

## ⚙️ Démarrage

Suivez ces étapes pour lancer le projet en local.

### Prérequis

-   [Node.js](https://nodejs.org/) (version 20 ou supérieure recommandée)
-   Un gestionnaire de paquets comme `npm` ou `yarn`

### 1. Installation

Clonez le dépôt et installez les dépendances :

```bash
npm install
```

### 2. Configuration

Créez un fichier `.env` à la racine du projet en copiant `.env.example` (s'il existe) ou en partant de zéro. Ajoutez les clés d'API nécessaires :

```env
# Clé API pour sécuriser votre propre endpoint /api/ask
CYGNIS_API_KEY="votre_cle_api_secrete_ici"

# Clé API pour accéder aux modèles Google Gemini via Genkit
GEMINI_API_KEY="votre_cle_api_google_ici"
```

### 3. Lancer le serveur de développement

Exécutez la commande suivante pour démarrer l'application :

```bash
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:9002](http://localhost:9002).

### 4. Tester l'API

Vous pouvez utiliser le script de test fourni pour vérifier que votre endpoint API fonctionne correctement. Assurez-vous que votre serveur de développement est en cours d'exécution, puis lancez :

```bash
npm run test:api
```

## ⚖️ Licence

Tous droits réservés.
Propriétaire : Simon Chusseau
