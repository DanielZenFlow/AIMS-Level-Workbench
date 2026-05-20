<script lang="ts">
	import { getGrid, toCSSColor } from './store/GridStore.svelte';
	import { EntityVariant, canHaveEntity, type Color } from './store/cell';
	import { getTool } from './store/ToolStore.svelte';

	type UsedEntity = {
		key: string;
		type: EntityVariant;
		id: string;
		color: Color;
	};

	const grid = getGrid();
	const tool = getTool();

	const usedEntities = $derived.by(() => {
		const seen = new Map<string, UsedEntity>();

		for (const row of grid.grid) {
			for (const cell of row) {
				if (!canHaveEntity(cell) || !cell.entity) continue;

				const entity = cell.entity;
				const key = `${entity.type}:${entity.id}:${entity.color}`;
				if (seen.has(key)) continue;

				seen.set(key, {
					key,
					type: entity.type,
					id: entity.id,
					color: entity.color
				});
			}
		}

		return Array.from(seen.values()).sort((a, b) => {
			if (a.type !== b.type) return a.type === EntityVariant.Box ? -1 : 1;
			return a.id.localeCompare(b.id, undefined, { numeric: true });
		});
	});

	function useEntity(entity: UsedEntity) {
		tool.setColor(entity.color);
		tool.setTool(entity.type);

		if (entity.type === EntityVariant.Box) {
			tool.nextBoxEntId = entity.id;
		} else {
			tool.nextAgentEntId = entity.id;
		}
	}
</script>

{#if usedEntities.length > 0}
	<div class="usedTokens">
		{#each usedEntities as entity (entity.key)}
			<button
				class="usedToken"
				class:agentToken={entity.type === EntityVariant.Agent}
				style={`background-color: ${toCSSColor(entity.color)}`}
				title={`${entity.type === EntityVariant.Box ? 'Box' : 'Agent'} ${entity.id} (${entity.color})`}
				aria-label={`${entity.type === EntityVariant.Box ? 'Box' : 'Agent'} ${entity.id} ${entity.color}`}
				onclick={() => useEntity(entity)}
			>
				{entity.id}
			</button>
		{/each}
	</div>
	<div class="hintLabel">Click used token to reuse ID and color</div>
{:else}
	<div class="hintLabel">Used entities will appear here</div>
{/if}
