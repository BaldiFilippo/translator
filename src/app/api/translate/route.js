import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json()
    console.log("Incoming translation request:", { text, sourceLanguage, targetLanguage })

    const apiKey = process.env.DEEPL_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { message: 'DeepL API key is not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
      body: JSON.stringify({
        text: [text],
        source_lang: sourceLanguage,
        target_lang: targetLanguage,
      }),
    })

    console.log("DeepL API response status:", response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("DeepL API error response:", errorText)
      return NextResponse.json(
        { message: `DeepL API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("DeepL API response data:", data)
    return NextResponse.json({ translatedText: data.translations[0].text })
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred during translation' },
      { status: 500 }
    )
  }
}
