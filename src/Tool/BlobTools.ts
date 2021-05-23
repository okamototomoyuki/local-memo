
export default class BlobTools {
    static getUrl(blob: Blob): string {
        const url = URL.createObjectURL(blob);
        return url;
    }
}