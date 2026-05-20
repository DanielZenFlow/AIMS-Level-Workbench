<script lang="ts">
	import { CellVariant } from './store/cell';
	import { getGrid } from './store/GridStore.svelte';
	import { getNotification } from './store/NotificationStore.svelte';

	let grid = getGrid();
	const notification = getNotification();

	let open = $state(false);
	let newName = $state('New level');
	let newWidth = $state(20);
	let newHeight = $state(14);
	let newCellVariant = $state(CellVariant.Free);

	function onCreateNewGrid() {
		const width = Number(newWidth);
		const height = Number(newHeight);
		if (!Number.isInteger(width) || !Number.isInteger(height) || width < 3 || width > 50 || height < 3 || height > 50) {
			notification.showError('Grid dimensions must be whole numbers from 3 to 50.');
			return;
		}
		if (!confirm('Create a new level and replace the current board?')) return;

		grid.fromDimensions(width, height, newCellVariant, newName.trim() || 'New level');
		open = false;
	}
</script>

<button onclick={() => { open = true; }} style="height:24px; padding:0 8px; font-size:11px;">New</button>

{#if open}
	<div class="dialogOverlay" onclick={() => { open = false; }} role="dialog">
		<div class="dialogBox" onclick={(e) => e.stopPropagation()}>
			<h3>Create new level</h3>
			<p>Select dimensions and fill cell to create a new level. Note that this will override the current level.</p>
			<div style="display:flex; flex-direction:column; gap:10px;">
				<label>
					<span>Width</span>
					<input type="number" bind:value={newWidth} max="50" min="3">
				</label>
				<label>
					<span>Height</span>
					<input type="number" bind:value={newHeight} max="50" min="3">
				</label>

				<div style="display:flex; gap:6px; align-items:center;">
					<span style="font-size:11px; font-weight:700; color:var(--text-soft);">Fill:</span>
					<button class="toolBtn" style="width:28px;height:28px;" class:active={newCellVariant === CellVariant.Free}
						onclick={() => { newCellVariant = CellVariant.Free; }}>F</button>
					<button class="toolBtn wallTool" style="width:28px;height:28px;" class:active={newCellVariant === CellVariant.Wall}
						onclick={() => { newCellVariant = CellVariant.Wall; }}>W</button>
				</div>
			</div>
			<div class="dialogFooter">
				<button type="button" class="secondaryDialogBtn" onclick={() => { open = false; }}>Cancel</button>
				<button type="button" onclick={onCreateNewGrid}>Create</button>
			</div>
		</div>
	</div>
{/if}
