<template>
  <div class="bucket">
    <h2>{{ bucket.title }}</h2>

    <div class="stats">
      <div class="count">
        <span class="number">{{ pendingNotes.length }}</span>
        <span class="label">Pending</span>
      </div>
      <div class="count">
        <span class="number">{{ inProgressNotes.length }}</span>
        <span class="label">In Progress</span>
      </div>
      <div class="count completed">
        <span class="number">{{ completedNotes.length }}</span>
        <span class="label">Completed</span>
      </div>
    </div>

    <div class="bucket-actions">
      <button v-if="showAddButton" @click="addNote">Add Note</button>
      <button class="secondary" @click="randomNote" :disabled="!pendingNotes.length">Random</button>
      <button class="secondary" @click="pickNote" :disabled="!pendingNotes.length">Pick</button>
    </div>

    <random-note-modal :show="showRandomModal" :bucket="bucket" :notes="pendingNotes" @close="closeRandomModal" @start="startNote" />

    <pick-note-modal :show="showPickModal" :bucket="bucket" :notes="pendingNotes" @close="closePickModal" @start="startNote" />
  </div>
</template>

<script>
import RandomNoteModal from './RandomNoteModal.vue'
import PickNoteModal from './PickNoteModal.vue'

export default {
  components: {
    RandomNoteModal,
    PickNoteModal
  },
  props: {
    bucket: Object,
    showAddButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showRandomModal: false,
      showPickModal: false
    }
  },
  computed: {
    pendingNotes() {
      return this.bucket.notes.filter(note => note.status === 'pending')
    },
    inProgressNotes() {
      return this.bucket.notes.filter(note => note.status === 'in-progress')
    },
    completedNotes() {
      return this.bucket.notes.filter(note => note.status === 'completed')
    }
  },
  methods: {
    addNote() {
      this.$emit('add-note', this.bucket)
    },
    randomNote() {
      this.showRandomModal = true
    },
    pickNote() {
      this.showPickModal = true
    },
    startNote(note) {
      this.$emit('start-note', {
        ...note,
        label: this.bucket.title
      })
    },
    closeRandomModal() {
      this.showRandomModal = false
    },
    closePickModal() {
      this.showPickModal = false
    }
  }
}
</script>

<style lang="scss" scoped>
.bucket {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 10px;
  box-shadow: 0 2px 4px var(--shadow);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--shadow);
  }

  h2 {
    color: var(--primary);
    margin-bottom: 15px;
    font-size: 1.5rem;
  }

  .bucket-actions {
    display: flex;
    gap: 0.8rem;
    justify-content: flex-end;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--light);
    border-radius: 6px;

    .count {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem;

      .number {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--primary);
      }

      .label {
        font-size: 0.8rem;
        color: var(--dark);
        opacity: 0.8;
      }

      &.completed .number {
        color: var(--secondary);
      }
    }
  }
}
</style>
