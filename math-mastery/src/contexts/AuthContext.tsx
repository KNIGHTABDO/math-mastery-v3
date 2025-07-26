'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, userData: { nom: string, prenom: string }) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateUser: (userData: Partial<AuthUser>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user)
      }
      setLoading(false)
    }

    getSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          nom: profile.nom,
          prenom: profile.prenom,
          role: profile.role
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error: error as Error | null }
    } catch (error) {
      return { error: error as Error | null }
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    userData: { nom: string, prenom: string }
  ) => {
    try {
      console.log('Début de l\'inscription pour:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nom: userData.nom,
            prenom: userData.prenom
          }
        }
      })

      console.log('Réponse de Supabase auth.signUp:', { data, error })

      if (error) {
        console.error('Erreur lors de l\'inscription:', error)
        return { error: error as Error | null }
      }

      if (data.user) {
        console.log('Utilisateur créé dans Auth:', data.user.id)
        
        // Créer le profil utilisateur via API route pour contourner RLS
        try {
          console.log('Création du profil utilisateur...')
          const response = await fetch('/api/users/create-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              nom: userData.nom,
              prenom: userData.prenom,
              role: 'utilisateur',
              date_inscription: new Date().toISOString()
            })
          })

          console.log('Réponse de l\'API create-profile:', response.status)

          if (!response.ok) {
            const errorData = await response.json()
            console.error('Erreur lors de la création du profil:', errorData)
            return { error: new Error(errorData.message || 'Erreur lors de la création du profil') }
          }

          const profileData = await response.json()
          console.log('Profil créé avec succès:', profileData)
          
          // Si l'email n'est pas confirmé automatiquement, informer l'utilisateur
          if (!data.session) {
            console.log('Aucune session créée - email de confirmation probablement envoyé')
          }
          
        } catch (profileError) {
          console.error('Erreur lors de la création du profil:', profileError)
          return { error: new Error('Erreur lors de la création du profil') }
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Erreur générale lors de l\'inscription:', error)
      return { error: error as Error | null }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateUser = async (userData: Partial<AuthUser>) => {
    if (!user) return { error: new Error('Utilisateur non connecté') }

    try {
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id)

      if (!error) {
        setUser({ ...user, ...userData })
      }

      return { error: error as Error | null }
    } catch (error) {
      return { error: error as Error | null }
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}