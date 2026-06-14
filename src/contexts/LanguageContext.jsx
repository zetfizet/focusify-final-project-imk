import { createContext, useState, useEffect, useContext } from 'react'
import en from '../locales/en'
import id from '../locales/id'

const translations = { en, id }

export const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('focusify_lang_v2') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('focusify_lang_v2', language)
  }, [language])

  const t = (key) => {
    const keys = key.split('.')
    let result = translations[language]
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k]
      } else {
        // Fallback to English if key is missing
        let fallback = translations['en']
        for (const fk of keys) {
          if (fallback && fallback[fk]) {
            fallback = fallback[fk]
          } else {
            return key // Return key itself if missing everywhere
          }
        }
        return fallback
      }
    }
    return result
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
