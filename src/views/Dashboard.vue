<template>
  <div class="dashboard" role="main" :class="{ 'is-loading': isLoading }">
    <!-- Skip link for keyboard users -->
    <button class="skip-link" @click="focusMainContent">Skip to main content</button>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="skeleton-loader">
      <div class="skeleton header"></div>
      <div class="skeleton stats"></div>
      <div class="skeleton buckets"></div>
    </div>

    <!-- Main content -->
    <div v-else>
      <div class="dashboard-header">
        <div class="header-main">
          <h1 id="main-content" tabindex="-1">Notes Dashboard</h1>
          <button class="help-button" @click="showHelp = true">
            <font-awesome-icon icon="circle-question" />
            Help Guide
          </button>
        </div>

        <div class="actions" role="toolbar" aria-label="Dashboard actions">
          <div class="primary-actions">
            <button class="success prominent" @click="showCreateNoteModal = true">
              <font-awesome-icon icon="file-signature" />
              Create Note
            </button>
            <button class="primary prominent" @click="showCreateBucketModal = true">
              <font-awesome-icon icon="folder-plus" />
              Create Bucket
            </button>
          </div>

          <data-actions :is-exporting="isExporting" :is-importing="isImporting" @export="exportData" @import="importData" />
        </div>
      </div>

      <!-- Help popover -->
      <div v-if="showHelp" class="help-popover">
        <div class="help-content">
          <h3>Quick Guide</h3>
          <ul>
            <li>Create notes and organize them in buckets</li>
            <li>Use time-based buckets for automatic organization</li>
            <li>Track active notes in the "In Progress" section</li>
          </ul>
          <button class="secondary" @click="showHelp = false">Got it!</button>
        </div>
      </div>

      <!-- Show In Progress section at the top if there are active items -->
      <div v-if="inProgressRecords.length" class="in-progress-section" role="region" aria-label="In progress items">
        <h2>
          <font-awesome-icon icon="clock" />
          In Progress
          <span class="count" aria-label="Number of items in progress"> ({{ inProgressRecords.length }}) </span>
        </h2>
        <div class="notes-list">
          <div v-for="activity in inProgressRecords" :key="activity.id" class="note-item" :class="{ overdue: isOverdue(activity) }">
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

      <div class="buckets-grid">
        <div class="section labeled-buckets">
          <div class="section-header">
            <h2>
              <font-awesome-icon icon="tag" />
              Labeled Buckets
            </h2>
            <bucket-controls @sort="sortBuckets('labeled', $event)" @filter="filterBuckets('labeled', $event)" />
          </div>
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
            <bucket v-for="bucket in filteredLabeledBuckets" :key="bucket.id" :bucket="bucket" @add-note="openCreateNoteModal" @start-note="startNote" @delete-note="deleteNote" />
          </div>
        </div>

        <div class="section time-buckets">
          <div class="section-header">
            <h2>
              <font-awesome-icon icon="clock" />
              Time-Based Buckets
            </h2>
            <bucket-controls type="time" @sort="sortBuckets('time', $event)" @filter="filterBuckets('time', $event)" />
          </div>
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
                  <div class="step-text">The note will automatically appear in the right time bucket</div>
                </div>
              </div>
              <button class="success" @click="showCreateNoteModal = true"><font-awesome-icon icon="file-signature" /> Create Your First Note</button>
            </div>
          </div>
          <div class="buckets-container">
            <bucket v-for="bucket in filteredTimeBuckets" :key="bucket.title" :bucket="bucket" :show-add-button="false" @start-note="startNote" @delete-note="deleteNote" />
          </div>
        </div>
      </div>

      <create-note-modal v-if="showCreateNoteModal" :selected-bucket="selectedBucket" @close="closeCreateNoteModal" @submit="createNote" @delete-note="deleteNote" />
      <create-bucket-form v-if="showCreateBucketModal" @close="showCreateBucketModal = false" @delete-note="deleteNote" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Bucket from '../components/Bucket.vue'
import CreateNoteModal from '../components/CreateNoteModal.vue'
import CreateBucketForm from '../components/CreateBucketForm.vue'
import Helpers from '@/utils/helpers'
import DataActions from '../components/DataActions.vue'
import BucketControls from '../components/BucketControls.vue'

