// src/components/Step6Export.js
;(function() {
  const { defineComponent, ref, onMounted } = Vue

  window.AdGen.Step6Export = defineComponent({
    name: 'Step6Export',
    props: { data: Object },
    emits: ['exported', 'back', 'start-new', 'go-gallery'],
    setup(props, { emit }) {
      const canvasRef = ref(null)
      const rendering = ref(true)
      const error     = ref('')
      const exported  = ref(false)

      onMounted(async function() {
        try {
          const canvas = canvasRef.value
          canvas.width  = props.data.width
          canvas.height = props.data.height
          await window.AdGen.renderBanner(canvas, props.data)
          rendering.value = false
        } catch (e) {
          error.value = 'Render failed: ' + (e.message || e)
          rendering.value = false
        }
      })

      function downloadPng() {
        const canvas = canvasRef.value
        const a = document.createElement('a')
        a.href = canvas.toDataURL('image/png')
        a.download = 'ad-' + props.data.id + '.png'
        a.click()
        exported.value = true
        emit('exported')
      }

      function downloadPdf() {
        if (!window.jspdf) { alert('jsPDF library not available.'); return }
        const canvas  = canvasRef.value
        const imgData = canvas.toDataURL('image/png')
        const { jsPDF } = window.jspdf
        const w = props.data.width
        const h = props.data.height
        const pdf = new jsPDF({
          orientation: w >= h ? 'landscape' : 'portrait',
          unit: 'px',
          format: [w, h],
          hotfixes: ['px_scaling'],
        })
        pdf.addImage(imgData, 'PNG', 0, 0, w, h)
        pdf.save('ad-' + props.data.id + '.pdf')
        exported.value = true
        emit('exported')
      }

      return { canvasRef, rendering, error, exported, downloadPng, downloadPdf }
    },
    template: `
      <div class="step">
        <h2 class="step-title">Step 6 — Export</h2>
        <p class="step-desc">Download your finished ad as PNG or PDF.</p>

        <div v-if="rendering" class="status-msg">
          <span class="spinner"></span> Rendering…
        </div>
        <div v-if="error" class="error-msg">{{ error }}</div>

        <div class="preview-wrap">
          <canvas ref="canvasRef" class="banner-canvas"></canvas>
        </div>

        <div v-if="!rendering && !error" class="export-btns">
          <button class="btn btn-primary" @click="downloadPng">⬇ Download PNG</button>
          <button class="btn btn-secondary" @click="downloadPdf">⬇ Download PDF</button>
          <span v-if="exported" class="exported-badge">Saved to gallery ✓</span>
        </div>

        <div class="step-actions">
          <button class="btn btn-back" @click="$emit('back')">← Back</button>
          <div class="action-group">
            <button class="btn btn-secondary" @click="$emit('go-gallery')">View Gallery →</button>
            <button class="btn btn-primary" @click="$emit('start-new')">+ New Ad</button>
          </div>
        </div>
      </div>
    `
  })
})()
