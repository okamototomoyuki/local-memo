import { nanoid } from 'nanoid'
import AppData from '../Data/AppData';
import System from '../System';
import BlobTools from '../Tool/BlobTools';

export default class FileAccess {

	static _NAME_APP = "appData.json";
	static _NAME_PAGES = "pages";
	static _NAME_IMAGES = "images";
	static _NAME_VOICES = "voices";
	static _NAME_INDEX = "index.html";
	static _NAME_GLOBAL_CSS = "global.css";
	static _NAME_BUILD = "build";
	static _NAME_BUNDLE_JS = "bundle.js";
	static _NAME_BUNDLE_CSS = "bundle.css";

	static _PATH_INDEX = "./index.html"
	static _PATH_GLOBAL_CSS = "./global.css"
	static _PATH_BUNDLE_JS = "./build/bundle.js"
	static _PATH_BUNDLE_CSS = "./build/bundle.css"

	static _META_TAG_PLAYER = "<meta name='wysiwyg-novel-type' content='player'>"

	static _hdlRoot: FileSystemDirectoryHandle | undefined;
	static _hdlApp: FileSystemFileHandle | undefined;
	static _hdlPages: FileSystemDirectoryHandle | undefined;
	static _hdlImages: FileSystemDirectoryHandle | undefined;
	static _hdlVoices: FileSystemDirectoryHandle | undefined;

	static _hdlIndex: FileSystemFileHandle | undefined;
	static _hdlGlobalCss: FileSystemFileHandle | undefined;
	static _hdlBuild: FileSystemDirectoryHandle | undefined;
	static _hdlBundleJs: FileSystemFileHandle | undefined;
	static _hdlBundleCss: FileSystemFileHandle | undefined;

	static _idToBlobImage = new Map<string, Blob>();
	static _idToBlobVoice = new Map<string, Blob>();

	/**
	 * プロジェクト読み込み
	 */
	static async loadProject() {
		this._hdlRoot = await window.showDirectoryPicker();
		if (this._hdlRoot) {
			[this._hdlApp,
			this._hdlPages,
			this._hdlImages,
			this._hdlVoices,

			this._hdlIndex,
			this._hdlGlobalCss,
			this._hdlBuild] =
				await Promise.all([
					this._hdlRoot.getFileHandle(this._NAME_APP, { create: true }),
					this._hdlRoot.getDirectoryHandle(this._NAME_PAGES, { create: true }),
					this._hdlRoot.getDirectoryHandle(this._NAME_IMAGES, { create: true }),
					this._hdlRoot.getDirectoryHandle(this._NAME_VOICES, { create: true }),

					this._hdlRoot.getFileHandle(this._NAME_INDEX, { create: true }),
					this._hdlRoot.getFileHandle(this._NAME_GLOBAL_CSS, { create: true }),
					this._hdlRoot.getDirectoryHandle(this._NAME_BUILD, { create: true }),
				]);
			[this._hdlBundleJs,
			this._hdlBundleCss] =
				await Promise.all([
					this._hdlBuild.getFileHandle(this._NAME_BUNDLE_JS, { create: true }),
					this._hdlBuild.getFileHandle(this._NAME_BUNDLE_CSS, { create: true })
				]);

			// バンドルコピー
			await Promise.all([
				this._fetchAndWrite(this._PATH_GLOBAL_CSS, this._hdlGlobalCss),
				this._fetchAndWrite(this._PATH_BUNDLE_JS, this._hdlBundleJs),
				this._fetchAndWrite(this._PATH_BUNDLE_CSS, this._hdlBundleCss)]);
			// HTML コピー
			await this.requestSaveHtml()

			const f = await this._hdlApp.getFile()
			const json = await f.text()
			AppData.shared = new AppData()
			if (json) {
				const obj = JSON.parse(json)
				Object.assign(AppData.shared, obj)
			}
		}
	}

	/**
	 * 読み込んで書き込み
	 * @param path 相対パス 
	 * @param handle 書き込み先ファイルハンドル
	 */
	static async _fetchAndWrite(path: string, handle: FileSystemFileHandle) {
		const res = await fetch(path)
		const bytes = await res.arrayBuffer()
		const w = await handle.createWritable();
		w.write(bytes);
		w.close();
	}

