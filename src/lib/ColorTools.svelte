<script lang="ts">
	import { getTool } from './store/ToolStore.svelte';
	import type { Color } from './store/cell';

	const tool = getTool();

	const colorMap: Record<Color, string> = {
		blue: '#3050fe',
		red: '#ff0000',
		cyan: '#02ffff',
		purple: '#6001b0',
		green: '#02ff00',
		orange: '#ff8001',
		pink: '#f060c0',
		grey: '#707070',
		lightblue: '#70c0ff',
		brown: '#602f00'
	};
</script>

<div class="colorSwatches">
	{#each Object.entries(colorMap) as [color, hex]}
		<button
			class="colorSwatch"
			class:active={tool.color === color}
			style="background-color: {hex};"
			aria-label={color}
			onclick={() => tool.setColor(color as Color)}
		></button>
	{/each}
</div>
