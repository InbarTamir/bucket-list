<template>
  <div class="activity-view">
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" @click="sort(column.key)">
            {{ column.label }}
            <span v-if="sortKey === column.key">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in sortedRecords" :key="record.id">
          <td>{{ record.note_description }}</td>
          <td>{{ record.label || '-' }}</td>
          <td>{{ record.time_estimation }}m</td>
          <td>{{ formatDate(record.started_at) }}</td>
          <td>{{ record.completed_at ? formatDate(record.completed_at) : '-' }}</td>
          <td :class="{ overdue: isOverdue(record) }">
            {{ record.time_to_complete ? `${record.time_to_complete.toFixed(1)}m` : '-' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { DATE_FORMAT_OPTIONS } from '../utils/constants'

export default {
  data() {
    return {
      columns: [
        { key: 'note_description', label: 'Description' },
        { key: 'label', label: 'Label' },
        { key: 'time_estimation', label: 'Estimated Time' },
        { key: 'started_at', label: 'Started' },
        { key: 'completed_at', label: 'Completed' },
        { key: 'time_to_complete', label: 'Time Taken' }
      ],
      sortKey: 'started_at',
      sortOrder: 'desc'
    }
  },
  computed: {
    sortedRecords() {
      return [...this.$store.state.activityRecords].sort((a, b) => {
        const aVal = a[this.sortKey]
        const bVal = b[this.sortKey]
        const modifier = this.sortOrder === 'asc' ? 1 : -1

        if (!aVal) return 1
        if (!bVal) return -1
        return aVal > bVal ? modifier : -modifier
      })
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString(undefined, DATE_FORMAT_OPTIONS)
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
      return record.time_to_complete && record.time_to_complete > record.time_estimation + 5
    }
  }
}
</script>

<style lang="scss" scoped>
.activity-view {
  padding: 20px;

  table {
    width: 100%;
    border-collapse: collapse;

    th {
      cursor: pointer;
      &:hover {
        background: #f5f5f5;
      }
    }

    td,
    th {
      padding: 8px;
      border: 1px solid #ddd;
      text-align: left;
    }

    .overdue {
      color: red;
    }
  }
}
</style>
