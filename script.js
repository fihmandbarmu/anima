const width = 640;
const height = 400;

const drawCanvas = document.getElementById('drawCanvas');
const drawCtx = drawCanvas.getContext('2d');
const onionCanvas = document.getElementById('onionCanvas');
const onionCtx = onionCanvas.getContext('2d');
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const sizeRange = document.getElementById('sizeRange');
const sizeVal = document.getElementById('sizeVal');
const btnBrush = document.getElementById('btnBrush');
const btnSelect = document.getElementById('btnSelect');
const btnDeleteObj = document.getElementById('btnDeleteObj');
const btnAddRect = document.getElementById('btnAddRect');
const btnAddCircle = document.getElementById('btnAddCircle');
const btnAddStar = document.getElementById('btnAddStar');
const emojiPicker = document.getElementById('emojiPicker');
const btnAddEmoji = document.getElementById('btnAddEmoji');
const bgPreset = document.getElementById('bgPreset');
const btnOnion = document.getElementById('btnOnion');
const btnClear = document.getElementById('btnClear');
const btnPlay = document.getElementById('btnPlay');
const btnAddFrame = document.getElementById('btnAddFrame');
const btnDupFrame = document.getElementById('btnDupFrame');
const btnDeleteFrame = document.getElementById('btnDeleteFrame');
const fpsRange = document.getElementById('fpsRange');
const fpsVal = document.getElementById('fpsVal');
const framesStrip = document.getElementById('framesStrip');
const frameCounter = document.getElementById('frameCounter');
const aiSeed = document.getElementById('aiSeed');
const btnAiGenerate = document.getElementById('btnAiGenerate');

// Chat AI controls
const chatInput = document.getElementById('chatInput');
const btnSendChat = document.getElementById('btnSendChat');
const chatMessages = document.getElementById('chatMessages');

// Voice recorder controls
const btnRecordVoice = document.getElementById('btnRecordVoice');
const btnPlayVoice = document.getElementById('btnPlayVoice');

let frames = [ [] ];
let backgroundTheme = 'none';
let currentFrame = 0;
let mode = 'brush';
let selectedObjectIndex = -1;
let isDrawingOrDragging = false;
let currentPath = null;
let dragOffsetX = 0, dragOffsetY = 0;
let onionSkinEnabled = true;
let isPlaying = false;
let playInterval = null;
let fps = 12;

// Voice Recording state
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;
let recordedAudioUrl = null;
let audioElement = new Audio();
let isRecording = false;

function init() {
  render();
  updateUI();

  drawCanvas.addEventListener('mousedown', handleMouseDown);
  drawCanvas.addEventListener('mousemove', handleMouseMove);
  drawCanvas.addEventListener('mouseup', handleMouseUp);

  drawCanvas.addEventListener('touchstart', (e) => handleMouseDown(e.touches[0]));
  drawCanvas.addEventListener('touchmove', (e) => handleMouseMove(e.touches[0]));
  drawCanvas.addEventListener('touchend', handleMouseUp);

  // Controls Event Listeners
  btnBrush.onclick = () => setMode('brush');
  btnSelect.onclick = () => setMode('select');
  btnDeleteObj.onclick = deleteSelectedObject;
  btnAddRect.onclick = () => addObject('rect');
  btnAddCircle.onclick = () => addObject('circle');
  btnAddStar.onclick = () => addObject('star');
  btnAddEmoji.onclick = () => addObject('emoji', emojiPicker.value);

  bgPreset.onchange = (e) => {
    backgroundTheme = e.target.value;
    render();
  };

  colorPicker.oninput = () => {
    if (selectedObjectIndex !== -1 && mode === 'select') {
      frames[currentFrame][selectedObjectIndex].color = colorPicker.value;
      render();
    }
  };

  sizeRange.oninput = () => {
    sizeVal.textContent = sizeRange.value;
    if (selectedObjectIndex !== -1 && mode === 'select') {
      frames[currentFrame][selectedObjectIndex].size = parseInt(sizeRange.value);
      render();
    }
  };

  btnOnion.onclick = () => {
    onionSkinEnabled = !onionSkinEnabled;
    btnOnion.classList.toggle('active', onionSkinEnabled);
    render();
  };

  btnClear.onclick = () => {
    frames[currentFrame] = [];
    selectedObjectIndex = -1;
    render();
  };

  btnAiGenerate.onclick = () => generate195MAiAnimation(aiSeed.value);
  btnSendChat.onclick = () => {
    if (chatInput.value.trim()) {
      processAiChatMessage(chatInput.value.trim());
      chatInput.value = '';
    }
  };
  chatInput.onkeydown = (e) => {
    if (e.key === 'Enter') btnSendChat.click();
  };

  btnPlay.onclick = togglePlay;
  btnAddFrame.onclick = () => addFrame(false);
  btnDupFrame.onclick = () => addFrame(true);
  btnDeleteFrame.onclick = deleteFrame;

  fpsRange.oninput = () => {
    fps = parseInt(fpsRange.value);
    fpsVal.textContent = fps;
    if (isPlaying) {
      togglePlay();
      togglePlay();
    }
  };
}

