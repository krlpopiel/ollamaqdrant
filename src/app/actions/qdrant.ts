'use server'

import { QdrantClient } from '@qdrant/js-client-rest'

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
})

const COLLECTION_NAME = 'cytaty'
const OLLAMA_URL = 'http://localhost:11434/api/embeddings'
const EMBEDDING_MODEL = 'nomic-embed-text'

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBEDDING_MODEL, prompt: text }),
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.embedding
}

export async function getMyQdrantCollections() {
  try {
    const result = await client.getCollections()
    return result.collections
  } catch (error) {
    console.error('Error fetching collections:', error)
    throw new Error('Nie udało się pobrać kolekcji z Qdrant.')
  }
}

export async function createCollection() {
  try {
    const collections = await client.getCollections()
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME)

    if (!exists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: { size: 768, distance: 'Cosine' },
      })
      console.log(`Kolekcja "${COLLECTION_NAME}" została utworzona.`)
      return { success: true, message: `Kolekcja "${COLLECTION_NAME}" została utworzona.` }
    }

    console.log(`Kolekcja "${COLLECTION_NAME}" już istnieje.`)
    return { success: true, message: `Kolekcja "${COLLECTION_NAME}" już istnieje.` }
  } catch (error) {
    console.error('Error creating collection:', error)
    throw new Error('Nie udało się utworzyć kolekcji w Qdrant.')
  }
}

export async function saveTextToQdrant(text: string) {
  try {
    const embedding = await getEmbedding(text)

    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: crypto.randomUUID(),
          vector: embedding,
          payload: { tekst: text },
        },
      ],
    })

    return { success: true, message: 'Cytat został zapisany!' }
  } catch (error) {
    console.error('Error saving text to Qdrant:', error)
    throw new Error('Nie udało się zapisać cytatu do Qdrant.')
  }
}

export async function searchInQdrant(query: string) {
  try {
    const embedding = await getEmbedding(query)

    const results = await client.search(COLLECTION_NAME, {
      vector: embedding,
      limit: 5,
      with_payload: true,
    })

    return results
  } catch (error) {
    console.error('Error searching in Qdrant:', error)
    throw new Error('Nie udało się wyszukać cytatów w Qdrant.')
  }
}
