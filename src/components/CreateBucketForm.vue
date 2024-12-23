<template>
  <div class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Create New Bucket</h3>
      </div>

      <form @submit.prevent="submitForm">
        <input type="text" v-model="title" placeholder="Enter bucket label" required ref="titleInput" autofocus />
        <div class="actions">
          <button type="submit">Create</button>
          <button type="button" class="danger" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: ''
    }
  },
  methods: {
    submitForm() {
      this.$store.dispatch('addLabeledBucket', { title: this.title })
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .modal-content {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    min-width: 400px;

    .modal-header {
      margin-bottom: 2rem;
      h3 {
        color: var(--primary);
        font-size: 1.4rem;
      }
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      input {
        width: 100%;
        padding: 0.8rem;
        font-size: 1rem;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }
    }
  }
}
</style>
