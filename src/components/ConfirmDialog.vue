<template>
  <dialog ref="dialog" class="confirm-dialog">
    <div class="content">
      <div class="dialog-header">
        <font-awesome-icon :icon="icon" class="header-icon" />
        <h3>{{ title }}</h3>
      </div>
      <p>{{ message }}</p>
      <div class="actions">
        <button class="secondary" @click="$emit('cancel')">Cancel</button>
        <button :class="confirmButtonClass" @click="$emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </dialog>
</template>

<script>
export default {
  props: {
    title: String,
    message: String,
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    confirmButtonClass: {
      type: String,
      default: 'danger'
    },
    icon: {
      type: String,
      default: 'circle-info'
    }
  },
  methods: {
    show() {
      this.$refs.dialog.showModal()
    },
    close() {
      this.$refs.dialog.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.confirm-dialog {
  .content {
    padding: 2rem;
    min-width: 400px;
    max-width: 90vw;

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;

      .header-icon {
        font-size: 1.5rem;
        color: var(--warning);
      }

      h3 {
        color: var(--dark);
        font-size: 1.4rem;
        margin: 0;
      }
    }

    p {
      color: var(--secondary);
      line-height: 1.5;
      margin-bottom: 2rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;

      button {
        min-width: 100px;
        padding: 0.6rem 1.2rem;
        font-size: 1rem;
      }
    }
  }
}
</style>
