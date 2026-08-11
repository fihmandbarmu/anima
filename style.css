document.addEventListener('DOMContentLoaded', () => {
  const initialShapes = [
    { name: 'Circle', class: 'circle', desc: 'A continuous curved line.' },
    { name: 'Square', class: 'square', desc: '4 equal sides.' },
    { name: 'Triangle', class: 'triangle', desc: '3 sides, strong base.' },
    { name: 'Diamond', class: 'diamond', desc: 'A rhombus geometry.' },
    { name: 'Pentagon', class: 'pentagon', desc: '5 distinct sides.' },
    { name: 'Hexagon', class: 'hexagon', desc: '6 sides.' },
    { name: 'Heptagon', class: 'heptagon', desc: '7 sides.' },
    { name: 'Octagon', class: 'octagon', desc: '8 sides.' },
    { name: 'Nonagon', class: 'nonagon', desc: '9 sides.' },
    { name: 'Decagon', class: 'decagon', desc: '10 sides.' },
    { name: 'Star', class: 'star', desc: '5-pointed polygon.' },
    { name: 'Cross', class: 'cross', desc: 'Orthogonal layout.' },
    { name: 'Chevron', class: 'chevron', desc: 'Directional chevron.' }
  ];

  let selectedCard = null;

  // 1. Render Header & Shortcut Legend Bar
  const header = document.createElement('header');
  header.className = 'hero-text';
  header.innerHTML = `
    <h1>Shape Explorer App</h1>
    <p>Click any shape to select it, then use the keyboard shortcuts below:</p>
  `;

  const shortcutBar = document.createElement('div');
  shortcutBar.className = 'shortcut-bar';
  shortcutBar.innerHTML = `
    <div class="key-badge"><kbd>D</kbd> Download App (Nothing Selected)</div>
    <div class="key-badge"><kbd>D</kbd> Duplicate Selected Shape</div>
    <div class="key-badge"><kbd>B</kbd> Toggle Bright Colors</div>
    <div class="key-badge"><kbd>R</kbd> Reset App</div>
  `;

  const grid = document.createElement('main');
  grid.className = 'shape-grid';

  // 2. Card Creation & Selection Handler
  function createCard(shapeData) {
    const card = document.createElement('div');
    card.className = 'shape-card';
    card.dataset.name = shapeData.name;
    card.dataset.class = shapeData.class;
    card.dataset.desc = shapeData.desc;

    card.innerHTML = `
      <div class="shape ${shapeData.class}"></div>
      <div class="shape-label">${shapeData.name}</div>
      <div class="shape-desc">${shapeData.desc}</div>
    `;

    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectedCard) selectedCard.classList.remove('selected');

      if (selectedCard === card) {
        selectedCard = null; // Deselect on second click
      } else {
        selectedCard = card;
        selectedCard.classList.add('selected');
      }
    });

    return card;
  }

  function renderGrid() {
    grid.innerHTML = '';
    initialShapes.forEach(shape => grid.appendChild(createCard(shape)));
  }

  // Deselect when clicking empty space
  document.addEventListener('click', () => {
    if (selectedCard) {
      selectedCard.classList.remove('selected');
      selectedCard = null;
    }
  });

  // 3. Actions (Download, Duplicate, Reset, Bright Colors)
  function downloadApp() {
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ShapeExplorerApp.html';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function duplicateSelected() {
    if (!selectedCard) return;
    const shapeData = {
      name: `${selectedCard.dataset.name} (Copy)`,
      class: selectedCard.dataset.class,
      desc: selectedCard.dataset.desc
    };
    const newCard = createCard(shapeData);
    selectedCard.insertAdjacentElement('afterend', newCard);

    // Shift selection to the duplicated card
    selectedCard.classList.remove('selected');
    selectedCard = newCard;
    selectedCard.classList.add('selected');
  }

  function resetApp() {
    document.body.classList.remove('bright-mode');
    selectedCard = null;
    renderGrid();
  }

  function toggleBrightColors() {
    document.body.classList.toggle('bright-mode');
  }

  // 4. Keyboard Shortcuts Listener
  document.addEventListener('keydown', (e) => {
    // Ignore input fields if present
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const key = e.key.toLowerCase();

    if (key === 'd') {
      e.preventDefault();
      if (selectedCard) {
        duplicateSelected();
      } else {
        downloadApp();
      }
    } else if (key === 'r') {
      e.preventDefault();
      resetApp();
    } else if (key === 'b') {
      e.preventDefault();
      toggleBrightColors();
    }
  });

  // Initialize
  document.body.appendChild(header);
  document.body.appendChild(shortcutBar);
  document.body.appendChild(grid);
  renderGrid();
});
