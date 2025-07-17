/*
 * Hermite resize - fast image resize/resample using Hermite filter.
 * https://github.com/viliusle/Hermite-resize
 */

//refactorizado
export function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number): void {
  /**const width_source = canvas.width;
  const height_source = canvas.height;**/
  width = Math.round(width);
  height = Math.round(height);

  /**const ratio_w = width_source / width;
  const ratio_h = height_source / height;**/
  /**const ratio_w_half = Math.ceil(ratio_w / 2);
  const ratio_h_half = Math.ceil(ratio_h / 2);**/

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  /**const img = ctx.getImageData(0, 0, width_source, height_source);**/
  const img2 = ctx.createImageData(width, height);

  // Redimensionar la imagen
  /**const data2 = resizeImageData(img.data, img2.data, width, height, ratio_w, ratio_h, ratio_w_half, ratio_h_half, width_source, height_source);**/

  // Configurar el nuevo tamaño del canvas y dibujar la imagen redimensionada
  canvas.width = width;
  canvas.height = height;
  ctx.putImageData(img2, 0, 0);
}

/**function resizeImageData(
  data: Uint8ClampedArray,
  data2: Uint8ClampedArray,
  width: number,
  height: number,
  ratio_w: number,
  ratio_h: number,
  ratio_w_half: number,
  ratio_h_half: number,
  width_source: number,
  height_source: number
): Uint8ClampedArray {
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const pixelData = calculatePixelData(i, j, data, width, ratio_w, ratio_h, ratio_w_half, ratio_h_half, width_source, height_source);
      const x2 = (i + j * width) * 4;
      data2[x2] = pixelData.gx_r / pixelData.weights;
      data2[x2 + 1] = pixelData.gx_g / pixelData.weights;
      data2[x2 + 2] = pixelData.gx_b / pixelData.weights;
      data2[x2 + 3] = pixelData.gx_a / pixelData.weights_alpha;
    }
  }
  return data2;
}**/

type Dimensions = {
  width: number;
  height: number;
  width_source: number;
  height_source: number;
};

type Ratios = {
  w: number;
  h: number;
  w_half: number;
  h_half: number;
};

function resizeImageData(
  data: Uint8ClampedArray,
  data2: Uint8ClampedArray,
  dimensions: Dimensions,
  ratios: Ratios
): Uint8ClampedArray {
  const { width, height, width_source, height_source } = dimensions;
  const { w: ratio_w, h: ratio_h, w_half: ratio_w_half, h_half: ratio_h_half } = ratios;

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const pixelDataParams: PixelDataParams = {i, j, data, width, ratio_w, ratio_h, ratioss : {ratio_w_half, ratio_h_half, width_source, height_source}};
      const pixelData = calculatePixelData(pixelDataParams);
      const x2 = (i + j * width) * 4;
      data2[x2] = pixelData.gx_r / pixelData.weights;
      data2[x2 + 1] = pixelData.gx_g / pixelData.weights;
      data2[x2 + 2] = pixelData.gx_b / pixelData.weights;
      data2[x2 + 3] = pixelData.gx_a / pixelData.weights_alpha;
    }
  }
  return data2;
}

//refactorizado
interface PixelDataParams {
  i: number;
  j: number;
  data: Uint8ClampedArray;
  width: number;
  ratio_w: number;
  ratio_h: number;
  ratioss: {
    ratio_w_half: number;
    ratio_h_half: number;
    width_source: number;
    height_source: number;
    /**
     * ratio_w: number;
    ratio_h: number;
    ratio_w_half: number;
    ratio_h_half: number;
     */
  };
}

