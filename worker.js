self.onmessage = (event) => {
  const { sharedBuffer, width, height, start, end } = event.data; 
  const pixels = new Uint8ClampedArray(sharedBuffer);

  for (let y = start; y < end; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4; 
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];

      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      pixels[index] = pixels[index + 1] = pixels[index + 2] = gray;
    }
  };

  postMessage('done');
}