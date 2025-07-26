# 🧮 Math Mastery

Plateforme éducative communautaire destinée aux étudiants marocains en 2ème année Baccalauréat (2BAC) - option Sciences Mathématiques et Physiques.

## 🎯 Objectif

Math Mastery est une plateforme 100% en français qui permet aux étudiants de :
- 📚 Consulter des contenus mathématiques adaptés au programme marocain 2BAC
- 💬 Commenter, aimer et partager les publications
- 🎓 Apprendre avec une communauté active d'étudiants
- 📊 Suivre leur progression et améliorer leurs résultats

## ✨ Fonctionnalités

### 👥 Pour les étudiants
- ✅ Créer un compte / se connecter
- 📚 Accéder aux publications (cours, exercices, quiz, vidéos)
- 💬 Commenter des publications
- ❤️ Aimer (liker) les publications
- 🔁 Partager une publication
- 🔍 Rechercher par mots-clés, par chapitre
- 🧮 Support LaTeX pour les formules mathématiques
- 🌙 Mode clair / sombre

### 🧑‍💼 Pour les administrateurs
- ➕ Ajouter / Modifier / Supprimer des publications
- 📁 Gérer les fichiers (PDFs, vidéos, images)
- ⭐ Marquer des posts comme "officiels"
- 📊 Voir les statistiques (vues, likes, partages)
- 👥 Gérer les utilisateurs

### 📂 Types de contenus
- 📘 **Cours** : Contenus théoriques détaillés
- 📝 **Exercices** : Problèmes avec solutions
- 📊 **Quiz** : Évaluations interactives
- 🎬 **Vidéos** : Contenu multimédia

### 📌 Chapitres couverts
- 🔵 **Analyse** : Fonctions, dérivées, intégrales
- 🟢 **Algèbre** : Nombres complexes, polynômes
- 🟣 **Géométrie** : Géométrie dans l'espace
- 🟠 **Probabilités** : Statistiques et probabilités

## 🛠️ Stack Technologique

- **Frontend** : Next.js 14 avec App Router, TypeScript
- **UI/UX** : Tailwind CSS, Lucide React Icons
- **Backend** : API Routes Next.js
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth avec gestion des rôles
- **Stockage** : Supabase Storage
- **Formules mathématiques** : KaTeX, react-katex
- **Markdown** : react-markdown
- **Formulaires** : React Hook Form + Zod
- **Date/Heure** : date-fns avec locale française

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd math-mastery
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration des variables d'environnement
Copier le fichier `.env.local.example` vers `.env.local` :
```bash
cp .env.local.example .env.local
```

Puis remplir les variables d'environnement :
```env
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Configuration de l'application
NEXT_PUBLIC_APP_NAME="Math Mastery"
NEXT_PUBLIC_APP_DESCRIPTION="Plateforme éducative pour les étudiants marocains 2BAC Sciences Mathématiques"
```

### 4. Configuration de la base de données Supabase

#### Créer les tables
Exécuter le SQL suivant dans l'éditeur SQL de Supabase :

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    role TEXT DEFAULT 'utilisateur' CHECK (role IN ('utilisateur', 'admin')),
    photo_profil TEXT,
    bio TEXT,
    date_inscription TIMESTAMPTZ DEFAULT NOW(),
    derniere_connexion TIMESTAMPTZ
);

-- Create posts table
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titre TEXT NOT NULL,
    contenu TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cours', 'exercice', 'quiz', 'video')),
    tags TEXT[] DEFAULT '{}',
    chapitre TEXT NOT NULL CHECK (chapitre IN ('analyse', 'algebre', 'geometrie', 'probabilites')),
    auteur_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    date_modification TIMESTAMPTZ,
    likes_count INTEGER DEFAULT 0,
    vues_count INTEGER DEFAULT 0,
    partages_count INTEGER DEFAULT 0,
    officiel BOOLEAN DEFAULT FALSE,
    actif BOOLEAN DEFAULT TRUE
);

-- Create comments table
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE
);

-- Create likes table
CREATE TABLE public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Create uploads table
CREATE TABLE public.uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    nom_fichier TEXT NOT NULL,
    type_fichier TEXT NOT NULL CHECK (type_fichier IN ('pdf', 'image', 'video')),
    taille_fichier BIGINT NOT NULL,
    url_fichier TEXT NOT NULL,
    date_upload TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'nouveau_post', 'mention')),
    titre TEXT NOT NULL,
    message TEXT NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    lien TEXT
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view active posts" ON public.posts FOR SELECT USING (actif = true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = auteur_id);

CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage likes" ON public.likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view uploads" ON public.uploads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage uploads" ON public.uploads FOR ALL USING (
    EXISTS (SELECT 1 FROM public.posts WHERE posts.id = uploads.post_id AND posts.auteur_id = auth.uid())
);

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
```

#### Configurer l'authentification
1. Dans le tableau de bord Supabase, aller dans Authentication > Settings
2. Configurer les URLs de redirection
3. Activer les providers email (requis)

#### Configurer le stockage
1. Créer un bucket `uploads` dans Storage
2. Configurer les policies pour permettre l'upload aux utilisateurs authentifiés

### 5. Lancer l'application
```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 📱 Utilisation

### Pour les étudiants
1. **S'inscrire** : Créer un compte avec email/mot de passe
2. **Explorer** : Parcourir les cours par chapitre ou type
3. **Participer** : Liker, commenter et partager les contenus
4. **Rechercher** : Utiliser la barre de recherche pour trouver des sujets spécifiques

### Pour les administrateurs
1. Se connecter avec un compte admin
2. Accéder au tableau de bord admin via le menu
3. Créer du contenu avec l'éditeur intégré (support LaTeX)
4. Gérer les utilisateurs et modérer les commentaires

## 🌐 Déploiement

### Vercel (Recommandé)
1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement dans Vercel
3. Déployer automatiquement

### Netlify
1. Construire l'application : `npm run build`
2. Déployer le dossier `out/` sur Netlify

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint

# Type checking
npm run type-check
```

## 🗂️ Structure du projet

```
math-mastery/
├── src/
│   ├── app/                 # Pages App Router
│   ├── components/          # Composants réutilisables
│   │   ├── ui/             # Composants UI de base
│   │   ├── layout/         # Layout components
│   │   ├── posts/          # Composants liés aux posts
│   │   └── comments/       # Composants de commentaires
│   ├── contexts/           # Contextes React
│   ├── lib/                # Utilitaires et configuration
│   ├── types/              # Types TypeScript
│   └── styles/             # Styles globaux
├── public/                 # Assets statiques
└── README.md
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- 📧 Email : contact@mathmastery.ma
- 💬 Discussions GitHub
- 📚 Documentation : [Wiki du projet]

## 🙏 Remerciements

- 🇲🇦 Ministère de l'Éducation Nationale du Maroc pour le programme officiel
- 👨‍🏫 Tous les professeurs qui contribuent au contenu
- 🎓 La communauté d'étudiants pour leurs retours
- 🛠️ Les maintainers des librairies open-source utilisées

---

**Math Mastery** - *"Les mathématiques sont la clé qui ouvre la porte de l'univers."* - Galilée
