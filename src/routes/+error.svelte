<script lang="ts">
	import { page } from '$app/stores';
</script>

<main class="errorPage">
	<h1>AIMS Level Workbench</h1>
	<p>{$page.status}: {$page.error?.message || 'Something went wrong.'}</p>
</main>
