<template>
  <div class="activity-view">
    <div v-if="!activityRecords.length" class="empty-guide">
      <font-awesome-icon icon="chart-line" class="feature-icon" />
      <h2>Track Your Activities</h2>
      <div class="features">
        <div class="feature">
          <div class="feature-header">
            <font-awesome-icon icon="play" />
            <h3>Start Notes</h3>
          </div>
          <p>Begin working on notes from your buckets</p>
        </div>
        <div class="feature">
          <div class="feature-header">
            <font-awesome-icon icon="stopwatch" />
            <h3>Track Time</h3>
          </div>
          <p>Compare estimated vs actual completion time</p>
        </div>
        <div class="feature">
          <div class="feature-header">
            <font-awesome-icon icon="history" />
            <h3>View History</h3>
          </div>
          <p>See all your completed activities here</p>
        </div>
      </div>
      <router-link to="/" class="start-link">
        <button class="primary"><font-awesome-icon icon="arrow-left" /> Go to Dashboard</button>
      </router-link>
    </div>

    <template v-else>
      <div class="toolbar">
        <input type="text" v-model="searchQuery" placeholder="Search by description..." class="search-input" />
      </div>
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" @click="sort(column.key)">
              {{ column.label }}
              <font-awesome-icon :icon="sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'" :class="['sort-icon', { active: sortKey === column.key }]" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id">
            <td class="description-cell">{{ record.description }}</td>
            <td class="label-cell">
              <span v-if="record.label" class="label">{{ record.label }}</span>
              <span v-else>-</span>
            </td>
            <td class="date-cell">{{ formatDate(record.startedAt) }}</td>
            <td class="date-cell">{{ record.completedAt ? formatDate(record.completedAt) : '-' }}</td>
            <td class="number-cell">{{ record.timeEstimation }}m</td>
            <td :class="['number-cell', { overdue: isOverdue(record) }]" :data-tooltip="getOverdueTooltip(record)">
              {{ record.timeToComplete ? `${record.timeToComplete}m` : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script>
import { DATE_FORMAT_OPTIONS } from '../utils/constants'
import Helpers from '@/utils/helpers'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      searchQuery: '',
      columns: [
        { key: 'description', label: 'Description' },
        { key: 'label', label: 'Label' },
        { key: 'startedAt', label: 'Started' },
        { key: 'completedAt', label: 'Completed' },
        { key: 'timeEstimation', label: 'Estimated Time' },
        { key: 'timeToComplete', label: 'Time Taken' }
      ],
      sortKey: 'startedAt',
      sortOrder: 'desc'
    }
  },
  computed: {
    ...mapState(['notes', 'activityRecords']),
    sortedRecords() {
      return this.activityRecords.toSorted((a, b) => {
        let aVal = a[this.sortKey]
        let bVal = b[this.sortKey]

        // Handle date fields
        if (['startedAt', 'completedAt'].includes(this.sortKey)) {
          aVal = aVal ? new Date(aVal).getTime() : 0
          bVal = bVal ? new Date(bVal).getTime() : 0
        }

        const modifier = this.sortOrder === 'asc' ? 1 : -1
        if (!aVal) return 1 * modifier
        if (!bVal) return -1 * modifier
        return aVal > bVal ? 1 * modifier : -1 * modifier
      })
    },
    filteredRecords() {
      if (!this.searchQuery) return this.sortedRecords

      const query = this.searchQuery.toLowerCase()
      return this.sortedRecords.filter(record => record.description.toLowerCase().includes(query))
    }
  },
  methods: {
    formatDate(date) {
      return Helpers.formatDateTime(date)
    },
    sort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortOrder = 'asc'
      }
    },
    isOverdue(record) {
      if (!record.timeToComplete) return false
      return record.timeToComplete > record.timeEstimation + 5
    },
    getOverdueTooltip(record) {
      if (!this.isOverdue(record)) return null
      const diff = record.timeToComplete - record.timeEstimation
      return `${diff.toFixed(1)}m over estimation`
    }
  }
}
</script>

<style lang="scss" scoped>
.activity-view {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px var(--shadow);
  max-width: 100%;
  overflow-x: auto; // Allow horizontal scroll on small screens

  .toolbar {
    margin-bottom: 1rem;

    .search-input {
      width: 300px;
      padding: 8px 12px;
      border: 2px solid var(--light);
      border-radius: 6px;
      font-size: 0.9rem;
      transition: all 0.2s ease;

      &:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(56, 172, 247, 0.1);
      }

      &::placeholder {
        color: var(--secondary);
      }
    }
  }

  table {
    width: 100%;
    min-width: 800px; // Prevent squishing on small screens
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.9rem;
    cursor: default;

    th,
    td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--light);
      text-align: center; // Center all columns by default

      &.description-cell {
        text-align: left; // Keep description left-aligned
        min-width: 200px;
        max-width: 400px;
      }

      &.label-cell {
        min-width: 100px;
        .label {
          background: var(--primary);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
        }
      }

      &.date-cell {
        min-width: 150px;
        white-space: nowrap;
      }

      &.number-cell {
        min-width: 80px;
        font-variant-numeric: tabular-nums;
      }
    }

    th {
      background: white;
      font-weight: 600;
      border-bottom: 2px solid var(--light);
      position: sticky;
      top: 0;
      z-index: 1;
      cursor: pointer;
      user-select: none;
      text-align: center; // Center all headers by default

      &:first-child {
        text-align: left; // Left align the description header
      }

      &:hover {
        background: var(--light);
      }

      .sort-icon {
        margin-left: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;

        &.active {
          opacity: 0.5;
        }
      }

      &:hover .sort-icon {
        opacity: 0.3;
      }
    }

    tr {
      &:hover td {
        background: var(--light);
      }

      &:last-child td {
        border-bottom: none;
      }
    }

    td.overdue {
      color: var(--danger);
      font-weight: 500;
      position: relative; // For tooltip positioning
      cursor: help; // Show help cursor on overdue times

      // Only override specific tooltip properties for overdue cells
      &[data-tooltip] {
        &:after {
          background: var(--danger);
          margin-bottom: 8px;
        }
      }
    }
  }

  .empty-guide {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow);

    .feature-icon {
      color: var(--primary);
      font-size: 3rem;
      margin-bottom: 1.5rem;
    }

    h2 {
      color: var(--dark);
      font-size: 1.8rem;
      margin-bottom: 2rem;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      width: 100%;
      max-width: 900px;
      margin-bottom: 2rem;

      .feature {
        padding: 1.5rem;
        background: var(--light);
        border-radius: 8px;
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          color: var(--primary);

          svg {
            font-size: 1.2rem;
          }

          h3 {
            font-size: 1.2rem;
            color: var (--dark);
          }
        }

        p {
          color: var(--dark);
          opacity: 0.8;
          font-size: 1rem;
          line-height: 1.4;
        }
      }
    }

    .start-link button {
      font-size: 1.1rem;
      padding: 0.8rem 1.5rem;

      svg {
        margin-right: 0.5rem;
      }
    }
  }
}
</style>
