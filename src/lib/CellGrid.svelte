<script lang="ts">
	import { onMount } from 'svelte';
	import Cell from './Cell.svelte';
	import { getGrid } from './store/GridStore.svelte';

	const store = getGrid();

	function rebuildAxes(rows: number, cols: number) {
		const axisTopInnerEl = document.getElementById('axisTopInner');
		const axisLeftInnerEl = document.getElementById('axisLeftInner');
		if (!axisTopInnerEl || !axisLeftInnerEl) return;
		axisTopInnerEl.innerHTML = '';
		axisLeftInnerEl.innerHTML = '';
		axisTopInnerEl.style.gridTemplateColumns = `repeat(${cols}, var(--axis))`;
		axisTopInnerEl.style.gridTemplateRows    = 'var(--axis)';
		axisLeftInnerEl.style.gridTemplateColumns = 'var(--axis)';
		axisLeftInnerEl.style.gridTemplateRows    = `repeat(${rows}, var(--axis))`;
		for (let c = 0; c < cols; c++) {
			const d = document.createElement('div');
			d.className = 'axisCell';
			d.textContent = String(c);
			axisTopInnerEl.appendChild(d);
		}
		for (let r = 0; r < rows; r++) {
			const d = document.createElement('div');
			d.className = 'axisCell';
			d.textContent = String(r);
			axisLeftInnerEl.appendChild(d);
		}
	}

	// Rebuild axes when dimensions change
	let prevWidth = 0;
	let prevHeight = 0;
	$effect(() => {
		const w = store.width;
		const h = store.height;
		if (w !== prevWidth || h !== prevHeight) {
			prevWidth = w;
			prevHeight = h;
			// Use microtask to ensure DOM is ready
			Promise.resolve().then(() => rebuildAxes(h, w));
		}
	});

	onMount(() => {
		rebuildAxes(store.height, store.width);
	});
</script>

<div class="board" style="grid-template-columns: repeat({store.width}, var(--cell));">
	{#each store.grid as grid_row, row}
		{#each grid_row as cell, col (cell.id)}
			<Cell {cell} {row} {col} />
		{/each}
	{/each}
</div>
