<script lang="ts">
	import {App, MarkdownPostProcessorContext, MarkdownView, TFile} from "obsidian";
	import {AvatarPlugin} from "../plugin";
	import Fab from "./Fab.svelte";
	import ObsidianIcon from "./ObsidianIcon.svelte";
	import type {SetState, State} from "../core/stateProviders";
	import {SelectImageModal} from "./SelectImageModal";

	interface AvatarViewState {
		image: string;
		description: string;
	}

	export let app: App;
	export let ctx: MarkdownPostProcessorContext;
	export let state: State<AvatarViewState>;
	export let setState: SetState<AvatarViewState>;

	let initialDescription = state?.description;
	let hoverOnImage: boolean = false;

	$: inSourceMode = app ? isSourceMode(app) : false;
	$: fallbackImage = `https://ui-avatars.com/api/?name=${ctx?.sourcePath.split("/").at(-1) ?? "::"}&size=240`;

	function isSourceMode(app: App) {
		const view = app.workspace.getMostRecentLeaf()?.view as MarkdownView;
		return view?.getMode() === "source";
	}

	function updateDescription() {
		initialDescription = state.description;
		setState((fm) => {
			fm.description = state.description;
		});
	}

	function updateImage() {
		if(inSourceMode) {
			new SelectImageModal(app, (path) => {
				setState((fm) => {
					fm.image = path;
				});
			}).open();
		}
	}

	function normalizeImgPath(src: string): string {
		const file = app.vault.getAbstractFileByPath(src);
		if(file && file instanceof TFile) {
			return app.vault.getResourcePath(file);
		}
		return src;
	}
</script>

<div class="flex">
	<div
		class="avatar relative"
		on:click={updateImage}
		on:mouseenter={() => hoverOnImage = true}
		on:mouseleave={() => hoverOnImage = false}
	>
		<img class="avatar" alt="Avatar" src={normalizeImgPath(state?.image) ?? fallbackImage} />
		{#if inSourceMode && hoverOnImage}
			<Fab>
				<ObsidianIcon id="edit"></ObsidianIcon>
			</Fab>
		{/if}
	</div>
	<div class="description">
		{#if inSourceMode}
			<i contenteditable="true" data-placeholder="Write your story..." bind:textContent={state.description}></i>
		{:else}
			<i data-placeholder="Write your story...">{state.description}</i>
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
