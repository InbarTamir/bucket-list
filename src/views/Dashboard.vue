<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Notes Dashboard</h1>
      <div class="actions">
        <button class="primary prominent" @click="showCreateBucketModal = true"><font-awesome-icon icon="folder-plus" /> Create Bucket</button>
        <button class="success prominent" @click="showCreateNoteModal = true"><font-awesome-icon icon="file-signature" /> Create Note</button>
      </div>
    </div>

    <div class="buckets-grid">
      <div class="section labeled-buckets">
        <h2>Labeled Buckets</h2>
        <div class="buckets-container">
          <bucket v-for="bucket in labeledBuckets" :key="bucket.id" :bucket="bucket" @add-note="openCreateNoteModal" @start-note="startNote" />
        </div>
      </div>

      <div class="section time-buckets">
        <h2>Time-Based Buckets</h2>
        <div class="buckets-container">
          <bucket v-for="bucket in timeBuckets" :key="bucket.title" :bucket="bucket" :show-add-button="false" @start-note="startNote" />
        </div>
      </div>
    </div>

    <div v-if="inProgressRecords.length" class="in-progress-section">
      <h2>In Progress</h2>
      <div class="notes-list">
        <div v-for="activity in inProgressRecords" :key="activity.id" class="note-item">
          <div class="note-info">
            <span class="description">{{ activity.description }}</span>
            <span class="label" v-if="activity.label">{{ activity.label }}</span>
            <span class="time">{{ activity.timeEstimation }}m</span>
            <span class="started-at">Started: {{ Helpers.formatDateTime(activity.startedAt) }}</span>
          </div>
          <div class="actions">
            <button class="active" data-tooltip="Restart" @click="restartNote(activity)">
              <font-awesome-icon icon="rotate-right" />
            </button>
            <button class="success" data-tooltip="Finish" @click="finishNote(activity)">
              <font-awesome-icon icon="check" />
            </button>
            <button class="danger" data-tooltip="Discard" @click="discardNote(activity)">
              <font-awesome-icon icon="trash" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <create-note-modal v-if="showCreateNoteModal" :selected-bucket="selectedBucket" @close="closeCreateNoteModal" @submit="createNote" />
    <create-bucket-form v-if="showCreateBucketModal" @close="showCreateBucketModal = false" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Bucket from '../components/Bucket.vue'
import CreateNoteModal from '../components/CreateNoteModal.vue'
import CreateBucketForm from '../components/CreateBucketForm.vue'
import Helpers from '@/utils/helpers'

export default {
  name: 'Dashboard',
  components: {
    Bucket,
    CreateNoteModal,
    CreateBucketForm
  },
  data() {
    return {
      Helpers,
      showCreateNoteModal: false,
      selectedBucket: null,
      showCreateBucketModal: false
    }
  },
  computed: {
    ...mapState(['notes']),
    ...mapGetters(['buckets', 'inProgressRecords']),
    labeledBuckets() {
      return this.buckets.filter(bucket => bucket.labeled)
    },
    timeBuckets() {
      return this.buckets.filter(bucket => !bucket.labeled)
    }
  },
  methods: {
    openCreateNoteModal(bucket = null) {
      this.selectedBucket = bucket
      this.showCreateNoteModal = true
    },
    closeCreateNoteModal() {
      this.showCreateNoteModal = false
      this.selectedBucket = null
    },
    createNote(note) {
      this.$store.dispatch('addNote', note)
      this.closeCreateNoteModal()
    },
    startNote(noteData) {
      this.$store.dispatch('startNote', noteData)
    },
    finishNote(activity) {
      this.$store.dispatch('finishNote', activity)
    },
    restartNote(activity) {
      this.$store.dispatch('restartNote', activity)
    },
    discardNote(activity) {
      this.$store.dispatch('discardNote', activity)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h1 {
      color: var(--dark);
      font-size: 2rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
    }
  }

  .buckets-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    .section {
      h2 {
        color: var(--dark);
        margin-bottom: 1rem;
        font-size: 1.5rem;
      }

      .buckets-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
    }
  }

  .in-progress-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid var(--light);
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px var(--shadow);

    h2 {
      color: var(--primary);
      margin-bottom: 1rem;
    }

    .notes-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .note-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--light);
        border-radius: 6px;

        .note-info {
          display: flex;
          gap: 1rem;
          align-items: center;

          .description {
            font-weight: 500;
          }

          .label {
            background: var(--primary);
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
          }

          .time,
          .started-at {
            color: var(--dark);
            opacity: 0.7;
            font-size: 0.9rem;
          }
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }
      }
    }
  }
}
</style>
