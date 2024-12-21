import Vue from 'vue'
import Vuex from 'vuex'
import { saveData, loadData } from '../utils/fileService'
import { TIME_BUCKETS } from '../utils/constants'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    notes: [],
    labeledBuckets: [], // Only store labeled buckets, time buckets are computed
    activityRecords: [],
    inProgressNoteIds: [] // Changed from inProgressNotes to just IDs
  },
  getters: {
    visibleTimeBuckets: state => {
      const unlabeledNotes = state.notes.filter(note => !note.label && note.status !== 'completed')
      return TIME_BUCKETS.filter(bucket => {
        const bucketNotes = unlabeledNotes.filter(note => note.timeEstimation >= bucket.min && note.timeEstimation <= bucket.max)
        return bucketNotes.length > 0
      }).map(bucket => ({
        ...bucket,
        notes: unlabeledNotes.filter(note => note.timeEstimation >= bucket.min && note.timeEstimation <= bucket.max)
      }))
    },
    visibleLabeledBuckets: state => {
      return state.labeledBuckets.map(bucket => ({
        ...bucket,
        notes: state.notes.filter(note => note.label === bucket.title)
      }))
    },
    inProgressNotes: state => {
      return state.inProgressNoteIds
        .map(id => {
          const note = state.notes.find(n => n.id === id)
          const activity = state.activityRecords.find(a => a.noteId === id && !a.completed_at)
          if (note && activity) {
            return {
              ...note,
              startedAt: activity.started_at,
              completedAt: activity.completed_at
            }
          }
          return null
        })
        .filter(Boolean)
    }
  },
  mutations: {
    setNotes(state, notes) {
      state.notes = notes
    },
    setBuckets(state, buckets) {
      state.labeledBuckets = buckets
    },
    setActivityRecords(state, records) {
      state.activityRecords = records
    },
    addNote(state, note) {
      state.notes.push({
        ...note,
        status: 'pending'
      })
    },
    updateNote(state, updatedNote) {
      const index = state.notes.findIndex(note => note.id === updatedNote.id)
      if (index !== -1) {
        // Ensure all required properties exist
        Vue.set(state.notes, index, {
          ...state.notes[index],
          ...updatedNote,
          startedAt: updatedNote.startedAt || null,
          completedAt: updatedNote.completedAt || null
        })
      }
    },
    deleteNote(state, noteId) {
      state.notes = state.notes.filter(note => note.id !== noteId)
    },
    addActivityRecord(state, record) {
      state.activityRecords.push({
        id: Date.now(),
        noteId: record.noteId,
        started_at: record.startedAt,
        completed_at: null,
        time_to_complete: null
      })
    },
    addToInProgress(state, noteId) {
      if (!state.inProgressNoteIds.includes(noteId)) {
        state.inProgressNoteIds.push(noteId)
      }
    },
    removeFromInProgress(state, noteId) {
      state.inProgressNoteIds = state.inProgressNoteIds.filter(id => id !== noteId)
    },
    finishNote(state, { noteId, keepInBucket }) {
      const note = state.notes.find(n => n.id === noteId)
      if (note) {
        if (!keepInBucket) {
          note.status = 'completed'
        } else {
          note.status = 'pending'
          note.lastCompleted = new Date().toISOString()
        }
      }
    },
    addLabeledBucket(state, bucket) {
      state.labeledBuckets.push({
        id: Date.now(),
        title: bucket.title,
        createdAt: new Date().toISOString()
      })
    },
    updateNoteStatus(state, { noteId, status }) {
      const note = state.notes.find(n => n.id === noteId)
      if (note) {
        note.status = status
      }
    }
  },
  actions: {
    async saveData({ state }) {
      const data = {
        notes: state.notes,
        labeledBuckets: state.labeledBuckets,
        activityRecords: state.activityRecords,
        inProgressNoteIds: state.inProgressNoteIds
      }
      await saveData(data)
    },
    async loadData({ commit }) {
      try {
        const data = await loadData()
        if (data) {
          commit('setNotes', data.notes || [])
          commit('setBuckets', data.labeledBuckets || [])
          commit('setActivityRecords', data.activityRecords || [])
          if (data.inProgressNoteIds) {
            data.inProgressNoteIds.forEach(noteId => commit('addToInProgress', noteId))
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    },
    async addNote({ commit, dispatch }, note) {
      commit('addNote', note)
      await dispatch('saveData')
    },
    async startNote({ commit, state, dispatch }, noteData) {
      const startedAt = new Date().toISOString()
      const note = state.notes.find(n => n.id === noteData.id)

      if (note) {
        // Update note status only
        commit('updateNoteStatus', {
          noteId: note.id,
          status: 'in-progress'
        })

        // Add to in-progress list
        commit('addToInProgress', note.id)

        // Create simplified activity record
        commit('addActivityRecord', {
          noteId: note.id,
          startedAt
        })

        await dispatch('saveData')
      }
    },

    async finishNote({ commit, state, dispatch }, noteId) {
      const completedAt = new Date().toISOString()
      const note = state.notes.find(n => n.id === noteId)

      if (note) {
        const keepInBucket = note.label === 'recurring'

        // Update note status
        commit('updateNoteStatus', {
          noteId,
          status: keepInBucket ? 'pending' : 'completed'
        })

        // Remove from in-progress
        commit('removeFromInProgress', noteId)

        // Update activity record
        const activity = state.activityRecords.find(a => a.noteId === noteId && !a.completed_at)

        if (activity) {
          const timeToComplete = Math.round((new Date(completedAt) - new Date(activity.started_at)) / 1000 / 60)

          commit('UPDATE_ACTIVITY', {
            activityId: activity.id,
            updates: {
              completed_at: completedAt,
              time_to_complete: timeToComplete
            }
          })
        }

        await dispatch('saveData')
      }
    },
    async deleteNote({ commit, dispatch }, noteId) {
      commit('deleteNote', noteId)
      await dispatch('saveData')
    },
    async addLabeledBucket({ commit, dispatch }, bucket) {
      commit('addLabeledBucket', bucket)
      await dispatch('saveData')
    }
  },
  modules: {}
})
