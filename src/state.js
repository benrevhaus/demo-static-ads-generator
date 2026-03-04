// src/state.js
// Single source of truth for all localStorage access.
// No other file may read/write localStorage directly.

const DRAFT_KEY = 'adgen_draft'
const ADS_KEY = 'adgen_ads'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function saveDraft(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

export function getDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

export function saveAd(adData) {
  const ads = getAllAds()
  const idx = ads.findIndex(a => a.id === adData.id)
  if (idx >= 0) {
    ads[idx] = { ...ads[idx], ...adData }
  } else {
    ads.unshift({ ...adData, id: adData.id || genId(), createdAt: adData.createdAt || Date.now(), tag: adData.tag || '' })
  }
  localStorage.setItem(ADS_KEY, JSON.stringify(ads))
}

export function getAllAds() {
  try {
    const raw = localStorage.getItem(ADS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function tagAd(id, tag) {
  const ads = getAllAds()
  const ad = ads.find(a => a.id === id)
  if (ad) {
    ad.tag = tag
    localStorage.setItem(ADS_KEY, JSON.stringify(ads))
  }
}

export function deleteAd(id) {
  const ads = getAllAds().filter(a => a.id !== id)
  localStorage.setItem(ADS_KEY, JSON.stringify(ads))
}

export function deleteAllUntagged() {
  const ads = getAllAds().filter(a => a.tag && a.tag.trim())
  localStorage.setItem(ADS_KEY, JSON.stringify(ads))
}