	/**
	 * HTML 書き込み
	 */
	static async requestSaveHtml() {
		if (this._hdlIndex) {
			const res = await fetch(this._PATH_INDEX)
			let text = await res.text()
			const w = await this._hdlIndex.createWritable();
			// タイトル
			text = text.replace(/<title>.*<\/title>/, `<title>${AppData.title}</title>`)
			// プレイヤー設定
			text = text.replace(/<!--player-->/, this._META_TAG_PLAYER)
			// TODO preload
			// TODO SEO
			w.write(text);
			w.close();
		}
	}

	/**
	 * アプリデータの書き込みリクエスト
	 */
	static async requestSaveAppData() {
		if (this._hdlApp) {
			const json = JSON.stringify(AppData.shared);
			const w = await this._hdlApp.createWritable();
			w.write(json);
			w.close();
		}
	}

	/**
	 * 画像保存
	 * @param blob データ
	 * @returns 画像アセットID
	 */
	static async saveImage(blob: Blob): Promise<string | undefined> {
		if (this._hdlImages) {
			return await this._save(this._hdlImages, this._idToBlobImage, blob)
		}
		return undefined;
	}

	/**
	 * 声保存
	 * @param blob データ
	 * @returns 声アセットID
	 */
	static async saveVoice(blob: Blob): Promise<string | undefined> {
		if (this._hdlVoices) {
			return await this._save(this._hdlVoices, this._idToBlobVoice, blob)
		}
		return undefined;
	}

	/**
	 * 保存
	 * @param hdlDir 画像・声などのフォルダハンドル
	 * @param idToBlob アセットIDとデータの紐づけ
	 * @param blob データ
	 * @returns アセットID
	 */
	static async _save(hdlDir: FileSystemDirectoryHandle, idToBlob: Map<string, Blob>, blob: Blob): Promise<string | undefined> {
		const id = nanoid()
		const f = await hdlDir.getFileHandle(id, {
			create: true,
		});
		if (f) {
			const w = await f.createWritable();
			w.write(blob);
			w.close();

			if (id) {
				idToBlob.set(id, blob);
			}

			return id;
		}

		return undefined
	}

	/**
	 * 画像のURL取得
	 * @param id 画像アセットID
	 * @returns URL
	 */
	static async getImageUrl(id: string): Promise<string | undefined> {
		if (System.isPlayer) {
			// プレイヤーならURL直接
			return `${this._NAME_IMAGES}/${id}`;
		} else {
			if (this._hdlImages) {
				const blob = await this._load(id, this._hdlImages, this._idToBlobImage)
				if (blob) {
					return BlobTools.getUrl(blob);
				}
			}
		}
		return undefined;
	}

	/**
	 * 声のURL取得
	 * @param id 声アセットID
	 * @returns URL
	 */
	static async getVoiceUrl(id: string): Promise<string | undefined> {
		if (System.isPlayer) {
			// プレイヤーならURL直接
			return `${this._NAME_VOICES}/${id}`;
		} else {
			if (this._hdlVoices) {
				const blob = await this._load(id, this._hdlVoices, this._idToBlobVoice)
				if (blob) {
					return BlobTools.getUrl(blob);
				}
			}
		}
		return undefined;
	}

	/**
	 * アセット読み込み
	 * @param id アセットID 
	 * @param hdlDir 配置フォルダのハンドル
	 * @param idToBlob アセット ID とデータ
	 * @returns データ
	 */
	static async _load(id: string, hdlDir: FileSystemDirectoryHandle, idToBlob: Map<string, Blob>): Promise<Blob | undefined> {
		let blob = idToBlob.get(id)
		if (!blob) {
			// キャッシュ無しなら読み込み
			if (idToBlob) {
				if (await this._isExists(id, hdlDir)) {
					const h = await hdlDir.getFileHandle(id)
					if (h instanceof FileSystemFileHandle) {
						const f = await h.getFile()
						const bytes = await f.arrayBuffer()
						blob = new Blob([bytes])
						idToBlob.set(id, blob)
						return blob
					}
				}
			}
		}
		return blob
	}

	/**
	 * ファイルがあるか
	 * @param id アセットID 
	 * @param hdlDir フォルダのハンドル 
	 * @returns true:有り
	 */
	static async _isExists(id: string, hdlDir: FileSystemDirectoryHandle): Promise<boolean> {
		for await (const [name, _] of hdlDir.entries()) {
			if (name == id) {
				return true
			}
		}
		return false
	}
}