function calculatePixelData({
  i,
  j,
  data,
  width,
  ratio_w,
  ratio_h,
  ratioss,
}: PixelDataParams): { gx_r: number; gx_g: number; gx_b: number; gx_a: number; weights: number; weights_alpha: number } {
  let gx_r = 0, gx_g = 0, gx_b = 0, gx_a = 0;
  let weights = 0, weights_alpha = 0;

  const xx_start = Math.floor(i * ratio_w);
  const yy_start = Math.floor(j * ratio_h);
  const xx_stop = Math.min(Math.ceil((i + 1) * ratio_w), ratioss.width_source);
  const yy_stop = Math.min(Math.ceil((j + 1) * ratio_h), ratioss.height_source);
  const center_x = i * ratio_w;
  const center_y = j * ratio_h;

  for (let yy = yy_start; yy < yy_stop; yy++) {
    const dy = Math.abs(center_y - yy) / ratioss.ratio_h_half;
    const w0 = dy * dy;
    for (let xx = xx_start; xx < xx_stop; xx++) {
      const weightData = calculateWeight(xx, yy, center_x, data, w0, ratioss.ratio_w_half, ratioss.width_source);
      if (weightData.weight > 0) {
        gx_r += weightData.weight * weightData.r;
        gx_g += weightData.weight * weightData.g;
        gx_b += weightData.weight * weightData.b;
        gx_a += weightData.weight * weightData.a;
        weights += weightData.weight;
        weights_alpha += weightData.weight_alpha;
      }
    }
  }

  return { gx_r, gx_g, gx_b, gx_a, weights, weights_alpha };

  /**let gx_r = 0, gx_g = 0, gx_b = 0, gx_a = 0;
  let weights = 0, weights_alpha = 0;

  const xx_start = Math.floor(i * ratios.ratio_w);
  const yy_start = Math.floor(j * ratios.ratio_h);
  const xx_stop = Math.min(Math.ceil((i + 1) * ratios.ratio_w), width_source);
  const yy_stop = Math.min(Math.ceil((j + 1) * ratios.ratio_h), height_source);
  const center_x = i * ratios.ratio_w;
  const center_y = j * ratios.ratio_h;

  for (let yy = yy_start; yy < yy_stop; yy++) {
    const dy = Math.abs(center_y - yy) / ratios.ratio_h_half;
    const w0 = dy * dy;
    for (let xx = xx_start; xx < xx_stop; xx++) {
      const weightData = calculateWeight(xx, yy, center_x, data, w0, ratios.ratio_w_half, width_source);
      if (weightData.weight > 0) {
        gx_r += weightData.weight * weightData.r;
        gx_g += weightData.weight * weightData.g;
        gx_b += weightData.weight * weightData.b;
        gx_a += weightData.weight * weightData.a;
        weights += weightData.weight;
        weights_alpha += weightData.weight_alpha;
      }
    }
  }

  return { gx_r, gx_g, gx_b, gx_a, weights, weights_alpha };**/
}
//

/**function calculatePixelData(
  i: number,
  j: number,
  data: Uint8ClampedArray,
  width: number,
  ratio_w: number,
  ratio_h: number,
  ratio_w_half: number,
  ratio_h_half: number,
  width_source: number,
  height_source: number
): { gx_r: number; gx_g: number; gx_b: number; gx_a: number; weights: number; weights_alpha: number } {
  let gx_r = 0, gx_g = 0, gx_b = 0, gx_a = 0;
  let weights = 0, weights_alpha = 0;

  const xx_start = Math.floor(i * ratio_w);
  const yy_start = Math.floor(j * ratio_h);
  const xx_stop = Math.min(Math.ceil((i + 1) * ratio_w), width_source);
  const yy_stop = Math.min(Math.ceil((j + 1) * ratio_h), height_source);
  const center_x = i * ratio_w;
  const center_y = j * ratio_h;

  for (let yy = yy_start; yy < yy_stop; yy++) {
    const dy = Math.abs(center_y - yy) / ratio_h_half;
    const w0 = dy * dy;
    for (let xx = xx_start; xx < xx_stop; xx++) {
      const weightData = calculateWeight(xx, yy, center_x, data, w0, ratio_w_half, width_source);
      if (weightData.weight > 0) {
        gx_r += weightData.weight * weightData.r;
        gx_g += weightData.weight * weightData.g;
        gx_b += weightData.weight * weightData.b;
        gx_a += weightData.weight * weightData.a;
        weights += weightData.weight;
        weights_alpha += weightData.weight_alpha;
      }
    }
  }
  return { gx_r, gx_g, gx_b, gx_a, weights, weights_alpha };
}**/

