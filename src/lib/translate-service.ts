'use server'
import type { TranslationResponse } from './types'

export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  // Get the API key from environment variables
  const apiKey = process.env.DEEPL_API_KEY

  if (!apiKey) {
    throw new Error('DeepL API key is not configured')
  }

  try {
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

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DeepL API error: ${response.status} ${errorText}`)
    }

    const data = (await response.json()) as TranslationResponse
    return data.translations[0].text
  } catch (error) {
    console.error('Translation error:', error)
    throw error
  }
}
