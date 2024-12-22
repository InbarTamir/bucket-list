import { TIME_BUCKETS } from '../utils/constants'

/* ============================== */
/*            STC DTOs            */
/* ============================== */

class SchemaBasedDTO {
  #schema

  constructor(data = {}, { origin = 'client', target = 'client' } = {}) {
    this.#schema = this.constructor._schema ?? {}
    Object.keys(this.#schema).forEach(key => {
      const { [origin]: originKey, [target]: targetKey, defaultValue } = this.#schema[key]
      this[targetKey] = data[originKey] ?? defaultValue
    })
  }

  static serverToClient(data) {
    return new this(data, { origin: 'server', target: 'client' })
  }

  static clientToServer(data) {
    return new this(data, { origin: 'client', target: 'server' })
  }
}

export class Note extends SchemaBasedDTO {
  static _schema = {
    id: { server: 'id', client: 'id', defaultValue: null },
    description: { server: 'description', client: 'description', defaultValue: '' },
    timeEstimation: { server: 'time_estimation', client: 'timeEstimation', defaultValue: 0 },
    label: { server: 'label', client: 'label', defaultValue: '' },
    recurring: { server: 'recurring', client: 'recurring', defaultValue: false }
  }

  constructor(note = {}, options = {}) {
    // super(this.#schema, note, origin)
    super(note, options)
  }
}

export class ActivityRecord extends SchemaBasedDTO {
  static _schema = {
    id: { server: 'id', client: 'id', defaultValue: null },
    noteId: { server: 'note_id', client: 'noteId', defaultValue: null },
    startedAt: { server: 'started_at', client: 'startedAt', defaultValue: null },
    completedAt: { server: 'completed_at', client: 'completedAt', defaultValue: null },
    timeToComplete: { server: 'time_to_complete', client: 'timeToComplete', defaultValue: null }
  }

  constructor(record = {}, options = {}) {
    super(record, options)
  }

  static createFromNote(note = {}) {
    return new ActivityRecord({
      id: Date.now(),
      noteId: note.id,
      startedAt: new Date().toISOString(),
      completedAt: null,
      timeToComplete: null
    })
  }
}

export class LabeledBucket extends SchemaBasedDTO {
  static _schema = {
    id: { server: 'id', client: 'id', defaultValue: null },
    title: { server: 'title', client: 'title', defaultValue: '' },
    createdAt: { server: 'created_at', client: 'createdAt', defaultValue: null }
  }

  constructor(bucket = {}, options = {}) {
    super(bucket, options)
  }
}

export class AppContent {
  constructor(data = {}) {
    this.notes = this.normalizeNotes(data.notes)
    this.activityRecords = this.normalizeActivityRecords(data.activity_records)
    this.labeledBuckets = this.normalizeLabeledBuckets(data.labeled_buckets)
    this.buckets = this.generateBuckets()
  }

  normalizeNotes(notes) {
    return notes.map(note => Note.serverToClient(note))
  }

  normalizeActivityRecords(records) {
    return records.map(record => ActivityRecord.serverToClient(record))
  }

  normalizeLabeledBuckets(buckets) {
    return buckets.map(bucket => LabeledBucket.serverToClient(bucket))
  }

  generateBuckets() {
    const timeBuckets = TIME_BUCKETS.map(bucket => {
      const notes = this.notes.filter(note => !note.label && note.timeEstimation >= bucket.min && note.timeEstimation <= bucket.max)
      return new BucketModel({
        ...bucket,
        notes,
        activityRecords: this.activityRecords.filter(record => notes.some(note => note.id === record.noteId))
      })
    })
    const labeledBuckets = this.labeledBuckets.map(bucket => {
      return new BucketModel({
        ...bucket,
        labeled: true,
        notes: this.notes.filter(note => note.label === bucket.title),
        activityRecords: this.activityRecords.filter(record => record.label === bucket.title)
      })
    })
    return [...timeBuckets, ...labeledBuckets]
  }
}

/* ============================== */
/*           Client DTOs          */
/* ============================== */

export class BucketModel {
  constructor(bucket = {}) {
    this.id = bucket.id || null
    this.title = bucket.title || ''
    this.labeled = bucket.labeled || false
    this.min = bucket.min || 0
    this.max = bucket.max || 0
    this.notes = bucket.notes || []
    this.activityRecords = bucket.activityRecords || []
    this.activityRecordsMap = this.mapRecordsByStatus(bucket.activityRecords)
    this.notesMap = this.mapNotesByStatus()
    this.stats = this.calculateStats()
  }

  mapRecordsByStatus(records) {
    // TODO: might not need this.. i'm too tired to think
    // the calculations cannot be done both here and in the store. one source of truth and all that.
    return {
      completed: records.filter(record => record.completedAt),
      inProgress: records.filter(record => !record.completedAt)
    }
  }

  mapNotesByStatus() {
    const inProgressRecords = this.activityRecords.filter(record => !record.completedAt)

    //   TODO: I will probably regret doing all this. Not sure it will be reactive when I update notes. Probably better to use computed.
    const notesMap = {
      inProgress: [],
      pending: []
    }
    this.notes.forEach(note => {
      const activityRecord = inProgressRecords.find(record => record.noteId === note.id)
      //   const activityRecord = this.activityRecordsMap.inProgress.find(record => record.noteId === note.id)

      if (activityRecord) {
        // notesMap.inProgress.push({ note, activityRecord })
        notesMap.inProgress.push(note)
      } else {
        notesMap.pending.push(note)
      }
    })
    return notesMap
  }

  calculateStats() {
    return {
      pending: this.notesMap.pending.length,
      inProgress: this.notesMap.inProgress.length,
      completed: this.activityRecords.filter(record => record.completedAt).length
    }
    // return {
    //   completed: this.activityRecordsMap.completed.length,
    //   inProgress: this.activityRecordsMap.inProgress.length,
    //   pending: this.notes.length - this.activityRecordsMap.inProgress.length
    // }
  }
}

// export class TimeBucketModel extends BucketModel {
//   constructor(bucket = {}) {
//     super(bucket)
//     this.min = bucket.min || 0
//     this.max = bucket.max || Infinity
//   }
// }

// export class NewNoteModel {
//   constructor(note = {}) {
//     this.description = note.description || ''
//     this.timeEstimation = note.timeEstimation || 0
//     this.label = note.label || ''
//   }
// }
