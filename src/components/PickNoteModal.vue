<template>
  <dialog ref="dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Pick Note from {{ bucket.title }}</h3>
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="Search notes..." autofocus />
        </div>
      </div>

      <div class="notes-list">
        <table v-if="filteredNotes.length">
          <thead>
            <tr>
              <th style="width: 60%">Description</th>
              <th style="width: 20%">Time</th>
              <th style="width: 20%">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="note in filteredNotes" :key="note.id">
              <td>{{ note.description }}</td>
              <td>{{ note.timeEstimation }}m</td>
              <td>
                <button @click="startNote(note)" :disabled="note.status === 'in-progress'">Start</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No notes found</div>
      </div>

      <div class="modal-actions">
        <button class="danger" @click="$emit('close')">Close</button>
      </div>
    </div>
  </dialog>
</template>

<script>
export default {
  props: {
    show: Boolean,
    bucket: Object,
    notes: Array
  },
  data() {
    return {
      searchQuery: ''
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.$refs.dialog.showModal()
        this.$nextTick(() => {
          this.$el.querySelector('input').focus()
        })
      } else {
        this.$refs.dialog.close()
      }
    }
  },
  mounted() {
    this.$refs.dialog.addEventListener('close', () => {
      this.$emit('close')
    })
  },
  computed: {
    filteredNotes() {
      return this.notes.filter(note => note.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
    }
  },
  methods: {
    startNote(note) {
      this.$emit('start', note)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content {
  padding: 2rem;
  min-width: 600px;
  max-width: 1000px;

  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
}

.modal-header {
  margin-bottom: 2rem;

  h3 {
    font-size: 1.6rem;
    color: var(--primary);
    margin-bottom: 1rem;
  }
}

.search-box {
  margin-bottom: 1.5rem;

  input {
    width: 100%;
    padding: 0.8rem;
    font-size: 1rem;
  }
}

.notes-list {
  margin: 1rem 0;
  flex: 1;
  overflow-y: auto;

  table {
    width: 100%;
    border-collapse: collapse;

    th {
      position: sticky;
      top: 0;
      background: var(--light);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid var(--light);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--dark);
  opacity: 0.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}
</style>
