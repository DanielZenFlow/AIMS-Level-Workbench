<script lang="ts">
	import { getGrid } from './store/GridStore.svelte';

	const store = getGrid();
</script>

<div class="gridToolRow">
	<div class="gridToolGroup">
		<span>Rows: {store.height}</span>
		<div class="gridButtonPair">
			<button class="toolbarBtn" onclick={() => store.removeRow()} disabled={store.height <= 3}>-</button>
			<button class="toolbarBtn" onclick={() => store.addRow()} disabled={store.height >= 50}>+</button>
		</div>
	</div>

	<div class="gridToolGroup">
		<span>Cols: {store.width}</span>
		<div class="gridButtonPair">
			<button class="toolbarBtn" onclick={() => store.removeColumn()} disabled={store.width <= 3}>-</button>
			<button class="toolbarBtn" onclick={() => store.addColumn()} disabled={store.width >= 50}>+</button>
		</div>
	</div>
</div>