function render() {
  renderBackground();
  drawCtx.clearRect(0, 0, width, height);
  const objects = frames[currentFrame];

  objects.forEach((obj, idx) => {
    drawObject(drawCtx, obj);
    if (idx === selectedObjectIndex && !isPlaying) {
      drawBoundingBox(drawCtx, obj);
    }
  });

  if (currentPath) {
    drawObject(drawCtx, currentPath);
  }

  renderOnionSkin();
}

function renderBackground() {
  bgCtx.clearRect(0, 0, width, height);
  if (backgroundTheme === 'none') {
    bgCtx.fillStyle = '#ffffff';
    bgCtx.fillRect(0, 0, width, height);
  } else if (backgroundTheme === 'space') {
    let grad = bgCtx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#050515'); grad.addColorStop(1, '#1a0b2e');
    bgCtx.fillStyle = grad; bgCtx.fillRect(0, 0, width, height);
    bgCtx.fillStyle = '#ffffff';
    for (let i = 0; i < 60; i++) {
      bgCtx.fillRect((i * 37) % width, (i * 19) % height, (i % 3) + 1, (i % 3) + 1);
    }
  } else if (backgroundTheme === 'sunset') {
    let grad = bgCtx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#fd3a69'); grad.addColorStop(0.6, '#fecd1a'); grad.addColorStop(1, '#2e1065');
    bgCtx.fillStyle = grad; bgCtx.fillRect(0, 0, width, height);
    bgCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    bgCtx.beginPath(); bgCtx.arc(320, 260, 80, 0, Math.PI * 2); bgCtx.fill();
  } else if (backgroundTheme === 'ocean') {
    let grad = bgCtx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0284c7'); grad.addColorStop(1, '#0369a1');
    bgCtx.fillStyle = grad; bgCtx.fillRect(0, 0, width, height);
    bgCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 5; i++) {
      bgCtx.beginPath(); bgCtx.arc(i * 150 + 50, 360, 100, 0, Math.PI * 2); bgCtx.fill();
    }
  } else if (backgroundTheme === 'cyber') {
    bgCtx.fillStyle = '#09090e'; bgCtx.fillRect(0, 0, width, height);
    bgCtx.strokeStyle = '#ec4899'; bgCtx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      bgCtx.beginPath(); bgCtx.moveTo(x, 0); bgCtx.lineTo(x, height); bgCtx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      bgCtx.beginPath(); bgCtx.moveTo(0, y); bgCtx.lineTo(width, y); bgCtx.stroke();
    }
  } else if (backgroundTheme === 'forest') {
    let grad = bgCtx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#064e3b'); grad.addColorStop(1, '#022c22');
    bgCtx.fillStyle = grad; bgCtx.fillRect(0, 0, width, height);
    bgCtx.fillStyle = '#065f46';
    for (let i = 0; i < 10; i++) {
      bgCtx.beginPath();
      bgCtx.moveTo(i * 70, height); bgCtx.lineTo(i * 70 + 35, 200); bgCtx.lineTo(i * 70 + 70, height);
      bgCtx.fill();
    }
  } else if (backgroundTheme === 'desert') {
    let grad = bgCtx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#ffedd5'); grad.addColorStop(1, '#f97316');
    bgCtx.fillStyle = grad; bgCtx.fillRect(0, 0, width, height);
  } else if (backgroundTheme === 'night') {
    bgCtx.fillStyle = '#020617'; bgCtx.fillRect(0, 0, width, height);
    bgCtx.fillStyle = '#e2e8f0';
    bgCtx.beginPath(); bgCtx.arc(520, 80, 40, 0, Math.PI * 2); bgCtx.fill();
  }
}

