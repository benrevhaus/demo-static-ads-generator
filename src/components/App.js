// src/components/App.js
;(function() {
  const { defineComponent, ref } = Vue

  window.AdGen.App = defineComponent({
    name: 'App',
    components: {
      Wizard:  window.AdGen.Wizard,
      Gallery: window.AdGen.Gallery,
    },
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
})()
