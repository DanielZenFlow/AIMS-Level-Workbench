<script lang="ts">
	import { onMount } from 'svelte';

	const STORAGE_KEY = 'aims-level-workbench:onboarding-seen';
	const OPEN_EVENT = 'open-onboarding-tutorial';

	const steps = [
		{
			title: 'Paint cells in a stroke',
			body:
				'Choose Free, Wall, or Clear, then hold the left mouse button and drag across the board to paint a continuous path.'
		},
		{
			title: 'Read exact coordinates',
			body:
				'Move the mouse over any cell to see its row and column near the cursor and in the top status line.'
		},
		{
			title: 'Copy with Eyedropper',
			body:
				'Use Eyedropper to pick an entity, goal, floor, or wall from the board and make it the active brush.'
		},
		{
			title: 'Move placed entities',
			body:
				'Drag agents and boxes to move them. Goal characters can be dragged too when you need to reposition targets.'
		},
		{
			title: 'Recover quickly',
			body:
				'Use Undo and Redo for recent edits. Esc closes an open cell menu first, or clears the active tool when no menu is open.'
		}
	];

	let open = $state(false);
	let stepIndex = $state(0);

	const isFirstStep = $derived(stepIndex === 0);
	const isLastStep = $derived(stepIndex === steps.length - 1);
	const currentStep = $derived(steps[stepIndex]);

	function showTutorial() {
		stepIndex = 0;
		open = true;
	}

	function finishTutorial() {
		localStorage.setItem(STORAGE_KEY, '1');
		open = false;
	}

	function previousStep() {
		if (!isFirstStep) stepIndex -= 1;
	}

	function nextStep() {
		if (isLastStep) {
			finishTutorial();
			return;
		}
		stepIndex += 1;
	}

	onMount(() => {
		const handleOpenTutorial = () => showTutorial();
		window.addEventListener(OPEN_EVENT, handleOpenTutorial);
		if (localStorage.getItem(STORAGE_KEY) !== '1') showTutorial();

		return () => window.removeEventListener(OPEN_EVENT, handleOpenTutorial);
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="dialogOverlay onboardingOverlay" role="dialog" aria-modal="true" aria-labelledby="onboardingTitle">
		<div class="dialogBox onboardingDialog" onclick={(e) => e.stopPropagation()}>
			<p class="onboardingKicker">First run</p>
			<h3 id="onboardingTitle">AIMS Level Workbench basics</h3>

			<ol class="onboardingSteps" aria-label="Tutorial progress">
				{#each steps as step, index}
					<li class:active={index === stepIndex} class:done={index < stepIndex}>
						<span>{index + 1}</span>
						{step.title}
					</li>
				{/each}
			</ol>

			<section class="onboardingBody">
				<p class="onboardingStepCount">Step {stepIndex + 1} of {steps.length}</p>
				<h4>{currentStep.title}</h4>
				<p>{currentStep.body}</p>
			</section>

			<div class="dialogFooter">
				<button type="button" class="secondaryDialogBtn" onclick={finishTutorial}>Skip</button>
				<button type="button" class="secondaryDialogBtn" onclick={previousStep} disabled={isFirstStep}>Back</button>
				<button type="button" onclick={nextStep}>{isLastStep ? 'Finish' : 'Next'}</button>
			</div>
		</div>
	</div>
{/if}
