<script lang="ts">
	import { getNotification } from './store/NotificationStore.svelte';

	const notification = getNotification();
</script>

{#if notification.message}
	<div class="notificationToast" role="alert">
		<div>
			<strong>{notification.title}</strong>
			<p>{notification.message}</p>
		</div>
		<button type="button" aria-label="Dismiss message" onclick={() => notification.clear()}>x</button>
	</div>
{/if}
