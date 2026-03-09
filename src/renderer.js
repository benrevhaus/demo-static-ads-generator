// src/renderer.js
// Canvas-based rendering for banner ads and placeholder image generation.

const COLOR_PRESETS = {
  sage: {
    name: 'Sage Wellness',
    bg: '#2d4f38', panel: '#2d4f38', accent: '#b8d4be',
    text: '#f0f7f1', subtext: '#c8e6c9', ctaBg: '#b8d4be', ctaText: '#1a2e22',
  },
  warm: {
    name: 'Warm Neutral',
    bg: '#6b4226', panel: '#8b5e3c', accent: '#f0e6d3',
    text: '#fdf6ee', subtext: '#f5dfc0', ctaBg: '#f0e6d3', ctaText: '#3d2b1a',
  },
  luxury: {
    name: 'Luxury Gold',
    bg: '#0d0d1a', panel: '#0d0d1a', accent: '#c9a84c',
    text: '#f0f0f0', subtext: '#c9a84c', ctaBg: '#c9a84c', ctaText: '#1a1a2e',
  },
}

const TEMPLATES = {
  A: { name: 'Split — Image Left',  layout: 'left-right' },
  B: { name: 'Stack — Image Top',   layout: 'top-bottom' },
  C: { name: 'Overlay — Full BG',   layout: 'overlay' },
}

const SIZE_PRESETS = [
  { label: 'Leaderboard 728×90',  value: '728x90',    w: 728,  h: 90  },
  { label: 'Banner 1500×500',     value: '1500x500',  w: 1500, h: 500 },
  { label: 'Square 1080×1080',    value: '1080x1080', w: 1080, h: 1080 },
  { label: 'Custom',              value: 'custom',    w: null, h: null },
]

function generatePlaceholderImage(promptData, width, height) {
  width  = width  || 800
  height = height || 400
  const canvas = document.createElement('canvas')
  canvas.width  = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const { mood = 'calming', productCategory = '', campaignHeader = '' } = promptData

  const gradients = {
    calming:   ['#1a4a5c', '#2c7873', '#6fb3b8', '#c8e6ea'],
    luxurious: ['#1a0533', '#4b1c82', '#7c3aed', '#c9a84c'],
    healing:   ['#1b4332', '#2d6a4f', '#74c69d', '#d8f3dc'],
  }
  const stops = gradients[mood] || gradients.calming
  const grad = ctx.createLinearGradient(0, 0, width, height)
  stops.forEach(function(color, i) { grad.addColorStop(i / (stops.length - 1), color) })
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  ctx.globalAlpha = 0.035
  for (let i = 0; i < 3000; i++) {
    ctx.beginPath()
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2)
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const label = (productCategory || campaignHeader || mood).toUpperCase()
  const fs = Math.max(16, Math.min(width / 10, 72))
  ctx.font = 'bold ' + fs + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillText(label, width / 2, height / 2)

  return canvas.toDataURL('image/png')
}

async function renderBanner(canvas, ad) {
  const { width, height, template, colorPreset, imageRef } = ad
  const colors = COLOR_PRESETS[colorPreset] || COLOR_PRESETS.sage
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)

  const img    = await _loadImage(imageRef)
  const layout = (TEMPLATES[template] || TEMPLATES.A).layout

  if (layout === 'left-right') {
    const imgW = Math.floor(width * 0.58)
    ctx.drawImage(img, 0, 0, imgW, height)
    ctx.fillStyle = colors.panel
    ctx.fillRect(imgW, 0, width - imgW, height)
    ctx.fillStyle = colors.accent
    ctx.fillRect(imgW, 0, Math.max(4, Math.floor(width * 0.003)), height)
    _drawTextPanel(ctx, { x: imgW + Math.floor(width * 0.015), y: 0, w: width - imgW - Math.floor(width * 0.025), h: height }, colors, ad)

  } else if (layout === 'top-bottom') {
    const imgH = Math.floor(height * 0.55)
    ctx.drawImage(img, 0, 0, width, imgH)
    ctx.fillStyle = colors.panel
    ctx.fillRect(0, imgH, width, height - imgH)
    ctx.fillStyle = colors.accent
    ctx.fillRect(0, imgH, width, Math.max(3, Math.floor(height * 0.006)))
    _drawTextPanel(ctx, { x: Math.floor(width * 0.02), y: imgH + 4, w: width * 0.96, h: height - imgH - 4 }, colors, ad)

  } else {
    ctx.drawImage(img, 0, 0, width, height)
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, width, height)
    const pw = Math.min(width * 0.72, 900)
    const ph = Math.min(height * 0.78, 480)
    const px = (width - pw) / 2
    const py = (height - ph) / 2
    ctx.fillStyle = colors.panel + 'dd'
    _roundRect(ctx, px, py, pw, ph, Math.min(12, height * 0.025))
    ctx.fill()
    _drawTextPanel(ctx, { x: px + pw * 0.04, y: py, w: pw * 0.92, h: ph }, colors, ad)
  }
}

