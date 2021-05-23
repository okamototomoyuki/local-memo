import System from "../System";
import FileAccess from "../System/FileAccess";
import Page from "./AppData/Page";

/**
 * アプリ情報
 */
export default class AppData {

    /** 共有データ */
    static shared: AppData | undefined;

    /**
     * ページ取得
     * @param pageIndex ページ番号
     * @returns ページ
     */
    static getPage(pageIndex: number): Page | undefined {
        const shared = AppData.shared
        if (shared) {
            if (pageIndex in shared.pages) {
                return shared.pages[pageIndex];
            }
        }
        return undefined;
    }

    /**
     * ページ作成
     * @param pageIndex ページ番号
     * @returns ページ
     */
    static createPage(pageIndex: number): Page | undefined {
        const shared = AppData.shared
        if (shared) {
            let page = shared.pages[pageIndex]
            const prevPage = shared.pages[pageIndex - 1]
            if (page) {
                return page;
            } else {
                if (prevPage) {
                    page = new Page();
                    Object.assign(page, prevPage);
                    page.text = ""
                } else {
                    page = new Page();
                }
                shared.pages[pageIndex] = page;
                return page;
            }
        }
        return undefined
    }

    /**
     * セーブ要求
     */
    static requsetSave() {
        FileAccess.requestSaveAppData();
    }

    /** true: 初期設定した */
    isInitSetting = false
    /** アプリタイトル  */
    title = ""
    /** アプリタイトル  */
    static get title() { return AppData.shared?.title ?? "" }
    /** アプリ解像度:横 */
    viewWidth = 1280;
    /** アプリ解像度:横 */
    static get viewWidth() { return AppData.shared?.viewWidth ?? 0 }
    /** アプリ解像度:縦 */
    viewHeight = 720;
    /** アプリ解像度:縦 */
    static get viewHeight() { return AppData.shared?.viewHeight ?? 0 }
    /** ページ一覧 */
    pages = new Array<Page>();
}