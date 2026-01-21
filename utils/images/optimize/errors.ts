export type ImageOptimizationErrorCode =
  | 'not-image'
  | 'decode-failed'
  | 'encode-failed'
  | 'cannot-compress';

export class ImageOptimizationError extends Error {
  code: ImageOptimizationErrorCode;

  constructor(code: ImageOptimizationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
