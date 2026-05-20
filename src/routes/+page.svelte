<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Undo2 from 'lucide-svelte/icons/undo-2';
	import Redo2 from 'lucide-svelte/icons/redo-2';
	import { getGrid } from '$lib/store/GridStore.svelte';
	import { getTool } from '$lib/store/ToolStore.svelte';
	import { getCellContextMenu } from '$lib/store/CellContextMenuStore.svelte';
	import LevelTools from '$lib/LevelTools.svelte';
	import GridTools from '$lib/GridTools.svelte';
	import CellTools from '$lib/CellTools.svelte';
	import EntityTools from '$lib/EntityTools.svelte';
	import ColorTools from '$lib/ColorTools.svelte';
	import UsedEntityTools from '$lib/UsedEntityTools.svelte';
	import CellGrid from '$lib/CellGrid.svelte';
	import CellContextMenu from '$lib/CellContextMenu.svelte';
	import NewGridDialog from '$lib/NewGridDialog.svelte';
	import Details from '$lib/Details.svelte';
	import OnboardingTutorial from '$lib/OnboardingTutorial.svelte';

	const grid = getGrid();
	const tool = getTool();
	const contextMenu = getCellContextMenu();

	function handleKeyDown(event: KeyboardEvent) {
		const target = event.target as HTMLInputElement | null;
		const tag = target?.tagName?.toLowerCase();
		if (tag === 'input' || tag === 'textarea') return;

		const isUndo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey;
		const isRedo =
			((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') ||
			((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && event.shiftKey);

		if (event.key === 'Escape') {
			event.preventDefault();
			if (contextMenu.state) {
				contextMenu.close();
				return;
			}
			tool.clearTool();
			return;
		}

		if (isUndo) {
			event.preventDefault();
			grid.undo();
			return;
		}
		if (isRedo) {
			event.preventDefault();
			grid.redo();
			return;
		}

		const key = event.key.toUpperCase();
		if (/^[A-Z]$/.test(key)) {
			tool.nextBoxGoalId = key;
			tool.nextBoxEntId = key;
		} else if (/^[0-9]$/.test(key)) {
			tool.nextAgentGoalId = key;
			tool.nextAgentEntId = key;
		}
	}

	const levelString = $page.url.searchParams.get('lvl');
	if (levelString) {
		const level = atob(levelString);
		grid.load(level);
		$page.url.searchParams.delete('lvl');
		goto($page.url);
	}

	// ---- Zoom / Pan ----
	const BASE_CELL = 22;
	const MIN_ZOOM = 0.3;
	const MAX_ZOOM = 4.0;
	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);

	let boardsEl: HTMLDivElement;
	let panViewportEl: HTMLDivElement;
	let panSurfaceEl: HTMLDivElement;
	let axisTopInnerEl: HTMLDivElement;
	let axisLeftInnerEl: HTMLDivElement;
	let hoverTipEl: HTMLDivElement;
	let hoverInfoEl: HTMLSpanElement;
	let zoomInfoEl: HTMLSpanElement;

	function applyZoom() {
		const cell = Math.round(BASE_CELL * zoom);
		document.documentElement.style.setProperty('--cell', `${cell}px`);
		document.documentElement.style.setProperty('--axis', `${cell + 6}px`);
		if (zoomInfoEl) zoomInfoEl.textContent = `${Math.round(zoom * 100)}%`;
	}

	function applyPan() {
		if (!panSurfaceEl || !axisTopInnerEl || !axisLeftInnerEl) return;
		panSurfaceEl.style.transform = `translate(${panX}px, ${panY}px)`;
		axisTopInnerEl.style.transform = `translateX(${panX}px)`;
		axisLeftInnerEl.style.transform = `translateY(${panY}px)`;
	}

	function clampZoom(v: number) { return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v)); }

	function zoomAt(clientX: number, clientY: number, factor: number) {
		const newZoom = clampZoom(zoom * factor);
		const realFactor = newZoom / zoom;
		if (realFactor === 1) return;
		const rect = panViewportEl.getBoundingClientRect();
		const mx = clientX - rect.left;
		const my = clientY - rect.top;
		panX = mx - (mx - panX) * realFactor;
		panY = my - (my - panY) * realFactor;
		zoom = newZoom;
		applyZoom();
		applyPan();
	}

	function resetView() {
		zoom = 1;
		applyZoom();
		requestAnimationFrame(() => {
			const board = panSurfaceEl.firstElementChild as HTMLElement | null;
			if (!board || !panViewportEl) {
				panX = panY = 0;
				applyPan();
				return;
			}
			panX = Math.round((panViewportEl.clientWidth - board.offsetWidth) / 2);
			panY = Math.round((panViewportEl.clientHeight - board.offsetHeight) / 2);
			applyPan();
		});
	}

	// ---- Board drag ----
	let dragging = false;
	let lastX = 0;
	let lastY = 0;

	function onBoardMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;
		// Only pan on empty board space or axes, never on cells or entities
		const target = e.target as HTMLElement;
		if (target?.closest?.('.cell') || target?.closest?.('.entity')) return;
		dragging = true;
		lastX = e.clientX;
		lastY = e.clientY;
		boardsEl.classList.add('grabbing');
		e.preventDefault();
	}
	function onWindowMouseMove(e: MouseEvent) {
		if (!dragging) return;
		panX += e.clientX - lastX;
		panY += e.clientY - lastY;
		lastX = e.clientX;
		lastY = e.clientY;
		applyPan();
	}
	function onWindowMouseUp() {
		grid.commitEditGroup();
		dragging = false;
		boardsEl?.classList.remove('grabbing');
	}

	function onBoardWheel(e: WheelEvent) {
		e.preventDefault();
		const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
		zoomAt(e.clientX, e.clientY, factor);
	}

	function onBoardMouseMove(e: MouseEvent) {
		const cell = (e.target as HTMLElement)?.closest?.('.cell') as HTMLElement | null;
		if (!cell || !cell.dataset.r) {
			hoverTipEl.classList.remove('show');
			return;
		}
		const r = cell.dataset.r;
		const c = cell.dataset.c;
		const rect = boardsEl.getBoundingClientRect();
		hoverTipEl.textContent = `(${r}, ${c})`;
		hoverTipEl.style.left = `${e.clientX - rect.left + 14}px`;
		hoverTipEl.style.top  = `${e.clientY - rect.top  + 14}px`;
		hoverTipEl.classList.add('show');
		if (hoverInfoEl) hoverInfoEl.textContent = `(${r}, ${c})`;
	}

	function onBoardMouseLeave() { hoverTipEl.classList.remove('show'); }

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('mousemove', onWindowMouseMove);
		window.addEventListener('mouseup', onWindowMouseUp);
		window.addEventListener('resize', () => { if (zoom === 1) resetView(); });
		applyZoom();
		applyPan();
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('mousemove', onWindowMouseMove);
			window.removeEventListener('mouseup', onWindowMouseUp);
		};
	});
