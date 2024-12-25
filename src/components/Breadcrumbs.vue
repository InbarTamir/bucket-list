<template>
  <nav class="breadcrumbs" aria-label="Breadcrumbs">
    <router-link to="/" class="home">
      <font-awesome-icon icon="home" />
    </router-link>
    <span class="separator">/</span>
    <span class="current">{{ currentRoute }}</span>
  </nav>
</template>

<script>
export default {
  computed: {
    currentRoute() {
      return this.$route.name.charAt(0).toUpperCase() + this.$route.name.slice(1)
    }
  }
}
</script>

<style lang="scss" scoped>
.breadcrumbs {
  font-size: 0.9rem;
  color: var(--secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  a {
    color: var(--primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .separator {
    color: var(--secondary);
    opacity: 0.5;
  }

  .current {
    font-weight: 500;
    color: var(--dark);
  }
}
</style>
