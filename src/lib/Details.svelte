<script>
	const OPEN_TUTORIAL_EVENT = 'open-onboarding-tutorial';

	let open = $state(false);

	function replayTutorial() {
		open = false;
		window.dispatchEvent(new CustomEvent(OPEN_TUTORIAL_EVENT));
	}
</script>

<button onclick={() => { open = true; }} class="toolbarBtn" style="height:24px;">?</button>

{#if open}
	<div class="dialogOverlay" onclick={() => { open = false; }} role="dialog">
		<div class="dialogBox" onclick={(e) => e.stopPropagation()} style="max-width:600px;">
			<h3>How to use</h3>

			<div style="display:flex; flex-direction:column; gap:10px; font-size:11px; line-height:1.5;">
				<div>
					<strong>What This Editor Does</strong>
					<p>This is a browser-only editor for MAvis hospital-domain .lvl files. It edits the in-browser copy of a level; use Save when you want to keep the result in the repository.</p>
				</div>

				<div>
					<strong>Loading and Saving</strong>
					<p>Use New for a fresh grid and Upload for an existing .lvl from levels, complevels, or complevels26. Save downloads a .lvl file, and PNG exports the board image.</p>
				</div>

				<div>
					<strong>Editing the Grid</strong>
					<p>
						<b style="color:#b59a4a;">Cells:</b> Free is walkable floor, Wall is +, and Clear removes goals or entities from walkable cells. Click or drag to paint cell tools. Use Eyedropper to copy an entity, goal, floor, or wall from the board as the active brush.<br>
						<b style="color:#b59a4a;">Goals:</b> Box goals use A-Z and agent goals use 0-9. Select the goal tool, choose the id, then click a walkable cell. Drag a goal character to move it.<br>
						<b style="color:#b59a4a;">Entities:</b> Select a color, choose Box or Agent, choose the id, then click a walkable cell. Drag entities to move them, double-click to delete them, or click an existing entity with the matching entity tool active to change its id/color.<br>
						<b style="color:#b59a4a;">Right click:</b> Open a cell menu to delete only an entity or goal, or use that item as a brush. Alt + right click still picks directly.
					</p>
				</div>

				<div>
					<strong>Navigation and History</strong>
					<p>Mouse wheel zooms, dragging empty board space pans, the coordinate readout shows row and column, and Ctrl+Z / Ctrl+Y undo and redo recent edits. Press Esc to close the cell menu first, or clear the active tool when no menu is open. Used entities appear in the Used section so you can quickly reuse an id and color.</p>
				</div>

				<div>
					<strong>Validation</strong>
					<p>The editor can still create invalid or unsolved levels. Test finished files from the repository root with server.jar and the Java client before relying on them.</p>
				</div>
			</div>

			<div class="dialogFooter">
				<button type="button" onclick={replayTutorial}>Open tutorial</button>
				<button type="button" onclick={() => { open = false; }}>Close</button>
			</div>
		</div>
	</div>
{/if}
