import { ExifTransform } from '../interfaces/exif-transform.interface';

// Black 2x1 JPEG, with the following meta information set:
// - EXIF Orientation: 6 (Rotated 90° CCW)
// Source: https://github.com/blueimp/JavaScript-Load-Image
const testAutoOrientationImageURL =
  'data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAA' +
  'AAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA' +
  'QEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE' +
  'BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/x' +
  'ABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAA' +
  'AAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==';

export function supportsAutomaticRotation(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Check if browser supports automatic image orientation:
      const supported = img.width === 1 && img.height === 2;
      resolve(supported);
    };
    img.src = testAutoOrientationImageURL;
  });
}

export function getTransformationsFromExifData(
  exifRotationOrArrayBuffer: number | ArrayBufferLike
): ExifTransform {
  if (typeof exifRotationOrArrayBuffer === 'object') {
    exifRotationOrArrayBuffer = getExifRotation(exifRotationOrArrayBuffer);
  }
  switch (exifRotationOrArrayBuffer) {
    case 2:
      return { rotate: 0, flip: true };
    case 3:
      return { rotate: 2, flip: false };
    case 4:
      return { rotate: 2, flip: true };
    case 5:
      return { rotate: 1, flip: true };
    case 6:
      return { rotate: 1, flip: false };
    case 7:
      return { rotate: 3, flip: true };
    case 8:
      return { rotate: 3, flip: false };
    default:
      return { rotate: 0, flip: false };
  }
}

//refactorizado
function getExifRotation(arrayBuffer: ArrayBufferLike): number {
  const view = new DataView(arrayBuffer);

  if (!isJpeg(view)) {
    return -2;
  }

  let offset = 2;
  while (offset < view.byteLength) {
    const marker = view.getUint16(offset, false);
    offset += 2;

    if (isExifMarker(marker, view, offset)) {
      return extractOrientation(view, offset);
    } else if (!isMarker(marker)) {
      break;
    } else {
      offset += view.getUint16(offset, false);
    }
  }
  return -1;
}

function isJpeg(view: DataView): boolean {
  return view.getUint16(0, false) === 0xffd8;
}

function isExifMarker(marker: number, view: DataView, offset: number): boolean {
  return marker === 0xffe1 && view.getUint32(offset + 2, false) === 0x45786966;
}

function isMarker(marker: number): boolean {
  return (marker & 0xff00) === 0xff00;
}

function extractOrientation(view: DataView, offset: number): number {
  const little = view.getUint16(offset + 6, false) === 0x4949;
  offset += view.getUint32(offset + 10, little);

  const tags = view.getUint16(offset, little);
  offset += 2;
  for (let i = 0; i < tags; i++) {
    if (view.getUint16(offset + i * 12, little) === 0x0112) {
      return view.getUint16(offset + i * 12 + 8, little);
    }
  }
  return -1;
}
//

/**function getExifRotation(arrayBuffer: ArrayBufferLike): number {
  const view = new DataView(arrayBuffer);
  if (view.getUint16(0, false) !== 0xffd8) {
    return -2;
  }
  const length = view.byteLength;
  let offset = 2;
  while (offset < length) {
    if (view.getUint16(offset + 2, false) <= 8) return -1;
    const marker = view.getUint16(offset, false);
    offset += 2;
    if (marker == 0xffe1) {
      if (view.getUint32((offset += 2), false) !== 0x45786966) {
        return -1;
      }

      const little = view.getUint16((offset += 6), false) == 0x4949;
      offset += view.getUint32(offset + 4, little);
      const tags = view.getUint16(offset, little);
      offset += 2;
      for (let i = 0; i < tags; i++) {
        if (view.getUint16(offset + i * 12, little) == 0x0112) {
          return view.getUint16(offset + i * 12 + 8, little);
        }
      }
    } else if ((marker & 0xff00) !== 0xff00) {
      break;
    } else {
      offset += view.getUint16(offset, false);
    }
  }
  return -1;
}**/
