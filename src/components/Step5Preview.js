// src/components/Step5Preview.js
import { defineComponent, ref, onMounted } from 'vue'
import { renderBanner } from '../renderer.js'

export default defineComponent({
  name: 'Step5Preview',
  props: { data: Object },
  emits: ['preview-ready', 'next', 'back'],
  setup(props, { emit }) {
    const canvasRef  = ref(null)
    const thumbRef   = ref(null)
    const rendering  = ref(true)
    const error      = ref('')

    onMounted(async () => {
      try {
        const canvas = canvasRef.value
        canvas.width  = props.data.width
        canvas.height = props.data.height
        await renderBanner(canvas, props.data)

        // Generate thumbnail (max 360px wide)
        const tW = 360
        const tH = Math.round(tW * props.data.height / props.data.width)
        const thumb = thumbRef.value
        thumb.width  = tW
        thumb.height = tH
        thumb.getContext('2d').drawImage(canvas, 0, 0, tW, tH)

        rendering.value = false
        emit('preview-ready', thumb.toDataURL('image/png'))
      } catch (e) {
        error.value = 'Preview render failed: ' + (e.message || e)
        rendering.value = false
      }
    })

    return { canvasRef, thumbRef, rendering, error }
  },
  template: `
    <div class="step">
      <h2 class="step-title">Step 5 — Preview</h2>
      <p class="step-desc">Your banner rendered at full resolution. It will be auto-saved to the gallery.</p>

      <div v-if="rendering" class="status-msg">
        <span class="spinner"></span> Rendering preview…
      </div>
      <div v-if="error" class="error-msg">{{ error }}</div>

      <div class="preview-wrap">
        <canvas ref="canvasRef" class="banner-canvas"></canvas>
      </div>
      <canvas ref="thumbRef" style="display:none"></canvas>

      <div class="step-actions">
        <button class="btn btn-back" @click="$emit('back')">← Back</button>
        <button class="btn btn-next" @click="$emit('next')" :disabled="rendering || !!error">
          Next: Export →
        </button>
      </div>
    </div>
  `
})
