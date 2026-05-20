type CellContextMenuState = {
	x: number;
	y: number;
	row: number;
	col: number;
};

class CellContextMenuStore {
	state: CellContextMenuState | null = $state(null);

	open(state: CellContextMenuState) {
		this.state = state;
	}

	close() {
		this.state = null;
	}
}

const cellContextMenuStore = new CellContextMenuStore();

const getCellContextMenu = () => cellContextMenuStore;

export { getCellContextMenu };
