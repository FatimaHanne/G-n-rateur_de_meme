const canvas = document.querySelector('.Canvas');
const ctx = canvas.getContext('2d');
const templates = document.querySelectorAll('.template');
const imageUpload = document.getElementById('imageUpload');
const dragDropArea = document.getElementById('dragDropArea');
const topText = document.getElementById('topText');
const bottomText = document.getElementById('bottomText');
const positionBtns = document.querySelectorAll('.position-btn')
const fontSizeInput = document.getElementById('fontSize');
const textColorInput = document.getElementById('textColor');
const contourColorInput = document.getElementById('contourColor');
const fontFamilyInput = document.getElementById('fontFamily');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// Variables pour le recadrage
const cropModal = document.getElementById('cropModal');
const cropImage = document.getElementById('cropImage');
const cropSelection = document.getElementById('cropSelection');
const cropOverlay = document.getElementById('cropOverlay');
let originalImageData = null;
let isDragging = false;
let isResizing = false;
let dragStart = { x: 0, y: 0 };
let currentHandle = null;

const img = new Image();
let topPosition = 'top-center';
let bottomPosition = 'bottom-center';

const templateSources = {
  drake: 'https://images.unsplash.com/photo-1753881907041-0aa92facfd3c?w=800',
  boyfreind: 'https://images.unsplash.com/photo-1753696053910-1166f7c6751e?w=800',
  brain: 'https://images.unsplash.com/photo-1750688650017-c3090567942f?w=800',
  costum: 'https://images.unsplash.com/photo-1753881907041-0aa92facfd3c?w=800'
};

img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  drawMeme();
};

templates.forEach(template => {
  template.addEventListener('click', () => {
    const name = template.dataset.template;
    if (!templateSources[name]) return;
    img.crossOrigin = 'anonymous';
    img.src = templateSources[name];
    originalImageData = templateSources[name];
    // hideImageControls();
      showImageControls();
      
  });
});

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
    originalImageData = reader.result;
    showImageControls();
  };
  reader.readAsDataURL(file);
});

dragDropArea.addEventListener('dragover', (e) => e.preventDefault());

dragDropArea.addEventListener('drop', (e) => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
    originalImageData = reader.result;
    showImageControls();
  };
  reader.readAsDataURL(file);
});

function showImageControls() {
  document.getElementById('cropBtn').style.display = 'inline-block';
  document.getElementById('removeBtn').style.display = 'inline-block';
}

function hideImageControls() {
  document.getElementById('cropBtn').style.display = 'none';
  document.getElementById('removeBtn').style.display = 'none';
}

function removeImage() {
  img.src = '';
  originalImageData = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hideImageControls();
  imageUpload.value = '';
}

function openCropModal() {
  if (!originalImageData) return;

  cropImage.onload = function() {
      // Adapter dynamiquement la taille du conteneur pour voir toute l’image
      const cropArea = document.getElementById('cropArea');
      cropArea.style.width = '';
      cropArea.style.height = '';

      // On veut que l’image tienne dans 90vw x 60vh au maximum
      let containerMaxWidth = window.innerWidth * 0.9;
      let containerMaxHeight = window.innerHeight * 0.6;
      let imgRatio = cropImage.naturalWidth / cropImage.naturalHeight;

      // Calcul adapté :
      let areaWidth = containerMaxWidth;
      let areaHeight = containerMaxWidth / imgRatio;
      if (areaHeight > containerMaxHeight) {
          areaHeight = containerMaxHeight;
          areaWidth = containerMaxHeight * imgRatio;
      }

      cropArea.style.width = `${areaWidth}px`;
      cropArea.style.height = `${areaHeight}px`;

      // Met à jour le cropSelection centré
      const selectionSize = Math.min(areaWidth, areaHeight) / 2;
      cropSelection.style.left = `${(areaWidth - selectionSize) / 2}px`;
      cropSelection.style.top = `${(areaHeight - selectionSize) / 2}px`;
      cropSelection.style.width = `${selectionSize}px`;
      cropSelection.style.height = `${selectionSize}px`;

      setupCropHandlers();
  };

  cropImage.src = originalImageData;
  cropModal.style.display = 'flex';
}


function closeCropModal() {
  cropModal.style.display = 'none';
}

function setupCropHandlers() {
  cropSelection.addEventListener('mousedown', startDrag);
  
  document.querySelectorAll('.crop-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => startResize(e, handle.classList[1]));
  });
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopDragResize);
}

function startDrag(e) {
  if (e.target.classList.contains('crop-handle')) return;
  isDragging = true;
  dragStart.x = e.clientX - cropSelection.offsetLeft;
  dragStart.y = e.clientY - cropSelection.offsetTop;
  e.preventDefault();
}

function startResize(e, handle) {
  isResizing = true;
  currentHandle = handle;
  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
  e.preventDefault();
  e.stopPropagation();
}

