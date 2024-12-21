export class Note {
  constructor(serverData = {}) {
    this.id = serverData.id
    this.description = serverData.description
    this.timeEstimation = serverData.time_estimation
    this.label = serverData.label
    this.status = serverData.status || 'pending'
    // this.startedAt = null
    // this.completedAt = null
  }

  //   setActivity(activity = {}) {
  //     this.startedAt = activity.startedAt ?? null
  //     this.completedAt = activity.completedAt ?? null
  //   }

  getServerData() {
    return {
      id: this.id,
      description: this.description,
      time_estimation: this.timeEstimation,
      label: this.label,
      status: this.status
    }
  }
}

export class ActivityRecord {
  constructor(serverData = {}) {
    this.id = serverData.id
    this.noteId = serverData.note_id
    this.startedAt = serverData.started_at ?? null
    this.completedAt = serverData.completed_at ?? null
    this.timeToComplete = serverData.time_to_complete ?? null
  }

  getServerData() {
    return {
      id: this.id,
      note_id: this.noteId,
      started_at: this.startedAt,
      completed_at: this.completedAt,
      time_to_complete: this.timeToComplete
    }
  }

  static createFromNote(note = {}) {
    return new ActivityRecord({
      id: Date.now(),
      note_id: note.id,
      started_at: new Date().toISOString(),
      completed_at: null,
      time_to_complete: null
    })
  }
}

export class Bucket {
  constructor(serverData = {}) {
    this.id = serverData.id
    this.title = serverData.title ?? ''
    this.createdAt = serverData.created_at ?? null
    this.notes = serverData.notes ?? []
  }

  addNote(note = {}) {
    this.notes.push(note)
  }

  removeNote(noteId) {
    this.notes = this.notes.filter(note => note.id !== noteId)
  }

  getServerData() {
    return {
      id: this.id,
      title: this.title,
      created_at: this.createdAt
    }
  }
}

export class TimeBucket extends Bucket {
  constructor(serverData = {}) {
    super(serverData)
    this.min = serverData.min
    this.max = serverData.max
  }
}
