/**
 * nonprofitAPI.js
 *
 * Targeted per-org data fetching for curated Islamic nonprofits.
 * Uses ProPublica Nonprofit Explorer API (via Vite proxy) to fetch
 * live Form 990 financial data for specific EINs.
 *
 * No bulk search — we use a curated database of verified Islamic orgs.
 */

const PROPUBLICA_BASE = '/api/propublica'

/**
 * Fetch live Form 990 financial data for a specific EIN from ProPublica.
 * Called when a user views an org's detail page or hovers on a card.
 * Returns enhanced financial data or null on failure.
 */
export async function fetchOrgFinancials(ein) {
  if (!ein) return null

  const cleanEin = String(ein).replace(/-/g, '')

  try {
    const response = await fetch(`${PROPUBLICA_BASE}/organizations/${cleanEin}.json`)
    if (!response.ok) return null

    const data = await response.json()
    if (!data.organization) return null

    const org = data.organization
    const filing = (data.filings_with_data || [])[0] || null

    return {
      // IRS master file data
      irsName: org.name,
      address: org.address,
      city: org.city,
      state: org.state,
      zipcode: org.zipcode,
      rulingDate: org.ruling_date,
      taxPeriod: org.tax_period,
      nteeCode: org.ntee_code,
      subsectionCode: org.subsection_code,
      // Financial data from latest Form 990
      totalRevenue: filing?.totrevenue || org.revenue_amount || null,
      totalExpenses: filing?.totfuncexpns || null,
      totalAssets: filing?.totassetsend || org.asset_amount || null,
      totalLiabilities: filing?.totliabend || null,
      totalContributions: filing?.totcntrbgfts || null,
      programExpensePercent: filing?.totfuncexpns && filing?.totrevenue
        ? Math.round((filing.totfuncexpns / filing.totrevenue) * 100)
        : null,
      filingYear: filing?.tax_prd_yr || null,
      filingCount: (data.filings_with_data || []).length,
      // Computed
      irsVerified: true,
      lastUpdated: new Date().toISOString(),
    }
  } catch (err) {
    console.warn(`[Mizan] Failed to fetch financials for EIN ${ein}:`, err.message)
    return null
  }
}

/**
 * Format large dollar amounts for display
 */
export function formatRevenue(amount) {
  if (!amount) return null
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount}`
}
