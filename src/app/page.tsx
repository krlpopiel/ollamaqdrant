'use client'

import { useState, useEffect } from 'react'
import {
  createCollection,
  getMyQdrantCollections,
  saveTextToQdrant,
  searchInQdrant,
} from './actions/qdrant'

export default function Home() {
  const [searchText, setSearchText] = useState('')
  const [text, setText] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    createCollection()
      .then(() => getMyQdrantCollections())
      .then(setCollections)
      .catch((err) => setStatus(`Błąd inicjalizacji: ${err.message}`))
  }, [])

  const handleSave = async () => {
    if (!text.trim()) {
      setStatus('Wpisz cytat przed zapisaniem.')
      return
    }
    setIsLoading(true)
    setStatus('')
    try {
      const result = await saveTextToQdrant(text)
      setStatus(result.message)
      setText('')
      // Refresh collections
      const cols = await getMyQdrantCollections()
      setCollections(cols)
    } catch (err: any) {
      setStatus(`Błąd: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchText.trim()) {
      setStatus('Wpisz zapytanie przed wyszukiwaniem.')
      return
    }
    setIsSearching(true)
    setStatus('')
    try {
      const res = await searchInQdrant(searchText)
      setResults(res)
    } catch (err: any) {
      setStatus(`Błąd: ${err.message}`)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="max-w-2xl mx-auto p-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 tracking-tight">
            Cytaty AI
          </h1>
          <p className="text-slate-400 text-lg">
            Wyszukiwanie semantyczne cytatów z Ollama + Qdrant
          </p>
        </div>

        {/* Status message */}
        {status && (
          <div
            className={`mb-8 p-4 rounded-xl border text-sm font-medium transition-all duration-300 ${
              status.startsWith('Błąd')
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {status}
          </div>
        )}

        {/* Section: Add Quote */}
        <section className="mb-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl shadow-indigo-500/5">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">✍️</span> Dodaj cytat
          </h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Wpisz swój ulubiony cytat..."
            rows={4}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Zapisywanie...
              </span>
            ) : (
              'Zapisz cytat'
            )}
          </button>
        </section>

        {/* Section: Search Quotes */}
        <section className="mb-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl shadow-purple-500/5">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🔍</span> Szukaj cytatów
          </h2>
          <div className="flex gap-3">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Wpisz zapytanie semantyczne..."
              className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Szukaj'
              )}
            </button>
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Wyniki ({results.length})
              </h3>
              {results.map((result, index) => (
                <div
                  key={result.id || index}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/80 transition-all duration-200 group"
                >
                  <p className="text-white/90 leading-relaxed text-lg italic">
                    &ldquo;{result.payload?.tekst}&rdquo;
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">#{index + 1}</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Score: {result.score?.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: Collections (debug) */}
        <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-300">
            <span className="text-lg">🗂️</span> Kolekcje w Qdrant
          </h2>
          {collections.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {collections.map((col: any) => (
                <span
                  key={col.name}
                  className="px-3 py-1.5 bg-slate-800/60 border border-slate-700 rounded-lg text-sm text-slate-300 font-mono"
                >
                  {col.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Ładowanie kolekcji...</p>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-600 text-xs">
          Ollama (nomic-embed-text) + Qdrant — Wyszukiwanie semantyczne
        </footer>
      </div>
    </main>
  )
}
