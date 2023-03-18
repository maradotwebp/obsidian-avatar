import {Plugin} from 'obsidian';
import type {AvatarPluginSettings} from "./settings";
import {DEFAULT_SETTINGS} from "./settings";
import {renderCodeBlockProcessor} from "./core/renderCodeBlockProcessor";
import AvatarView from "./components/AvatarView.svelte";
import {withCodeblockState} from "./core/stateProviders";

export class AvatarPlugin extends Plugin {
	settings: AvatarPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor("avatar", renderCodeBlockProcessor(
			AvatarView,
			{ app: this.app, plugin: this },
			withCodeblockState()
		));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = {
			...DEFAULT_SETTINGS,
			...(await this.loadData())
		};
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
