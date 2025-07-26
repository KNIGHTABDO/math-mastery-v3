import { Database } from './database'

// Types dérivés de la base de données
export type User = Database['public']['Tables']['users']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type Upload = Database['public']['Tables']['uploads']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Types pour les formulaires
export type CreateUser = Database['public']['Tables']['users']['Insert']
export type CreatePost = Database['public']['Tables']['posts']['Insert']
export type CreateComment = Database['public']['Tables']['comments']['Insert']
export type CreateUpload = Database['public']['Tables']['uploads']['Insert']

// Types étendus avec relations
export interface PostWithAuthor extends Post {
  users: User
  uploads?: Upload[]
  comments?: CommentWithUser[]
  isLiked?: boolean
}

export interface CommentWithUser extends Comment {
  users: User
  replies?: CommentWithUser[]
}

export interface UserWithStats extends User {
  posts_count?: number
  comments_count?: number
  likes_received?: number
}

// Types pour l'authentification
export interface AuthUser {
  id: string
  email: string
  role: 'utilisateur' | 'admin'
}

// Types pour les formulaires
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  nom: string
  prenom: string
}

export interface PostForm {
  titre: string
  contenu: string
  type: 'cours' | 'exercice' | 'quiz' | 'video'
  chapitre: 'analyse' | 'algebre' | 'geometrie' | 'probabilites'
  tags: string[]
  files?: File[]
}

export interface CommentForm {
  contenu: string
  post_id: string
  parent_id?: string
}

// Types pour les filtres et recherche
export interface SearchFilters {
  query?: string
  type?: Post['type']
  chapitre?: Post['chapitre']
  tags?: string[]
  author?: string
  sortBy?: 'date' | 'likes' | 'vues'
  sortOrder?: 'asc' | 'desc'
}

// Types pour les statistiques
export interface AdminStats {
  total_users: number
  total_posts: number
  total_comments: number
  total_likes: number
  new_users_this_month: number
  popular_posts: PostWithAuthor[]
  recent_activity: {
    type: 'post' | 'comment' | 'like'
    data: any
    date: string
  }[]
}

// Types pour les thèmes
export type Theme = 'light' | 'dark'

// Types pour les notifications
export interface NotificationWithData extends Notification {
  post?: Post
  user?: User
}

// Types pour l'état global
export interface AppState {
  user: AuthUser | null
  theme: Theme
  loading: boolean
  notifications: NotificationWithData[]
}

// Types pour les erreurs
export interface AppError {
  message: string
  code?: string
  details?: any
}

// Constants
export const CHAPITRES = {
  analyse: 'Analyse',
  algebre: 'Algèbre', 
  geometrie: 'Géométrie',
  probabilites: 'Probabilités'
} as const

export const POST_TYPES = {
  cours: 'Cours',
  exercice: 'Exercice',
  quiz: 'Quiz',
  video: 'Vidéo'
} as const

export const FILE_TYPES = {
  pdf: 'PDF',
  image: 'Image',
  video: 'Vidéo'
} as const