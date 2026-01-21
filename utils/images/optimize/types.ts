export type ImageOptimizationOptions = {
  maxBytes: number;
  targetBytes: number;
  maxDimension: number;
  minQuality: number;
  maxQuality: number;
  qualitySearchSteps: number;
  dimensionScaleFactor: number;
  maxDimensionPasses: number;
};

export type ImageOptimizationResult = {
  file: File;
  wasOptimized: boolean;
  originalBytes: number;
  finalBytes: number;
  mimeType: string;
  width?: number;
  height?: number;
};
