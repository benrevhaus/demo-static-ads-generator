// src/components/Wizard.js
;(function() {
  const { defineComponent, ref, reactive } = Vue

  const STEPS = ['Image', 'Template', 'Content', 'Style', 'Preview', 'Export']

  function freshDraft() {
    return {
      id:           Date.now().toString(36) + Math.random().toString(36).slice(2),
      createdAt:    Date.now(),
      imagePrompt:  { campaignHeader: '', productCategory: '', mood: 'calming', subject: '', backgroundStyle: '', colorHints: '' },
      imageRef:     '',
      template:     'A',
      sizePreset:   '1500x500',
      width:        1500,
      height:       500,
      headline:     '',
      body:         '',
      discount:     null,
      promoCode:    '',
      ctaText:      'Shop Now',
      ctaUrl:       '',
      colorPreset:  'sage',
      tag:          '',
      thumbnailRef: '',
    }
  }

  window.AdGen.Wizard = defineComponent({
    name: 'Wizard',
    components: {
      Step1Image:    window.AdGen.Step1Image,
      Step2Template: window.AdGen.Step2Template,
      Step3Content:  window.AdGen.Step3Content,
      Step4Style:    window.AdGen.Step4Style,
      Step5Preview:  window.AdGen.Step5Preview,
      Step6Export:   window.AdGen.Step6Export,
    },
    emits: ['go-gallery'],
    setup(_, { emit }) {
      const { saveDraft, getDraft, clearDraft, saveAd } = window.AdGen
      const step  = ref(1)
      const draft = reactive(getDraft() || freshDraft())

      function update(patch) {
        Object.assign(draft, patch)
        saveDraft(Object.assign({}, draft))
      }

      function next()  { saveDraft(Object.assign({}, draft)); step.value++ }
      function back()  { step.value-- }

      function onPreviewReady(thumbnailRef) {
        update({ thumbnailRef: thumbnailRef })
        saveAd(Object.assign({}, draft, { thumbnailRef: thumbnailRef }))
      }

      function onExported() { saveAd(Object.assign({}, draft)) }

      function startNew() {
        Object.assign(draft, freshDraft())
        clearDraft()
        step.value = 1
      }

      return { step, draft, update, next, back, onPreviewReady, onExported, startNew, STEPS, emit }
    },
    template: `
      <div class="wizard">
        <nav class="step-nav">
          <div
            v-for="(label, i) in STEPS"
            :key="i"
            :class="['step-pip', step === i+1 ? 'active' : '', step > i+1 ? 'done' : '']"
          >
            <div class="pip-circle">{{ step > i+1 ? '✓' : i+1 }}</div>
            <div class="pip-label">{{ label }}</div>
          </div>
        </nav>

        <div class="wizard-body">
          <Step1Image    v-if="step === 1" :data="draft" @update="update" @next="next" />
          <Step2Template v-else-if="step === 2" :data="draft" @update="update" @next="next" @back="back" />
          <Step3Content  v-else-if="step === 3" :data="draft" @update="update" @next="next" @back="back" />
          <Step4Style    v-else-if="step === 4" :data="draft" @update="update" @next="next" @back="back" />
          <Step5Preview  v-else-if="step === 5" :data="draft" @preview-ready="onPreviewReady" @next="next" @back="back" />
          <Step6Export   v-else-if="step === 6" :data="draft" @exported="onExported" @back="back" @start-new="startNew" @go-gallery="emit('go-gallery')" />
        </div>
      </div>
    `
  })
})()
