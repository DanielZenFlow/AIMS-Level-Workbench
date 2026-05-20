# AIMS Level Workbench

AIMS Level Workbench is a browser-based editor for MAvis hospital-domain
`.lvl` files used in Artificial Intelligence and Multi-Agent Systems work. It
runs locally in the browser and focuses on fast level editing, visual feedback,
and export back to the standard `.lvl` format.

This project is forked from `mas-lvlr` by `cluplau`:
<https://github.com/cluplau/mas-lvlr>

## GitHub Pages

Use the hosted app here:

<https://danielzenflow.github.io/AIMS-Level-Workbench/>

The app is configured for static deployment on GitHub Pages. Deployment runs
automatically from `.github/workflows/deploy.yml` when changes are pushed to
`main`. The workflow builds with:

```powershell
pnpm build
```

and sets `BASE_PATH=/AIMS-Level-Workbench` so assets load correctly from the
GitHub Pages project URL.

## Features

- Edit hospital-domain `.lvl` files in a visual grid.
- Paint floor, wall, and clear cells with click-and-drag strokes.
- Place and edit agents, boxes, agent goals, and box goals.
- Drag entities and goal characters to move them.
- Use Eyedropper to pick entities, goals, floor, or wall as the active brush.
- Undo and redo recent edits, with one drag stroke counted as one undo step.
- See row and column coordinates while hovering over the board.
- Export levels as `.lvl` files or PNG images.
- Reopen the first-run tutorial from the help dialog.
- Receive centered compatibility messages when an uploaded `.lvl` file is not
  in the expected format.

## Level Format

The importer expects MAvis-style hospital `.lvl` files with these sections:

```text
#domain
#levelname
#colors
#initial
#goal
#end
```

Walls are represented by `+`, boxes by `A-Z`, agents by `0-9`, and goals are
stored in the separate `#goal` grid. The `#initial` and `#goal` grids should
have the same number of rows.

The editor can still create syntactically valid but unsolved or invalid levels.
Test finished levels with MAvis/server tooling before relying on them.

## Local Quick Start

To run from a cloned or downloaded source copy:

```powershell
corepack enable
pnpm install
pnpm start
```

Then open:

```text
http://127.0.0.1:5173
```

`5173` is the default Vite development port used by `pnpm start`. If that port
is already busy, Vite may use the next available port, such as `5174`. Always
use the local URL printed in the terminal.

On Windows, you can also use:

```powershell
.\run.ps1
```

or:

```cmd
run.cmd
```

## Development

Common commands:

```powershell
pnpm dev
pnpm check
pnpm build
pnpm preview
```

`pnpm` is preferred because this repository includes `pnpm-lock.yaml`.

## Project Structure

```text
src/lib/store/GridStore.svelte.ts    Level parsing, editing, undo/redo, export
src/lib/store/ToolStore.svelte.ts    Active tool, color, ids, Eyedropper state
src/lib/Cell.svelte                  Cell painting, picking, drag/drop handling
src/lib/LevelTools.svelte            Upload, Save, PNG export
src/lib/OnboardingTutorial.svelte    First-run tutorial
src/app.css                          App layout and visual styling
```

## Release Status

Current version: `v1.0.0`

Before releasing or pushing changes, run:

```powershell
pnpm check
pnpm build
```
