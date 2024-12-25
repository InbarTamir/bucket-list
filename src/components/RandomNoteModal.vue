<template>
  <dialog ref="dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Random Note from "{{ bucket.title }}"</h3>
        <button class="close-button" @click="$emit('close')" data-tooltip="Close">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <div v-if="currentNote" class="note-content">
        <div class="note-info">
          <div class="note-details">
            <span class="time-badge">{{ currentNote.timeEstimation }}m <font-awesome-icon icon="clock" /></span>
            <p class="description">{{ currentNote.description }}</p>
          </div>
          <div class="actions">
            <button class="play" @click="startNote" data-tooltip="Start"><font-awesome-icon icon="play" /></button>
            <button class="danger" data-tooltip="Delete" @click="deleteNote">
              <font-awesome-icon icon="trash" />
            </button>
          </div>
        </div>
        <div class="modal-actions">
          <button v-if="notes.length > 1" class="secondary" @click="nextNote"><font-awesome-icon icon="dice" /> Next Random</button>
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
  margin-inline: auto;

  .modal-header {
    margin-bottom: 2rem;
    position: relative;

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
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 1rem;

      .note-details {
        flex: 1;
        display: flex;
        gap: 1rem;
        align-items: center;
        position: relative;

        .description {
          font-size: 1.4rem;
          color: var(--dark);
          line-height: 1.4;
        }

        .time-badge {
          position: relative;
          top: 0;
          right: 0;
          background: var(--primary);
          color: white;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 1rem;
          font-weight: 500;
        }
      }

      .actions {
        display: flex;
        gap: 0.5rem;

        button {
          padding-inline: 0.8rem;
        }
      }
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
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