function _drawTextPanel(ctx, bounds, colors, ad) {
  const { x, y, w, h } = bounds
  const headline  = ad.headline  || ''
  const body      = ad.body      || ''
  const discount  = ad.discount
  const promoCode = ad.promoCode || ''
  const ctaText   = ad.ctaText   || 'Shop Now'

  const headFs = _clamp(h * 0.15, 12, 52)
  const bodyFs = _clamp(headFs * 0.52, 10, 22)
  const codeFs = _clamp(headFs * 0.38, 9, 16)
  const btnH   = _clamp(h * 0.18, 24, 52)

  let cursor = y + h * 0.1

  if (discount) {
    const r  = _clamp(h * 0.14, 20, 52)
    const bx = x + w - r - 4
    const by = y + r + 4
    ctx.save()
    ctx.beginPath()
    ctx.arc(bx, by, r, 0, Math.PI * 2)
    ctx.fillStyle = colors.accent
    ctx.fill()
    ctx.fillStyle = colors.ctaText
    ctx.font = 'bold ' + _clamp(r * 0.42, 8, 22) + 'px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(discount + '%', bx, by - r * 0.12)
    ctx.font = 'bold ' + _clamp(r * 0.3, 6, 14) + 'px sans-serif'
    ctx.fillText('OFF', bx, by + r * 0.32)
    ctx.restore()
  }

  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = colors.text
  ctx.font = 'bold ' + headFs + 'px sans-serif'
  const headW = discount ? w * 0.78 : w
  _wrapText(ctx, headline, headW).forEach(function(line) {
    if (cursor + headFs > y + h - btnH - 12) return
    ctx.fillText(line, x, cursor)
    cursor += headFs * 1.25
  })
  cursor += headFs * 0.2

  if (body) {
    ctx.font = bodyFs + 'px sans-serif'
    ctx.fillStyle = colors.subtext
    _wrapText(ctx, body, w).slice(0, 3).forEach(function(line) {
      if (cursor + bodyFs > y + h - btnH - 12) return
      ctx.fillText(line, x, cursor)
      cursor += bodyFs * 1.4
    })
    cursor += bodyFs * 0.3
  }

  if (promoCode && cursor + codeFs <= y + h - btnH - 8) {
    ctx.font = 'bold ' + codeFs + 'px monospace'
    ctx.fillStyle = colors.accent
    ctx.fillText('USE: ' + promoCode, x, cursor)
    cursor += codeFs * 1.8
  }

  if (ctaText) {
    ctx.font = 'bold ' + _clamp(btnH * 0.44, 10, 20) + 'px sans-serif'
    const btnW = Math.min(ctx.measureText(ctaText).width + btnH * 2, w * 0.68)
    const btnY = Math.min(cursor + h * 0.04, y + h - btnH - 8)
    _roundRect(ctx, x, btnY, btnW, btnH, btnH / 2)
    ctx.fillStyle = colors.ctaBg
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = colors.ctaText
    ctx.fillText(ctaText, x + btnW / 2, btnY + btnH / 2)
  }
}

function _clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }

function _wrapText(ctx, text, maxWidth) {
  if (!text) return []
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i]
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = words[i] }
    else line = test
  }
  if (line) lines.push(line)
  return lines
}

function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function _loadImage(src) {
  return new Promise(function(resolve) {
    if (!src) { resolve(_grayPlaceholder()); return }
    const img = new Image()
    img.onload  = function() { resolve(img) }
    img.onerror = function() { resolve(_grayPlaceholder()) }
    img.src = src
  })
}

function _grayPlaceholder() {
  const c = document.createElement('canvas')
  c.width = 100; c.height = 100
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 100, 100)
  g.addColorStop(0, '#444'); g.addColorStop(1, '#222')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 100, 100)
  const img = new Image()
  img.src = c.toDataURL()
  return img
}

Object.assign(window.AdGen, { COLOR_PRESETS, TEMPLATES, SIZE_PRESETS, generatePlaceholderImage, renderBanner })
