'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Calculator,
  Target,
  Award,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PostCard from '@/components/posts/PostCard'
import { PostWithAuthor } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const HomePage: React.FC = () => {
  const { user } = useAuth()
  const [recentPosts, setRecentPosts] = useState<PostWithAuthor[]>([])
  const [stats, setStats] = useState({
    total_users: 0,
    total_posts: 0,
    total_comments: 0,
    success_rate: 94
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les posts récents
        const { data: postsData, error: postsError } = await supabase
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
        .eq('actif', true)
        .order('date_creation', { ascending: false })
        .limit(4)

      if (postsError) throw postsError

      // Transformer les données et vérifier les likes
      const transformedPosts: PostWithAuthor[] = []
      for (const post of postsData || []) {
        let isLiked = false
        if (user) {
          const { data: likeData } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', post.id)
            .single()
          isLiked = !!likeData
        }

        transformedPosts.push({
          ...post,
          comments: post.comments || [],
          uploads: post.uploads || [],
          isLiked
        })
      }

      setRecentPosts(transformedPosts)

      // Charger les statistiques
      const [usersCount, postsCount, commentsCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('posts').select('*', { count: 'exact' }).eq('actif', true),
        supabase.from('comments').select('*', { count: 'exact' })
      ])

      setStats({
        total_users: usersCount.count || 0,
        total_posts: postsCount.count || 0,
        total_comments: commentsCount.count || 0,
        success_rate: 94
      })

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
    }

    loadData()
  }, [user])

  const handleLikePost = async (postId: string) => {
    if (!user) return

    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

      const currentPost = recentPosts.find(p => p.id === postId)
      if (!currentPost) return

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id)

        await supabase
          .from('posts')
          .update({ likes_count: currentPost.likes_count - 1 })
          .eq('id', postId)
      } else {
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: postId
          })

        await supabase
          .from('posts')
          .update({ likes_count: currentPost.likes_count + 1 })
          .eq('id', postId)
      }

      // Reload data to refresh the posts
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors du like:', error)
    }
  }

  const displayStats = [
    { label: 'Étudiants actifs', value: stats.total_users.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Cours disponibles', value: stats.total_posts.toString(), icon: BookOpen, color: 'text-green-600' },
    { label: 'Commentaires', value: stats.total_comments.toString(), icon: Calculator, color: 'text-purple-600' },
    { label: 'Taux de réussite', value: `${stats.success_rate}%`, icon: TrendingUp, color: 'text-orange-600' }
  ]

  const features = [
    {
      icon: BookOpen,
      title: 'Cours complets',
      description: 'Accédez à des cours détaillés couvrant tout le programme 2BAC Sciences Mathématiques'
    },
    {
      icon: Calculator,
      title: 'Exercices interactifs',
      description: 'Pratiquez avec des exercices variés et des corrections détaillées'
    },
    {
      icon: Users,
      title: 'Communauté active',
      description: 'Échangez avec d\'autres étudiants et posez vos questions'
    },
    {
      icon: Award,
      title: 'Suivi des progrès',
      description: 'Suivez votre progression et identifiez vos points forts'
    }
  ]

  const chapters = [
    { key: 'analyse', name: 'Analyse', description: 'Fonctions, dérivées, intégrales', color: 'bg-blue-500' },
    { key: 'algebre', name: 'Algèbre', description: 'Nombres complexes, polynômes', color: 'bg-green-500' },
    { key: 'geometrie', name: 'Géométrie', description: 'Géométrie dans l\'espace', color: 'bg-purple-500' },
    { key: 'probabilites', name: 'Probabilités', description: 'Statistiques et probabilités', color: 'bg-orange-500' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Maîtrisez les{' '}
              <span className="text-yellow-300">Mathématiques</span>
              <br />
              du 2BAC
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Rejoignez la communauté d&apos;étudiants marocains en Sciences Mathématiques et Physiques. 
              Cours, exercices, quiz et entraide pour exceller au Baccalauréat.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Accéder au dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/inscription">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      Commencer gratuitement
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/connexion">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      Se connecter
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {loading ? '...' : stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapitres */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Programme 2BAC Sciences Mathématiques
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Explorez tous les chapitres du programme officiel
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {chapters.map((chapter) => (
              <Link key={chapter.key} href={`/explorer?chapitre=${chapter.key}`}>
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 ${chapter.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">
                      {chapter.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {chapter.description}
                    </p>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Voir les cours
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Posts récents */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Publications récentes
            </h2>
            <Link href="/explorer">
              <Button variant="outline">
                Voir tout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune publication encore
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Soyez le premier à partager du contenu avec la communauté !
                </p>
                {user && (
                  <Link href="/creer-post">
                    <Button>
                      Créer la première publication
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {recentPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => handleLikePost(post.id)}
                  onComment={() => window.open(`/posts/${post.id}`, '_blank')}
                  onShare={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi choisir Math Mastery ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Une plateforme conçue spécialement pour les étudiants marocains du 2BAC Sciences Mathématiques
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="py-16 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à exceller en mathématiques ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Rejoignez des milliers d&apos;étudiants qui ont choisi Math Mastery pour réussir leur 2BAC
            </p>
            <Link href="/inscription">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Créer mon compte gratuitement
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage
