'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
import { formatRelativeTime, getChapterColor, getTypeIcon } from '@/lib/utils'
import { PostWithAuthor } from '@/types'
import ReactMarkdown from 'react-markdown'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

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

  const handleLike = async () => {
    if (isLiking || !onLike) return
    setIsLiking(true)
    await onLike()
    setIsLiking(false)
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

  const renderContent = (content: string) => {
    const components = {
      // Rendu des formules LaTeX inline  
      code: ({ inline, className, children, ...props }: any) => {
        if (inline && typeof children === 'string' && children.startsWith('$') && children.endsWith('$')) {
          const formula = children.slice(1, -1)
          return <InlineMath math={formula} />
        }
        return <code className={className} {...props}>{children}</code>
      },
      // Rendu des blocs de formules LaTeX
      pre: ({ children }: any) => {
        const child = React.Children.only(children)
        if (React.isValidElement(child) && 
            typeof child.props === 'object' && 
            child.props !== null && 
            'children' in child.props) {
          const content = (child.props as { children: unknown }).children
          if (typeof content === 'string' && content.startsWith('$$') && content.endsWith('$$')) {
            const formula = content.slice(2, -2)
            return <BlockMath math={formula} />
          }
        }
        return <pre>{children}</pre>
      }
    }

    return (
      <ReactMarkdown components={components}>
        {showFullContent ? content : truncateText(content, 300)}
      </ReactMarkdown>
    )
  }

  return (
    <Card variant="elevated" className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar utilisateur */}
            <div className="flex-shrink-0">
              {post.users.photo_profil ? (
                <img
                  src={post.users.photo_profil}
                  alt={`${post.users.prenom} ${post.users.nom}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {getInitials(post.users.prenom, post.users.nom)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {post.users.prenom} {post.users.nom}
                </h3>
                {post.officiel && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{formatRelativeTime(post.date_creation)}</span>
                <span>•</span>
                <Eye className="h-3 w-3" />
                <span>{post.vues_count} vues</span>
              </div>
            </div>
          </div>

          {/* Type et chapitre */}
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
              {getTypeIconComponent(post.type)}
              <span className="text-xs font-medium">{getTypeIcon(post.type)}</span>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChapterColor(post.chapitre)}`}>
              {post.chapitre}
            </span>
          </div>
        </div>

        {/* Titre */}
        <Link 
          href={`/posts/${post.id}`}
          className="block mt-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {post.titre}
          </h2>
        </Link>
      </CardHeader>

      <CardContent>
        {/* Contenu */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {renderContent(post.contenu)}
        </div>

        {!showFullContent && post.contenu.length > 300 && (
          <Link 
            href={`/posts/${post.id}`}
            className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Lire la suite →
          </Link>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag, index) => (
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
        {post.uploads && post.uploads.length > 0 && (
          <div className="mt-3 space-y-2">
            {post.uploads.map((upload) => (
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
                post.isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart 
                className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} 
              />
              <span>{post.likes_count}</span>
            </Button>

            {/* Commentaires */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onComment}
              className="text-gray-500 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{post.comments?.length || 0}</span>
            </Button>

            {/* Partage */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="text-gray-500 hover:text-green-500"
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span>{post.partages_count}</span>
            </Button>
          </div>

          {/* Lien vers le post complet */}
          {!showFullContent && (
            <Link href={`/posts/${post.id}`}>
              <Button variant="outline" size="sm">
                Voir le post
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default PostCard