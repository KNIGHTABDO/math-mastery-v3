import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Test de connexion à la base de données
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(5)

    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      return NextResponse.json(
        { error: 'Erreur de base de données', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Connexion réussie', users: data, count: data.length },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erreur lors du test:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', message: 'Une erreur interne est survenue' },
      { status: 500 }
    )
  }
}
