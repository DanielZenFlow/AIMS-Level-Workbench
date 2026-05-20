<script lang="ts">
	import { EntityVariant } from './store/cell';
	import { toCSSColor } from './store/GridStore.svelte';
	import { getTool } from './store/ToolStore.svelte';

	const tool = getTool();
</script>

<div style="margin-bottom:4px;">
	<div class="inputRow">
		<button class="toolBtn entityTool boxEnt" class:active={tool.tool === EntityVariant.Box}
			style="background-color:{toCSSColor(tool.color)};"
			onclick={() => tool.toggleTool(EntityVariant.Box)}>{tool.nextBoxEntId || 'B'}</button>
		<input type="text" maxlength="1" placeholder="A-Z"
			value={tool.nextBoxEntId}
			oninput={(e) => {
				tool.nextBoxEntId = (e.target as HTMLInputElement).value.toUpperCase();
				if (tool.nextBoxEntId) tool.setTool(EntityVariant.Box);
			}}
			onkeydown={(e) => { if (e.key === 'Enter') tool.setTool(EntityVariant.Box); }}>
	</div>
	<span class="hintLabel">Box (A-Z)</span>
</div>

<div>
	<div class="inputRow">
		<button class="toolBtn entityTool agentEnt" class:active={tool.tool === EntityVariant.Agent}
			style="background-color:{toCSSColor(tool.color)};"
			onclick={() => tool.toggleTool(EntityVariant.Agent)}>{tool.nextAgentEntId || '0'}</button>
		<input type="text" maxlength="1" placeholder="0-9"
			value={tool.nextAgentEntId}
			oninput={(e) => {
				tool.nextAgentEntId = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
				if (tool.nextAgentEntId) tool.setTool(EntityVariant.Agent);
			}}
			onkeydown={(e) => { if (e.key === 'Enter') tool.setTool(EntityVariant.Agent); }}>
	</div>
	<span class="hintLabel">Agent (0-9)</span>
</div>
