import Vue from 'vue'
import Vuex from 'vuex'
import { saveData, loadData } from '../utils/fileService'
import { TIME_BUCKETS } from '../utils/constants'
import { ActivityRecord } from '@/utils/dto'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    notes: [],
    labeledBuckets: [],
    activityRecords: [],
    buckets: []
  },
  getters: {
    inProgressRecords: state => {
      const incompleteActivities = state.activityRecords.filter(record => !record.completed_at)
      return incompleteActivities
        .map(activity => {
          return {
            activity,
            note: state.notes.find(n => n.id === activity.noteId)
          }
        })
        .filter(record => record.note)
    }
  },
  mutations: {
    setNotes(state, notes) {
      state.notes = notes
    },
    setLabeledBuckets(state, buckets) {
      state.labeledBuckets = buckets
    },
    setBuckets(state, buckets) {
      state.buckets = buckets
    },
    setActivityRecords(state, records) {
      state.activityRecords = records
    },
    addNote(state, note) {
      state.notes.push(note)
    },
    updateNote(state, updatedNote) {
      const index = state.notes.findIndex(note => note.id === updatedNote.id)
      if (index !== -1) {
        Vue.set(state.notes, index, updatedNote)
      }
    },
    deleteNote(state, noteId) {
      state.notes = state.notes.filter(note => note.id !== noteId)
    },
    addActivityRecordFromNote(state, record) {
      state.activityRecords.push(record)
    },
    // TODO:
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
    // TODO:
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
          commit('setNotes', data.notes)
          commit('setActivityRecords', data.activityRecords)
          commit('setLabeledBuckets', data.labeledBuckets)
          commit('setBuckets', data.buckets)
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
      const note = state.notes.find(n => n.id === noteData.id)

      if (note) {
        // Update note status only
        commit('updateNoteStatus', {
          noteId: note.id,
          status: 'in-progress'
        })

        // Add to in-progress list
        // commit('addToInProgress', note.id)

        // Create simplified activity record
        commit('addActivityRecordFromNote', ActivityRecord.createFromNote(note))

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
