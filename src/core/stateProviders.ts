import type { App, MarkdownPostProcessorContext } from "obsidian";
import type { CodeBlockProcessorProps } from "./renderCodeBlockProcessor";
import { parseYaml, stringifyYaml } from "obsidian";

export type State<T> = Partial<T>;
export type SetState<T> = (setter: (state: Partial<T>) => void) => void;

declare let app: App;

export type StateProvider<T> = (
	props: CodeBlockProcessorProps,
	source: string,
	node: HTMLElement,
	ctx: MarkdownPostProcessorContext
) => {
	state: State<T>;
	setState: SetState<T>;
};

export function withCodeblockState<T>(): StateProvider<T> {
	return (props, source, node, ctx) => {
		let state: State<T> = {};
		try {
			state = parseYaml(source) ?? {};
		} catch (_) {}

		const setState: SetState<T> = (stateSetter) => {
			const newState = { ...state };
			stateSetter(newState);
			const newStateStr: string = stringifyYaml(newState);

			const info = ctx.getSectionInfo(node);
			if (info) {
				app.workspace.activeEditor?.editor?.replaceRange(
					newStateStr + "```",
					{ line: info.lineStart + 1, ch: 0 },
					{ line: info.lineEnd, ch: 3 }
				);
			}
		};

		return {
			state,
			setState,
		};
	};
}
