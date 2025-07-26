'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Search, 
  Filter, 
  BookOpen, 
  FileText,
  Users
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PostCard from '@/components/posts/PostCard'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { PostWithAuthor } from '@/types'

const ExplorerPage: React.FC = () => {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    chapitre: searchParams.get('chapitre') || '',
    sortBy: 'date_creation'
  })

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      try {
        let query = supabase
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

      // Appliquer les filtres
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.chapitre) {
        query = query.eq('chapitre', filters.chapitre)
      }

      // Appliquer le tri
      if (filters.sortBy === 'likes_count') {
        query = query.order('likes_count', { ascending: false })
      } else if (filters.sortBy === 'vues_count') {
        query = query.order('vues_count', { ascending: false })
      } else {
        query = query.order('date_creation', { ascending: false })
      }

      const { data, error } = await query.limit(20)

      if (error) throw error

      // Transformer les données et vérifier les likes
      const transformedPosts: PostWithAuthor[] = []
      for (const post of data || []) {
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

      setPosts(transformedPosts)
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error)
    } finally {
      setLoading(false)
    }
    }

    loadPosts()
  }, [filters, user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implémenter la recherche textuelle
    window.location.reload()
  }

  const handleLikePost = async (postId: string) => {
    if (!user) return

    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id)

        const currentPost = posts.find(p => p.id === postId)
        if (currentPost) {
          await supabase
            .from('posts')
            .update({ likes_count: Math.max(0, currentPost.likes_count - 1) })
            .eq('id', postId)
        }
      } else {
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: postId
          })

        const currentPost = posts.find(p => p.id === postId)
        if (currentPost) {
          await supabase
            .from('posts')
            .update({ likes_count: currentPost.likes_count + 1 })
            .eq('id', postId)
        }
      }

      window.location.reload()
    } catch (error) {
      console.error('Erreur lors du like:', error)
    }
  }

  const chapitres = [
    { key: '', name: 'Tous les chapitres' },
    { key: 'analyse', name: 'Analyse' },
    { key: 'algebre', name: 'Algèbre' },
    { key: 'geometrie', name: 'Géométrie' },
    { key: 'probabilites', name: 'Probabilités' }
  ]

  const types = [
    { key: '', name: 'Tous les types' },
    { key: 'cours', name: 'Cours' },
    { key: 'exercice', name: 'Exercices' },
    { key: 'quiz', name: 'Quiz' },
    { key: 'video', name: 'Vidéos' }
  ]

  const sortOptions = [
    { key: 'date_creation', name: 'Plus récents' },
    { key: 'likes_count', name: 'Plus aimés' },
    { key: 'vues_count', name: 'Plus vus' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Explorer les contenus
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez les cours, exercices et quiz créés par la communauté
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Rechercher des contenus..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
                <Button type="submit">
                  Rechercher
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chapitre
                  </label>
                  <select
                    value={filters.chapitre}
                    onChange={(e) => setFilters(prev => ({ ...prev, chapitre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {chapitres.map(chapitre => (
                      <option key={chapitre.key} value={chapitre.key}>
                        {chapitre.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {types.map(type => (
                      <option key={type.key} value={type.key}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trier par
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {sortOptions.map(option => (
                      <option key={option.key} value={option.key}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFilters({ type: '', chapitre: '', sortBy: 'date_creation' })
                      setSearchTerm('')
                    }}
                    className="w-full"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {posts.filter(p => p.type === 'cours').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cours disponibles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {posts.filter(p => p.type === 'exercice').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Exercices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600 mr-4" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(posts.map(p => p.auteur_id)).size}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contributeurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun contenu trouvé
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Essayez de modifier vos filtres ou votre terme de recherche
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLikePost(post.id)}
                onComment={() => window.open(`/posts/${post.id}`, '_blank')}
                onShare={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`)
                }}
              />
            ))
          )}
        </div>

        {/* Load More */}
        {!loading && posts.length > 0 && posts.length % 20 === 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Charger plus de contenus
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExplorerPage
