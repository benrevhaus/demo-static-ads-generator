// src/components/Step1Image.js
import { defineComponent, ref, reactive } from 'vue'
import { generatePlaceholderImage } from '../renderer.js'

export default defineComponent({
  name: 'Step1Image',
  props: { data: Object },
  emits: ['update', 'next'],
  setup(props, { emit }) {
    const prompt = reactive({ ...props.data.imagePrompt })
    const imageRef = ref(props.data.imageRef || '')
    const generating = ref(false)
    const error = ref('')

    const builtPrompt = () =>
      `${prompt.mood} ${prompt.productCategory} ad — ${prompt.subject || 'product'} on ${prompt.backgroundStyle || 'clean'} background with ${prompt.colorHints || 'natural'} tones. Campaign: "${prompt.campaignHeader || 'Untitled'}"`

    async function generate() {
      generating.value = true
      error.value = ''
      try {
        await new Promise(r => setTimeout(r, 700))
        const dataUrl = generatePlaceholderImage(prompt, 900, 450)
        imageRef.value = dataUrl
        emit('update', { imagePrompt: { ...prompt }, imageRef: dataUrl })
      } catch (e) {
        error.value = 'Generation failed. Please retry.'
      } finally {
        generating.value = false
      }
    }

    function proceed() {
      if (!imageRef.value) { error.value = 'Please generate an image first.'; return }
      emit('update', { imagePrompt: { ...prompt }, imageRef: imageRef.value })
      emit('next')
    }

    return { prompt, imageRef, generating, error, builtPrompt, generate, proceed }
  },
  template: `
    <div class="step">
      <h2 class="step-title">Step 1 — Generate Image</h2>
      <p class="step-desc">Build a structured prompt, then generate a placeholder image for your ad.</p>

      <div class="form-grid">
        <label class="form-field">
          <span class="field-label">Campaign Header</span>
          <input v-model="prompt.campaignHeader" maxlength="80" placeholder="e.g. Summer Wellness Sale" />
        </label>
        <label class="form-field">
          <span class="field-label">Product Category</span>
          <input v-model="prompt.productCategory" maxlength="60" placeholder="e.g. Skincare" />
        </label>
        <label class="form-field">
          <span class="field-label">Mood</span>
          <select v-model="prompt.mood">
            <option value="calming">Calming</option>
            <option value="luxurious">Luxurious</option>
            <option value="healing">Healing</option>
          </select>
        </label>
        <label class="form-field">
          <span class="field-label">Subject Description</span>
          <input v-model="prompt.subject" maxlength="120" placeholder="e.g. woman in a field of lavender" />
        </label>
        <label class="form-field">
          <span class="field-label">Background Style</span>
          <input v-model="prompt.backgroundStyle" maxlength="80" placeholder="e.g. soft bokeh, minimal studio" />
        </label>
        <label class="form-field">
          <span class="field-label">Color Hints</span>
          <input v-model="prompt.colorHints" maxlength="80" placeholder="e.g. sage green, ivory cream" />
        </label>
      </div>

      <div class="prompt-preview">
        <span class="prompt-label">Prompt preview:</span>
        <span class="prompt-text">{{ builtPrompt() }}</span>
      </div>

      <button class="btn btn-primary generate-btn" @click="generate" :disabled="generating">
        <span v-if="generating" class="spinner"></span>
        {{ generating ? 'Generating…' : 'Generate Placeholder Image' }}
      </button>

      <div v-if="error" class="error-msg">{{ error }}</div>

      <div v-if="imageRef" class="image-preview">
        <img :src="imageRef" alt="Generated placeholder" />
      </div>

      <div class="step-actions">
        <span></span>
        <button class="btn btn-next" @click="proceed" :disabled="!imageRef">Next →</button>
      </div>
    </div>
  `
})
