<script lang="ts">
	import {
		CellVariant,
		EntityVariant,
		canHaveEntity,
		isAgentGoalCell,
		isBoxGoalCell,
		isEmptyCell,
		isFreeCell,
		isWallCell
	} from './store/cell';
	import { getCellContextMenu } from './store/CellContextMenuStore.svelte';
	import { getGrid } from './store/GridStore.svelte';
	import { getTool } from './store/ToolStore.svelte';

	const contextMenu = getCellContextMenu();
	const grid = getGrid();
	const tool = getTool();

	const state = $derived(contextMenu.state);
	const cell = $derived(state ? grid.getCell(state.row, state.col) : undefined);
	const hasEntity = $derived(!!cell && canHaveEntity(cell) && !!cell.entity);
	const hasGoal = $derived(!!cell && (isAgentGoalCell(cell) || isBoxGoalCell(cell)));
	const hasCellBrush = $derived(!!cell && (isWallCell(cell) || isFreeCell(cell)));
	const entityMenuLabel = $derived(cell && canHaveEntity(cell) && cell.entity ? cell.entity.id : '');
	const goalMenuLabel = $derived(cell && (isAgentGoalCell(cell) || isBoxGoalCell(cell)) ? cell.goalFor : '');
	const cellBrushLabel = $derived(cell && isWallCell(cell) ? 'wall' : 'floor');

	function closeContextMenu() {
		contextMenu.close();
	}

	function pickEntityFromCell(): boolean {
		if (cell && canHaveEntity(cell) && cell.entity) {
			tool.setColor(cell.entity.color);
			if (cell.entity.type === EntityVariant.Agent) {
				tool.nextAgentEntId = cell.entity.id;
				tool.setTool(EntityVariant.Agent);
			} else {
				tool.nextBoxEntId = cell.entity.id;
				tool.setTool(EntityVariant.Box);
			}
			return true;
		}

		return false;
	}

	function pickGoalFromCell(): boolean {
		if (cell && isAgentGoalCell(cell)) {
			tool.nextAgentGoalId = cell.goalFor;
			tool.setTool(CellVariant.AgentGoal);
			return true;
		}
		if (cell && isBoxGoalCell(cell)) {
			tool.nextBoxGoalId = cell.goalFor;
			tool.setTool(CellVariant.BoxGoal);
			return true;
		}

		return false;
	}

	function pickCellTypeFromCell(): boolean {
		if (!cell) return false;
		if (isWallCell(cell)) {
			tool.setTool(CellVariant.Wall);
			return true;
		}
		if (isEmptyCell(cell)) return false;
		if (isFreeCell(cell)) {
			tool.setTool(CellVariant.Free);
			return true;
		}

		return false;
	}

	function removeEntityFromMenu() {
		if (state) grid.removeEntity(state.row, state.col);
		closeContextMenu();
	}

	function removeGoalFromMenu() {
		if (state) grid.removeGoal(state.row, state.col);
		closeContextMenu();
	}

	function pickEntityFromMenu() {
		pickEntityFromCell();
		closeContextMenu();
	}

	function pickGoalFromMenu() {
		pickGoalFromCell();
		closeContextMenu();
	}

	function pickCellTypeFromMenu() {
		pickCellTypeFromCell();
		closeContextMenu();
	}
</script>

<svelte:window onclick={closeContextMenu} oncontextmenu={closeContextMenu} onresize={closeContextMenu} />

{#if state && cell && (hasEntity || hasGoal || hasCellBrush)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="cellContextMenu"
		style:left={`${state.x}px`}
		style:top={`${state.y}px`}
		role="menu"
		tabindex="-1"
		oncontextmenu={(ev) => {
			ev.preventDefault();
			ev.stopPropagation();
		}}
	>
		{#if hasEntity}
			<button type="button" role="menuitem" onclick={removeEntityFromMenu}>Delete entity {entityMenuLabel}</button>
		{/if}
		{#if hasGoal}
			<button type="button" role="menuitem" onclick={removeGoalFromMenu}>Delete goal {goalMenuLabel}</button>
		{/if}
		{#if hasEntity || hasGoal}
			<div class="cellContextMenuSeparator"></div>
		{/if}
		{#if hasEntity}
			<button type="button" role="menuitem" onclick={pickEntityFromMenu}>Use entity {entityMenuLabel} brush</button>
		{/if}
		{#if hasGoal}
			<button type="button" role="menuitem" onclick={pickGoalFromMenu}>Use goal {goalMenuLabel} brush</button>
		{/if}
		{#if hasCellBrush}
			<button type="button" role="menuitem" onclick={pickCellTypeFromMenu}>Use {cellBrushLabel} brush</button>
		{/if}
	</div>
{/if}
