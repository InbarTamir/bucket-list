/* ============================== */
/*            STC DTOs            */
/* ============================== */

export class Note {
  #schema = {
    id: { server: 'id', client: 'id', defaultValue: null },
    description: { server: 'description', client: 'description', defaultValue: '' },
    timeEstimation: { server: 'time_estimation', client: 'timeEstimation', defaultValue: 0 },
    label: { server: 'label', client: 'label', defaultValue: '' },
    status: { server: 'status', client: 'status', defaultValue: 'pending' }
  }

  constructor(note = {}, origin = 'client') {
    Object.keys(this.#schema).forEach(key => {
      const { [origin]: originKey, defaultValue } = this.#schema[key]
      this[originKey] = note[originKey] ?? defaultValue
    })
  }

  toServer() {
    const serverData = {}
    Object.keys(this.#schema).forEach(key => {
      const { server: serverKey, client: clientKey } = this.#schema[key]
      serverData[serverKey] = this[clientKey]
    })
    return serverData
  }

  static fromServer(note) {
    return new Note(note, 'server')
  }
}

export class ActivityRecord {
  #schema = {
    id: { server: 'id', client: 'id', defaultValue: null },
    noteId: { server: 'note_id', client: 'noteId', defaultValue: null },
    startedAt: { server: 'started_at', client: 'startedAt', defaultValue: null },
    completedAt: { server: 'completed_at', client: 'completedAt', defaultValue: null },
    timeToComplete: { server: 'time_to_complete', client: 'timeToComplete', defaultValue: null }
  }

  constructor(record = {}, origin = 'client') {
    Object.keys(this.#schema).forEach(key => {
      const { [origin]: originKey, defaultValue } = this.#schema[key]
      this[originKey] = record[originKey] ?? defaultValue
    })
  }

  toServer() {
    const serverData = {}
    Object.keys(this.#schema).forEach(key => {
      const { server: serverKey, client: clientKey } = this.#schema[key]
      serverData[serverKey] = this[clientKey]
    })
    return serverData
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

export class LabeledBucket {
  #schema = {
    id: { server: 'id', client: 'id', defaultValue: null },
    title: { server: 'title', client: 'title', defaultValue: '' },
    createdAt: { server: 'created_at', client: 'createdAt', defaultValue: null }
  }

  constructor(bucket = {}, origin = 'client') {
    Object.keys(this.#schema).forEach(key => {
      const { [origin]: originKey, defaultValue } = this.#schema[key]
      this[originKey] = bucket[originKey] ?? defaultValue
    })
  }

  toServer() {
    const serverData = {}
    Object.keys(this.#schema).forEach(key => {
      const { server: serverKey, client: clientKey } = this.#schema[key]
      serverData[serverKey] = this[clientKey]
    })
    return serverData
  }
}

/* ============================== */
/*           Client DTOs          */
/* ============================== */

export class TimeBucket extends LabeledBucket {
  constructor(data = {}, origin = 'client') {
    super(data, origin)
    this.min = data.min ?? 0
    this.max = data.max ?? 0
  }
}
