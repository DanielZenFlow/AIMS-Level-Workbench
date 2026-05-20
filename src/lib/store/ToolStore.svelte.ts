import { getContext, setContext } from 'svelte';
import { CellVariant, type EntityVariant, type Color } from './cell';
import { localState } from '@sv-use/core';

const TOOL_KEY = 'tool';
const COLOR_KEY = 'color';
type ToolVariant = CellVariant | EntityVariant | null;

class ToolStore {
	#tool: { current: ToolVariant } = localState(TOOL_KEY, CellVariant.Free);
	#color: { current: Color } = localState(COLOR_KEY, 'blue');
	picking = $state(false);
	suppressPaintUntilMouseUp = false;

	// Goal IDs — separate from entity IDs
	nextAgentGoalId = $state('0');
	nextBoxGoalId = $state('A');
	// Entity IDs
	nextAgentEntId = $state('0');
	nextBoxEntId = $state('A');

	get tool(): ToolVariant {
		return this.#tool.current;
	}
	get color(): Color {
		return this.#color.current;
	}

	setTool(tool: ToolVariant) {
		this.picking = false;
		this.suppressPaintUntilMouseUp = false;
		this.#tool.current = tool;
	}

	toggleTool(tool: CellVariant | EntityVariant) {
		this.picking = false;
		this.suppressPaintUntilMouseUp = false;
		this.#tool.current = this.#tool.current === tool ? null : tool;
	}

	togglePipette() {
		this.suppressPaintUntilMouseUp = false;
		this.picking = !this.picking;
	}

	clearTool() {
		this.picking = false;
		this.suppressPaintUntilMouseUp = false;
		this.#tool.current = null;
	}

	setColor(color: Color) {
		this.#color.current = color;
	}
}

const setTool = () => setContext('tool', new ToolStore());
const getTool = () => getContext('tool') as ToolStore;

export { setTool, getTool };
