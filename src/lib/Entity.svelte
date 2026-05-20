<script lang="ts">
	import { canHaveEntity, CellVariant, isAgentEntity, isBoxEntity, type Cell as CellType } from './store/cell';
	import { getGrid, toCSSColor } from './store/GridStore.svelte';
	import { getTool } from './store/ToolStore.svelte';

	type Props = { cell: CellType; row: number; col: number };
	const { cell, row, col }: Props = $props();

	const tool = getTool();
	const grid = getGrid();

	function entityDragstartHandler(ev: DragEvent) {
		if (!ev?.dataTransfer) return;
		ev.dataTransfer.setData('entity', JSON.stringify({ row, col }));
		ev.stopPropagation();
	}

	function dblClickHandler() {
		grid.removeEntity(row, col);
	}

	function stopProp(e: Event) {
		// When Clear tool is active, let mousedown through so the cell can clear the entity
		if (tool.tool === CellVariant.Clear) return;
		if (tool.picking) return;
		e.stopImmediatePropagation();
	}

	function entityClickHandler(ev: MouseEvent) {
		ev.stopPropagation();
		if (!canHaveEntity(cell)) return;

		if (tool.tool === 'agent' && cell.entity?.type === 'agent') {
			grid.setEntityDetails(row, col, tool.color, tool.nextAgentEntId);
		} else if (tool.tool === 'box' && cell.entity?.type === 'box') {
			grid.setEntityDetails(row, col, tool.color, tool.nextBoxEntId);
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
{#if canHaveEntity(cell) && cell.entity && isAgentEntity(cell.entity)}
	<div
		data-entity="true"
		class="entity agent"
		style={`background-color: ${toCSSColor(cell.entity.color)}`}
		draggable="true"
		onmousedown={stopProp}
		ondragstart={entityDragstartHandler}
		ondblclick={dblClickHandler}
		onclick={entityClickHandler}
	>
		{cell.entity.id}
	</div>
{:else if canHaveEntity(cell) && cell.entity && isBoxEntity(cell.entity)}
	<div
		data-entity="true"
		class="entity box"
		style={`background-color: ${toCSSColor(cell.entity.color)}`}
		draggable="true"
		ondragstart={entityDragstartHandler}
		ondblclick={dblClickHandler}
		onclick={entityClickHandler}
	>
		{cell.entity.id}
	</div>
{/if}