function renderOnionSkin() {
  onionCtx.clearRect(0, 0, width, height);
  if (onionSkinEnabled && currentFrame > 0 && !isPlaying) {
    const prevObjects = frames[currentFrame - 1];
    prevObjects.forEach(obj => drawObject(onionCtx, obj));
  }
}

function drawObject(ctx, obj) {
  ctx.save();
  ctx.fillStyle = obj.color;
  ctx.strokeStyle = obj.color;
  ctx.lineWidth = obj.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (obj.type === 'path') {
    if (obj.points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(obj.points[0].x, obj.points[0].y);
      for (let i = 1; i < obj.points.length; i++) {
        ctx.lineTo(obj.points[i].x, obj.points[i].y);
      }
      ctx.stroke();
    }
  } else if (obj.type === 'rect') {
    ctx.fillRect(obj.x - obj.size/2, obj.y - obj.size/2, obj.size, obj.size);
  } else if (obj.type === 'circle') {
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, obj.size/2, 0, Math.PI * 2);
    ctx.fill();
  } else if (obj.type === 'star') {
    ctx.beginPath();
    drawStarPoints(ctx, obj.x, obj.y, 5, obj.size/2, obj.size/4);
    ctx.fill();
  } else if (obj.type === 'emoji') {
    ctx.font = `${obj.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obj.value, obj.x, obj.y);
  }
  ctx.restore();
}

function drawBoundingBox(ctx, obj) {
  ctx.save();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  const b = getObjectBounds(obj);
  ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
  ctx.restore();
}

function getObjectBounds(obj) {
  if (obj.type === 'path') {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    obj.points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    const padding = obj.size / 2;
    return { x: minX - padding, y: minY - padding, w: (maxX - minX) + obj.size, h: (maxY - minY) + obj.size };
  } else {
    return { x: obj.x - obj.size/2, y: obj.y - obj.size/2, w: obj.size, h: obj.size };
  }
}

function drawStarPoints(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let step = Math.PI / spikes;
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
}

// Pointer Handling
function handleMouseDown(e) {
  if (isPlaying) return;
  const { x, y } = getCanvasCoords(e);
  isDrawingOrDragging = true;

  if (mode === 'brush') {
    selectedObjectIndex = -1;
    currentPath = {
      type: 'path',
      points: [{ x, y }],
      color: colorPicker.value,
      size: parseInt(sizeRange.value)
    };
  } else if (mode === 'select') {
    const objects = frames[currentFrame];
    selectedObjectIndex = -1;

    for (let i = objects.length - 1; i >= 0; i--) {
      const b = getObjectBounds(objects[i]);
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        selectedObjectIndex = i;
        const obj = objects[i];
        dragOffsetX = x - (obj.x || (b.x + b.w/2));
        dragOffsetY = y - (obj.y || (b.y + b.h/2));
        colorPicker.value = obj.color || '#000000';
        sizeRange.value = obj.size;
        sizeVal.textContent = obj.size;
        break;
      }
    }
  }
  render();
}

function handleMouseMove(e) {
  if (!isDrawingOrDragging || isPlaying) return;
  const { x, y } = getCanvasCoords(e);

  if (mode === 'brush' && currentPath) {
    currentPath.points.push({ x, y });
  } else if (mode === 'select' && selectedObjectIndex !== -1) {
    const obj = frames[currentFrame][selectedObjectIndex];
    if (obj.type === 'path') {
      const b = getObjectBounds(obj);
      const currentCenterX = b.x + b.w/2;
      const currentCenterY = b.y + b.h/2;
      const dx = (x - dragOffsetX) - currentCenterX;
      const dy = (y - dragOffsetY) - currentCenterY;
      obj.points.forEach(p => { p.x += dx; p.y += dy; });
    } else {
      obj.x = x - dragOffsetX;
      obj.y = y - dragOffsetY;
    }
  }
  render();
}

function handleMouseUp() {
  if (!isDrawingOrDragging) return;
  isDrawingOrDragging = false;

  if (mode === 'brush' && currentPath) {
    if (currentPath.points.length > 0) {
      frames[currentFrame].push(currentPath);
    }
    currentPath = null;
  }
  render();
}

function getCanvasCoords(e) {
  const rect = drawCanvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (width / rect.width),
    y: (e.clientY - rect.top) * (height / rect.height)
  };
}

function addObject(type, value = '') {
  const newObj = {
    type: type,
    value: value,
    x: width / 2,
    y: height / 2,
    size: parseInt(sizeRange.value) < 15 ? 40 : parseInt(sizeRange.value),
    color: colorPicker.value
  };
  frames[currentFrame].push(newObj);
  setMode('select');
  selectedObjectIndex = frames[currentFrame].length - 1;
  render();
}

function deleteSelectedObject() {
  if (selectedObjectIndex !== -1) {
    frames[currentFrame].splice(selectedObjectIndex, 1);
    selectedObjectIndex = -1;
    render();
  }
}

function setMode(newMode) {
  mode = newMode;
  btnBrush.classList.toggle('active', mode === 'brush');
  btnSelect.classList.toggle('active', mode === 'select');
  if (mode === 'brush') selectedObjectIndex = -1;
  render();
}

// AI Chat Assistant Engine
function processAiChatMessage(text) {
  const lower = text.toLowerCase();
  addChatMessage('user', text);

  let response = "";

  if (lower.includes('background') || lower.includes('bg') || lower.includes('theme')) {
    if (lower.includes('space') || lower.includes('galaxy')) {
      backgroundTheme = 'space'; response = "🌌 Background set to Space!";
    } else if (lower.includes('sunset')) {
      backgroundTheme = 'sunset'; response = "🌅 Background set to Sunset!";
    } else if (lower.includes('ocean') || lower.includes('water')) {
      backgroundTheme = 'ocean'; response = "🌊 Background set to Ocean!";
    } else if (lower.includes('cyber') || lower.includes('grid')) {
      backgroundTheme = 'cyber'; response = "🌆 Background set to Cyberpunk Grid!";
    } else if (lower.includes('forest') || lower.includes('tree')) {
      backgroundTheme = 'forest'; response = "🌲 Background set to Forest!";
    } else if (lower.includes('desert')) {
      backgroundTheme = 'desert'; response = "🏜️ Background set to Desert!";
    } else if (lower.includes('night') || lower.includes('moon')) {
      backgroundTheme = 'night'; response = "🌙 Background set to Night Sky!";
    } else if (lower.includes('clear') || lower.includes('blank') || lower.includes('white')) {
      backgroundTheme = 'none'; response = "Canvas background cleared!";
    } else {
      backgroundTheme = 'space'; response = "Background updated!";
    }
    bgPreset.value = backgroundTheme;
  } else {
    let addedObj = false;
    const stickerOptions = Array.from(emojiPicker.options);

    for (let opt of stickerOptions) {
      const val = opt.value;
      const label = opt.text.toLowerCase();
      if (lower.includes(label.split(' ')[1] || label) || lower.includes(val)) {
        addObject('emoji', val);
        response = `Added ${val} sticker to frame!`;
        addedObj = true;
        break;
      }
    }

    if (!addedObj) {
      if (lower.includes('rect') || lower.includes('square')) {
        addObject('rect'); response = "Added Rectangle shape!";
      } else if (lower.includes('circle') || lower.includes('ball')) {
        addObject('circle'); response = "Added Circle shape!";
      } else if (lower.includes('star')) {
        addObject('star'); response = "Added Star shape!";
      } else {
        response = "I can add backgrounds (Space, Sunset, Ocean, Cyber, Forest, Desert, Night) or 80+ stickers (Rocket, Dragon, Cat, Fire, Robot, Pizza). Try 'Add a rocket sticker' or 'Set background to sunset'!";
      }
    }
  }

  setTimeout(() => addChatMessage('bot', response), 300);
  render();
}

function addChatMessage(sender, msg) {
  const el = document.createElement('div');
  el.className = `msg ${sender}`;
  el.textContent = msg;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Voice Recorder Module
btnRecordVoice.onclick = async () => {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        recordedAudioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        recordedAudioUrl = URL.createObjectURL(recordedAudioBlob);
        audioElement.src = recordedAudioUrl;
        btnPlayVoice.style.display = 'inline-block';
      };

      mediaRecorder.start();
      isRecording = true;
      btnRecordVoice.textContent = "⏹️ Stop Recording";
      btnRecordVoice.classList.add('recording');
    } catch (err) {
      alert("Microphone access is required to record voice.");
    }
  } else {
    mediaRecorder.stop();
    isRecording = false;
    btnRecordVoice.textContent = "🎙️ Record Voice";
    btnRecordVoice.classList.remove('recording');
  }
};

btnPlayVoice.onclick = () => {
  if (recordedAudioUrl) {
    audioElement.currentTime = 0;
    audioElement.play();
  }
};

// Frame & Playback Controls
function addFrame(duplicate = false) {
  let newFrameObjects = [];
  if (duplicate) {
    newFrameObjects = JSON.parse(JSON.stringify(frames[currentFrame]));
  }
  currentFrame++;
  frames.splice(currentFrame, 0, newFrameObjects);
  selectedObjectIndex = -1;
  render();
  updateUI();
}

function deleteFrame() {
  if (frames.length <= 1) {
    frames[0] = [];
    selectedObjectIndex = -1;
    render();
    return;
  }
  frames.splice(currentFrame, 1);
  if (currentFrame >= frames.length) currentFrame = frames.length - 1;
  selectedObjectIndex = -1;
  render();
  updateUI();
}

function togglePlay() {
  isPlaying = !isPlaying;
  if (isPlaying) {
    btnPlay.textContent = "⏸️ Pause";
    btnPlay.style.background = "#f59e0b";
    if (recordedAudioUrl) {
      audioElement.currentTime = 0;
      audioElement.play();
    }
    playInterval = setInterval(() => {
      currentFrame = (currentFrame + 1) % frames.length;
      render();
      updateUI();
    }, 1000 / fps);
  } else {
    btnPlay.textContent = "▶ Play";
    btnPlay.style.background = "#10b981";
    clearInterval(playInterval);
    render();
  }
}

function updateUI() {
  frameCounter.textContent = `Frame ${currentFrame + 1} / ${frames.length}`;
  framesStrip.innerHTML = '';

  frames.forEach((_, idx) => {
    const card = document.createElement('div');
    card.className = `frame-card ${idx === currentFrame ? 'active' : ''}`;
    card.textContent = `#${idx + 1}`;
    card.onclick = () => {
      if (isPlaying) togglePlay();
      currentFrame = idx;
      selectedObjectIndex = -1;
      render();
      updateUI();
    };
    framesStrip.appendChild(card);
  });
}