function calculateWeight(
  xx: number,
  yy: number,
  center_x: number,
  data: Uint8ClampedArray,
  w0: number,
  ratio_w_half: number,
  width_source: number
): { weight: number; weight_alpha: number; r: number; g: number; b: number; a: number } {
  const dx = Math.abs(center_x - xx) / ratio_w_half;
  const w = Math.sqrt(w0 + dx * dx);
  if (w >= 1) return { weight: 0, weight_alpha: 0, r: 0, g: 0, b: 0, a: 0 }; // pixel too far

  const weight = 2 * w * w * w - 3 * w * w + 1;
  const pos_x = 4 * (xx + yy * width_source);
  const a = data[pos_x + 3];
  const weight_alpha = weight;
  const adjustedWeight = a < 255 ? (weight * a) / 250 : weight;

  return {
    weight: adjustedWeight,
    weight_alpha: weight_alpha,
    r: data[pos_x],
    g: data[pos_x + 1],
    b: data[pos_x + 2],
    a: a,
  };
}
//

/**export function resizeCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) {
  const width_source = canvas.width;
  const height_source = canvas.height;
  width = Math.round(width);
  height = Math.round(height);

  const ratio_w = width_source / width;
  const ratio_h = height_source / height;
  const ratio_w_half = Math.ceil(ratio_w / 2);
  const ratio_h_half = Math.ceil(ratio_h / 2);

  const ctx = canvas.getContext('2d');
  if (ctx) {
    const img = ctx.getImageData(0, 0, width_source, height_source);
    const img2 = ctx.createImageData(width, height);
    const data = img.data;
    const data2 = img2.data;

    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const x2 = (i + j * width) * 4;
        const center_y = j * ratio_h;
        let weight = 0;
        let weights = 0;
        let weights_alpha = 0;
        let gx_r = 0;
        let gx_g = 0;
        let gx_b = 0;
        let gx_a = 0;

        const xx_start = Math.floor(i * ratio_w);
        const yy_start = Math.floor(j * ratio_h);
        let xx_stop = Math.ceil((i + 1) * ratio_w);
        let yy_stop = Math.ceil((j + 1) * ratio_h);
        xx_stop = Math.min(xx_stop, width_source);
        yy_stop = Math.min(yy_stop, height_source);

        for (let yy = yy_start; yy < yy_stop; yy++) {
          const dy = Math.abs(center_y - yy) / ratio_h_half;
          const center_x = i * ratio_w;
          const w0 = dy * dy; //pre-calc part of w
          for (let xx = xx_start; xx < xx_stop; xx++) {
            const dx = Math.abs(center_x - xx) / ratio_w_half;
            const w = Math.sqrt(w0 + dx * dx);
            if (w >= 1) {
              //pixel too far
              continue;
            }
            //hermite filter
            weight = 2 * w * w * w - 3 * w * w + 1;
            const pos_x = 4 * (xx + yy * width_source);
            //alpha
            gx_a += weight * data[pos_x + 3];
            weights_alpha += weight;
            //colors
            if (data[pos_x + 3] < 255)
              weight = (weight * data[pos_x + 3]) / 250;
            gx_r += weight * data[pos_x];
            gx_g += weight * data[pos_x + 1];
            gx_b += weight * data[pos_x + 2];
            weights += weight;
          }
        }
        data2[x2] = gx_r / weights;
        data2[x2 + 1] = gx_g / weights;
        data2[x2 + 2] = gx_b / weights;
        data2[x2 + 3] = gx_a / weights_alpha;
      }
    }

    canvas.width = width;
    canvas.height = height;

    //draw
    ctx.putImageData(img2, 0, 0);
  }
}**/
