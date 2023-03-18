<script lang="ts">
	import {App, MarkdownPostProcessorContext, MarkdownView} from "obsidian";
	import {AvatarPlugin} from "../plugin";
	import Fab from "./Fab.svelte";
	import ObsidianIcon from "./ObsidianIcon.svelte";
	import type {SetState, State} from "../core/stateProviders";

	interface AvatarViewState {
		image: string;
		description: string;
	}

	export let app: App;
	export let plugin: AvatarPlugin;
	export let ctx: MarkdownPostProcessorContext;
	export let state: State<AvatarViewState>;
	export let setState: SetState<AvatarViewState>;

	let initialDescription = state?.description;
	let hoverOnImage: boolean = false;

	$: inPreviewMode = isPreviewMode(app);
	$: fallbackImage = `https://ui-avatars.com/api/?name=${ctx?.sourcePath.split("/").at(-1) ?? "::"}&size=240`;

	function isPreviewMode(app: App) {
		const view = app.workspace.getMostRecentLeaf()?.view as MarkdownView;
		return view?.getMode() === "preview";
	}

	function updateDescription() {
		initialDescription = state.description;
		setState((fm) => {
			fm.description = state.description;
		});
	}

	function selectImage() {
	}
</script>

<div class="flex">
	<div
		class="avatar relative"
		on:click={selectImage}
		on:mouseenter={() => hoverOnImage = true}
		on:mouseleave={() => hoverOnImage = false}
	>
		<img class="avatar" alt="Avatar" src={state?.image ?? fallbackImage} />
		{#if hoverOnImage}
			<Fab>
				<ObsidianIcon id="edit"></ObsidianIcon>
			</Fab>
		{/if}
	</div>
	<div class="description">
		{#if inPreviewMode}
			<i data-placeholder="Write your story...">{state.description}</i>
		{:else}
			<i contenteditable="true" data-placeholder="Write your story..." bind:textContent={state.description}></i>
		{/if}
		{#if (initialDescription !== "" || state?.description !== "") && state?.description !== initialDescription}
			<Fab on:click={updateDescription}>
				<ObsidianIcon id="save"></ObsidianIcon>
			</Fab>
		{/if}
	</div>
</div>

<style>
	.flex {
		display: flex;
		gap: 1.4em;
		flex-wrap: wrap;
		justify-items: center;
	}

	@media (min-width: 992px) {
		.flex {
			flex-wrap: nowrap;
		}
	}
	
	.relative {
		position: relative;
	}

	.avatar {
		flex: 0 0 auto;
		width: 240px;
		height: 240px;
		object-fit: cover;
		border-radius: 6px;
	}

	.description {
		flex: 1 1 auto;
		word-break: break-word;
		padding: 6px;
		border-radius: 6px;
	}

	[contenteditable=true]:empty:not(:focus):before{
		content: attr(data-placeholder);
		color: var(--text-faint);
		font-style: italic;
	}
</style>
