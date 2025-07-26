'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  BookOpen, 
  FileText, 
  Video, 
  HelpCircle,
  Eye,
  Calendar,
  Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatRelativeTime, getChapterColor, getTypeIcon, getInitials, getDifficultyColor, formatTimeLimit } from '@/lib/utils'
import { PostWithAuthor } from '@/types'
import ShareModal from './ShareModal'
import PostContent from './PostContent'
import { supabase } from '@/lib/supabase'

interface PostCardProps {
  post: PostWithAuthor
  showFullContent?: boolean
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  showFullContent = false,
  onLike,
  onComment,
  onShare
}) => {
  const [isLiking, setIsLiking] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [localPost, setLocalPost] = useState(post)

  // Sync localPost with post prop when it changes
  React.useEffect(() => {
    setLocalPost(post)
  }, [post])

  const handleLike = async () => {
    if (isLiking || !onLike) return
    setIsLiking(true)
    await onLike()
    setIsLiking(false)
  }

  const handleShare = async () => {
    try {
      // Ouvrir le modal de partage
      setIsShareModalOpen(true)
      
      // Incrémenter le compteur de partages
      await supabase
        .from('posts')
        .update({ partages_count: localPost.partages_count + 1 })
        .eq('id', post.id)
      
      // Mettre à jour l'état local
      setLocalPost(prev => ({
        ...prev,
        partages_count: prev.partages_count + 1
      }))
      
      // Appeler la fonction onShare si fournie
      if (onShare) {
        onShare()
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error)
    }
  }

  const getTypeIconComponent = (type: string) => {
    switch (type) {
      case 'cours':
        return <BookOpen className="h-4 w-4" />
      case 'exercice':
        return <FileText className="h-4 w-4" />
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Card variant="elevated" className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar utilisateur */}
            <div className="flex-shrink-0">
              {localPost.users.photo_profil ? (
                <Image
                  src={localPost.users.photo_profil}
                  alt={`${localPost.users.prenom} ${localPost.users.nom}`}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {getInitials(localPost.users.prenom, localPost.users.nom)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {localPost.users.prenom} {localPost.users.nom}
                </h3>
                {localPost.officiel && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{formatRelativeTime(localPost.date_creation)}</span>
                <span>•</span>
                <Eye className="h-3 w-3" />
                <span>{localPost.vues_count} vues</span>
              </div>
            </div>
          </div>

          {/* Type et chapitre */}
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
              {getTypeIconComponent(localPost.type)}
              <span className="text-xs font-medium">{getTypeIcon(localPost.type)}</span>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChapterColor(localPost.chapitre)}`}>
              {localPost.chapitre}
            </span>
            
            {/* Afficher la difficulté pour les exercices et quiz */}
            {(localPost.type === 'exercice' || localPost.type === 'quiz') && localPost.difficulty && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(localPost.difficulty)}`}>
                {localPost.difficulty}
              </span>
            )}
            
            {/* Afficher la durée pour les quiz */}
            {localPost.type === 'quiz' && localPost.time_limit && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                ⏱️ {formatTimeLimit(localPost.time_limit)}
              </span>
            )}
          </div>
        </div>

        {/* Titre */}
        <Link 
          href={`/posts/${localPost.id}`}
          className="block mt-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {localPost.titre}
          </h2>
        </Link>
      </CardHeader>

      <CardContent>
        {/* Contenu */}
        <PostContent
          post={{
            id: localPost.id,
            type: localPost.type,
            contenu: localPost.contenu,
            video_url: localPost.video_url,
            difficulty: localPost.difficulty,
            time_limit: localPost.time_limit,
            questions: localPost.questions
          }}
          showFullContent={showFullContent}
        />

        {!showFullContent && localPost.contenu.length > 300 && (
          <Link 
            href={`/posts/${localPost.id}`}
            className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Lire la suite →
          </Link>
        )}

        {/* Tags */}
        {localPost.tags && localPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {localPost.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Pièces jointes */}
        {localPost.uploads && localPost.uploads.length > 0 && (
          <div className="mt-3 space-y-2">
            {localPost.uploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {upload.nom_fichier}
                </span>
                <span className="text-xs text-gray-500">
                  ({upload.type_fichier.toUpperCase()})
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            {/* Like */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              loading={isLiking}
              className={`text-gray-500 hover:text-red-500 ${
                localPost.isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart 
                className={`h-4 w-4 mr-1 ${localPost.isLiked ? 'fill-current' : ''}`} 
              />
              <span>{localPost.likes_count}</span>
            </Button>

            {/* Commentaires */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onComment}
              className="text-gray-500 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{localPost.comments?.length || 0}</span>
            </Button>

            {/* Partage */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-500 hover:text-green-500"
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span>{localPost.partages_count}</span>
            </Button>
          </div>

          {/* Lien vers le post complet */}
          {!showFullContent && (
            <Link href={`/posts/${localPost.id}`}>
              <Button variant="outline" size="sm">
                Voir le post
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={localPost}
      />
    </Card>
  )
}

export default PostCard