function handleMouseMove(e) {
  if (isDragging) {
    const area = document.getElementById('cropArea');
    const areaRect = area.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x - areaRect.left, areaRect.width - cropSelection.offsetWidth));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y - areaRect.top, areaRect.height - cropSelection.offsetHeight));
    
    cropSelection.style.left = newX + 'px';
    cropSelection.style.top = newY + 'px';
  }
  
  if (isResizing && currentHandle) {
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const area = document.getElementById('cropArea');
    const areaRect = area.getBoundingClientRect();
    
    let newWidth = cropSelection.offsetWidth;
    let newHeight = cropSelection.offsetHeight;
    let newLeft = cropSelection.offsetLeft;
    let newTop = cropSelection.offsetTop;
    
    switch(currentHandle) {
      case 'se':
        newWidth = Math.max(50, Math.min(newWidth + deltaX, areaRect.width - newLeft));
        newHeight = Math.max(50, Math.min(newHeight + deltaY, areaRect.height - newTop));
        break;
      case 'sw':
        newWidth = Math.max(50, newWidth - deltaX);
        newHeight = Math.max(50, Math.min(newHeight + deltaY, areaRect.height - newTop));
        newLeft = Math.max(0, cropSelection.offsetLeft + deltaX);
        break;
      case 'ne':
        newWidth = Math.max(50, Math.min(newWidth + deltaX, areaRect.width - newLeft));
        newHeight = Math.max(50, newHeight - deltaY);
        newTop = Math.max(0, cropSelection.offsetTop + deltaY);
        break;
      case 'nw':
        newWidth = Math.max(50, newWidth - deltaX);
        newHeight = Math.max(50, newHeight - deltaY);
        newLeft = Math.max(0, cropSelection.offsetLeft + deltaX);
        newTop = Math.max(0, cropSelection.offsetTop + deltaY);
        break;
    }
    
    cropSelection.style.width = newWidth + 'px';
    cropSelection.style.height = newHeight + 'px';
    cropSelection.style.left = newLeft + 'px';
    cropSelection.style.top = newTop + 'px';
    
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
  }
}

function stopDragResize() {
  isDragging = false;
  isResizing = false;
  currentHandle = null;
}

function applyCrop() {
  const area = document.getElementById('cropArea');
  const scaleX = cropImage.naturalWidth / cropImage.offsetWidth;
  const scaleY = cropImage.naturalHeight / cropImage.offsetHeight;
  
  const cropX = (cropSelection.offsetLeft) * scaleX;
  const cropY = (cropSelection.offsetTop) * scaleY;
  const cropWidth = cropSelection.offsetWidth * scaleX;
  const cropHeight = cropSelection.offsetHeight * scaleY;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const cropImg = new Image();
 cropImg.crossOrigin = 'anonymous';

  cropImg.onload = function() {
    ctx.drawImage(cropImg, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    const croppedImageData = canvas.toDataURL();
    img.src = croppedImageData;
    originalImageData = croppedImageData;
    closeCropModal();
  };
  cropImg.src = originalImageData;
}

positionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    positionBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const position = btn.dataset.position;
       if (position.includes('top') || position.includes('center')) {
      topPosition = position;
    } else if (position.includes('bottom')) {
      bottomPosition = position;
    }

    drawMeme();
  });
});

function drawText(text, position, fontSize, fontFamily, fillColor, strokeColor) {
  if (!text) return;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = fontSize * 0.1;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let x = canvas.width / 2;
  let y = 50;

  const positionMap = {
    'top-left': [50, 50],
    'top-center': [x, 50],
    'top-right': [canvas.width - 50, 50],
    'center-left': [50, canvas.height / 2],
    'center': [x, canvas.height / 2],
    'center-right': [canvas.width - 50, canvas.height / 2],
    'bottom-left': [50, canvas.height - 50],
    'bottom-center': [x, canvas.height - 50],
    'bottom-right': [canvas.width - 50, canvas.height - 50]
  };

  [x, y] = positionMap[position] || [x, y];

  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function drawMeme() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const fontSize = parseInt(fontSizeInput.value);
  const fontFamily = fontFamilyInput.value;
  const textColor = textColorInput.value;
  const contourColor = contourColorInput.value;

  drawText(topTextInput.value, topPosition, fontSize, fontFamily, textColor, contourColor);
  drawText(bottomTextInput.value, bottomPosition, fontSize, fontFamily, textColor, contourColor);
}

[topTextInput, bottomTextInput, fontSizeInput, textColorInput, contourColorInput, fontFamilyInput].forEach(input => {
  input.addEventListener('input', drawMeme);
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'meme.png';
  link.href = canvas.toDataURL();
  link.click();
});

resetBtn.addEventListener('click', () => {
  topTextInput.value = '';
  bottomTextInput.value = '';
  img.src = '';
  originalImageData = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hideImageControls();
});