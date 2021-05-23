<script lang="ts">
	import { onMount, setContext } from "svelte";
	import System from "./System";
	import Input from "./System/Input";
	import AppData from "./Data/AppData";
	import Page from "./Data/AppData/Page";
	import FileAccess from "./System/FileAccess";

	let divView: HTMLDivElement;
	let imgCalc: HTMLImageElement;
	let txtBody: HTMLTextAreaElement;

	let isInit = false;
	let isEdit = true;
	let isFocusText = false;
	let pageIndex = 0;

	onMount(() => {
		System.imgCalc = imgCalc;
		System.addRequestAnimationFrame(loop);
	});

	const loop = () => {
		if (isFocusText == false) {
			if (Input.arrowRight?.down) {
				pageIndex++;
				loadOrCreatePage();
			} else if (Input.arrowLeft?.down) {
				pageIndex = Math.max(pageIndex - 1, 0);
				loadOrCreatePage();
			}
		}
	};

	const onClickOpenProject = async () => {
		await FileAccess.loadProject();
		if (AppData.shared) {
			isInit = true;
			divView.style.setProperty("--width", `${AppData.viewWidth}`);
			divView.style.setProperty("--height", `${AppData.viewHeight}`);

			loadOrCreatePage();
		}
	};

	const loadOrCreatePage = async () => {
		let p = AppData.getPage(pageIndex);
		if (!p) {
			p = AppData.createPage(pageIndex);
		}
		if (p) {
			txtBody.innerHTML = p ? p.text : "";
		}
	};

	export const getCurrent = (): Page | undefined => {
		return AppData.getPage(pageIndex);
	};

	const onFocusText = () => {
		isFocusText = true;
	};
	const onBlurText = () => {
		isFocusText = false;
	};
	const onInputText = () => {
		saveText();
	};
	const saveText = () => {
		const page = AppData.getPage(pageIndex);
		if (page) {
			page.text = txtBody.value;
			AppData.requsetSave();
		}
	};
</script>

<button class:hidden={isInit} on:click={onClickOpenProject}>読み込み</button>

<div class:hidden={isInit == false} class="display">
	<div class="view" bind:this={divView}>
		<div class="text-container">
			<div class="text-frame">
				<textarea
					type="text"
					class="text"
					placeholder="メモを入力してね"
					bind:this={txtBody}
					on:focus={onFocusText}
					on:blur={onBlurText}
					on:input={onInputText}
				/>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.hidden {
		display: none;
	}
	.display {
		width: 100%;
		height: 100%;
		.view {
			position: relative;
			width: 100%;
			height: 100%;

			.text-container {
				position: absolute;
				width: 100%;
				height: 100%;
				& .text-frame {
					position: relative;
					width: 100%;
					height: 100%;
					& .text {
						position: relative;
						width: calc(100%);
						height: calc(100%);
					}
				}
			}
		}
	}
</style>
