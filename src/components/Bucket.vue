<template>
  <div
    class="bucket"
    :class="{
      'in-progress-shadow': bucket.notesMap.inProgress.length > 0,
      'bucket-completed': isDone
    }"
  >
    <h2>
      {{ bucket.title }}
      <span v-if="timeEstimation" class="time-indicator"> {{ timeEstimation }} <font-awesome-icon icon="clock" /> </span>
    </h2>

    <div class="stats">
      <div class="count">
        <span class="number">{{ bucket.stats.pending }}</span>
        <span class="label">Pending</span>
      </div>
      <div :class="['count', { 'in-progress': bucket.stats.inProgress > 0 }]">
        <span class="number">{{ bucket.stats.inProgress }}</span>
        <span class="label">In-Progress</span>
      </div>
      <div class="count completed">
        <span class="number">{{ bucket.stats.completed }}</span>
        <span class="label">Completed</span>
      </div>
    </div>

    <div class="bucket-actions">
      <button v-if="showAddButton" @click="addNote">Add Note</button>
      <template v-if="pendingNotes.length">
        <button class="outlined" @click="randomNote"><font-awesome-icon icon="dice" /> Random</button>
        <button class="outlined" @click="pickNote"><font-awesome-icon icon="hand-pointer" /> Pick</button>
      </template>
    </div>

    <random-note-modal :show="showRandomModal" :bucket="bucket" :notes="pendingNotes" @close="closeRandomModal" @start="startNote" />

    <pick-note-modal :show="showPickModal" :bucket="bucket" :notes="pendingNotes" @close="closePickModal" @start="startNote" />
  </div>
</template>

<script>
import RandomNoteModal from './RandomNoteModal.vue'
import PickNoteModal from './PickNoteModal.vue'
import { BucketModel } from '@/utils/dto'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  components: {
    RandomNoteModal,
    PickNoteModal,
    FontAwesomeIcon
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
    // TODO: use or remove
    inProgressNotes() {
      return this.bucket.notesMap.inProgress
    },
    isDone() {
      return this.bucket.stats.pending === 0 && this.bucket.stats.inProgress === 0
    },
    timeEstimation() {
      if (!this.bucket.max) return null
      if (this.bucket.max === Infinity) return `∞`
      return `${this.bucket.max}m`
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
  width: fit-content;
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

  &.bucket-completed {
    opacity: 0.4;

    &:hover {
      opacity: 1; // Restore full opacity on hover
    }
  }

  h2 {
    color: var(--primary);
    margin-bottom: 15px;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;

    .time-indicator {
      font-size: 0.5em;
      color: var(--special-dark);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: normal;

      i {
        font-size: 0.9em;
        margin-left: 2px;
      }
    }
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
        white-space: nowrap;
      }

      &.in-progress .number {
        color: var(--active-number);
        animation: bounce 0.8s ease-in-out infinite; // Slightly faster animation
        font-weight: 900;
      }

      &.completed .number {
        color: var(--success);
      }
    }
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2); // Slightly bigger bounce
  }
}
</style>
