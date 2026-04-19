import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { NGO_SEED_DATA } from '../data/ngoSeedData'
import { fetchOrgFinancials } from '../utils/nonprofitAPI'

const NGOContext = createContext(null)

const FINANCIAL_CACHE_KEY = 'mizan_ngo_financials_v1'

export function NGOProvider({ children }) {
  const [ngoDatabase, setNgoDatabase] = useState(NGO_SEED_DATA)
  const [ngoLoading, setNgoLoading] = useState(false)
  // Cache of live financial data keyed by EIN
  const [financialCache, setFinancialCache] = useState(() => {
    try {
      const cached = localStorage.getItem(FINANCIAL_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        // Expire entries older than 24 hours
        const now = Date.now()
        const valid = {}
        for (const [ein, entry] of Object.entries(parsed)) {
          if (now - new Date(entry.lastUpdated).getTime() < 24 * 60 * 60 * 1000) {
            valid[ein] = entry
          }
        }
        return valid
      }
    } catch (e) { /* ignore */ }
    return {}
  })
  const fetchingRef = useRef(new Set())

  // Persist financial cache
  useEffect(() => {
    try {
      localStorage.setItem(FINANCIAL_CACHE_KEY, JSON.stringify(financialCache))
    } catch (e) { /* storage full */ }
  }, [financialCache])

  const getNgoById = useCallback((id) => {
    return ngoDatabase.find(ngo => ngo.id === id) || null
  }, [ngoDatabase])

  const getNgosByCategory = useCallback((category) => {
    return ngoDatabase.filter(ngo =>
      ngo.category === category || ngo.secondaryCategories?.includes(category)
    )
  }, [ngoDatabase])

  /**
   * Fetch live financial data for a specific NGO.
   * Called when user views an org detail page or hovers on a card.
   * Returns cached data if available, otherwise fetches from ProPublica.
   */
  const fetchLiveData = useCallback(async (ngoId) => {
    const ngo = ngoDatabase.find(n => n.id === ngoId)
    if (!ngo?.ein) return null

    const cleanEin = ngo.ein.replace(/-/g, '')

    // Return cached if fresh
    if (financialCache[cleanEin]) {
      return financialCache[cleanEin]
    }

    // Don't duplicate in-flight requests
    if (fetchingRef.current.has(cleanEin)) return null
    fetchingRef.current.add(cleanEin)

    try {
      const data = await fetchOrgFinancials(ngo.ein)
      if (data) {
        setFinancialCache(prev => ({ ...prev, [cleanEin]: data }))

        // Also update the NGO record in the database with fresh financial data
        setNgoDatabase(prev => prev.map(n => {
          if (n.id !== ngoId) return n
          return {
            ...n,
            annualRevenue: data.totalRevenue || n.annualRevenue,
            programExpensePercent: data.programExpensePercent || n.programExpensePercent,
            irsVerified: true,
            _liveDataLoaded: true,
          }
        }))

        return data
      }
    } catch (e) {
      console.warn(`[Mizan] Live data fetch failed for ${ngoId}`)
    } finally {
      fetchingRef.current.delete(cleanEin)
    }

    return null
  }, [ngoDatabase, financialCache])

  /**
   * Get cached financial data for an NGO (synchronous).
   */
  const getFinancials = useCallback((ngoId) => {
    const ngo = ngoDatabase.find(n => n.id === ngoId)
    if (!ngo?.ein) return null
    const cleanEin = ngo.ein.replace(/-/g, '')
    return financialCache[cleanEin] || null
  }, [ngoDatabase, financialCache])

  /**
   * Search NGOs by query string (local only — curated database).
   */
  const searchNgos = useCallback((query) => {
    if (!query || query.trim().length < 2) return ngoDatabase

    const q = query.toLowerCase()
    return ngoDatabase.filter(ngo => {
      const haystack = [
        ngo.name,
        ngo.category,
        ngo.mission,
        ...(ngo.tags || []),
        ...(ngo.secondaryCategories || []),
        ...(ngo.countriesOfOperation || []),
        ngo.city,
        ngo.state,
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [ngoDatabase])

  return (
    <NGOContext.Provider value={{
      ngoDatabase,
      ngoLoading,
      getNgoById,
      getNgosByCategory,
      searchNgos,
      fetchLiveData,
      getFinancials,
    }}>
      {children}
    </NGOContext.Provider>
  )
}

export const useNGO = () => useContext(NGOContext)
