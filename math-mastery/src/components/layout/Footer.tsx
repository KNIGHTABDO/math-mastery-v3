import React from 'react'
import Link from 'next/link'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube 
} from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Math Mastery',
      links: [
        { name: 'Accueil', href: '/' },
        { name: 'Explorer', href: '/explorer' },
        { name: 'Communauté', href: '/communaute' },
        { name: 'À propos', href: '/a-propos' }
      ]
    },
    {
      title: 'Matières',
      links: [
        { name: 'Analyse', href: '/explorer?chapitre=analyse' },
        { name: 'Algèbre', href: '/explorer?chapitre=algebre' },
        { name: 'Géométrie', href: '/explorer?chapitre=geometrie' },
        { name: 'Probabilités', href: '/explorer?chapitre=probabilites' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'FAQ', href: '/faq' },
        { name: 'Nous contacter', href: '/contact' },
        { name: 'Guide d\'utilisation', href: '/guide' },
        { name: 'Signaler un problème', href: '/signaler' }
      ]
    },
    {
      title: 'Légal',
      links: [
        { name: 'Conditions d\'utilisation', href: '/conditions' },
        { name: 'Politique de confidentialité', href: '/confidentialite' },
        { name: 'Mentions légales', href: '/mentions-legales' },
        { name: 'Cookies', href: '/cookies' }
      ]
    }
  ]

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'YouTube', href: '#', icon: Youtube }
  ]

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Math Mastery
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Plateforme éducative dédiée aux étudiants marocains en 2BAC Sciences Mathématiques et Physiques.
            </p>

            {/* Informations de contact */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span>contact@mathmastery.ma</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+212 XX XX XX XX</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Maroc</span>
              </div>
            </div>
          </div>

          {/* Sections de liens */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 lg:mb-0">
              © {currentYear} Math Mastery. Tous droits réservés.
            </div>

            {/* Réseaux sociaux */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Suivez-nous :
              </span>
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Message d'encouragement */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              &quot;Les mathématiques sont la clé qui ouvre la porte de l&apos;univers.&quot; - Galilée
            </p>
          </div>
        </div>
      </div>

      {/* Bande colorée */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
    </footer>
  )
}

export default Footer