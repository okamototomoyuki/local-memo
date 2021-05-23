import { nanoid } from 'nanoid'
import AppData from '../Data/AppData';

export default class FileAccess {

	static _NAME_APP = "appData.json";

	static _hdlRoot: FileSystemDirectoryHandle | undefined;
	static _hdlApp: FileSystemFileHandle | undefined;

	/**
	 * プロジェクト読み込み
	 */
	static async loadProject() {
		this._hdlRoot = await window.showDirectoryPicker();
		if (this._hdlRoot) {
			[this._hdlApp] =
				await Promise.all([
					this._hdlRoot.getFileHandle(this._NAME_APP, { create: true })
				]);

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