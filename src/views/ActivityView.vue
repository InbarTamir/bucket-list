<template>
  <div class="activity-view">
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
        <tr v-for="record in sortedRecords" :key="record.id">
          <td class="description-cell">{{ getNoteDescription(record) }}</td>
          <td class="label-cell">
            <span v-if="getNoteLabel(record)" class="label">{{ getNoteLabel(record) }}</span
            ><span v-else>-</span>
          </td>
          <td class="date-cell">{{ formatDate(record.startedAt) }}</td>
          <td class="date-cell">{{ record.completedAt ? formatDate(record.completedAt) : '-' }}</td>
          <td class="number-cell">{{ getNoteTimeEstimation(record) }}m</td>
          <td :class="['number-cell', { overdue: isOverdue(record) }]">
            {{ record.timeToComplete ? `${record.timeToComplete}m` : '-' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { DATE_FORMAT_OPTIONS } from '../utils/constants'
import { mapState } from 'vuex'

export default {
  data() {
    return {
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
    enrichedRecords() {
      return this.activityRecords.map(record => {
        const note = this.notes.find(n => n.id === record.noteId)
        return {
          ...record,
          description: note?.description || 'Unknown',
          label: note?.label || '',
          timeEstimation: note?.timeEstimation || 0
        }
      })
    },
    sortedRecords() {
      return [...this.enrichedRecords].sort((a, b) => {
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
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
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
      const note = this.getNoteForRecord(record)
      return note && record.timeToComplete > note.timeEstimation + 5
    },
    getNoteForRecord(record) {
      return this.notes.find(note => note.id === record.noteId)
    },
    getNoteDescription(record) {
      const note = this.getNoteForRecord(record)
      return note?.description || 'Unknown'
    },
    getNoteLabel(record) {
      const note = this.getNoteForRecord(record)
      return note?.label
    },
    getNoteTimeEstimation(record) {
      const note = this.getNoteForRecord(record)
      return note?.timeEstimation || 0
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

  table {
    width: 100%;
    min-width: 800px; // Prevent squishing on small screens
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.9rem;

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
        // text-align: right;
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
    }
  }
}
</style>
