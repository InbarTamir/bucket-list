import Vue from 'vue'
import Vuex from 'vuex'
import { saveData, loadData } from '../utils/fileService'
import { Note, ActivityRecord, LabeledBucket, AppContent } from '@/utils/dto'

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
    },
    updateActivityRecord(state, updatedRecord) {
      const index = state.activityRecords.findIndex(record => record.id === updatedRecord.id)
      if (index !== -1) {
        Vue.set(state.activityRecords, index, updatedRecord)
      }
    }
  },
  actions: {
    async saveData({ state }) {
      const data = {
        notes: state.notes.map(note => Note.clientToServer(note)),
        labeled_buckets: state.labeledBuckets.map(bucket => LabeledBucket.clientToServer(bucket)),
        activity_records: state.activityRecords.map(record => ActivityRecord.clientToServer(record))
      }
      await saveData(data)
    },
    async loadData({ commit }) {
      try {
        const data = await loadData()
        if (data) {
          const appContent = new AppContent(data)
          commit('setNotes', appContent.notes)
          commit('setActivityRecords', appContent.activityRecords)
          commit('setLabeledBuckets', appContent.labeledBuckets)
          commit('setBuckets', appContent.buckets)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    },
    async addNote({ commit, dispatch }, note) {
      commit('addNote', note)
      await dispatch('saveData')
    },
    async startNote({ commit, dispatch }, note) {
      // Create activity record
      const activityRecord = ActivityRecord.createFromNote(note)
      commit('addActivityRecordFromNote', activityRecord)
      await dispatch('saveData')
    },

    async finishNote({ commit, state, dispatch }, noteId) {
      const activityRecord = state.activityRecords.find(record => record.noteId === noteId && !record.completedAt)

      if (activityRecord) {
        const completedAt = new Date().toISOString()
        const timeToComplete = Math.round((new Date(completedAt) - new Date(activityRecord.startedAt)) / 1000 / 60)

        const updatedRecord = ActivityRecord.update(activityRecord, {
          completedAt,
          timeToComplete
        })

        commit('updateActivityRecord', updatedRecord)
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
