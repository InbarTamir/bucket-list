<template>
  <div class="bucket-controls">
    <div class="sort-controls">
      <button class="icon-button" @click="toggleControls" data-tooltip="Sort & Filter">
        <font-awesome-icon icon="filter" />
      </button>

      <div v-if="showControls" class="controls-panel">
        <div class="sort-section">
          <h4>Sort by</h4>
          <select v-model="sortValue" @change="updateSort">
            <template v-if="type === 'labeled'">
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
      sortValue: this.type === 'labeled' ? 'alpha' : 'time',
      filters: {
        hideEmpty: false,
        showActive: false
      }
    }
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
