<script lang="ts">
	import {
		App,
		MarkdownPostProcessorContext,
		MarkdownRenderer,
		MarkdownView,
		TFile,
	} from "obsidian";
	import Fab from "./Fab.svelte";
	import ObsidianIcon from "./ObsidianIcon.svelte";
	import type { SetState, State } from "../core/stateProviders";
	import { SelectImageModal } from "./SelectImageModal";
	import { AvatarPlugin } from "../plugin";
	import { onMount } from "svelte";

	interface AvatarViewState {
		image?: string;
		/**
		 * The side on which the image will be displayed.
		 *
		 * @default "left"
		 */
		side?: "left" | "right";
		/**
		 * The size of the avatar image.
		 *
		 * small: 180x180
		 * medium: 240x240
		 * large: 300x300
		 *
		 * @default "medium"
		 */
		size?: "small" | "medium" | "large" | number;
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

	let inSourceMode = false;
	$: fallbackImage = `https://ui-avatars.com/api/?name=${ctx?.sourcePath.split("/").at(-1) ?? "::"}&size=240`;
	$: avatarSize = state.size
		? typeof state.size === "string"
			? {
					small: 180,
					medium: 240,
					large: 300,
				}[state.size]
			: state.size
		: 240;

	onMount(() => {
		inSourceMode = isSourceMode();
		let x = app.workspace.on("layout-change", () => {
			inSourceMode = isSourceMode();
		});
		return () => app.workspace.offref(x);
	});

	function isSourceMode() {
		const view = app.workspace.getActiveViewOfType(MarkdownView);
		return view?.getMode?.() === "source";
	}

	function enterEditMode() {
		if (inSourceMode && !editMode) {
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
		if (inSourceMode) {
			new SelectImageModal(app, (path) => {
				setState((fm) => {
					fm.image = path;
				});
			}).open();
		}
	}

	function normalizeImgPath(src: string): string {
		const file = app.vault.getAbstractFileByPath(src);
		if (file && file instanceof TFile) {
			return app.vault.getResourcePath(file);
		}
		return src;
	}

	$: if (descriptionPreviewEl && plugin && state && state?.description) {
		descriptionPreviewEl.innerHTML = "";
		MarkdownRenderer.renderMarkdown(
			state.description,
			descriptionPreviewEl,
			ctx?.sourcePath ?? "",
			plugin,
		);
	}
</script>

<div class="flex" class:reverse={state?.side === "right"}>
	<div
		class="avatar-container relative"
		on:click={updateImage}
		on:mouseenter={() => (hoverOnImage = true)}
		on:mouseleave={() => (hoverOnImage = false)}
	>
		<img
			class="avatar"
			alt="Avatar"
			style:width={`${avatarSize}px`}
			style:height={`${avatarSize}px`}
			src={state.image ? normalizeImgPath(state?.image) : fallbackImage}
		/>
		{#if inSourceMode && hoverOnImage}
			<Fab>
				<ObsidianIcon id="edit"></ObsidianIcon>
			</Fab>
		{/if}
	</div>
	<div
		class="description relative"
		on:click={enterEditMode}
		class:editmode={!!editMode}
	>
		<textarea
			class="textarea"
			bind:this={descriptionEditEl}
			hidden={!editMode}
			placeholder="Write your story..."
			bind:value={state.description}
		></textarea>
		<span
			class="avatar-plugin--md with-placeholder"
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
		justify-content: center;
	}

	.flex.reverse {
		flex-direction: row-reverse;
	}

	@media (min-width: 992px) {
		.flex {
			flex-wrap: nowrap;
		}
	}

	.relative {
		position: relative;
	}

	.avatar-container {
		flex: 0 0 auto;
	}

	.avatar {
		object-fit: cover;
		border-radius: 6px;
	}

	.description {
		flex: 1 1 auto;
		word-break: break-word;
		border-radius: 6px;
	}

	.description.editmode {
		padding: 6px;
	}

	.textarea {
		width: 100%;
		height: 100%;
		resize: none;
	}

	.with-placeholder:empty:before {
		content: attr(data-placeholder);
		color: var(--text-faint);
		font-style: italic;
	}
</style>
