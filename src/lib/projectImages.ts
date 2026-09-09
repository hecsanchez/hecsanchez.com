import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ResolvedImage {
  src: string;
  width: number;
  height: number;
  /** Portrait shots get a height cap instead of stretching to the column. */
  portrait: boolean;
}

const PUBLIC_DIR = 'public';
const PROJECT_IMAGE_DIR = 'projects';

/**
 * Reads intrinsic dimensions straight from the file header. Rendering `width`
 * and `height` is what keeps the reserved space correct and avoids layout
 * shift, so an image we cannot measure is not worth rendering.
 */
function readDimensions(buf: Buffer): { width: number; height: number } | null {
  // PNG: 8-byte signature, then the IHDR chunk carries width/height as big-endian u32.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // GIF: little-endian u16 pair in the logical screen descriptor.
  if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'GIF') {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }

  // WebP: only the extended (VP8X) and lossy (VP8 ) chunks are worth parsing.
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8X') {
      return {
        width: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)),
        height: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)),
      };
    }
    if (chunk === 'VP8 ' && buf.length > 30) {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
  }

  // JPEG: walk the marker segments until a start-of-frame carries the size.
  if (buf.length > 4 && buf.readUInt16BE(0) === 0xffd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) { offset++; continue; }
      const marker = buf[offset + 1];
      const isFrameHeader = (marker >= 0xc0 && marker <= 0xc3)
        || (marker >= 0xc5 && marker <= 0xc7)
        || (marker >= 0xc9 && marker <= 0xcb)
        || (marker >= 0xcd && marker <= 0xcf);
      if (isFrameHeader) {
        return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
      }
      offset += 2 + buf.readUInt16BE(offset + 2);
    }
  }

  return null;
}

/**
 * Resolves a screenshot in `public/projects/`. Returns `null` when the file is
 * absent, so a page renders text-only until a real image is dropped in — no
 * placeholders, no broken images.
 */
export function resolveProjectImage(file: string | undefined): ResolvedImage | null {
  if (!file) return null;

  const path = join(process.cwd(), PUBLIC_DIR, PROJECT_IMAGE_DIR, file);
  if (!existsSync(path)) return null;

  const size = readDimensions(readFileSync(path));
  if (!size || !size.width || !size.height) return null;

  return {
    src: `/${PROJECT_IMAGE_DIR}/${file}`,
    width: size.width,
    height: size.height,
    portrait: size.height > size.width,
  };
}
