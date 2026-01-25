# PoC: migrate renderer to WebGPU and remove client-side `three` alias

## Summary

React Three Fiber warns that `WebGlRenderer` is deprecated in favor of WebGPU. We currently alias `three` → `three/webgpu` for client bundles as a stopgap, but this is brittle and causes subtle differences (e.g., buffer array writes that don't update GPU buffers reliably). This issue tracks a full WebGPU migration PoC that should work in supported browsers and provide a graceful fallback to WebGL.

## Goal

Produce a minimal, working PoC branch that:
- removes the temporary `three` client alias
- uses the WebGPU renderer (r3f/three) or selects WebGPU at runtime when supported
- ensures particle animations and other rendering features are visually correct
- falls back to WebGL when WebGPU is not available
- keeps tests passing (or updates tests where necessary)

## Acceptance checklist

- [ ] Dev build succeeds using the WebGPU renderer (no module export errors)
- [ ] Particle animation is visibly moving and matches expected behavior
- [ ] Unit and component tests pass (or are updated)
- [ ] Fallback to WebGL works correctly for unsupported browsers
- [ ] Documentation on migration steps + caveats included

## PoC plan

1. Create branch `feat/webgpu-poc`.
2. Replace/condition the `Canvas` renderer import to use WebGPU (or r3f's API to select the renderer).
3. Make particle code use BufferAttribute APIs (we already added `setXYZ` fallback in `utils/particles.ts`).
4. Add runtime feature detection and WebGL fallback.
5. Update tests & mocks (e.g., react-three mocks) for WebGPU behavior.
6. Validate in a WebGPU-capable browser and iterate.

## Notes / Risks

- WebGPU browser support is not universal — must ship a robust fallback.
- Some third-party libraries may need small updates for WebGPU compatibility.

---

If you'd like, I can implement the PoC on `feat/webgpu-poc` and link the branch once ready.
