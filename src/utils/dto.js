import { CURRENT_DATA_VERSION } from './migrations'

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

export class ServerData {
  constructor(data = {}) {
    this.version = data.version || CURRENT_DATA_VERSION
    this.notes = data.notes || []
    this.activity_records = data.activityRecords || []
    // this.labeled_buckets = data.labeledBuckets || [{ id: 1, title: 'Important', createdAt: new Date().toISOString() }]
    this.labeled_buckets = data.labeledBuckets || []
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
    super(note, options)
  }
}

export class ActivityRecord extends SchemaBasedDTO {
  static _schema = {
    id: { server: 'id', client: 'id', defaultValue: null },
    noteId: { server: 'note_id', client: 'noteId', defaultValue: null },
    description: { server: 'description', client: 'description', defaultValue: '' },
    timeEstimation: { server: 'time_estimation', client: 'timeEstimation', defaultValue: 0 },
    label: { server: 'label', client: 'label', defaultValue: '' },
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
      description: note.description,
      timeEstimation: note.timeEstimation,
      label: note.label,
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
  }

  get activityRecordsMap() {
    return {
      completed: this.activityRecords.filter(record => record.completedAt),
      inProgress: this.activityRecords.filter(record => !record.completedAt)
    }
  }

  get notesMap() {
    const inProgressRecords = this.activityRecords.filter(record => !record.completedAt)
    const notesMap = {
      inProgress: [],
      pending: []
    }

    this.notes.forEach(note => {
      const activityRecord = inProgressRecords.find(record => record.noteId === note.id)
      if (activityRecord) {
        notesMap.inProgress.push(note)
      } else {
        notesMap.pending.push(note)
      }
    })

    return notesMap
  }

  get stats() {
    return {
      pending: this.notesMap.pending.length,
      inProgress: this.notesMap.inProgress.length,
      completed: this.activityRecordsMap.completed.length
    }
  }
}
