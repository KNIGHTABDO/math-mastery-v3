export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nom: string
          prenom: string
          role: 'utilisateur' | 'admin'
          photo_profil?: string
          bio?: string
          date_inscription: string
          derniere_connexion?: string
        }
        Insert: {
          id: string
          email: string
          nom: string
          prenom: string
          role?: 'utilisateur' | 'admin'
          photo_profil?: string
          bio?: string
          date_inscription?: string
          derniere_connexion?: string
        }
        Update: {
          id?: string
          email?: string
          nom?: string
          prenom?: string
          role?: 'utilisateur' | 'admin'
          photo_profil?: string
          bio?: string
          date_inscription?: string
          derniere_connexion?: string
        }
      }
      posts: {
        Row: {
          id: string
          titre: string
          contenu: string
          type: 'cours' | 'exercice' | 'quiz' | 'video'
          tags: string[]
          chapitre: 'analyse' | 'algebre' | 'geometrie' | 'probabilites'
          auteur_id: string
          date_creation: string
          date_modification?: string
          likes_count: number
          vues_count: number
          partages_count: number
          officiel: boolean
          actif: boolean
        }
        Insert: {
          id?: string
          titre: string
          contenu: string
          type: 'cours' | 'exercice' | 'quiz' | 'video'
          tags?: string[]
          chapitre: 'analyse' | 'algebre' | 'geometrie' | 'probabilites'
          auteur_id: string
          date_creation?: string
          date_modification?: string
          likes_count?: number
          vues_count?: number
          partages_count?: number
          officiel?: boolean
          actif?: boolean
        }
        Update: {
          id?: string
          titre?: string
          contenu?: string
          type?: 'cours' | 'exercice' | 'quiz' | 'video'
          tags?: string[]
          chapitre?: 'analyse' | 'algebre' | 'geometrie' | 'probabilites'
          auteur_id?: string
          date_creation?: string
          date_modification?: string
          likes_count?: number
          vues_count?: number
          partages_count?: number
          officiel?: boolean
          actif?: boolean
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          contenu: string
          date_creation: string
          parent_id?: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          contenu: string
          date_creation?: string
          parent_id?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          contenu?: string
          date_creation?: string
          parent_id?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          date_creation: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          date_creation?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          date_creation?: string
        }
      }
      uploads: {
        Row: {
          id: string
          post_id: string
          nom_fichier: string
          type_fichier: 'pdf' | 'image' | 'video'
          taille_fichier: number
          url_fichier: string
          date_upload: string
        }
        Insert: {
          id?: string
          post_id: string
          nom_fichier: string
          type_fichier: 'pdf' | 'image' | 'video'
          taille_fichier: number
          url_fichier: string
          date_upload?: string
        }
        Update: {
          id?: string
          post_id?: string
          nom_fichier?: string
          type_fichier?: 'pdf' | 'image' | 'video'
          taille_fichier?: number
          url_fichier?: string
          date_upload?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'like' | 'comment' | 'nouveau_post' | 'mention'
          titre: string
          message: string
          lu: boolean
          date_creation: string
          lien?: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'like' | 'comment' | 'nouveau_post' | 'mention'
          titre: string
          message: string
          lu?: boolean
          date_creation?: string
          lien?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'like' | 'comment' | 'nouveau_post' | 'mention'
          titre?: string
          message?: string
          lu?: boolean
          date_creation?: string
          lien?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'utilisateur' | 'admin'
      post_type: 'cours' | 'exercice' | 'quiz' | 'video'
      chapitre_type: 'analyse' | 'algebre' | 'geometrie' | 'probabilites'
      file_type: 'pdf' | 'image' | 'video'
      notification_type: 'like' | 'comment' | 'nouveau_post' | 'mention'
    }
  }
}