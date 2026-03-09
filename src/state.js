// src/state.js
// Single source of truth for all localStorage access.

const _DRAFT_KEY = 'adgen_draft'
const _ADS_KEY   = 'adgen_ads'

function _genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function saveDraft(draft) {
  localStorage.setItem(_DRAFT_KEY, JSON.stringify(draft))
}

function getDraft() {
  try { return JSON.parse(localStorage.getItem(_DRAFT_KEY)) } catch { return null }
}

function clearDraft() {
  localStorage.removeItem(_DRAFT_KEY)
}

function getAllAds() {
  try { return JSON.parse(localStorage.getItem(_ADS_KEY)) || [] } catch { return [] }
}

function saveAd(adData) {
  const ads = getAllAds()
  const idx = ads.findIndex(a => a.id === adData.id)
  if (idx >= 0) {
    ads[idx] = { ...ads[idx], ...adData }
  } else {
    ads.unshift({ ...adData, id: adData.id || _genId(), createdAt: adData.createdAt || Date.now(), tag: adData.tag || '' })
  }
  localStorage.setItem(_ADS_KEY, JSON.stringify(ads))
}

function tagAd(id, tag) {
  const ads = getAllAds()
  const ad  = ads.find(a => a.id === id)
  if (ad) { ad.tag = tag; localStorage.setItem(_ADS_KEY, JSON.stringify(ads)) }
}

function deleteAd(id) {
  localStorage.setItem(_ADS_KEY, JSON.stringify(getAllAds().filter(a => a.id !== id)))
}

function deleteAllUntagged() {
  localStorage.setItem(_ADS_KEY, JSON.stringify(getAllAds().filter(a => a.tag && a.tag.trim())))
}

Object.assign(window.AdGen, { saveDraft, getDraft, clearDraft, getAllAds, saveAd, tagAd, deleteAd, deleteAllUntagged })
