<script lang="ts">
	import { onMount, setContext } from "svelte";
	import dayjs from "dayjs";
	import System from "./System";
	import Input from "./System/Input";
	import ImageAsset from "./View/ImageAsset.svelte";
	import AppData from "./Data/AppData";
	import Page from "./Data/AppData/Page";
	import FileAccess from "./System/FileAccess";
	import BlobTools from "./Tool/BlobTools";

	let divView: HTMLDivElement;
	let imgCalc: HTMLImageElement;
	let astBk: ImageAsset;
	let txtMsg: HTMLDivElement;
	let divMic: HTMLDivElement;
	let aDl: HTMLAnchorElement;
	let adVoice: HTMLAudioElement;

	let recognition: SpeechRecognition | undefined;
	let grammarList: SpeechGrammarList | undefined;
	let recorder: MediaRecorder | undefined;
	let audioChunks: Array<BlobPart> | undefined;

	let isInit = false;
	let isEdit = true;
	let isFocusText = false;
	let isRecoding = false;
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
		// 今の声止める
		adVoice.pause();

		let p = AppData.getPage(pageIndex);
		if (!p) {
			p = AppData.createPage(pageIndex);
		}
		if (p) {
			txtMsg.innerHTML = p ? p.text : "";
			astBk.setAssetId(p.bgImageId);
			const url = await FileAccess.getVoiceUrl(p.voiceId);
			if (url) {
				adVoice.src = url;
				adVoice.play();
			}
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
			page.text = txtMsg.innerHTML;
			AppData.requsetSave();
		}
	};
	const onClickRecVoice = async () => {
		if (webkitSpeechRecognition) {
			if (!recognition) {
				const audioStream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				recorder = new MediaRecorder(audioStream);
				recorder.ondataavailable = (re) => {
					if (re.data.size > 0) {
						const fr = new FileReader();
						fr.onload = async (fe) => {
							const dataUrl = fe.target?.result?.toString();
							if (dataUrl) {
								const res = await fetch(dataUrl);
								const blob = await res.blob();
								const assetId = await FileAccess.saveVoice(
									blob
								);
								const page = AppData.getPage(pageIndex);
								if (assetId && page) {
									page.voiceId = assetId;
									AppData.requsetSave();
								}
							}
						};
						fr.readAsDataURL(re.data);
					}
				};

				grammarList = new webkitSpeechGrammarList();
				const grammar =
					"#JSGF V1.0 JIS ja; grammar numbers; public <numbers> = 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 ;";
				grammarList.addFromString(grammar, 1);

				recognition = new webkitSpeechRecognition();
				recognition.grammars = grammarList;
				recognition.continuous = true;
				recognition.interimResults = true;
				recognition.onresult = (e) => {
					txtMsg.innerHTML = e.results[0][0].transcript;
					saveText();
				};
				recognition.onend = (event) => {
					// 一定時間入力が無いと終了するので継続する
					if (isRecoding) {
						recognition?.start();
					}
				};
			}
			if (recorder && recognition && grammarList) {
				isRecoding = !isRecoding;

				if (isRecoding) {
					txtMsg.innerHTML = "";
					audioChunks = new Array<BlobPart>();

					recorder.start();
					recognition.start();
				} else {
					recorder.stop();
					recognition?.stop();
				}
			}
		}
	};
	const onClickDelVoice = () => {
		const page = AppData.getPage(pageIndex);
		if (page) {
			page.voiceId = "";
			AppData.requsetSave();
		}
	};
</script>

<div class="hidden">
	<!--非表示オブジェクト-->
	<audio bind:this={adVoice} controls>
		<track src="" kind="captions" srclang="es" />
		音声を再生するには、audioタグをサポートしたブラウザが必要です。
	</audio>
	<a bind:this={aDl} href="about:blank">ダウンロード用アンカー</a>
	<img bind:this={imgCalc} alt="サイズ計算用img" />
</div>

<button class:hidden={isInit} on:click={onClickOpenProject}>読み込み</button>

<div class="display" class:hidden={isInit == false}>
	<div class="view" bind:this={divView}>
		<div class="asset-container">
			<ImageAsset isBackground="true" bind:this={astBk} />
		</div>
		<div class="text-container">
			<div class="text-frame">
				<div
					class="text"
					contenteditable={isEdit}
					bind:this={txtMsg}
					on:focus={onFocusText}
					on:blur={onBlurText}
					on:input={onInputText}
				/>
				<div class="commands">
					<div
						class="rec-voice"
						class:recoding={isRecoding}
						on:click={onClickRecVoice}
						bind:this={divMic}
					/>
					<div
						class="del-voice"
						class:recoding={isRecoding}
						on:click={onClickDelVoice}
					/>
				</div>
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
		display: flex;
		justify-content: center;
		align-items: center;
		.view {
			position: relative;
			max-width: 100vw;
			max-height: 100vh;
			width: calc(100vh * var(--width) / var(--height));
			height: calc(100vw * var(--height) / var(--width));

			.asset-container {
				position: absolute;
				background-color: gray;
				width: 100%;
				height: 100%;
			}

			.text-container {
				position: absolute;
				width: 100%;
				height: 100%;
				display: flex;
				align-items: flex-end;
				pointer-events: none;
				& .text-frame {
					position: relative;
					background-color: rgba(1, 1, 1, 0.5);
					width: 100%;
					height: calc(100% / 3);
					display: flex;
					flex-direction: row;
					justify-content: center;
					align-items: center;
					pointer-events: initial;

					& .text {
						position: relative;
						color: white;

						width: calc(100% - 6vw);
						height: calc(100% - 4vw);

						font-size: 3vw;
						overflow: hidden;
					}
					& .commands {
						width: 4vw;
						height: 100%;
						display: flex;
						flex-direction: column;
						align-items: flex-start;
						justify-content: flex-start;

						& div {
							width: 4vw;
							height: 4vw;
							background-size: contain;
							margin: 1vw 0;
						}
						& .rec-voice {
							background-image: url(../image/rec_voice.png);
							&.recoding {
								background-color: red;
								border-radius: 2vw 2vw;
								background-image: unset;
							}
						}

						& .del-voice {
							background-image: url(../image/del_voice.png);
						}
					}
				}
			}
		}
	}
</style>