export default {
  name: 'Dashboard',
  components: {
    Bucket,
    CreateNoteModal,
    CreateBucketForm,
    DataActions,
    BucketControls
  },
  data() {
    return {
      Helpers,
      showCreateNoteModal: false,
      selectedBucket: null,
      showCreateBucketModal: false,
      isExporting: false,
      isImporting: false,
      isLoading: false,
      showHelp: false,
      sortConfig: {
        labeled: 'createdAt',
        time: 'time'
      },
      filterConfig: {
        labeled: { hideEmpty: false, showActive: false },
        time: { hideEmpty: false, showActive: false }
      }
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
      return this.timeBuckets.some(bucket => bucket.notes.length > 0 || bucket.activityRecords.length > 0)
    },
    hasLabeledBuckets() {
      return this.labeledBuckets.length > 0
    },
    sortedLabeledBuckets() {
      return this.sortBucketList(this.labeledBuckets, this.sortConfig.labeled)
    },
    filteredLabeledBuckets() {
      return this.filterBucketList(this.sortedLabeledBuckets, this.filterConfig.labeled)
    },
    sortedTimeBuckets() {
      return this.sortBucketList(this.timeBuckets, this.sortConfig.time)
    },
    filteredTimeBuckets() {
      return this.filterBucketList(this.sortedTimeBuckets, this.filterConfig.time)
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
    },
    isOverdue(activity) {
      const startTime = new Date(activity.startedAt).getTime()
      const estimatedEndTime = startTime + activity.timeEstimation * 60 * 1000
      return Date.now() > estimatedEndTime
    },
    sortBuckets(type, sortBy) {
      this.sortConfig[type] = sortBy
    },
    filterBuckets(type, filters) {
      this.filterConfig[type] = filters
    },
    sortBucketList(buckets, sortBy) {
      return [...buckets].sort((a, b) => {
        switch (sortBy) {
          case 'alpha':
            return a.title.localeCompare(b.title)
          case 'time':
            return (a.max || Infinity) - (b.max || Infinity)
          case 'pending':
            return b.stats.pending - a.stats.pending
          case 'active':
            return b.stats.inProgress - a.stats.inProgress
          case 'total':
            return b.notes.length - a.notes.length
          default:
            if (a.labeled) {
              return new Date(b.createdAt) - new Date(a.createdAt)
            }
            return (a.max || Infinity) - (b.max || Infinity)
        }
      })
    },
    filterBucketList(buckets, filters) {
      return buckets.filter(bucket => {
        if (filters.hideEmpty && bucket.notes.length === 0) return false
        if (filters.showActive && bucket.stats.inProgress === 0) return false
        return true
      })
    },
    focusMainContent() {
      const mainContent = this.$el.querySelector('#main-content')
      if (mainContent) {
        mainContent.focus()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .skip-link {
    position: absolute;
    left: -9999px;
    z-index: 999;
    padding: 1em;
    background-color: white;
    color: var(--primary);
    border: none;
    text-decoration: none;

    &:focus {
      left: 50%;
      transform: translateX(-50%);
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
  }

  .dashboard-header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow);

    h1 {
      color: var(--dark);
      font-size: clamp(1.5rem, 4vw, 2rem);
      margin: 0;

      &:focus {
        outline: none;
        text-decoration: underline;
      }
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      .primary-actions,
      .secondary-actions {
        display: flex;
        gap: 0.5rem;
      }

      @media (max-width: 768px) {
        width: 100%;
        flex-direction: column-reverse;

        .primary-actions,
        .secondary-actions {
          width: 100%;
          justify-content: stretch;

          button {
            flex: 1;
          }
        }
      }
    }

    @media (max-width: 576px) {
      .actions {
        flex-direction: column;
        width: 100%;

        .primary-actions,
        .secondary-actions {
          width: 100%;

          button {
            flex: 1;
          }
        }
      }
    }
  }

  .in-progress-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow);
    border-left: 4px solid var(--primary);

    h2 {
      color: var(--primary);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .count {
        font-size: 0.9em;
        color: var(--dark);
        opacity: 0.7;
      }
    }

    .notes-list {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); // Increased min-width

      .note-item {
        background: var(--light);
        border-radius: 8px;
        padding: 1rem;
        display: grid;
        grid-template-columns: 1fr auto; // Changed to grid layout
        gap: 1rem;
        align-items: center;

        &.overdue {
          border-left: 3px solid var(--danger);
        }

        .note-info {
          display: grid;
          grid-template-columns: minmax(0, 2fr) auto auto auto; // Grid layout for note info
          gap: 0.75rem;
          align-items: center;

          .description {
            font-weight: 500;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .label {
            background: var(--primary);
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            white-space: nowrap;
          }

          .time {
            white-space: nowrap;
            color: var(--dark);
            opacity: 0.7;
            font-size: 0.9rem;
          }

          .started-at {
            white-space: nowrap;
            color: var (--dark);
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

  .buckets-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    .section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px var(--shadow);

      h2 {
        color: var(--dark);
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;

        svg {
          color: var(--primary);
          font-size: 0.9em;
        }
      }

      .buckets-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        align-items: start;

        @media (max-width: 768px) {
          grid-template-columns: 1fr; // Stack on mobile
        }
      }

      &.labeled-buckets:empty::after,
      &.time-buckets:empty::after {
        content: 'No buckets yet';
        display: block;
        text-align: center;
        padding: 2rem;
        color: var(--dark);
        opacity: 0.6;
        font-style: italic;
      }

      // Getting started improvements
      .getting-started {
        border: 2px dashed var(--primary);
        border-radius: 8px;
        padding: 2rem;
        margin: -0.5rem -0.5rem 1.5rem;

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
        }
      }
    }
  }

  .skeleton-loader {
    .skeleton {
      background: #eee;
      border-radius: 8px;
      animation: loading 1.5s infinite;

      &.header {
        height: 60px;
        margin-bottom: 2rem;
      }

      &.stats {
        height: 100px;
        margin-bottom: 2rem;
      }

      &.buckets {
        height: 400px;
      }
    }
  }

  .header-main {
    display: flex;
    align-items: center;
    gap: 1rem;

    .help-button {
      background: none;
      color: var(--primary);
      padding: 0.5rem;
      font-size: 0.9rem;

      &:hover {
        color: var(--special);
      }
    }
  }

  .help-popover {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;

    .help-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 400px;

      h3 {
        color: var(--primary);
        margin-bottom: 1rem;
      }

      ul {
        margin-bottom: 1.5rem;
        padding-left: 1.5rem;

        li {
          margin-bottom: 0.5rem;
        }
      }
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
}

@keyframes loading {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 1000;
}
</style>
