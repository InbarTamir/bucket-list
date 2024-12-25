<template>
  <div class="data-actions">
    <button class="action-link" :disabled="isExporting" @click="$emit('export')">
      <font-awesome-icon :icon="isExporting ? 'spinner' : 'file-export'" :spin="isExporting" />
      {{ isExporting ? 'Exporting...' : 'Export' }}
    </button>
    <button class="action-link" :disabled="isImporting" @click="$emit('import')">
      <font-awesome-icon :icon="isImporting ? 'spinner' : 'file-import'" :spin="isImporting" />
      {{ isImporting ? 'Importing...' : 'Import' }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    isExporting: Boolean,
    isImporting: Boolean
  },
  data() {
    return {
      isOpen: false
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    handleClickOutside(event) {
      if (!this.$refs.dropdown?.contains(event.target) && !this.$refs.trigger?.contains(event.target)) {
        this.isOpen = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.data-actions {
  display: flex;
  gap: 1rem;

  .action-link {
    background: none;
    color: var(--secondary);
    padding: 0;
    display: flex;
    align-items: center;
    font-size: 0.9rem;

    &:hover {
      color: var(--primary);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
