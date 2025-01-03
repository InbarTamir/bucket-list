<template>
  <div id="app">
    <nav>
      <router-link to="/" exact>Dashboard</router-link>
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
  --action: #4dabf7;
  --special: #e680ff;
  --special-dark: #cd00ff;
  --active-number: #ff841c;
  --warning: #ff9800;
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

  svg {
    margin-right: 6px; // Default margin for buttons with text
  }

  &[data-tooltip] {
    position: relative;
    padding: 8px; // Equal padding for icon-only buttons

    svg {
      margin: 0; // Remove margin for icon-only buttons
    }
  }

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

  &.action {
    background: var(--action);
  }

  &.outlined {
    background: var(--special);
    border: 1px solid var(--special);
    color: white;

    &:hover {
      background: white;
      color: var(--special);
    }
  }

  &.success {
    background: var(--success);
  }

  &.play {
    background: var(--success);
    &:hover {
      background: darken(#28a745, 5%);
    }
  }

  &.active {
    background: var(--active-number);
  }

  &.prominent {
    font-size: 1.1rem;
    padding: 10px 20px;
    font-weight: 600;

    svg {
      font-size: 0.9em;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px var(--shadow);
    }
  }

  &.close-button {
    background: transparent;
    color: var(--dark);
    opacity: 0.5;
    padding: 0;
    margin-inline-start: 20px;
    margin-block-end: 40px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
      transform: none;
    }
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

.modal-header {
  margin-bottom: 2rem;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  h3 {
    font-size: 1.6rem;
    color: var(--primary);
    margin-bottom: 1rem;
  }
}

dialog {
  padding: 0;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  max-width: 90vw;
  max-height: 90vh;
  margin-inline: auto;
  top: 100px;

  &::backdrop {
    background: rgba(0, 0, 0, 0.6);
  }

  &[open] {
    animation: slide-up 0.2s ease;
  }
}

// Global tooltip styles
[data-tooltip] {
  position: relative;

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    border-radius: 4px;
    background: var(--dark);
    color: white;
    font-size: 0.8rem;
    white-space: nowrap;
    pointer-events: none;
    z-index: 1000;
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
