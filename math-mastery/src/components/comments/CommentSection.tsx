'use client'

import React, { useState } from 'react'
import { MessageCircle, Reply, MoreVertical, Trash2, Edit } from 'lucide-react'
import { CommentWithUser, CommentForm } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface CommentSectionProps {
  postId: string
  comments: CommentWithUser[]
  onAddComment: (comment: CommentForm) => Promise<void>
  onDeleteComment?: (commentId: string) => Promise<void>
  onEditComment?: (commentId: string, content: string) => Promise<void>
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  onAddComment,
  onDeleteComment,
  onEditComment
}) => {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      await onAddComment({
        contenu: newComment,
        post_id: postId
      })
      setNewComment('')
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || !user || !replyTo) return

    setIsSubmitting(true)
    try {
      await onAddComment({
        contenu: replyContent,
        post_id: postId,
        parent_id: replyTo
      })
      setReplyContent('')
      setReplyTo(null)
    } catch (error) {
      console.error('Erreur lors de la réponse:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim() || !onEditComment) return

    try {
      await onEditComment(commentId, editContent)
      setEditingComment(null)
      setEditContent('')
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!onDeleteComment) return
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      try {
        await onDeleteComment(commentId)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const startEdit = (comment: CommentWithUser) => {
    setEditingComment(comment.id)
    setEditContent(comment.contenu)
  }

  const cancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
  }

  const renderComment = (comment: CommentWithUser, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <Card variant="outlined" padding="sm">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.users.photo_profil ? (
              <img
                src={comment.users.photo_profil}
                alt={`${comment.users.prenom} ${comment.users.nom}`}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-medium">
                {getInitials(comment.users.prenom, comment.users.nom)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.users.prenom} {comment.users.nom}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(comment.date_creation)}
                </span>
              </div>

              {/* Actions */}
              {user && (user.id === comment.user_id || user.role === 'admin') && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(comment)}
                    className="p-1 h-auto"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 h-auto text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className="mt-1">
              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleEdit(comment.id)}
                      disabled={!editContent.trim()}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={cancelEdit}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {comment.contenu}
                </p>
              )}
            </div>

            {/* Actions */}
            {!isReply && user && editingComment !== comment.id && (
              <div className="flex items-center space-x-4 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="text-xs text-gray-500 hover:text-blue-500"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Répondre
                </Button>
              </div>
            )}

            {/* Formulaire de réponse */}
            {replyTo === comment.id && (
              <form onSubmit={handleReply} className="mt-3">
                <div className="space-y-2">
                  <Input
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Écrivez votre réponse..."
                    className="text-sm"
                  />
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="submit" 
                      size="sm" 
                      loading={isSubmitting}
                      disabled={!replyContent.trim()}
                    >
                      Répondre
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setReplyTo(null)
                        setReplyContent('')
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </Card>

      {/* Réponses */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  // Séparer les commentaires principaux des réponses
  const mainComments = comments.filter(comment => !comment.parent_id)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Commentaires ({mainComments.length})
        </h3>
      </div>

      {/* Formulaire de nouveau commentaire */}
      {user ? (
        <Card variant="outlined" padding="sm">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {user.role ? (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                ) : null}
              </div>
              <div className="flex-1">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Écrivez votre commentaire..."
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="sm" 
                loading={isSubmitting}
                disabled={!newComment.trim()}
              >
                Commenter
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card variant="outlined" padding="sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Connectez-vous pour participer à la discussion
          </p>
        </Card>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {mainComments.length > 0 ? (
          mainComments.map(comment => renderComment(comment))
        ) : (
          <Card variant="outlined" padding="lg">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun commentaire pour le moment</p>
              <p className="text-sm mt-1">Soyez le premier à commenter !</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CommentSection