// src/components/Step4Style.js
;(function() {
  const { defineComponent, ref } = Vue

  window.AdGen.Step4Style = defineComponent({
    name: 'Step4Style',
    props: { data: Object },
    emits: ['update', 'next', 'back'],
    setup(props, { emit }) {
      const { COLOR_PRESETS } = window.AdGen
      const colorPreset = ref(props.data.colorPreset || 'sage')

      function proceed() {
        emit('update', { colorPreset: colorPreset.value })
        emit('next')
      }

      return { colorPreset, COLOR_PRESETS, proceed }
    },
    template: `
      <div class="step">
        <h2 class="step-title">Step 4 — Style</h2>
        <p class="step-desc">Choose one of three color presets. This controls the panel, text, and CTA colors.</p>

        <div class="preset-grid">
          <div
            v-for="(preset, key) in COLOR_PRESETS"
            :key="key"
            :class="['preset-card', colorPreset === key ? 'selected' : '']"
            @click="colorPreset = key"
          >
            <div class="preset-swatch" :style="{ background: preset.panel }">
              <div class="ps-row">
                <span class="ps-accent" :style="{ background: preset.accent }"></span>
                <span class="ps-text" :style="{ color: preset.text }">Headline</span>
              </div>
              <span class="ps-cta" :style="{ background: preset.ctaBg, color: preset.ctaText }">CTA</span>
            </div>
            <div class="preset-name">{{ preset.name }}</div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-back" @click="$emit('back')">← Back</button>
          <button class="btn btn-next" @click="proceed">Next →</button>
        </div>
      </div>
    `
  })
})()
