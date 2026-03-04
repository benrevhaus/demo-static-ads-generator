// src/components/App.js
import { defineComponent, ref } from 'vue'
import Wizard  from './Wizard.js'
import Gallery from './Gallery.js'

export default defineComponent({
  name: 'App',
  components: { Wizard, Gallery },
  setup() {
    const view = ref('wizard')
    return { view }
  },
  template: `
    <div class="app-shell">
      <header class="app-header">
        <div class="app-logo">Ad Generator</div>
        <nav class="app-nav">
          <button :class="['nav-tab', view === 'wizard'  ? 'active' : '']" @click="view = 'wizard'">Create</button>
          <button :class="['nav-tab', view === 'gallery' ? 'active' : '']" @click="view = 'gallery'">Gallery</button>
        </nav>
      </header>
      <main class="app-main">
        <Wizard  v-if="view === 'wizard'"  @go-gallery="view = 'gallery'" />
        <Gallery v-else                    @create-new="view = 'wizard'" />
      </main>
    </div>
  `
})
