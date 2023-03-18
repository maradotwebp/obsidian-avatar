<script lang="ts">
	import {
		App,
		MarkdownPostProcessorContext,
		MarkdownRenderer,
		MarkdownView,
		TFile
	} from "obsidian";
	import Fab from "./Fab.svelte";
	import ObsidianIcon from "./ObsidianIcon.svelte";
	import type {SetState, State} from "../core/stateProviders";
	import {SelectImageModal} from "./SelectImageModal";
	import {AvatarPlugin} from "../plugin";

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
	let editMode: boolean = false;
	let descriptionEditEl: HTMLElement;
	let descriptionPreviewEl: HTMLElement;

	$: inSourceMode = app ? isSourceMode(app) : false;
	$: fallbackImage = `https://ui-avatars.com/api/?name=${ctx?.sourcePath.split("/").at(-1) ?? "::"}&size=240`;

	function isSourceMode(app: App) {
		const view = app.workspace.getMostRecentLeaf()?.view as MarkdownView;
		return view?.getMode() === "source";
	}

	function enterEditMode() {
		if(inSourceMode && !editMode) {
			editMode = true;
			queueMicrotask(() => {
				descriptionEditEl.focus();
			});
		}
	}

	function updateDescription(evt: MouseEvent) {
		editMode = false;
		initialDescription = state.description;
		setState((fm) => {
			fm.description = state.description;
		});
		evt.stopPropagation();
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

	$: if(descriptionPreviewEl && plugin && state && state?.description) {
		MarkdownRenderer.renderMarkdown(state.description, descriptionPreviewEl, "", plugin);
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
	<div class="description" on:click={enterEditMode}>
		<span
			bind:this={descriptionEditEl}
			hidden={!editMode}
			contenteditable="true"
			data-placeholder="Write your story..."
			bind:textContent={state.description}
		></span>
		<span
			hidden={editMode}
			bind:this={descriptionPreviewEl}
			data-placeholder="Write your story..."
		></span>
		{#if editMode}
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
