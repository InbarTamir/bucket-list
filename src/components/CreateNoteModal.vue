<template>
  <div class="modal">
    <div class="modal-content">
      <h2>Create Note</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="description">Description:</label>
          <input id="description" v-model="form.description" type="text" required />
        </div>

        <div class="form-group">
          <label for="timeEstimation">Time Estimation (minutes):</label>
          <input id="timeEstimation" v-model.number="form.timeEstimation" type="number" required min="1" />
        </div>

        <div class="form-group checkbox">
          <label>
            <input type="checkbox" v-model="form.recurring" />
            Recurring
            <span class="help-icon" data-tooltip="This note will not be removed when completed">
              <font-awesome-icon icon="circle-question" />
            </span>
          </label>
        </div>

        <div class="form-group" v-if="!selectedBucket">
          <label for="label">Label (optional):</label>
          <select id="label" v-model="form.label">
            <option value="">No Label</option>
            <option v-for="bucket in labeledBuckets" :key="bucket.title" :value="bucket.title">
              {{ bucket.title }}
            </option>
          </select>
        </div>

        <div class="actions">
          <button type="submit">Create</button>
          <button type="button" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    selectedBucket: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        description: '',
        timeEstimation: null,
        label: '',
        recurring: false
      }
    }
  },
  computed: {
    ...mapState({
      labeledBuckets: state => state.labeledBuckets
    })
  },
  created() {
    if (this.selectedBucket) {
      this.form.label = this.selectedBucket.title
    }
  },
  methods: {
    submitForm() {
      this.$emit('submit', { ...this.form })
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

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    min-width: 300px;

    .form-group {
      margin-bottom: 1rem;

      &.checkbox {
        label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;

          .help-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            font-size: 14px;
            cursor: help;
          }
        }

        input[type='checkbox'] {
          width: auto;
          cursor: pointer;
          accent-color: var(--primary);
          width: 16px;
          height: 16px;
          border: 2px solid #ddd;
          border-radius: 3px;
          appearance: none;
          -webkit-appearance: none;
          position: relative;
          background: white;

          &:checked {
            background: var(--primary);
            border-color: var(--primary);
          }

          &:checked::after {
            content: '✓';
            color: white;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
          }
        }
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
      }

      input,
      select {
        width: 100%;
        padding: 0.5rem;
      }
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  }
}
</style>
