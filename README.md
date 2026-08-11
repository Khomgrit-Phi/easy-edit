# Easy Edit

A web-based 2D layered image/configuration editor — a focused mix of Figma, Canva, and a professional 2D editor, built to demonstrate a reusable 2D editing engine rather than a specific business use case.

Built with **React**, **Fabric.js**, and the HTML5 `<canvas>`, bundled with **Vite**.

## Features

- Layered 2D editing with drag-reorderable z-index
- Move / resize / rotate objects with snap-to-center and snap-to-object guides
- Layer visibility and locking
- Shape, text, and image insertion
- Per-layer color and material (Flat / Cotton / Polyester / Mesh) controls
- Properties panel for transform, opacity, blend mode, and text styling
- Zoom / pan with a fit-to-view control
- Crop tool
- Starter templates (blank canvas, sample composition)
- Undo / redo history
- Export to PNG, JPG, or PDF
- Preview mode (editor chrome hidden, canvas only)

## Getting started

```bash
npm install
npm run dev       # start the Vite dev server
npm run build      # production build to dist/
npm run preview    # serve the production build locally
```

## Project structure

```
index.html          Vite entry HTML
vite.config.js
src/
  main.jsx           App bootstrap
  App.jsx             Top-level state, undo/redo history, keyboard shortcuts
  TopBar.jsx           Project name, undo/redo, save, preview, export
  LeftSidebar.jsx       Tools, asset library, templates
  CanvasArea.jsx        Fabric.js canvas, selection, zoom/pan, crop
  RightPanel.jsx         Document/shape/text property inspector
  LayerPanel.jsx          Layer list (reorder, rename, visibility, lock)
  engine.js                Fabric.js object creation, materials, export
  data.js                    Static tool/asset/template/font definitions
  ds/                          Easy Edit design system (components + tokens)
```
