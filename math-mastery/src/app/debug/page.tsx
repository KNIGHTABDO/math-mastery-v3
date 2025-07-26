'use client'

import { useState } from 'react'

interface User {
  id: string
  email: string
  nom: string
  prenom: string
  role: string
  date_inscription: string
}

export default function DebugPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users || [])
      } else {
        setError(data.message || 'Erreur lors de la récupération')
      }
    } catch {
      setError('Erreur de réseau')
    } finally {
      setLoading(false)
    }
  }

  const testCreateUser = async () => {
    setLoading(true)
    setError('')
    
    try {
      const testUser = {
        id: 'test-' + Date.now(),
        email: 'test@example.com',
        nom: 'Test',
        prenom: 'User'
      }
      
      const response = await fetch('/api/users/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('Utilisateur de test créé avec succès!')
        fetchUsers() // Refresh the list
      } else {
        setError(data.message || 'Erreur lors de la création')
      }
    } catch {
      setError('Erreur de réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug - Utilisateurs</h1>
      
      <div className="space-y-4">
        <button 
          onClick={fetchUsers}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Chargement...' : 'Récupérer les utilisateurs'}
        </button>
        
        <button 
          onClick={testCreateUser}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-2"
        >
          {loading ? 'Chargement...' : 'Créer utilisateur de test'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Utilisateurs trouvés: {users.length}</h2>
        <div className="grid gap-4">
          {users.map((user, index) => (
            <div key={user.id || index} className="border p-4 rounded">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nom:</strong> {user.nom}</p>
              <p><strong>Prénom:</strong> {user.prenom}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Date inscription:</strong> {user.date_inscription}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
