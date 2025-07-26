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

const HomePage: React.FC = () => {
  const { user } = useAuth()
  const [recentPosts, setRecentPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)

  // Simuler des données pour la démo
  useEffect(() => {
    const loadData = async () => {
      // TODO: Remplacer par de vraies données de l'API
      const mockPosts: PostWithAuthor[] = [
        {
          id: '1',
          titre: 'Introduction aux fonctions dérivées',
          contenu: 'Dans ce cours, nous allons découvrir les concepts fondamentaux des fonctions dérivées et leur application en analyse mathématique.\n\nLa dérivée d\'une fonction $f(x)$ au point $x = a$ est définie par:\n\n$$f\'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$$\n\nCette limite, si elle existe, nous donne la pente de la tangente à la courbe au point considéré.',
          type: 'cours' as const,
          tags: ['dérivées', 'analyse', 'fonctions'],
          chapitre: 'analyse' as const,
          auteur_id: '1',
          date_creation: new Date(Date.now() - 86400000).toISOString(),
          date_modification: undefined,
          likes_count: 24,
          vues_count: 156,
          partages_count: 8,
          officiel: true,
          actif: true,
          users: {
            id: '1',
            email: 'prof.hassan@mathmastery.ma',
            nom: 'El Idrissi',
            prenom: 'Hassan',
            role: 'admin' as const,
            photo_profil: undefined,
            bio: 'Professeur de mathématiques, spécialiste en analyse',
            date_inscription: '2024-01-01T00:00:00Z',
            derniere_connexion: undefined
          },
          uploads: [],
          comments: [],
          isLiked: false
        },
        {
          id: '2',
          titre: 'Exercices sur les nombres complexes',
          contenu: 'Série d\'exercices corrigés sur les nombres complexes pour réviser les concepts essentiels du programme 2BAC.\n\n**Exercice 1:** Soit $z = 3 + 4i$. Calculer $|z|$ et $\\arg(z)$.\n\n**Solution:**\n- $|z| = \\sqrt{3^2 + 4^2} = 5$\n- $\\arg(z) = \\arctan(\\frac{4}{3})$',
          type: 'exercice' as const,
          tags: ['complexes', 'exercices', 'algèbre'],
          chapitre: 'algebre' as const,
          auteur_id: '2',
          date_creation: new Date(Date.now() - 172800000).toISOString(),
          date_modification: undefined,
          likes_count: 18,
          vues_count: 89,
          partages_count: 5,
          officiel: false,
          actif: true,
          users: {
            id: '2',
            email: 'amal.bennani@example.com',
            nom: 'Bennani',
            prenom: 'Amal',
            role: 'utilisateur' as const,
            photo_profil: undefined,
            bio: undefined,
            date_inscription: '2024-01-15T00:00:00Z',
            derniere_connexion: undefined
          },
          uploads: [],
          comments: [],
          isLiked: user?.id === '2'
        }
      ]

      setRecentPosts(mockPosts)
      setLoading(false)
    }

    loadData()
  }, [user])

  const stats = [
    { label: 'Étudiants actifs', value: '2,847', icon: Users, color: 'text-blue-600' },
    { label: 'Cours disponibles', value: '156', icon: BookOpen, color: 'text-green-600' },
    { label: 'Exercices résolus', value: '4,293', icon: Calculator, color: 'text-purple-600' },
    { label: 'Taux de réussite', value: '94%', icon: TrendingUp, color: 'text-orange-600' }
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
                <Link href="/explorer">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Explorer les cours
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
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
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
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {recentPosts.slice(0, 4).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => {
                    // TODO: Implémenter la logique de like
                    console.log('Like post', post.id)
                  }}
                  onComment={() => {
                    // TODO: Implémenter la logique de commentaire
                    console.log('Comment post', post.id)
                  }}
                  onShare={() => {
                    // TODO: Implémenter la logique de partage
                    console.log('Share post', post.id)
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
