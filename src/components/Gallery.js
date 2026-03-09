// src/components/Gallery.js
;(function() {
  const { defineComponent, ref, computed } = Vue

  window.AdGen.Gallery = defineComponent({
    name: 'Gallery',
    emits: ['create-new'],
    setup(_, { emit }) {
      const { getAllAds, tagAd, deleteAd, deleteAllUntagged } = window.AdGen
      const filter    = ref('all')
      const ads       = ref(getAllAds())
      const tagInputs = ref({})

      function refresh() {
        ads.value = getAllAds()
        ads.value.forEach(function(ad) {
          if (tagInputs.value[ad.id] === undefined) tagInputs.value[ad.id] = ad.tag || ''
        })
      }
      refresh()

      const filtered = computed(function() {
        if (filter.value === 'tagged')   return ads.value.filter(function(a) { return a.tag && a.tag.trim() })
        if (filter.value === 'untagged') return ads.value.filter(function(a) { return !a.tag || !a.tag.trim() })
        return ads.value
      })

      function applyTag(id) {
        tagAd(id, (tagInputs.value[id] || '').trim())
        refresh()
      }

      function remove(id) {
        if (confirm('Delete this ad?')) { deleteAd(id); delete tagInputs.value[id]; refresh() }
      }

      function bulkDelete() {
        const count = ads.value.filter(function(a) { return !a.tag || !a.tag.trim() }).length
        if (!count) { alert('No untagged ads to delete.'); return }
        if (confirm('Delete ' + count + ' untagged ad(s)? This cannot be undone.')) {
          deleteAllUntagged(); refresh()
        }
      }

      function fmtDate(ts) {
        return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      }

      return { filter, ads, filtered, tagInputs, applyTag, remove, bulkDelete, fmtDate }
    },
    template: `
      <div class="gallery">
        <div class="gallery-header">
          <h2>Gallery</h2>
          <div class="gallery-controls">
            <div class="filter-tabs">
              <button :class="['filter-tab', filter === 'all'      ? 'active' : '']" @click="filter = 'all'">All ({{ ads.length }})</button>
              <button :class="['filter-tab', filter === 'tagged'   ? 'active' : '']" @click="filter = 'tagged'">Tagged</button>
              <button :class="['filter-tab', filter === 'untagged' ? 'active' : '']" @click="filter = 'untagged'">Untagged</button>
            </div>
            <div class="gallery-actions">
              <button class="btn btn-danger" @click="bulkDelete">Delete All Untagged</button>
              <button class="btn btn-primary" @click="$emit('create-new')">+ Create New</button>
            </div>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="gallery-empty">
          <p v-if="ads.length === 0">No ads yet.</p>
          <p v-else>No ads match this filter.</p>
          <button class="btn btn-primary" @click="$emit('create-new')">Create your first ad</button>
        </div>

        <div class="gallery-grid">
          <div v-for="ad in filtered" :key="ad.id" class="gallery-card">
            <button class="card-delete" @click="remove(ad.id)" title="Delete ad">✕</button>

            <div class="card-thumb">
              <img v-if="ad.thumbnailRef" :src="ad.thumbnailRef" :alt="ad.headline" />
              <div v-else class="thumb-placeholder">No preview</div>
            </div>

            <div class="card-body">
              <div class="card-headline">{{ ad.headline || '(no headline)' }}</div>
              <div class="card-meta">
                {{ ad.width }}×{{ ad.height }}px &middot; Template {{ ad.template }} &middot; {{ fmtDate(ad.createdAt) }}
              </div>
              <div class="tag-row">
                <input
                  v-model="tagInputs[ad.id]"
                  :placeholder="ad.tag || 'Add a tag…'"
                  @keydown.enter="applyTag(ad.id)"
                  maxlength="30"
                  class="tag-input"
                />
                <button class="btn-sm" @click="applyTag(ad.id)">Tag</button>
              </div>
              <span v-if="ad.tag" class="tag-badge">{{ ad.tag }}</span>
            </div>
          </div>
        </div>
      </div>
    `
  })
})()
