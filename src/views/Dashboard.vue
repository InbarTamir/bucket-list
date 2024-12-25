<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Notes Dashboard</h1>
      <div class="actions">
        <div class="file-actions">
          <button class="secondary" :disabled="isExporting" @click="exportData">
            <font-awesome-icon :icon="isExporting ? 'spinner' : 'file-export'" :spin="isExporting" />
            {{ isExporting ? 'Exporting...' : 'Export' }}
          </button>
          <button class="secondary" :disabled="isImporting" @click="importData">
            <font-awesome-icon :icon="isImporting ? 'spinner' : 'file-import'" :spin="isImporting" />
            {{ isImporting ? 'Importing...' : 'Import' }}
          </button>
        </div>
        <button class="primary prominent" @click="showCreateBucketModal = true"><font-awesome-icon icon="folder-plus" /> Create Bucket</button>
        <button class="success prominent" @click="showCreateNoteModal = true"><font-awesome-icon icon="file-signature" /> Create Note</button>
      </div>
    </div>

    <div class="buckets-grid">
      <div class="section labeled-buckets">
        <h2>Labeled Buckets</h2>
        <div v-if="!hasLabeledBuckets" class="getting-started">
          <div class="getting-started-content">
            <div class="organization-options">
              <div class="option active">
                <font-awesome-icon icon="folder-tree" class="feature-icon" />
                <h3>Labeled Buckets</h3>
                <p>Organize notes by categories</p>
                <button class="primary" @click="showCreateBucketModal = true"><font-awesome-icon icon="folder-plus" /> Create Your First Bucket</button>
              </div>
              <div class="option">
                <font-awesome-icon icon="clock" class="feature-icon" />
                <h3>Time-Based Buckets</h3>
                <p>Auto-organize by estimated duration</p>
                <button class="secondary" @click="scrollToTimeBuckets"><font-awesome-icon icon="arrow-down" /> See Time Buckets</button>
              </div>
            </div>
          </div>
        </div>
        <div class="buckets-container">
          <bucket v-for="bucket in labeledBuckets" :key="bucket.id" :bucket="bucket" @add-note="openCreateNoteModal" @start-note="startNote" @delete-note="deleteNote" />
        </div>
      </div>

      <div class="section time-buckets">
        <h2>Time-Based Buckets</h2>
        <div v-if="!hasTimeBasedNotes" class="getting-started">
          <div class="getting-started-content">
            <font-awesome-icon icon="lightbulb" class="feature-icon" />
            <h3>How Time-Based Buckets Work</h3>
            <div class="steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-text">Create a new note using the button below or at the top</div>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-text">Set a time estimation for your note</div>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-text">The note will automatically appear in the right time bucket</div>
              </div>
            </div>
            <button class="success" @click="showCreateNoteModal = true"><font-awesome-icon icon="file-signature" /> Create Your First Note</button>
          </div>
        </div>
        <div class="buckets-container">
          <bucket v-for="bucket in timeBuckets" :key="bucket.title" :bucket="bucket" :show-add-button="false" @start-note="startNote" @delete-note="deleteNote" />
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

    <create-note-modal v-if="showCreateNoteModal" :selected-bucket="selectedBucket" @close="closeCreateNoteModal" @submit="createNote" @delete-note="deleteNote" />
    <create-bucket-form v-if="showCreateBucketModal" @close="showCreateBucketModal = false" @delete-note="deleteNote" />
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
      showCreateBucketModal: false,
      isExporting: false,
      isImporting: false
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
    },
    hasTimeBasedNotes() {
      return this.timeBuckets.some(bucket => bucket.notes.length > 0)
    },
    hasLabeledBuckets() {
      return this.labeledBuckets.length > 0
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
      this.$store.dispatch('createNote', note)
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
    },
    deleteNote(note) {
      this.$store.dispatch('deleteNote', note.id)
    },
    async exportData() {
      this.isExporting = true
      try {
        await this.$store.dispatch('exportToFile')
      } finally {
        this.isExporting = false
      }
    },
    async importData() {
      this.isImporting = true
      try {
        await this.$store.dispatch('importFromFile')
      } finally {
        this.isImporting = false
      }
    },
    scrollToTimeBuckets() {
      this.$el.querySelector('.time-buckets').scrollIntoView({ behavior: 'smooth' })
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

      .file-actions {
        display: flex;
        gap: 0.5rem;
        margin-right: 1rem;
        padding-right: 1rem;
        border-right: 1px solid var(--light);
      }
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

      .getting-started {
        background: white;
        border: 2px dashed var(--primary);
        border-radius: 8px;
        padding: 2rem;
        margin-bottom: 1.5rem;

        .getting-started-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 600px;
          margin: 0 auto;

          .organization-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            width: 100%;
            margin-bottom: 2rem;

            .option {
              background: var(--light);
              padding: 2rem;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 1rem;
              transition: transform 0.2s ease;

              &:hover {
                transform: translateY(-2px);
              }

              &.active {
                background: white;
                border: 2px dashed var(--primary);
              }

              .feature-icon {
                font-size: 2rem;
                color: var(--primary);
              }

              h3 {
                font-size: 1.2rem;
                margin: 0;
              }

              p {
                color: var(--dark);
                opacity: 0.8;
                text-align: center;
                margin-bottom: 0.5rem;
              }

              button {
                width: 100%;
              }
            }
          }

          .feature-icon {
            color: var(--primary);
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }

          h3 {
            color: var(--dark);
            font-size: 1.4rem;
            margin-bottom: 1.5rem;
          }

          .steps {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 2rem;
            width: 100%;

            .step {
              display: flex;
              align-items: center;
              gap: 1rem;
              text-align: left;

              .step-number {
                background: var(--primary);
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                flex-shrink: 0;
              }

              .step-text {
                color: var(--dark);
                font-size: 1.1rem;
                line-height: 1.4;
              }
            }
          }

          button {
            font-size: 1.1rem;
            padding: 0.8rem 1.5rem;
          }

          button.primary {
            background: var(--primary);
            &:hover {
              background: darken(#38acf7, 5%);
            }
          }
        }
      }

      .empty-message {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: var(--light);
        border: 1px solid var(--primary);
        color: var(--dark);
        padding: 0.75rem 1rem;
        border-radius: 6px;
        margin-bottom: 1rem;
        font-size: 0.95rem;

        .info-icon {
          color: var(--primary);
          font-size: 1.2rem;
          flex-shrink: 0;
        }
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
