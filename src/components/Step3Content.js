// src/components/Step3Content.js
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'Step3Content',
  props: { data: Object },
  emits: ['update', 'next', 'back'],
  setup(props, { emit }) {
    const headline  = ref(props.data.headline  || '')
    const body      = ref(props.data.body      || '')
    const discount  = ref(props.data.discount != null ? String(props.data.discount) : '')
    const promoCode = ref(props.data.promoCode || '')
    const ctaText   = ref(props.data.ctaText   || 'Shop Now')
    const ctaUrl    = ref(props.data.ctaUrl    || '')

    const headLen = computed(() => headline.value.length)
    const bodyLen = computed(() => body.value.length)

    const errors = computed(() => {
      const e = []
      if (!headline.value.trim()) e.push('Headline is required.')
      if (headLen.value > 50)     e.push('Headline must be ≤ 50 characters.')
      if (bodyLen.value > 150)    e.push('Body must be ≤ 150 characters.')
      if (discount.value !== '') {
        const n = Number(discount.value)
        if (isNaN(n) || n < 0 || n > 50) e.push('Discount must be a number between 0 and 50.')
      }
      if (!ctaText.value.trim()) e.push('CTA button text is required.')
      return e
    })

    function proceed() {
      if (errors.value.length) return
      emit('update', {
        headline:  headline.value,
        body:      body.value,
        discount:  discount.value === '' ? null : Number(discount.value),
        promoCode: promoCode.value,
        ctaText:   ctaText.value,
        ctaUrl:    ctaUrl.value,
      })
      emit('next')
    }

    return { headline, body, discount, promoCode, ctaText, ctaUrl, headLen, bodyLen, errors, proceed }
  },
  template: `
    <div class="step">
      <h2 class="step-title">Step 3 — Content</h2>
      <p class="step-desc">Write your ad copy. Fields are validated before you can proceed.</p>

      <div class="form-grid">
        <label class="form-field">
          <span class="field-label">
            Headline
            <span class="char-count" :class="headLen > 50 ? 'over' : ''">{{ headLen }}/50</span>
          </span>
          <input v-model="headline" maxlength="50" placeholder="Your main message" />
        </label>

        <label class="form-field full-width">
          <span class="field-label">
            Body Copy
            <span class="char-count" :class="bodyLen > 150 ? 'over' : ''">{{ bodyLen }}/150</span>
          </span>
          <textarea v-model="body" maxlength="150" rows="3" placeholder="Supporting copy (optional)"></textarea>
        </label>

        <label class="form-field">
          <span class="field-label">Discount % <span class="hint">(optional, ≤ 50)</span></span>
          <input v-model="discount" type="number" min="0" max="50" placeholder="e.g. 20" />
        </label>

        <label class="form-field">
          <span class="field-label">Promo Code <span class="hint">(optional)</span></span>
          <input v-model="promoCode" maxlength="20" placeholder="e.g. SUMMER20" />
        </label>

        <label class="form-field">
          <span class="field-label">CTA Button Text</span>
          <input v-model="ctaText" maxlength="30" placeholder="Shop Now" />
        </label>

        <label class="form-field">
          <span class="field-label">CTA URL <span class="hint">(optional)</span></span>
          <input v-model="ctaUrl" type="url" placeholder="https://example.com" />
        </label>
      </div>

      <div v-if="errors.length" class="errors-box">
        <div v-for="e in errors" :key="e" class="error-msg">{{ e }}</div>
      </div>

      <div class="step-actions">
        <button class="btn btn-back" @click="$emit('back')">← Back</button>
        <button class="btn btn-next" @click="proceed" :disabled="errors.length > 0">Next →</button>
      </div>
    </div>
  `
})
