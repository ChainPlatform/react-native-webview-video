export const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
export const DEFAULT_YOUTUBE_URL = 'https://chainplatform.github.io/react-native-video-webview/youtube.html';
export const DEFAULT_VIMEO_URL = 'https://chainplatform.github.io/react-native-video-webview/vimeo.html';
export const DEFAULT_VIDEOJS_URL = 'https://chainplatform.github.io/react-native-video-webview/videojs.html';
export function getTime(num) {
    let hours = Math.floor(num / 3600);
    num = num - hours * 3600;
    hours = hours > 0 ? (hours < 10 ? "0" + hours : hours) : "";
    let minutes = Math.floor(num / 60);
    num = num - minutes * 60;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let seconds = parseInt(num % 60);
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return (hours ? (hours + ":") : "") + minutes + ":" + seconds;
}