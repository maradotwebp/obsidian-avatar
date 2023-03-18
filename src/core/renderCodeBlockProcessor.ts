import type {App, MarkdownPostProcessorContext, Plugin} from "obsidian";
import type {SvelteComponent} from "svelte";
import type {StateProvider} from "./stateProviders";

export interface CodeBlockProcessorProps extends Record<string, any> {
	app: App;
	plugin: Plugin;
}

/**
 * Renders a svelte component as a code block processor.
 * @param component the svelte component to render.
 * @param props properties forwarded to the component.
 * @param stateProvider an optional provider that handles state & state updates of the code block processor.
 */
export function renderCodeBlockProcessor<S>(
	component: typeof SvelteComponent,
	props: CodeBlockProcessorProps,
	stateProvider?: StateProvider<S>
) {
	return (source: string, containerEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		const node = containerEl.createEl("div");
		new component({
			target: containerEl,
			props: {
				...props,
				...stateProvider?.(props, source, node, ctx),
				ctx
			}
		});
	}
}
