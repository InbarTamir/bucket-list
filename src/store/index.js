import Vue from 'vue'
import Vuex from 'vuex'
import { TIME_BUCKETS } from '@/utils/constants'
import { saveToIndexedDB, loadFromIndexedDB } from '@/utils/dataService'
import { downloadBackup, uploadBackup } from '@/utils/fileService'
import { Note, ActivityRecord, LabeledBucket, BucketModel, ServerData } from '@/utils/dto'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    notes: [],
    labeledBuckets: [],
    activityRecords: []
  },
  getters: {
    inProgressRecords: state => {
      return state.activityRecords.filter(record => !record.completedAt)
    },
    buckets: state => {
      const timeBuckets = TIME_BUCKETS.map(bucket => {
        const notes = state.notes.filter(note => !note.label && note.timeEstimation >= bucket.min && note.timeEstimation <= bucket.max)
        return new BucketModel({
          ...bucket,
          notes,
          activityRecords: state.activityRecords.filter(record => record.timeEstimation >= bucket.min && record.timeEstimation <= bucket.max)
        })
      })
      const labeledBuckets = state.labeledBuckets.map(bucket => {
        const notes = state.notes.filter(note => note.label === bucket.title)
        return new BucketModel({
          ...bucket,
          labeled: true,
          notes,
          activityRecords: state.activityRecords.filter(record => record.label === bucket.title)
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
      state.labeledBuckets.push(
        new LabeledBucket({
          id: Date.now(),
          title: bucket.title,
          createdAt: new Date().toISOString()
        })
      )
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
    _prepareServerData({ state }) {
      const notes = state.notes.map(note => Note.clientToServer(note))
      const activityRecords = state.activityRecords.map(record => ActivityRecord.clientToServer(record))
      const labeledBuckets = state.labeledBuckets.map(bucket => LabeledBucket.clientToServer(bucket))

      return new ServerData({ notes, activityRecords, labeledBuckets })
    },
    async saveData({ dispatch }) {
      const data = await dispatch('_prepareServerData')
      await saveToIndexedDB(data)
    },

    async loadData({ commit }) {
      try {
        const data = await loadFromIndexedDB()

        if (data) {
          const notes = data.notes.map(note => Note.serverToClient(note))
          commit('setNotes', notes)

          const activityRecords = data.activity_records.map(record => ActivityRecord.serverToClient(record))
          commit('setActivityRecords', activityRecords)

          const labeledBuckets = data.labeled_buckets.map(bucket => LabeledBucket.serverToClient(bucket))
          commit('setLabeledBuckets', labeledBuckets)
        }
      } catch (error) {
        Vue.$toast.error('Failed to load data: ' + error.message)
      }
    },

    async exportToFile({ dispatch }) {
      try {
        const data = await dispatch('_prepareServerData')
        await downloadBackup(data)
        Vue.$toast.success('Data exported successfully')
      } catch (error) {
        Vue.$toast.error(`Export failed: ${error.message}`)
      }
    },

    async importFromFile({ dispatch }) {
      try {
        const data = await uploadBackup()
        if (data) {
          await saveToIndexedDB(data)
          await dispatch('loadData')
          Vue.$toast.success('Data imported successfully')
        }
      } catch (error) {
        Vue.$toast.error(`Import failed: ${error.message}`)
      }
    },

    async createNote({ commit, dispatch }, note) {
      const newNote = new Note({
        ...note,
        id: Date.now()
      })
      commit('addNote', newNote)
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

      const updatedRecord = new ActivityRecord({ ...record, completedAt, timeToComplete })

      // Find the note to check if it's recurring
      const note = state.notes.find(n => n.id === record.noteId)

      // If note exists and is not recurring, remove it
      if (note && !note.recurring) {
        commit('deleteNote', note.id)
      }

      commit('updateActivityRecord', updatedRecord)

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
      const updatedRecord = new ActivityRecord({ ...record, startedAt: new Date().toISOString() })
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
