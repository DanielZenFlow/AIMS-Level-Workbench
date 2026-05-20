<script lang="ts">
	import Entity from './Entity.svelte';
	import {
		canHaveEntity,
		CellVariant,
		EntityVariant,
		isAgentGoalCell,
		isBoxGoalCell,
		isCellVariant,
		isEmptyCell,
		isFreeCell,
		isEntityVariant,
		isWallCell,
		type Cell as CellType
	} from './store/cell';
	import { getCellContextMenu } from './store/CellContextMenuStore.svelte';
	import { getGrid } from './store/GridStore.svelte';
	import { getTool } from './store/ToolStore.svelte';

	type Props = { cell: CellType; row: number; col: number };
	const { cell, row, col }: Props = $props();

	const grid = getGrid();
	const tool = getTool();
	const contextMenu = getCellContextMenu();

	let ref: HTMLDivElement | undefined = $state(undefined);

	function isStrokeTool() {
		return (
			tool.tool === CellVariant.Wall ||
			tool.tool === CellVariant.Free ||
			tool.tool === CellVariant.Empty ||
			tool.tool === CellVariant.Clear
		);
	}

	function paintCell(ev: MouseEvent) {
		if (!ref) return;
		if (ev.target !== ref && !ref.contains(ev.target as Node)) return;
		if (!tool.tool) return;

		if (isCellVariant(tool.tool)) {
			if (tool.tool === CellVariant.Clear) {
				grid.clearCell(row, col);
				return;
			}
			if (tool.tool === CellVariant.AgentGoal) {
				grid.setCell(row, col, tool.tool, tool.nextAgentGoalId);
				return;
			}
			if (tool.tool === CellVariant.BoxGoal) {
				grid.setCell(row, col, tool.tool, tool.nextBoxGoalId);
				return;
			}
			grid.setCell(row, col, tool.tool);
			return;
		}

		if (isEntityVariant(tool.tool)) {
			if (tool.tool === EntityVariant.Agent) {
				grid.addEntity(row, col, {
					type: tool.tool,
					id: tool.nextAgentEntId,
					color: tool.color
				});
			} else if (tool.tool === EntityVariant.Box) {
				grid.addEntity(row, col, {
					type: tool.tool,
					id: tool.nextBoxEntId,
					color: tool.color
				});
			}
		}
	}

	function cellMouseDownHandler(ev: MouseEvent) {
		if (ev.button !== 0) return;
		if (tool.picking) {
			pickFromCell(ev);
			tool.suppressPaintUntilMouseUp = true;
			return;
		}
		tool.suppressPaintUntilMouseUp = false;
		if (tool.tool && tool.tool !== CellVariant.Clear && (ev.target as HTMLElement)?.closest?.('.entity')) return;
		if (isStrokeTool()) grid.beginEditGroup();
		paintCell(ev);
	}

	function pickEntityFromCell(): boolean {
		if (canHaveEntity(cell) && cell.entity) {
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
		if (isAgentGoalCell(cell)) {
			tool.nextAgentGoalId = cell.goalFor;
			tool.setTool(CellVariant.AgentGoal);
			return true;
		}
		if (isBoxGoalCell(cell)) {
			tool.nextBoxGoalId = cell.goalFor;
			tool.setTool(CellVariant.BoxGoal);
			return true;
		}

		return false;
	}

	function pickCellTypeFromCell(): boolean {
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

	function pickFromCell(ev: MouseEvent) {
		const target = ev.target as HTMLElement;
		const pickedEntity = target.closest('.entity');
		const pickedGoal = target.closest('.goalChar');

		if (pickedEntity && pickEntityFromCell()) return;
		if (pickedGoal && pickGoalFromCell()) return;
		if (pickEntityFromCell()) return;
		if (pickGoalFromCell()) return;
		pickCellTypeFromCell();
	}

	function cellContextMenuHandler(ev: MouseEvent) {
		ev.preventDefault();
		ev.stopPropagation();

		if (ev.altKey) {
			pickFromCell(ev);
			return;
		}

		contextMenu.open({
			x: Math.max(8, Math.min(ev.clientX, window.innerWidth - 184)),
			y: Math.max(8, Math.min(ev.clientY, window.innerHeight - 184)),
			row,
			col
		});
	}

	function cellMouseOverHandler(ev: MouseEvent) {
		if (ev.buttons !== 1) return;
		if (tool.suppressPaintUntilMouseUp) return;
		if (!tool.tool) return;
		if (tool.tool !== CellVariant.Wall && tool.tool !== CellVariant.Free && tool.tool !== CellVariant.Empty && tool.tool !== CellVariant.Clear) return;
		paintCell(ev);
	}

	function dragoverHandler(ev: DragEvent) {
		ev.preventDefault();
	}

	function cellDropHandler(ev: DragEvent) {
		ev.preventDefault();
		if (!ev?.dataTransfer) return;
		const entity = ev.dataTransfer.getData('entity');
		if (entity) {
			const d = JSON.parse(entity);
			grid.moveEntity(d.row, d.col, row, col);
			ev.stopPropagation();
			return;
		}
		const goal = ev.dataTransfer.getData('goal');
		if (goal) {
			const d = JSON.parse(goal);
			grid.moveGoal(d.row, d.col, row, col);
			ev.stopPropagation();
		}
	}

	function goalDragstartHandler(ev: DragEvent) {
		if (!ev?.dataTransfer) return;
		ev.dataTransfer.setData('goal', JSON.stringify({ row, col }));
		ev.stopPropagation();
	}

	function goalMouseDownHandler(ev: MouseEvent) {
		if (tool.picking) return;
		ev.stopPropagation();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div
	bind:this={ref}
	class="cell"
	class:wall={isWallCell(cell)}
	class:empty={isEmptyCell(cell)}
	class:goal-fill={isAgentGoalCell(cell) || isBoxGoalCell(cell)}
	data-r={row}
	data-c={col}
	onmousedown={cellMouseDownHandler}
	onmouseover={cellMouseOverHandler}
	oncontextmenu={cellContextMenuHandler}
	ondragover={dragoverHandler}
	ondrop={cellDropHandler}
>
	{#if isBoxGoalCell(cell) || isAgentGoalCell(cell)}
		<span
			class="goalChar"
			draggable="true"
			onmousedown={goalMouseDownHandler}
			ondragstart={goalDragstartHandler}
		>{cell.goalFor}</span>
	{/if}

	{#if canHaveEntity(cell) && cell.entity}
		<Entity {cell} {row} {col} />
	{/if}
</div>
