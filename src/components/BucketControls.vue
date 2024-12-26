<template>
  <div class="bucket-controls">
    <div class="sort-controls" ref="controlsContainer">
      <button class="icon-button" @click="toggleControls" data-tooltip="Sort & Filter">
        <font-awesome-icon icon="filter" />
      </button>

      <div v-if="showControls" class="controls-panel" ref="panel" @keydown.esc="closeControls">
        <div class="sort-section">
          <h4>Sort by</h4>
          <select v-model="sortValue" @change="updateSort">
            <template v-if="type === 'labeled'">
              <option value="createdAt">Creation Date</option>
              <option value="alpha">Alphabetical</option>
            </template>
            <template v-else>
              <option value="time">Time Estimation</option>
            </template>
            <option value="pending">Pending Count</option>
            <option value="active">Active Count</option>
            <option value="total">Total Notes</option>
          </select>
        </div>

        <div class="filter-section">
          <h4>Filter</h4>
          <label>
            <input type="checkbox" v-model="filters.hideEmpty" @change="updateFilters" />
            Hide Empty Buckets
          </label>
          <label>
            <input type="checkbox" v-model="filters.showActive" @change="updateFilters" />
            Show Active Only
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'labeled',
      validator: value => ['labeled', 'time'].includes(value)
    }
  },
  data() {
    return {
      showControls: false,
      sortValue: this.type === 'labeled' ? 'createdAt' : 'time',
      filters: {
        hideEmpty: false,
        showActive: false
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
    document.addEventListener('keydown', this.handleEscape)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    document.removeEventListener('keydown', this.handleEscape)
  },
  methods: {
    toggleControls() {
      this.showControls = !this.showControls
    },
    updateSort() {
      this.$emit('sort', this.sortValue)
    },
    updateFilters() {
      this.$emit('filter', { ...this.filters })
    },
    closeControls() {
      this.showControls = false
    },
    handleClickOutside(event) {
      const container = this.$refs.controlsContainer
      if (container && !container.contains(event.target)) {
        this.closeControls()
      }
    },
    handleEscape(event) {
      if (event.key === 'Escape' && this.showControls) {
        this.closeControls()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bucket-controls {
  position: relative;

  .controls-panel {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 0.5rem;
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 4px 12px var(--shadow);
    min-width: 200px;
    z-index: 10;
    outline: none; // Remove focus outline since we're handling keyboard interaction

    h4 {
      color: var(--dark);
      margin-bottom: 0.5rem;
    }

    .sort-section {
      margin-bottom: 1rem;

      select {
        width: 100%;
      }
    }

    .filter-section {
      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
      }
    }
  }
}
</style>
