<template>
  <div class="note">
    <p>{{ note.description }}</p>
    <p>{{ note.timeEstimation }}</p>
    <p>{{ note.label }}</p>
    <button @click="startNote" :disabled="note.status === 'in-progress'">Start</button>
    <button @click="finishNote" :disabled="note.status !== 'in-progress'">Finish</button>
    <button @click="deleteNote" :disabled="note.status === 'in-progress'">Delete</button>
  </div>
</template>

<script>
export default {
  props: {
    note: Object
  },
  methods: {
    startNote() {
      this.$emit('start', this.note)
    },
    finishNote() {
      this.$emit('finish', this.note)
    },
    deleteNote() {
      this.$emit('delete', this.note)
    }
  }
}
</script>

<style scoped>
.note {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
}
</style>
