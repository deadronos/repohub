import { type ComponentProps } from 'react';
import { Canvas, type RootState } from '@react-three/fiber';

export type WebGPUCanvasProps = ComponentProps<typeof Canvas> & {
  onRendererCreated?: (rendererType: 'webgpu' | 'webgl') => void;
};

export interface GLProps {
  canvas?: HTMLCanvasElement | OffscreenCanvas;
  [key: string]: unknown;
}

export type RendererInstance = {
  render: (...args: unknown[]) => unknown;
  isWebGPURenderer?: boolean;
  backend?: { isWebGLBackend?: boolean };
} & Record<string, unknown>;

export type RendererCtor = new (options: Record<string, unknown>) => RendererInstance;
export type RendererFactory = (options: Record<string, unknown>) => RendererInstance;
export type RendererExport = RendererCtor | RendererFactory;
export type CanvasGlProp = ComponentProps<typeof Canvas>['gl'];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isRendererExport(value: unknown): value is RendererExport {
  return typeof value === 'function';
}

export function hasInit(value: unknown): value is { init: () => void | Promise<void> } {
  return isRecord(value) && typeof value.init === 'function';
}

export interface WebGPUState {
  loading: boolean;
  Renderer: unknown;
  failed: boolean;
}

export { type RootState };
