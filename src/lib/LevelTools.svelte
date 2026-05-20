<script lang="ts">
	import { getGrid } from './store/GridStore.svelte';
	import { getNotification } from './store/NotificationStore.svelte';

	const store = getGrid();
	const notification = getNotification();

	let fileInput: HTMLInputElement;

	function showUploadError(detail: string) {
		notification.showError(
			`${detail}\n\nPlease upload a hospital .lvl file with these sections: #domain, #levelname, #colors, #initial, #goal, and #end.`,
			'Level file is not compatible'
		);
	}

	function uploadGrid() {
		if (!confirm('Upload a level and replace the current board?')) return;
		fileInput.click();
	}

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.readAsText(file);
		reader.onerror = () => {
			showUploadError('Unable to read that .lvl file.');
			if (target) target.value = '';
		};
		reader.onload = () => {
			try {
				const level = reader.result?.toString() ?? '';
				store.load(level);
			} catch (error) {
				showUploadError(error instanceof Error ? error.message : 'Unable to load that .lvl file.');
			} finally {
				if (target) target.value = '';
			}
		};
	}

	function downloadGrid() {
		try {
			const data = store.toString();
			const blob = new Blob([data], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${store.name || 'New level'}.lvl`;
			a.click();
			URL.revokeObjectURL(url);
		} catch {
			notification.showError('Unable to save this level.');
		}
	}

	async function downloadGridScreenshot() {
		const element = document.getElementById('boards') || document.querySelector('.board');
		if (!element) {
			notification.showError('Unable to create PNG because the board was not found.');
			return;
		}
		try {
			const html2canvas = (await import('@cantoo/html2canvas')).default;
			const canvas = await html2canvas(element as HTMLElement, { scale: 3, backgroundColor: '#000000' });
			const link = document.createElement('a');
			link.href = canvas.toDataURL('image/png');
			link.download = `${store.name || 'New level'}.png`;
			link.click();
		} catch {
			notification.showError('PNG export failed.');
		}
	}
</script>

<label style="font-size:11px; color:var(--text-soft); font-weight:700;">
	Name
	<input type="text" bind:value={store.name} style="margin-top:4px;" placeholder="Level name">
</label>

<div style="display:flex; gap:2px; margin-top:4px;">
	<button onclick={uploadGrid} title="Upload .lvl" style="font-size:10px; padding:0 5px; height:22px; flex:1;">Upload</button>
	<button onclick={downloadGrid} title="Download .lvl" style="font-size:10px; padding:0 5px; height:22px; flex:1;">Save</button>
	<button onclick={downloadGridScreenshot} title="Save PNG" style="font-size:10px; padding:0 5px; height:22px; flex:1;">PNG</button>
</div>

<input type="file" accept=".lvl," class="hiddenFile" bind:this={fileInput} onchange={handleFileUpload} />
