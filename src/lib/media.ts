/** Public asset paths that should use <video> instead of <img>. */
const VIDEO_PATH = /\.(mp4|webm|ogg)(\?.*)?$/i;

export function isVideoAssetPath(src: string): boolean {
  return VIDEO_PATH.test(src || "");
}