// 195M Generator
function generate195MAiAnimation(seedVal) {
  if (isPlaying) togglePlay();
  frames = [];
  const totalFrames = 16;
  const emojis = ["🚀", "⭐", "🔥", "🤖", "⚽", "👾", "❤️", "🐱", "🛸", "🦄", "🐉", "🍕"];
  const shapes = ["rect", "circle", "star", "emoji"];
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  let seed = parseInt(seedVal) || 100;
  function random() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  const objCount = 2 + Math.floor(random() * 4);
  const archetypes = [];

  for (let o = 0; o < objCount; o++) {
    archetypes.push({
      type: shapes[Math.floor(random() * shapes.length)],
      emoji: emojis[Math.floor(random() * emojis.length)],
      color: colors[Math.floor(random() * colors.length)],
      baseSize: 25 + Math.floor(random() * 40),
      startX: 100 + Math.floor(random() * 440),
      startY: 80 + Math.floor(random() * 240),
      speedX: (random() - 0.5) * 12,
      speedY: (random() - 0.5) * 12
    });
  }

  for (let f = 0; f < totalFrames; f++) {
    const frameObjs = [];
    archetypes.forEach(arch => {
      frameObjs.push({
        type: arch.type,
        value: arch.emoji,
        color: arch.color,
        size: arch.baseSize,
        x: Math.max(40, Math.min(600, arch.startX + arch.speedX * f)),
        y: Math.max(40, Math.min(360, arch.startY + arch.speedY * f))
      });
    });
    frames.push(frameObjs);
  }

  currentFrame = 0;
  render();
  updateUI();
}

window.onload = init;
