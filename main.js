const imageInput = document.querySelector('#image-input');
const canvas = document.querySelector('#canvas');
const processButton = document.querySelector('#process-button');
const ctx = canvas.getContext('2d');

const numWorkers = 4;
let imageData;
let sharedBuffer;
let workers = [];

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      imageData = ctx.getImageData(0, 0, img.width, img.height);
      sharedBuffer = new SharedArrayBuffer(imageData.data.length);
      const sharedArray = new Uint8ClampedArray(sharedBuffer);
      sharedArray.set(imageData.data);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});


processButton.addEventListener('click', () => {
  if(!imageData) {
    alert(`carregue uma imagem!`);
    return;
  }

  const sharedArray = new Uint8ClampedArray(sharedBuffer);
  const blockSize = Math.ceil(imageData.height / numWorkers);

  for(let i = 0 ; i < numWorkers ; i++) {
    const worker = new Worker('worker.js');
    workers.push(worker);

    worker.postMessage({
      sharedBuffer,
      width: imageData.width,
      height: imageData.height,
      start: i * blockSize,
      end: Math.min((i + 1) * blockSize, imageData.height),
    });

    worker.onmessage = () => {
      workers = workers.filter((w) => w !== worker);
      if(workers.length === 0) {
        const result = new Uint8ClampedArray(sharedBuffer);
        imageData.data.set(result);
        ctx.putImageData(imageData, 0, 0);
        alert(`processamento concluido`);
      } 
    }
  }
});