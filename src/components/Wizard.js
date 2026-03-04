// src/components/Wizard.js
import { defineComponent, ref, reactive } from 'vue'
import { saveDraft, getDraft, clearDraft, saveAd } from '../state.js'
import Step1Image    from './Step1Image.js'
import Step2Template from './Step2Template.js'
import Step3Content  from './Step3Content.js'
import Step4Style    from './Step4Style.js'
import Step5Preview  from './Step5Preview.js'
import Step6Export   from './Step6Export.js'

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

export default defineComponent({
  name: 'Wizard',
  components: { Step1Image, Step2Template, Step3Content, Step4Style, Step5Preview, Step6Export },
  emits: ['go-gallery'],
  setup(_, { emit }) {
    const step  = ref(1)
    const draft = reactive(getDraft() || freshDraft())

    function update(patch) {
      Object.assign(draft, patch)
      saveDraft({ ...draft })
    }

    function next()  { saveDraft({ ...draft }); step.value++ }
    function back()  { step.value-- }

    function onPreviewReady(thumbnailRef) {
      update({ thumbnailRef })
      saveAd({ ...draft, thumbnailRef })
    }

    function onExported() {
      saveAd({ ...draft })
    }

    function startNew() {
      const fresh = freshDraft()
      Object.assign(draft, fresh)
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
