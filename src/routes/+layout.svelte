<script lang="ts">
	import { setGrid } from '$lib/store/GridStore.svelte';
	import NotificationToast from '$lib/NotificationToast.svelte';
	import { setNotification } from '$lib/store/NotificationStore.svelte';
	import { setTool } from '$lib/store/ToolStore.svelte';
	import '../app.css';

	let { children } = $props();
	setGrid();
	setTool();
	setNotification();
</script>

{@render children()}
<NotificationToast />
