/**
 * Application State Manager
 */
class AppState {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('app_items')) || [];
    this.theme = localStorage.getItem('app_theme') || 'light';
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this));
    localStorage.setItem('app_items', JSON.stringify(this.items));
    localStorage.setItem('app_theme', this.theme);
  }

  addItem(text) {
    if (!text.trim()) return false;
    const newItem = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
    };
    this.items.push(newItem);
    this.notify();
    return true;
  }

  toggleItem(id) {
    this.items = this.items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    this.notify();
  }

  removeItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.notify();
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.notify();
  }
}

/**
 * UI Renderer & Event Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  const state = new AppState();

  // DOM Elements
  const inputEl = document.querySelector('#item-input');
  const addBtn = document.querySelector('#add-btn');
  const listEl = document.querySelector('#item-list');
  const themeToggleBtn = document.querySelector('#theme-toggle');
  const toastContainer = document.querySelector('#toast-container') || createToastContainer();

  // Initial Theme Setup
  document.documentElement.setAttribute('data-theme', state.theme);

  // Render Loop
  state.subscribe((data) => {
    // Sync Theme
    document.documentElement.setAttribute('data-theme', data.theme);

    // Sync Item List
    if (listEl) {
      listEl.innerHTML = '';
      data.items.forEach((item) => {
        const li = document.createElement('li');
        li.className = `item-row ${item.completed ? 'completed' : ''}`;
        li.innerHTML = `
          <span>${escapeHTML(item.text)}</span>
          <div>
            <button class="btn-icon toggle-btn" data-id="${item.id}">✓</button>
            <button class="btn-icon delete-btn" data-id="${item.id}">✕</button>
          </div>
        `;
        listEl.appendChild(li);
      });
    }
  });

  // Event Listeners
  if (addBtn && inputEl) {
    const handleAdd = () => {
      if (state.addItem(inputEl.value)) {
        showToast('Item added successfully');
        inputEl.value = '';
        inputEl.focus();
      }
    };

    addBtn.addEventListener('click', handleAdd);
    inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleAdd();
    });
  }

  if (listEl) {
    listEl.addEventListener('click', (e) => {
      const target = e.target;
      const id = Number(target.dataset.id);

      if (target.classList.contains('toggle-btn')) {
        state.toggleItem(id);
      } else if (target.classList.contains('delete-btn')) {
        state.removeItem(id);
        showToast('Item removed', 'danger');
      }
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      state.toggleTheme();
    });
  }

  // Toast System Utility
  function showToast(message, type = 'brand') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
    );
  }

  // Initial Paint
  state.notify();
});
