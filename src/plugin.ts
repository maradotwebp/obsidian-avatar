import {Plugin} from 'obsidian';
import {renderCodeBlockProcessor} from "./core/renderCodeBlockProcessor";
import AvatarView from "./components/AvatarView.svelte";
import {withCodeblockState} from "./core/stateProviders";

export class AvatarPlugin extends Plugin {

	async onload() {
		this.registerMarkdownCodeBlockProcessor("avatar", renderCodeBlockProcessor(
			AvatarView,
			{ app: this.app, plugin: this },
			withCodeblockState()
		));
	}
}
