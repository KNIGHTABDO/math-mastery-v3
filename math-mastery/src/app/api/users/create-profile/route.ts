import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, nom, prenom, role, date_inscription } = body

    console.log('Tentative de création de profil pour:', { id, email, nom, prenom })

    // Valider les données requises
    if (!id || !email || !nom || !prenom) {
      console.error('Données manquantes:', { id, email, nom, prenom })
      return NextResponse.json(
        { error: 'Données manquantes', message: 'ID, email, nom et prénom sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .single()

    if (existingUser) {
      console.log('Utilisateur existe déjà:', id)
      return NextResponse.json(
        { message: 'Utilisateur existe déjà', user: existingUser },
        { status: 200 }
      )
    }

    // Utiliser le client admin pour contourner RLS
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id,
          email,
          nom,
          prenom,
          role: role || 'utilisateur',
          date_inscription: date_inscription || new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création du profil dans la DB:', error)
      return NextResponse.json(
        { error: 'Erreur de base de données', message: error.message, details: error },
        { status: 500 }
      )
    }

    console.log('Profil créé avec succès dans la DB:', data)
    return NextResponse.json(
      { message: 'Profil créé avec succès', user: data },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erreur lors de la création du profil (catch):', error)
    return NextResponse.json(
      { error: 'Erreur serveur', message: 'Une erreur interne est survenue', details: error },
      { status: 500 }
    )
  }
}
