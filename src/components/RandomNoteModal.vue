<template>
  <dialog ref="dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Random Note from {{ bucket.title }}</h3>
      </div>

      <div v-if="currentNote" class="note-content">
        <div class="note-info">
          <p class="description">{{ currentNote.description }}</p>
          <span class="time-badge">{{ currentNote.timeEstimation }}m</span>
        </div>
        <div class="actions">
          <button @click="startNote">Start</button>
          <button v-if="notes.length > 1" class="secondary" @click="nextNote">Next Random</button>
          <button class="danger" data-tooltip="Delete" @click="deleteNote">
            <font-awesome-icon icon="trash" />
          </button>
          <button class="secondary" @click="$emit('close')">Close</button>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>No available notes in this bucket</p>
        <button class="danger" @click="$emit('close')">Close</button>
      </div>
    </div>
  </dialog>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  props: {
    show: Boolean,
    bucket: Object,
    notes: Array
  },
  components: {
    FontAwesomeIcon
  },
  data() {
    return {
      currentNote: null
    }
  },
  watch: {
    show: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.pickRandomNote()
          this.$refs.dialog?.showModal()
        } else {
          this.$refs.dialog?.close()
          this.currentNote = null
        }
      }
    }
  },
  mounted() {
    this.$refs.dialog.addEventListener('close', () => {
      this.$emit('close')
    })
  },
  methods: {
    pickRandomNote() {
      if (this.notes.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.notes.length)
        this.currentNote = this.notes[randomIndex]
      } else {
        this.currentNote = null
      }
    },
    startNote() {
      this.$emit('start', this.currentNote)
      this.$emit('close')
    },
    nextNote() {
      this.pickRandomNote()
    },
    deleteNote() {
      this.$emit('delete', this.currentNote)
      this.pickRandomNote()
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content {
  padding: 2rem;
  min-width: 400px;
  max-width: 800px;

  .modal-header {
    margin-bottom: 2rem;

    h3 {
      color: var(--primary);
      font-size: 1.4rem;
    }
  }

  .note-content {
    .note-info {
      background: var(--light);
      padding: 2rem;
      border-radius: 8px;
      margin: 1.5rem 0;
      position: relative;

      .description {
        font-size: 1.4rem;
        color: var(--dark);
        margin-right: 80px;
        line-height: 1.4;
      }

      .time-badge {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        background: var(--primary);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 1rem;
        font-weight: 500;
      }
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
  }

  .empty-state {
    text-align: center;
    padding: 3rem 2rem;

    p {
      font-size: 1.2rem;
      color: var(--dark);
      opacity: 0.7;
      margin-bottom: 1.5rem;
    }
  }
}
</style>
