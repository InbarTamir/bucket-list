<template>
  <div class="create-bucket-form">
    <form @submit.prevent="submitForm">
      <input type="text" v-model="title" placeholder="Enter bucket label" required />
      <button type="submit">Create Labeled Bucket</button>
    </form>
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
      this.$store.dispatch('addLabeledBucket', {
        title: this.title
      })
      this.title = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.create-bucket-form {
  margin: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;

  input {
    margin-right: 1rem;
    padding: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
  }
}
</style>
