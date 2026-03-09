// src/components/Step2Template.js
;(function() {
  const { defineComponent, ref, computed } = Vue

  window.AdGen.Step2Template = defineComponent({
    name: 'Step2Template',
    props: { data: Object },
    emits: ['update', 'next', 'back'],
    setup(props, { emit }) {
      const { TEMPLATES, SIZE_PRESETS } = window.AdGen
      const template   = ref(props.data.template  || 'A')
      const sizePreset = ref(props.data.sizePreset || '1500x500')
      const customW    = ref(props.data.sizePreset === 'custom' ? props.data.width  : 800)
      const customH    = ref(props.data.sizePreset === 'custom' ? props.data.height : 400)

      const currentSize = computed(function() {
        const preset = SIZE_PRESETS.find(function(s) { return s.value === sizePreset.value })
        if (preset && preset.value !== 'custom') return { w: preset.w, h: preset.h }
        return { w: Math.max(100, parseInt(customW.value) || 800), h: Math.max(100, parseInt(customH.value) || 400) }
      })

      function proceed() {
        const s = currentSize.value
        emit('update', { template: template.value, sizePreset: sizePreset.value, width: s.w, height: s.h })
        emit('next')
      }

      return { template, sizePreset, customW, customH, currentSize, TEMPLATES, SIZE_PRESETS, proceed }
    },
    template: `
      <div class="step">
        <h2 class="step-title">Step 2 — Template & Size</h2>
        <p class="step-desc">Choose a locked layout template and set the banner dimensions.</p>

        <h3 class="section-heading">Layout Template</h3>
        <div class="template-grid">
          <div
            v-for="(t, key) in TEMPLATES"
            :key="key"
            :class="['template-card', template === key ? 'selected' : '']"
            @click="template = key"
          >
            <div class="template-thumb" :data-layout="t.layout">
              <div class="tt-img"></div>
              <div class="tt-text"></div>
            </div>
            <div class="template-label">
              <strong>{{ key }}</strong> — {{ t.name }}
            </div>
          </div>
        </div>

        <h3 class="section-heading">Size</h3>
        <div class="size-options">
          <label v-for="s in SIZE_PRESETS" :key="s.value" class="size-option">
            <input type="radio" :value="s.value" v-model="sizePreset" />
            <span>{{ s.label }}</span>
          </label>
        </div>
        <div v-if="sizePreset === 'custom'" class="custom-size">
          <label class="form-field inline">
            <span class="field-label">Width (px)</span>
            <input type="number" v-model="customW" min="100" max="4000" />
          </label>
          <label class="form-field inline">
            <span class="field-label">Height (px)</span>
            <input type="number" v-model="customH" min="100" max="4000" />
          </label>
        </div>
        <p class="size-display">Canvas: <strong>{{ currentSize.w }} × {{ currentSize.h }}px</strong></p>

        <div class="step-actions">
          <button class="btn btn-back" @click="$emit('back')">← Back</button>
          <button class="btn btn-next" @click="proceed">Next →</button>
        </div>
      </div>
    `
  })
})()
