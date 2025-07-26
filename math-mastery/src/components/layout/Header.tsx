'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Settings, 
  Bell,
  Search,
  Plus,
  BookOpen,
  Users,
  BarChart3
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
// import { Modal, ModalContent } from '@/components/ui/Modal'

const Header: React.FC = () => {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const navigationItems = [
    { name: 'Accueil', href: '/', icon: BookOpen },
    { name: 'Explorer', href: '/explorer', icon: Search },
    { name: 'Communauté', href: '/communaute', icon: Users }
  ]

  const adminNavigationItems = [
    { name: 'Tableau de bord', href: '/admin', icon: BarChart3 },
    { name: 'Gérer les posts', href: '/admin/posts', icon: BookOpen },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users }
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  M
                </div>
                <span className="hidden sm:block">Math Mastery</span>
              </Link>
            </div>

            {/* Navigation desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {user?.role === 'admin' && (
                <>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                  {adminNavigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </>
              )}
            </nav>

            {/* Barre de recherche */}
            <div className="hidden lg:block flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch}>
                <Input
                  type="search"
                  placeholder="Rechercher des cours, exercices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  className="w-full"
                />
              </form>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Bouton de recherche mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => {/* TODO: Ouvrir modal de recherche */}}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Bouton de thème */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hidden sm:flex"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>

              {user ? (
                <>
                  {/* Notifications */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
                  </Button>

                  {/* Bouton créer post (admin) */}
                  {user.role === 'admin' && (
                    <Link href="/admin/posts/nouveau">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Créer</span>
                      </Button>
                    </Link>
                  )}

                  {/* Menu utilisateur */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="p-2"
                    >
                      <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                    </Button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {user.role}
                          </p>
                        </div>
                        
                        <Link
                          href="/profil"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Mon profil
                        </Link>
                        
                        <Link
                          href="/parametres"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Paramètres
                        </Link>

                        <div className="border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Se déconnecter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/connexion">
                    <Button variant="outline" size="sm">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/inscription">
                    <Button size="sm">
                      Inscription
                    </Button>
                  </Link>
                </div>
              )}

              {/* Menu mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-4 py-2 space-y-1">
              {/* Recherche mobile */}
              <form onSubmit={handleSearch} className="mb-4">
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </form>

              {/* Navigation */}
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {user?.role === 'admin' && (
                <>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                  {adminNavigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </>
              )}

              {/* Bouton de thème mobile */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <span>Thème {theme === 'light' ? 'sombre' : 'clair'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Overlay pour fermer les menus */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-25"
          onClick={() => {
            setIsMobileMenuOpen(false)
            setIsUserMenuOpen(false)
          }}
        />
      )}
    </>
  )
}

export default Header