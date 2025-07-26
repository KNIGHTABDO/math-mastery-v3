'use client'

import React, { useState } from 'react'
import { 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  MessageCircle,
  Check,
  ExternalLink
} from 'lucide-react'
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PostWithAuthor } from '@/types'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  post: PostWithAuthor
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, post }) => {
  const [copied, setCopied] = useState(false)
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const postUrl = `${baseUrl}/posts/${post.id}`
  const encodedUrl = encodeURIComponent(postUrl)
  const encodedTitle = encodeURIComponent(post.titre)
  const encodedText = encodeURIComponent(`Découvrez ce ${post.type} sur Math Mastery : ${post.titre}`)

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'text-blue-600 hover:text-blue-700',
      bgColor: 'hover:bg-blue-50'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      color: 'text-sky-500 hover:text-sky-600',
      bgColor: 'hover:bg-sky-50'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'text-blue-700 hover:text-blue-800',
      bgColor: 'hover:bg-blue-50'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: 'text-green-600 hover:text-green-700',
      bgColor: 'hover:bg-green-50'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
      color: 'text-gray-600 hover:text-gray-700',
      bgColor: 'hover:bg-gray-50'
    }
  ]

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  const handleShareClick = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Partager cette publication"
      size="md"
    >
      <ModalContent className="space-y-6">
        {/* Aperçu du post */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {post.type}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 capitalize">
              {post.chapitre}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
            {post.titre}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Par {post.users.prenom} {post.users.nom}
          </p>
        </div>

        {/* Copier le lien */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lien de la publication
          </label>
          <div className="flex items-center space-x-2">
            <Input
              value={postUrl}
              readOnly
              className="flex-1 font-mono text-sm"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className={copied ? 'text-green-600' : ''}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copier
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Partage sur les réseaux sociaux */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Partager sur les réseaux sociaux
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {shareLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleShareClick(link.url)}
                className={`flex items-center justify-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${link.bgColor} ${link.color}`}
              >
                <link.icon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">{link.name}</span>
                <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
              </button>
            ))}
          </div>
        </div>

        {/* QR Code section (optionnel) */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Le partage de cette publication aide à faire grandir la communauté Math Mastery
          </p>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ShareModal
