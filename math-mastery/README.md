# Math Mastery - Plateforme éducative pour 2BAC Sciences Mathématiques

Une plateforme communautaire dédiée aux étudiants marocains en 2ème année Baccalauréat Sciences Mathématiques et Physiques.

## 🚀 Fonctionnalités

- **Cours complets** : Accès à des cours détaillés couvrant tout le programme 2BAC Sciences Mathématiques
- **Exercices interactifs** : Pratique avec des exercices variés et des corrections détaillées  
- **Communauté active** : Échange avec d'autres étudiants et possibilité de poser des questions
- **Suivi des progrès** : Suivi de progression et identification des points forts
- **Formules mathématiques** : Rendu LaTeX intégré pour les formules mathématiques
- **Mode sombre** : Interface adaptable selon les préférences

## 🛠️ Technologies utilisées

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : Tailwind CSS v4
- **Authentification** : Supabase Auth
- **Base de données** : Supabase (PostgreSQL)
- **Formules mathématiques** : KaTeX + react-katex
- **Icônes** : Lucide React

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase (pour la base de données et l'authentification)

## ⚡ Installation et configuration

1. **Cloner le repository**
   ```bash
   git clone [url-du-repo]
   cd math-mastery
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Supabase**
   - Créer un projet sur [supabase.com](https://supabase.com)
   - Copier `.env.local.example` vers `.env.local`
   - Remplir les variables d'environnement Supabase :
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Ouvrir l'application**
   Naviguer vers [http://localhost:3000](http://localhost:3000)

## 🏗️ Scripts disponibles

- `npm run dev` : Démarre le serveur de développement
- `npm run build` : Compile l'application pour la production
- `npm run start` : Démarre le serveur de production
- `npm run lint` : Vérifie le code avec ESLint

## 📚 Structure du projet

```
src/
├── app/                 # App Router de Next.js
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants d'interface utilisateur
│   ├── layout/         # Composants de mise en page
│   ├── posts/          # Composants liés aux publications
│   └── comments/       # Composants de commentaires
├── contexts/           # Contextes React (Auth, Theme)
├── lib/                # Utilitaires et configuration
└── types/              # Définitions TypeScript
```

## 🎨 Fonctionnalités principales

### Authentification
- Inscription et connexion via Supabase Auth
- Gestion des profils utilisateur
- Protection des routes

### Publications
- Création de cours, exercices, quiz
- Support des formules LaTeX (inline et bloc)
- Système de likes et commentaires
- Categorisation par chapitres

### Interface utilisateur
- Design responsive (mobile-first)
- Mode sombre/clair
- Composants UI réutilisables
- Animations et transitions fluides

## 🔧 Configuration Tailwind CSS v4

Le projet utilise Tailwind CSS v4 avec la configuration suivante :
- Import via `@import "tailwindcss"`
- Configuration PostCSS optimisée
- Classes utilitaires personnalisées

## 📱 Chapitres couverts

- **Analyse** : Fonctions, dérivées, intégrales
- **Algèbre** : Nombres complexes, polynômes  
- **Géométrie** : Géométrie dans l'espace
- **Probabilités** : Statistiques et probabilités

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**Math Mastery** - Excellez en mathématiques au 2BAC ! 🎓✨
