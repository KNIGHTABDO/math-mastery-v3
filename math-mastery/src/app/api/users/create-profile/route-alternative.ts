import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, nom, prenom } = body

    // Valider les données requises
    if (!id || !email || !nom || !prenom) {
      return NextResponse.json(
        { error: 'Données manquantes', message: 'ID, email, nom et prénom sont requis' },
        { status: 400 }
      )
    }

    // Utiliser une fonction RPC pour créer le profil
    const { data, error } = await supabase.rpc('create_user_profile', {
      user_id: id,
      user_email: email,
      user_nom: nom,
      user_prenom: prenom
    })

    if (error) {
      console.error('Erreur lors de la création du profil:', error)
      return NextResponse.json(
        { error: 'Erreur de base de données', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Profil créé avec succès', user: data },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erreur lors de la création du profil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', message: 'Une erreur interne est survenue' },
      { status: 500 }
    )
  }
}
