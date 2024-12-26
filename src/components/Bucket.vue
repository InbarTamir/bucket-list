<template>
  <div class="bucket" :class="[bucketClass, { 'has-activity': hasActiveNotes, 'is-stale': isStale }]">
    <div class="bucket-header">
      <div class="title-area">
        <h2>{{ bucket.title }}</h2>
        <span v-if="timeEstimation" class="time-badge">{{ timeEstimation }} <font-awesome-icon icon="clock" /></span>
      </div>

      <div class="actions">
        <button v-if="showAddButton" class="icon-button" @click="addNote" data-tooltip="Add Note">
          <font-awesome-icon icon="plus" />
        </button>
        <button v-if="bucket.labeled && !hasActiveNotes" class="icon-button danger" @click="confirmDelete" data-tooltip="Delete Bucket">
          <font-awesome-icon icon="trash" />
        </button>
      </div>
    </div>

    <div class="bucket-stats">
      <div class="stat pending" :class="{ 'has-items': bucket.stats.pending > 0 }">
        <div class="stat-number">{{ bucket.stats.pending }}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat in-progress" :class="{ 'has-items': bucket.stats.inProgress > 0 }">
        <div class="stat-number">{{ bucket.stats.inProgress }}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat completed">
        <div class="stat-number">{{ bucket.stats.completed }}</div>
        <div class="stat-label">Done</div>
      </div>
    </div>

    <div class="bucket-actions">
      <button v-if="pendingNotes.length" class="pick-button" @click="pickNote"><font-awesome-icon icon="hand-pointer" /> Select Note</button>
      <button v-if="pendingNotes.length" class="random-button" @click="randomNote" data-tooltip="Pick random note">
        <font-awesome-icon icon="dice" />
      </button>
    </div>

    <random-note-modal :show="showRandomModal" :bucket="bucket" :notes="pendingNotes" @close="closeRandomModal" @start="startNote" @delete="deleteNote" />
    <pick-note-modal :show="showPickModal" :bucket="bucket" :notes="pendingNotes" @close="closePickModal" @start="startNote" @delete="deleteNote" />
    <confirm-dialog ref="confirmDialog" title="Delete Bucket" icon="triangle-exclamation" :message="`Are you sure you want to delete '${bucket.title}'? This will also delete all notes inside it.`" @confirm="deleteBucket" @cancel="$refs.confirmDialog.close()" />
  </div>
</template>

<script>
import RandomNoteModal from './RandomNoteModal.vue'
import PickNoteModal from './PickNoteModal.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { BucketModel } from '@/utils/dto'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  components: {
    RandomNoteModal,
    PickNoteModal,
    FontAwesomeIcon,
    ConfirmDialog
  },
  props: {
    bucket: BucketModel,
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
      return this.bucket.notesMap.pending
    },
    inProgressNotes() {
      return this.bucket.notesMap.inProgress
    },
    isStale() {
      return !this.bucket.labeled && this.bucket.stats.pending === 0 && this.bucket.stats.inProgress === 0
    },
    timeEstimation() {
      if (!this.bucket.max) return null
      if (this.bucket.max === Infinity) return `∞`
      return `${this.bucket.max}m`
    },
    getPendingPercent() {
      const total = this.bucket.stats.pending + this.bucket.stats.inProgress + this.bucket.stats.completed
      return total ? (this.bucket.stats.pending / total) * 100 : 0
    },
    getProgressPercent() {
      const total = this.bucket.stats.pending + this.bucket.stats.inProgress + this.bucket.stats.completed
      return total ? (this.bucket.stats.completed / total) * 100 : 0
    },
    bucketClass() {
      if (!this.bucket.labeled) return 'time-bucket'
      return `label-bucket color-${this.colorIndex}`
    },
    colorIndex() {
      // Generate consistent color index based on bucket title
      return Math.abs(
        this.bucket.title.split('').reduce((acc, char) => {
          return acc + char.charCodeAt(0)
        }, 0) % 5
      )
    },
    hasActiveNotes() {
      return this.inProgressNotes?.length > 0
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
      this.$emit('start-note', note)
    },
    closeRandomModal() {
      this.showRandomModal = false
    },
    closePickModal() {
      this.showPickModal = false
    },
    deleteNote(note) {
      this.$emit('delete-note', note)
    },
    confirmDelete() {
      this.$refs.confirmDialog.show()
    },
    deleteBucket() {
      this.$store.dispatch('deleteBucket', this.bucket.id)
      this.$toast.success(`Bucket "${this.bucket.title}" deleted`)
      this.$refs.confirmDialog.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.bucket {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.05);

  .bucket-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    .title-area {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      h2 {
        font-size: 1.2rem;
        color: var(--dark);
        font-weight: 600;
      }

      .time-badge {
        color: var(--primary);
        font-size: 0.9rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
    }

    .actions {
      display: flex;
      gap: 0.5rem;

      .icon-button {
        &.danger {
          opacity: 0.6;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }

  .bucket-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem; // Increased gap between stats
    margin: 1.25rem 0; // Increased vertical margin

    .stat {
      text-align: center;
      padding: 1.25rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.05);

      .stat-number {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
      }

      .stat-label {
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }

      &.pending {
        color: var(--dark);

        &.has-items {
          background: rgba(56, 172, 247, 0.1);
          .stat-number {
            color: var(--primary);
          }
        }
      }

      &.in-progress {
        color: var(--active-number);

        &.has-items {
          background: rgba(255, 132, 28, 0.15);
        }
      }

      &.completed {
        color: var(--success);
      }
    }
  }

  .bucket-actions {
    margin-top: auto; // Push actions to bottom
    padding-top: 1rem; // Add some space from stats
    border-top: 1px solid rgba(0, 0, 0, 0.05);

    display: flex;
    gap: 0.5rem;

    .pick-button {
      flex: 1;
      background: var(--light);
      color: var(--dark);
      padding: 0.5rem;
      font-size: 0.9rem;
      border-radius: 6px;

      &:hover {
        background: var(--primary);
        color: white;
      }
    }

    .random-button {
      background: rgba(230, 128, 255, 0.1);
      color: var(--special-dark);
      width: 40px;
      padding: 0.5rem;
      border-radius: 6px;

      &:hover {
        background: var(--special);
        color: white;
      }
    }
  }

  &.label-bucket {
    &.color-0 {
      border-left: 4px solid #4caf50;
    }
    &.color-1 {
      border-left: 4px solid #2196f3;
    }
    &.color-2 {
      border-left: 4px solid #9c27b0;
    }
    &.color-3 {
      border-left: 4px solid #ff9800;
    }
    &.color-4 {
      border-left: 4px solid #e91e63;
    }
  }

  &.time-bucket {
    border-left: 4px solid var(--primary);

    &.is-stale {
      opacity: 0.4;
    }
  }

  .bucket-icon {
    color: var(--secondary);
    font-size: 1.1rem;
    margin-right: 0.5rem;
  }
}
</style>
