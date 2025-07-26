'use client'

import React, { useState } from 'react'
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Trophy,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface PostContentProps {
  post: {
    id: string
    type: 'cours' | 'exercice' | 'quiz' | 'video'
    contenu: string
    video_url?: string
    difficulty?: 'facile' | 'moyen' | 'difficile'
    time_limit?: number
    questions?: QuizQuestion[]
  }
  showFullContent?: boolean
}

interface QuizState {
  currentQuestion: number
  answers: Record<string, number>
  showResults: boolean
  timeLeft?: number
  startTime?: number
}

const PostContent: React.FC<PostContentProps> = ({ post, showFullContent = false }) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    showResults: false
  })

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

  const renderVideoContent = () => {
    if (!post.video_url) return null

    let embedUrl = post.video_url
    
    // Convert YouTube URLs to embed format
    if (post.video_url.includes('youtube.com/watch?v=')) {
      const videoId = post.video_url.split('v=')[1]?.split('&')[0]
      embedUrl = `https://www.youtube.com/embed/${videoId}`
    } else if (post.video_url.includes('youtu.be/')) {
      const videoId = post.video_url.split('youtu.be/')[1]?.split('?')[0]
      embedUrl = `https://www.youtube.com/embed/${videoId}`
    }
    // Convert Vimeo URLs to embed format
    else if (post.video_url.includes('vimeo.com/')) {
      const videoId = post.video_url.split('vimeo.com/')[1]?.split('?')[0]
      embedUrl = `https://player.vimeo.com/video/${videoId}`
    }

    return (
      <div className="mb-6">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {embedUrl !== post.video_url ? (
            <iframe
              src={embedUrl}
              title="Vidéo"
              className="w-full h-full"
              allowFullScreen
              frameBorder="0"
            />
          ) : (
            <video
              src={post.video_url}
              controls
              className="w-full h-full object-cover"
            >
              Votre navigateur ne supporte pas les vidéos HTML5.
            </video>
          )}
        </div>
      </div>
    )
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'facile':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'moyen':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'difficile':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
    }
  }

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'facile':
        return '⭐'
      case 'moyen':
        return '⭐⭐'
      case 'difficile':
        return '⭐⭐⭐'
      default:
        return '⭐'
    }
  }

  const startQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      answers: {},
      showResults: false,
      startTime: Date.now(),
      timeLeft: post.time_limit ? post.time_limit * 60 : undefined
    })
  }

  const selectAnswer = (questionId: string, answerIndex: number) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answerIndex
      }
    }))
  }

  const nextQuestion = () => {
    if (!post.questions) return
    
    if (quizState.currentQuestion < post.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }))
    } else {
      // Terminer le quiz
      setQuizState(prev => ({
        ...prev,
        showResults: true
      }))
    }
  }

  const restartQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      answers: {},
      showResults: false
    })
  }

  const calculateScore = () => {
    if (!post.questions) return { score: 0, total: 0, percentage: 0 }
    
    const score = post.questions.filter(q => 
      quizState.answers[q.id] === q.correctAnswer
    ).length
    
    const total = post.questions.length
    const percentage = Math.round((score / total) * 100)
    
    return { score, total, percentage }
  }

  const renderQuizContent = () => {
    if (!post.questions || post.questions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Aucune question disponible pour ce quiz</p>
        </div>
      )
    }

    if (!quizState.showResults && quizState.startTime === undefined) {
      // État initial - afficher le bouton de démarrage
      return (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
              Prêt à commencer le quiz ?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <span className="font-medium">Questions :</span>
                <span>{post.questions.length}</span>
              </div>
              {post.time_limit && (
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.time_limit} min</span>
                </div>
              )}
              {post.difficulty && (
                <div className="flex items-center justify-center space-x-2">
                  <span>Difficulté :</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(post.difficulty)}`}>
                    {getDifficultyIcon(post.difficulty)} {post.difficulty}
                  </span>
                </div>
              )}
            </div>
            <Button onClick={startQuiz} className="mt-4">
              <Play className="h-4 w-4 mr-2" />
              Commencer le quiz
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (quizState.showResults) {
      // Afficher les résultats
      const { score, total, percentage } = calculateScore()
      
      return (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
              Résultats du quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {percentage}%
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {score} / {total} bonnes réponses
              </div>
            </div>

            {/* Révision des questions */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Révision des réponses
              </h4>
              {post.questions.map((question, index) => {
                const userAnswer = quizState.answers[question.id]
                const isCorrect = userAnswer === question.correctAnswer
                
                return (
                  <div key={question.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start space-x-2 mb-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Question {index + 1}: {question.question}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-7 space-y-2">
                      {question.options.map((option, optionIndex) => {
                        let optionClass = 'p-2 rounded border text-sm '
                        
                        if (optionIndex === question.correctAnswer) {
                          optionClass += 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        } else if (optionIndex === userAnswer && userAnswer !== question.correctAnswer) {
                          optionClass += 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        } else {
                          optionClass += 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        }
                        
                        return (
                          <div key={optionIndex} className={optionClass}>
                            {option}
                            {optionIndex === question.correctAnswer && (
                              <span className="ml-2 text-xs font-medium">(Bonne réponse)</span>
                            )}
                            {optionIndex === userAnswer && userAnswer !== question.correctAnswer && (
                              <span className="ml-2 text-xs font-medium">(Votre réponse)</span>
                            )}
                          </div>
                        )
                      })}
                      
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Explication :</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-center">
              <Button onClick={restartQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Refaire le quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Mode quiz en cours
    const currentQuestion = post.questions[quizState.currentQuestion]
    const userAnswer = quizState.answers[currentQuestion.id]
    const progress = ((quizState.currentQuestion + 1) / post.questions.length) * 100

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Question {quizState.currentQuestion + 1} / {post.questions.length}
            </CardTitle>
            {post.time_limit && quizState.timeLeft !== undefined && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{Math.floor(quizState.timeLeft / 60)}:{(quizState.timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {currentQuestion.question}
            </h3>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(currentQuestion.id, index)}
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    userAnswer === index
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      userAnswer === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {userAnswer === index && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-900 dark:text-white">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={nextQuestion}
              disabled={userAnswer === undefined}
            >
              {quizState.currentQuestion === post.questions.length - 1 ? 'Terminer' : 'Suivant'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderExerciseContent = () => {
    return (
      <div className="space-y-4">
        {post.difficulty && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Difficulté :
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(post.difficulty)}`}>
              {getDifficultyIcon(post.difficulty)} {post.difficulty}
            </span>
          </div>
        )}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {renderMarkdown(post.contenu)}
        </div>
      </div>
    )
  }

  // Rendu principal selon le type de post
  switch (post.type) {
    case 'video':
      return (
        <div>
          {showFullContent && renderVideoContent()}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderMarkdown(post.contenu)}
          </div>
        </div>
      )

    case 'exercice':
      return renderExerciseContent()

    case 'quiz':
      return (
        <div className="space-y-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderMarkdown(post.contenu)}
          </div>
          {showFullContent && renderQuizContent()}
        </div>
      )

    case 'cours':
    default:
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {renderMarkdown(post.contenu)}
        </div>
      )
  }
}

export default PostContent