</script>

<main class="app">
	<aside class="panel">
		<div class="panelHeader">
			<div class="brandBlock">
				<div class="titleBlock">
					<h1 style="margin:0;">AIMS Level Workbench</h1>
					<span class="versionText">v1.0.0</span>
				</div>
				<div class="githubMeta">
					<a
						class="githubLink"
						href="https://github.com/DanielZenFlow/AIMS-Level-Workbench"
						target="_blank"
						rel="noreferrer"
						aria-label="AIMS Level Workbench on GitHub"
					>
						<svg class="githubMark" viewBox="0 0 16 16" aria-hidden="true">
							<path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
						</svg>
						<span>By DanielZenFlow</span>
					</a>
					<a
						class="githubLink forkLink"
						href="https://github.com/cluplau/mas-lvlr"
						target="_blank"
						rel="noreferrer"
						aria-label="Forked from mas-lvlr on GitHub"
					>
						<span>Forked from mas-lvlr by cluplau</span>
					</a>
				</div>
			</div>
			<div style="display:flex; gap:4px;">
				<NewGridDialog />
				<Details />
			</div>
		</div>

		<h2>Level</h2>
		<LevelTools />

		<h2>Grid</h2>
		<GridTools />

		<h2>Cells</h2>
		<CellTools />

		<h2>Entities</h2>
		<EntityTools />

		<h2>Colors</h2>
		<ColorTools />

		<h2>Used</h2>
		<UsedEntityTools />
		<OnboardingTutorial />
	</aside>

	<section class="boardWrap">
		<div class="toolbar">
			<span bind:this={hoverInfoEl}>(row, col)</span>
		</div>
		<div class="boards" bind:this={boardsEl}
			onmousedown={onBoardMouseDown}
			onwheel={onBoardWheel}
	onmousemove={onBoardMouseMove}
			onmouseleave={onBoardMouseLeave}
			role="grid"
		>
			<div class="axisCorner"></div>
			<div class="axisTop">
				<div id="axisTopInner" class="axisInner" bind:this={axisTopInnerEl}></div>
			</div>
			<div class="axisLeft">
				<div id="axisLeftInner" class="axisInner" bind:this={axisLeftInnerEl}></div>
			</div>
			<div class="panViewport" bind:this={panViewportEl}>
				<div class="panSurface" bind:this={panSurfaceEl}>
					<CellGrid />
				</div>
			</div>
			<div class="hoverTip" bind:this={hoverTipEl}></div>
		</div>
		<div class="historyControls" aria-label="Edit history">
			<button class="historyBtn" onclick={() => grid.undo()} disabled={!grid.canUndo} title="Undo" aria-label="Undo">
				<Undo2 size={16} />
			</button>
			<button class="historyBtn" onclick={() => grid.redo()} disabled={!grid.canRedo} title="Redo" aria-label="Redo">
				<Redo2 size={16} />
			</button>
		</div>
		<div class="statusBar">
			<span class="statusInfo"></span>
			<span class="statusSpacer"></span>
			<span class="statusInfo" bind:this={zoomInfoEl}>100%</span>
			<button class="toolbarBtn" onclick={resetView} title="Reset view">⊙</button>
		</div>
		<CellContextMenu />
	</section>
</main>
