'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  FileText, 
  Video, 
  HelpCircle,
  Loader2,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface CreatePostForm {
  titre: string
  contenu: string
  type: 'cours' | 'exercice' | 'quiz' | 'video'
  chapitre: 'analyse' | 'algebre' | 'geometrie' | 'probabilites'
  tags: string
  // Champs spécifiques aux différents types
  videoUrl?: string // Pour les vidéos
  difficulty?: 'facile' | 'moyen' | 'difficile' // Pour exercices et quiz
  timeLimit?: number // Pour quiz (en minutes)
  questions?: QuizQuestion[] // Pour quiz
  attachments?: File[] // Pour tous types
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

const CreatePostPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<CreatePostForm>({
    titre: '',
    contenu: '',
    type: 'cours',
    chapitre: 'analyse',
    tags: '',
    videoUrl: '',
    difficulty: 'moyen',
    timeLimit: 15,
    questions: [],
    attachments: []
  })
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  React.useEffect(() => {
    if (!user) {
      router.push('/connexion')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.titre.trim() || !formData.contenu.trim()) {
        throw new Error('Le titre et le contenu sont obligatoires')
      }

      // Validation spécifique par type
      if (formData.type === 'video' && !formData.videoUrl?.trim()) {
        throw new Error('L\'URL de la vidéo est obligatoire pour ce type de publication')
      }

      if (formData.type === 'quiz' && (!formData.questions || formData.questions.length === 0)) {
        throw new Error('Au moins une question est obligatoire pour un quiz')
      }

      if (formData.type === 'quiz') {
        // Vérifier que toutes les questions sont complètes
        const incompleteQuestions = (formData.questions || []).filter(q => 
          !q.question.trim() || q.options.some(opt => !opt.trim())
        )
        if (incompleteQuestions.length > 0) {
          throw new Error('Toutes les questions doivent avoir un énoncé et toutes les options doivent être remplies')
        }
      }

      // Préparer les tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // Préparer les données spécifiques au type
      const typeSpecificData: Record<string, unknown> = {}
      
      if (formData.type === 'video') {
        typeSpecificData.video_url = formData.videoUrl
      }
      
      if (formData.type === 'exercice' || formData.type === 'quiz') {
        typeSpecificData.difficulty = formData.difficulty
      }
      
      if (formData.type === 'quiz') {
        typeSpecificData.time_limit = formData.timeLimit
        typeSpecificData.questions = formData.questions
      }

      // Créer le post
      const postData = {
        titre: formData.titre.trim(),
        contenu: formData.contenu.trim(),
        type: formData.type,
        chapitre: formData.chapitre,
        tags: tagsArray,
        auteur_id: user.id,
        officiel: user.role === 'admin',
        actif: true,
        likes_count: 0,
        vues_count: 0,
        partages_count: 0,
        ...typeSpecificData
      }

      const { data, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()

      if (postError) throw postError

      // Rediriger vers le post créé
      router.push(`/posts/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const renderMarkdown = (content: string) => {
    const components: Components = {
      code: (props) => {
        const { children } = props
        if (typeof children === 'string' && children.startsWith('$') && children.endsWith('$')) {
          const formula = children.slice(1, -1)
          return <InlineMath math={formula} />
        }
        return <code {...props}>{children}</code>
      },
      pre: ({ children }) => {
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

    return <ReactMarkdown components={components}>{content}</ReactMarkdown>
  }

  const types = [
    { value: 'cours', label: 'Cours', icon: BookOpen, description: 'Leçon théorique' },
    { value: 'exercice', label: 'Exercice', icon: FileText, description: 'Problème à résoudre' },
    { value: 'quiz', label: 'Quiz', icon: HelpCircle, description: 'Questions-réponses' },
    { value: 'video', label: 'Vidéo', icon: Video, description: 'Contenu vidéo' }
  ]

  const chapitres = [
    { value: 'analyse', label: 'Analyse' },
    { value: 'algebre', label: 'Algèbre' },
    { value: 'geometrie', label: 'Géométrie' },
    { value: 'probabilites', label: 'Probabilités' }
  ]

  const getContentPlaceholder = () => {
    switch (formData.type) {
      case 'cours':
        return `Rédigez votre cours ici...

Exemple de structure :
# Introduction
Présentation du concept

## Définition
Définition formelle avec formules

## Exemples
Exemples concrets avec solutions

## Exercices
Exercices d'application

Utilisez Markdown et LaTeX : $f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$`
      case 'exercice':
        return `Énoncé de l'exercice...

Exemple :
**Exercice :** Calculer la dérivée de $f(x) = x^2 + 3x - 1$

**Données :**
- Fonction : $f(x) = x^2 + 3x - 1$

**Question :**
Déterminer $f'(x)$

**Indications :**
- Utiliser les règles de dérivation
- Simplifier le résultat`
      case 'quiz':
        return `Description du quiz...

Ce quiz porte sur [sujet]. Il contient [nombre] questions et dure environ [durée] minutes.

**Objectifs :**
- Vérifier la compréhension de...
- Évaluer les capacités à...

Les questions seront ajoutées dans la section ci-dessous.`
      case 'video':
        return `Description de la vidéo...

Cette vidéo présente [sujet] en [durée].

**Plan de la vidéo :**
1. Introduction
2. Développement
3. Exemples
4. Conclusion

**Prérequis :**
- Connaissance de...

L'URL de la vidéo sera ajoutée dans la section ci-dessous.`
      default:
        return 'Rédigez votre contenu ici...'
    }
  }

  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }
    setFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }))
  }

  const updateQuizQuestion = (id: string, field: keyof QuizQuestion, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      questions: (prev.questions || []).map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    }))
  }

  const removeQuizQuestion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      questions: (prev.questions || []).filter(q => q.id !== id)
    }))
  }

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'video':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Configuration vidéo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL de la vidéo *
                </label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  value={formData.videoUrl || ''}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                />
                <div className="mt-1 text-sm text-gray-500">
                  Supports YouTube, Vimeo, et liens directs vers fichiers vidéo
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'exercice':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Configuration exercice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Niveau de difficulté
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty || 'moyen'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
                </select>
              </div>
            </CardContent>
          </Card>
        )

      case 'quiz':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configuration quiz</CardTitle>
                <Button
                  type="button"
                  onClick={addQuizQuestion}
                  size="sm"
                >
                  Ajouter une question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Niveau de difficulté
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty || 'moyen'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="facile">Facile</option>
                    <option value="moyen">Moyen</option>
                    <option value="difficile">Difficile</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temps limite (minutes)
                  </label>
                  <Input
                    id="timeLimit"
                    name="timeLimit"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.timeLimit || 15}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Questions */}
              {(formData.questions || []).length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Questions ({(formData.questions || []).length})
                  </h4>
                  {(formData.questions || []).map((question, index) => (
                    <div key={question.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          Question {index + 1}
                        </h5>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuizQuestion(question.id)}
                        >
                          Supprimer
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Question
                          </label>
                          <Input
                            value={question.question}
                            onChange={(e) => updateQuizQuestion(question.id, 'question', e.target.value)}
                            placeholder="Posez votre question..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Options de réponse
                          </label>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  checked={question.correctAnswer === optionIndex}
                                  onChange={() => updateQuizQuestion(question.id, 'correctAnswer', optionIndex)}
                                  className="text-blue-600"
                                />
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options]
                                    newOptions[optionIndex] = e.target.value
                                    updateQuizQuestion(question.id, 'options', newOptions)
                                  }}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            Sélectionnez la bonne réponse en cochant le bouton radio correspondant
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Explication (optionnel)
                          </label>
                          <textarea
                            value={question.explanation || ''}
                            onChange={(e) => updateQuizQuestion(question.id, 'explanation', e.target.value)}
                            placeholder="Expliquez pourquoi cette réponse est correcte..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-vertical"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(formData.questions || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune question ajoutée</p>
                  <p className="text-sm">Cliquez sur &quot;Ajouter une question&quot; pour commencer</p>
                </div>
              )}
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Créer une publication
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Partagez vos connaissances avec la communauté Math Mastery
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Type de publication */}
          <Card>
            <CardHeader>
              <CardTitle>Type de publication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {types.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <type.icon className={`h-8 w-8 mb-2 ${
                      formData.type === type.value ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {type.label}
                    </span>
                    <span className="text-sm text-gray-500 text-center">
                      {type.description}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="titre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre *
                </label>
                <Input
                  id="titre"
                  name="titre"
                  type="text"
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Ex: Introduction aux fonctions dérivées"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="chapitre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chapitre *
                  </label>
                  <select
                    id="chapitre"
                    name="chapitre"
                    value={formData.chapitre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    {chapitres.map(chapitre => (
                      <option key={chapitre.value} value={chapitre.value}>
                        {chapitre.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (séparés par des virgules)
                  </label>
                  <Input
                    id="tags"
                    name="tags"
                    type="text"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="dérivées, fonctions, analyse"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenu */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {formData.type === 'cours' && 'Contenu du cours *'}
                  {formData.type === 'exercice' && 'Énoncé de l\'exercice *'}
                  {formData.type === 'quiz' && 'Description du quiz *'}
                  {formData.type === 'video' && 'Description de la vidéo *'}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={preview ? "outline" : "primary"}
                    size="sm"
                    onClick={() => setPreview(false)}
                  >
                    Éditer
                  </Button>
                  <Button
                    type="button"
                    variant={preview ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setPreview(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div className="min-h-64 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {formData.contenu ? renderMarkdown(formData.contenu) : (
                      <p className="text-gray-500 italic">Aperçu du contenu...</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <textarea
                    id="contenu"
                    name="contenu"
                    value={formData.contenu}
                    onChange={handleChange}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-vertical"
                    placeholder={getContentPlaceholder()}
                    required
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    Supports Markdown et LaTeX pour les formules mathématiques
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Champs spécifiques au type */}
          {renderTypeSpecificFields()}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Annuler
            </Button>

            <Button
              type="submit"
              loading={loading}
              disabled={!formData.titre.trim() || !formData.contenu.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publication...
                </>
              ) : (
                'Publier'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePostPage
