<script lang="ts">
	import { set_data } from "svelte/internal";

	import AppData from "../Data/AppData";
	import System from "../System";
	import FileAccess from "../System/FileAccess";
	import BlobTools from "../Tool/BlobTools";

	export let isBackground = "";

	let inptFile: HTMLInputElement;
	let divContainer: HTMLDivElement;

	const onDragOver = (e: DragEvent) => {
		e.stopPropagation();
		e.preventDefault();
		divContainer.style.background = "#e1e7f0";
	};

	const onDragLeave = (e: DragEvent) => {
		e.stopPropagation();
		e.preventDefault();
		divContainer.style.background = "#ffffff";
	};

	const onDrop = (e: DragEvent) => {
		e.stopPropagation();
		e.preventDefault();
		divContainer.style.background = "#ffffff"; //背景色を白に戻す
		let files = e.dataTransfer?.files ?? null; //ドロップしたファイルを取得
		if (files && files.length > 0) {
			inptFile.files = files; //inputのvalueをドラッグしたファイルに置き換える。
			loadFile(files[0]);
		}
	};

	const onDblClick = () => {
		inptFile.click();
	};

	const onChange = () => {
		if (inptFile.files && inptFile.files.length > 0) {
			loadFile(inptFile.files[0]);
		}
	};

	const loadFile = (file: File) => {
		/* FileReaderで読み込み、プレビュー画像を表示。 */
		const fr = new FileReader();
		fr.readAsDataURL(file);
		fr.onload = async () => {
			const dataUrl = fr.result?.toString();
			if (dataUrl) {
				const res = await fetch(dataUrl);
				const blob = await res.blob();
				const assetId = await FileAccess.saveImage(blob);
				const page = System.view?.getCurrent();
				if (assetId && page) {
					page.bgImageId = assetId;
					AppData.requsetSave();
					setAssetId(assetId);
				}
			}
		};
	};

	export const setAssetId = async (assetId: string) => {
		const imgCalc = System.imgCalc;
		if (imgCalc) {
			const url = await FileAccess.getImageUrl(assetId);
			if (url) {
				imgCalc.src = url;
				imgCalc.onload = () => {
					const style = divContainer.style;
					style.backgroundImage = `url(${imgCalc.src})`;
					style.backgroundSize = "cover";
					style.backgroundPosition = "center";
					style.backgroundRepeat = "no-repeat";
					if (isBackground) {
						style.width = "100%";
						style.height = "100%";
					} else {
						style.width = `${
							(imgCalc.naturalWidth / AppData.viewWidth) * 100
						}%`;
						style.height = `${
							(imgCalc.naturalHeight / AppData.viewHeight) * 100
						}%`;
					}
				};
			} else {
				// 背景真っ白
				const style = divContainer.style;
				style.backgroundImage = ``;
			}
		}
	};
</script>

<div
	class="container"
	bind:this={divContainer}
	on:dragover={onDragOver}
	on:dragleave={onDragLeave}
	on:drop={onDrop}
	on:dblclick={onDblClick}
>
	<input type="file" bind:this={inptFile} on:change={onChange} />
</div>

<style lang="scss">
	.container {
		width: 100%;
		height: 100%;
		& input {
			display: none;
		}
	}
</style>
