import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST ROUTE DEBUG ===')
    console.log('Request method:', request.method)
    console.log('Request URL:', request.url)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    // Get the raw text first
    const requestText = await request.text()
    console.log('Raw request body:', requestText)
    console.log('Body length:', requestText.length)
    console.log('Body type:', typeof requestText)
    
    if (!requestText || requestText.trim() === '') {
      return NextResponse.json({
        error: 'Empty body',
        received: requestText,
        length: requestText.length
      }, { status: 400 })
    }

    // Try to parse as JSON
    let parsedBody
    try {
      parsedBody = JSON.parse(requestText)
      console.log('Parsed body:', parsedBody)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({
        error: 'JSON parse failed',
        received: requestText,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      received: parsedBody,
      message: 'Request processed successfully'
    })

  } catch (error) {
    console.error('Route error:', error)
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
