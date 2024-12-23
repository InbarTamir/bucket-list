import Vue from 'vue'
import Vuex from 'vuex'
import { TIME_BUCKETS } from '@/utils/constants'
import { saveData, loadData } from '../utils/fileService'
import { Note, ActivityRecord, LabeledBucket, BucketModel } from '@/utils/dto'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    notes: [],
    labeledBuckets: [],
    activityRecords: []
  },
  getters: {
    inProgressRecords: state => {
      const incompleteActivities = state.activityRecords.filter(record => !record.completedAt)
      return incompleteActivities
        .map(activity => {
          return {
            activity,
            note: state.notes.find(n => n.id === activity.noteId)
          }
        })
        .filter(record => record.note)
    },
    buckets: state => {
      const timeBuckets = TIME_BUCKETS.map(bucket => {
        const notes = state.notes.filter(note => !note.label && note.timeEstimation >= bucket.min && note.timeEstimation <= bucket.max)
        return new BucketModel({
          ...bucket,
          notes,
          activityRecords: state.activityRecords.filter(record => notes.some(note => note.id === record.noteId))
        })
      })
      const labeledBuckets = state.labeledBuckets.map(bucket => {
        const notes = state.notes.filter(note => note.label === bucket.title)
        return new BucketModel({
          ...bucket,
          labeled: true,
          notes,
          activityRecords: state.activityRecords.filter(record => notes.some(note => note.id === record.noteId))
        })
      })
      return [...timeBuckets, ...labeledBuckets]
    }
  },
  mutations: {
    setNotes(state, notes) {
      Vue.set(state, 'notes', notes)
    },
    setLabeledBuckets(state, buckets) {
      Vue.set(state, 'labeledBuckets', buckets)
    },
    setActivityRecords(state, records) {
      Vue.set(state, 'activityRecords', records)
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
      const index = state.notes.findIndex(note => note.id === noteId)
      if (index !== -1) {
        state.notes.splice(index, 1)
      }
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
    updateActivityRecord(state, updatedRecord) {
      const index = state.activityRecords.findIndex(record => record.id === updatedRecord.id)
      if (index !== -1) {
        Vue.set(state.activityRecords, index, updatedRecord)
      }
    },
    discardNote(state, record) {
      const index = state.activityRecords.findIndex(r => r.id === record.id)
      if (index !== -1) {
        state.activityRecords.splice(index, 1)
      }
    }
  },
  actions: {
    async saveData({ state }) {
      const data = {
        notes: state.notes.map(note => Note.clientToServer(note)),
        activity_records: state.activityRecords.map(record => ActivityRecord.clientToServer(record)),
        labeled_buckets: state.labeledBuckets.map(bucket => LabeledBucket.clientToServer(bucket))
      }
      await saveData(data)
    },
    async loadData({ commit }) {
      try {
        const data = await loadData()
        if (data) {
          // Notes
          const notes = data.notes.map(note => Note.serverToClient(note))
          commit('setNotes', notes)

          // Activity Records
          const activityRecords = data.activity_records.map(record => ActivityRecord.serverToClient(record))
          commit('setActivityRecords', activityRecords)

          // Labeled Buckets
          const labeledBuckets = data.labeled_buckets.map(bucket => LabeledBucket.serverToClient(bucket))
          commit('setLabeledBuckets', labeledBuckets)
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

    async finishNote({ commit, dispatch, state }, record) {
      const completedAt = new Date().toISOString()
      const minutesDiff = (new Date(completedAt) - new Date(record.startedAt)) / 1000 / 60
      const timeToComplete = Math.max(0.1, Math.round(minutesDiff * 10) / 10)

      const updatedRecord = ActivityRecord.update(record, {
        completedAt,
        timeToComplete
      })

      // Find the note to check if it's recurring
      const note = state.notes.find(n => n.id === record.noteId)

      commit('updateActivityRecord', updatedRecord)

      // If note exists and is not recurring, remove it
      if (note && !note.recurring) {
        commit('deleteNote', note.id)
      }

      await dispatch('saveData')
    },
    async deleteNote({ commit, dispatch }, noteId) {
      commit('deleteNote', noteId)
      await dispatch('saveData')
    },
    async addLabeledBucket({ commit, dispatch }, bucket) {
      commit('addLabeledBucket', bucket)
      await dispatch('saveData')
    },
    async restartNote({ commit, dispatch }, record) {
      const updatedRecord = ActivityRecord.update(record, {
        startedAt: new Date().toISOString()
      })
      commit('updateActivityRecord', updatedRecord)
      await dispatch('saveData')
    },
    async discardNote({ commit, dispatch }, record) {
      commit('discardNote', record)
      await dispatch('saveData')
    }
  },
  modules: {}
})
