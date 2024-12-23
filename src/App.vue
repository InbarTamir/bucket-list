<template>
  <div id="app">
    <nav>
      <router-link to="/">Dashboard</router-link>
      <router-link to="/activity">Activity</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style lang="scss">
:root {
  --primary: #38acf7;
  --secondary: #6c757d;
  --success: #28a745;
  --danger: #dc3545;
  --danger-rgb: 220, 53, 69;
  --dark: #343a40;
  --light: #f8f9fa;
  --shadow: rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--light);
  color: var(--dark);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

nav {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow);
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
  justify-content: center;

  a {
    text-decoration: none;
    color: var(--dark);
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
      background: var(--light);
    }

    &.router-link-active {
      background: var(--primary);
      color: white;
    }
  }
}

// Global button styles
button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  background: var(--primary);
  color: white;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }

  &.danger {
    background: var(--danger);
  }

  &.secondary {
    background: var(--secondary);
  }
}

// Global input styles
input,
select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
}

// Add dialog styles
dialog {
  padding: 0;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  max-width: 90vw;
  max-height: 90vh;

  &::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  &[open] {
    animation: slide-up 0.2s ease;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
