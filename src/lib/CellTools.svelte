<script lang="ts">
	import Pipette from 'lucide-svelte/icons/pipette';
	import { CellVariant } from './store/cell';
	import { getTool } from './store/ToolStore.svelte';

	const tool = getTool();
</script>

<div class="toolRow cellToolRow">
	<div class="toolColumn">
		<button class="toolBtn floorTool" class:active={tool.tool === CellVariant.Free}
			onclick={() => tool.toggleTool(CellVariant.Free)}
			title="Free"
			aria-label="Free"></button>
		<span class="toolLabel">Free</span>
	</div>
	<div class="toolColumn">
		<button class="toolBtn wallTool" class:active={tool.tool === CellVariant.Wall}
			onclick={() => tool.toggleTool(CellVariant.Wall)}
			title="Wall"
			aria-label="Wall"></button>
		<span class="toolLabel">Wall</span>
	</div>
	<div class="toolColumn">
		<button class="toolBtn clearTool" class:active={tool.tool === CellVariant.Clear}
			onclick={() => tool.toggleTool(CellVariant.Clear)}>
			<span style="color:#dc2626; font-size:24px; line-height:1;">&#10005;</span>
		</button>
		<span class="toolLabel">Clear</span>
	</div>
	<div class="toolColumn">
		<button
			class="toolBtn pipetteTool"
			class:active={tool.picking}
			onclick={() => tool.togglePipette()}
			title="Eyedropper"
			aria-label="Eyedropper"
		>
			<Pipette size={22} />
		</button>
		<span class="toolLabel">Eyedropper</span>
	</div>
</div>

<div style="margin-top:6px;">
	<div class="inputRow">
		<button class="toolBtn goalTool boxGoal" class:active={tool.tool === CellVariant.BoxGoal}
			onclick={() => tool.toggleTool(CellVariant.BoxGoal)}>{tool.nextBoxGoalId || 'B'}</button>
		<input type="text" maxlength="1" placeholder="A-Z"
			value={tool.nextBoxGoalId}
			oninput={(e) => {
				tool.nextBoxGoalId = (e.target as HTMLInputElement).value.toUpperCase();
				if (tool.nextBoxGoalId) tool.setTool(CellVariant.BoxGoal);
			}}
			onkeydown={(e) => { if (e.key === 'Enter') tool.setTool(CellVariant.BoxGoal); }}>
	</div>
	<span class="hintLabel">Box goal (A-Z)</span>
</div>

<div style="margin-top:2px;">
	<div class="inputRow">
		<button class="toolBtn goalTool agentGoal" class:active={tool.tool === CellVariant.AgentGoal}
			onclick={() => tool.toggleTool(CellVariant.AgentGoal)}>{tool.nextAgentGoalId || '0'}</button>
		<input type="text" maxlength="1" placeholder="0-9"
			value={tool.nextAgentGoalId}
			oninput={(e) => {
				tool.nextAgentGoalId = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
				if (tool.nextAgentGoalId) tool.setTool(CellVariant.AgentGoal);
			}}
			onkeydown={(e) => { if (e.key === 'Enter') tool.setTool(CellVariant.AgentGoal); }}>
	</div>
	<span class="hintLabel">Agent goal (0-9)</span>
</div>
