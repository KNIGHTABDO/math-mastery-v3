'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  MessageCircle, 
  Send,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PostCard from '@/components/posts/PostCard'
import CommentSection from '@/components/comments/CommentSection'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { PostWithAuthor, CommentWithUser } from '@/types'

const PostPage: React.FC = () => {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [post, setPost] = useState<PostWithAuthor | null>(null)
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commenting, setCommenting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadComments = async () => {
      try {
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            users (
              id,
              nom,
              prenom,
              photo_profil,
              role
            )
          `)
          .eq('post_id', id)
          .is('parent_id', null)
          .order('date_creation', { ascending: true })

        if (commentsError) throw commentsError

        // Charger les réponses pour chaque commentaire
        const commentsWithReplies: CommentWithUser[] = []
        for (const comment of commentsData || []) {
          const { data: replies, error: repliesError } = await supabase
            .from('comments')
            .select(`
              *,
              users (
                id,
                nom,
                prenom,
                photo_profil,
                role
              )
            `)
            .eq('parent_id', comment.id)
            .order('date_creation', { ascending: true })

          if (repliesError) throw repliesError

          commentsWithReplies.push({
            ...comment,
            replies: replies || []
          })
        }

        setComments(commentsWithReplies)
      } catch (error) {
        console.error('Erreur lors du chargement des commentaires:', error)
      }
    }

    const loadData = async () => {
      if (id) {
        try {
          // Charger le post
          const { data: postData, error: postError } = await supabase
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
              uploads (*)
            `)
            .eq('id', id)
            .eq('actif', true)
            .single()

          if (postError) throw postError

          // Vérifier si l'utilisateur a liké ce post
          let isLiked = false
          if (user) {
            const { data: likeData } = await supabase
              .from('likes')
              .select('id')
              .eq('user_id', user.id)
              .eq('post_id', id)
              .single()
            isLiked = !!likeData
          }

          const postWithState = {
            ...postData,
            uploads: postData.uploads || [],
            comments: [],
            isLiked
          }

          setPost(postWithState)

          // Incrémenter le compteur de vues
          if (typeof id === 'string') {
            await supabase
              .from('posts')
              .update({ vues_count: postData.vues_count + 1 })
              .eq('id', id)
          }

          // Charger les commentaires
          await loadComments()
        } catch (error) {
          console.error('Erreur lors du chargement du post:', error)
          setError('Post introuvable')
        } finally {
          setLoading(false)
        }
      }
    }

    loadData()
  }, [id, user])

  const loadComments = async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            id,
            nom,
            prenom,
            photo_profil,
            role
          )
        `)
        .eq('post_id', id)
        .is('parent_id', null)
        .order('date_creation', { ascending: true })

      if (commentsError) throw commentsError

      // Charger les réponses pour chaque commentaire
      const commentsWithReplies: CommentWithUser[] = []
      for (const comment of commentsData || []) {
        const { data: replies, error: repliesError } = await supabase
          .from('comments')
          .select(`
            *,
            users (
              id,
              nom,
              prenom,
              photo_profil,
              role
            )
          `)
          .eq('parent_id', comment.id)
          .order('date_creation', { ascending: true })

        if (repliesError) throw repliesError

        commentsWithReplies.push({
          ...comment,
          replies: replies || []
        })
      }

      setComments(commentsWithReplies)
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error)
    }
  }

  const handleAddComment = async (comment: { contenu: string, post_id: string, parent_id?: string }) => {
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          contenu: comment.contenu,
          post_id: comment.post_id,
          parent_id: comment.parent_id,
          user_id: user?.id
        })

      if (error) throw error
      
      // Reload comments
      loadComments()
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error)
    }
  }

  const handleLike = async () => {
    if (!user || !post) return

    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .single()

      if (existingLike) {
        // Supprimer le like
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id)

        await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq('id', post.id)

        setPost(prev => prev ? {
          ...prev,
          likes_count: prev.likes_count - 1,
          isLiked: false
        } : null)
      } else {
        // Ajouter un like
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: post.id
          })

        await supabase
          .from('posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', post.id)

        setPost(prev => prev ? {
          ...prev,
          likes_count: prev.likes_count + 1,
          isLiked: true
        } : null)
      }
    } catch (error) {
      console.error('Erreur lors du like:', error)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !post || !newComment.trim()) return

    setCommenting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          contenu: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      await loadComments()
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error)
    } finally {
      setCommenting(false)
    }
  }

  const handleShare = async () => {
    try {
      // Incrémenter le compteur de partages
      if (post) {
        await supabase
          .from('posts')
          .update({ partages_count: post.partages_count + 1 })
          .eq('id', post.id)
        
        setPost(prev => prev ? {
          ...prev,
          partages_count: prev.partages_count + 1
        } : null)
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Post introuvable
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Ce post n&apos;existe pas ou a été supprimé.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Post Content */}
        <PostCard
          post={post}
          showFullContent={true}
          onLike={handleLike}
          onComment={() => {}}
          onShare={handleShare}
        />

        {/* Comments Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Commentaires ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment Form */}
            {authLoading ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
                <p className="text-gray-500 mt-2">Chargement...</p>
              </div>
            ) : user ? (
              <form onSubmit={handleComment} className="mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      className="mb-3"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        loading={commenting}
                        disabled={!newComment.trim()}
                      >
                        {commenting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Commenter
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Connectez-vous pour participer à la discussion
                </p>
                <Button onClick={() => router.push('/connexion')}>
                  Se connecter
                </Button>
              </div>
            )}

            {/* Comments List */}
            <CommentSection
              comments={comments}
              postId={post.id}
              onAddComment={handleAddComment}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PostPage
