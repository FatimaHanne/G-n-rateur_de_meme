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


const img = new Image(); // ✅ déclaration
let topPosition = 'top-center';
let bottomPosition = 'bottom-center';
// let centerPosition = 'center';

const templateSources = {
  drake: 'https://images.unsplash.com/photo-1753881907041-0aa92facfd3c?w=800',
  boyfreind: 'https://images.unsplash.com/photo-1753696053910-1166f7c6751e?w=800',
  brain: 'https://images.unsplash.com/photo-1750688650017-c3090567942f?w=800',
  costum: 'https://images.unsplash.com/photo-1753881907041-0aa92facfd3c?w=800'
};

// ✅ redimensionne le canvas à chaque chargement
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
  });
});

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
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
  };
  reader.readAsDataURL(file);
});

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
// Dessiner le texte avec contour
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
// Réécoute tous les changements
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});


