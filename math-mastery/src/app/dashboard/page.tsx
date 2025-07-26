'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  TrendingUp, 
  Users, 
  Heart,
  MessageCircle,
  PlusCircle,
  Calendar,
  Award,
  Clock,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PostCard from '@/components/posts/PostCard'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { PostWithAuthor } from '@/types'

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [stats, setStats] = useState({
    posts_count: 0,
    likes_received: 0,
    comments_count: 0,
    views_count: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/connexion')
      return
    }

    if (user) {
      const loadDashboardData = async () => {
        if (!user) return

        try {
          // Charger les posts récents de l'utilisateur
          const { data: userPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          users (
            id,
            email,
            nom,
            prenom,
            role,
            photo_profil,
            bio,
            date_inscription
          ),
          uploads (*),
          comments (
            id,
            contenu,
            date_creation,
            users (nom, prenom)
          )
        `)
        .eq('auteur_id', user.id)
        .eq('actif', true)
        .order('date_creation', { ascending: false })
        .limit(5)

      if (postsError) throw postsError

      // Transformer les données pour correspondre au type PostWithAuthor
      const transformedPosts: PostWithAuthor[] = userPosts?.map(post => ({
        ...post,
        comments: post.comments || [],
        uploads: post.uploads || [],
        isLiked: false // On vérifiera plus tard si l'utilisateur a liké
      })) || []

      setPosts(transformedPosts)

      // Charger les statistiques utilisateur
      const { data: userStats, error: statsError } = await supabase
        .from('posts')
        .select('id, likes_count, vues_count, auteur_id')
        .eq('auteur_id', user.id)
        .eq('actif', true)

      if (statsError) throw statsError

      // Calculer les statistiques
      const totalLikes = userStats?.reduce((sum, post) => sum + post.likes_count, 0) || 0
      const totalViews = userStats?.reduce((sum, post) => sum + post.vues_count, 0) || 0

      // Compter les commentaires
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      setStats({
        posts_count: userStats?.length || 0,
        likes_received: totalLikes,
        comments_count: commentsCount || 0,
        views_count: totalViews
      })

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
      }

      loadDashboardData()
    }
  }, [user, authLoading, router])

  const handleLikePost = async (postId: string) => {
    if (!user) return

    try {
      // Vérifier si l'utilisateur a déjà liké ce post
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

      if (existingLike) {
        // Supprimer le like
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id)

        // Décrémenter le compteur
        const currentPost = posts.find(p => p.id === postId)
        if (currentPost) {
          await supabase
            .from('posts')
            .update({ likes_count: Math.max(0, currentPost.likes_count - 1) })
            .eq('id', postId)
        }
      } else {
        // Ajouter un like
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: postId
          })

        // Incrémenter le compteur
        const currentPost = posts.find(p => p.id === postId)
        if (currentPost) {
          await supabase
            .from('posts')
            .update({ likes_count: currentPost.likes_count + 1 })
            .eq('id', postId)
        }
      }

      // Recharger les données
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors du like:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bienvenue, {user.email.split('@')[0]} !
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Voici un aperçu de votre activité sur Math Mastery
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Mes publications
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.posts_count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Likes reçus
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.likes_received}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Mes commentaires
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.comments_count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total vues
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.views_count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" />
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/creer-post">
                <Button className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Créer un post
                </Button>
              </Link>
              <Link href="/explorer">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Explorer les cours
                </Button>
              </Link>
              <Link href="/communaute">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Voir la communauté
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Dernière connexion: Aujourd&apos;hui
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Award className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Membre depuis: {new Date(user.id).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Publications</span>
                    <span>{stats.posts_count}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((stats.posts_count / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Engagement</span>
                    <span>{stats.likes_received}/50</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((stats.likes_received / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mes publications récentes</CardTitle>
              <Link href="/mes-posts">
                <Button variant="outline" size="sm">
                  Voir tout
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune publication
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Vous n&apos;avez pas encore créé de publication. Commencez dès maintenant !
                </p>
                <Link href="/creer-post">
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Créer ma première publication
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={() => handleLikePost(post.id)}
                    onComment={() => router.push(`/posts/${post.id}`)}
                    onShare={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`)
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
