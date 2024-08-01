export function youtubeHTML(videoId) {
    return `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1">
    <title>Youtube Player Webview</title>
    <meta charset="utf-8">
    <meta name="author" content="santran686@gmail.com">
    <meta name="author" content="chainplatform.net">
    <style>
        html {
            overflow-y: hidden;
            overflow-x: hidden;
            height: 100%;
        }

        body {
            background-color: transparent;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div id="player"></div>
    <script>
        const parsedUrl = new URL(window.location.href), videoId = parsedUrl.searchParams.get("videoId");
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        var player;
        // var iframeWindow;
        var lastTimeUpdate = 0;
        function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                videoId: '${videoId}',
                playerVars: {
                    'playsinline': 1,
                    'modestbranding': 1,
                    'controls': 0,
                    'rel': 0,
                    'loop': 0,
                    'fs': 0,
                    'autoplay': 0
                },
                events: {
                    onReady: onPlayerReady,
                    onError: onPlayerError,
                    onStateChange: onPlayerStateChange,
                    onPlaybackRateChange: onPlaybackRateChange,
                    onPlaybackQualityChange: onPlaybackQualityChange
                }
            });
            // iframeWindow = player.getIframe().contentWindow;
        }
        function onPlayerError(e) {
            sendMessageToParent({ eventType: "playerError", data: e.data })
        }
        function onPlaybackRateChange(e) {
            sendMessageToParent({ eventType: "playbackRateChange", data: e.data })
        }
        function onPlaybackQualityChange(e) {
            sendMessageToParent({ eventType: "playerQualityChange", data: e.data })
        }
        function onPlayerReady(e) {
            sendMessageToParent({ eventType: "playerReady", data: null })
        }
        function onPlayerStateChange(e) {
            sendMessageToParent({ eventType: "playerStateChange", data: e.data })
        }
        function sendMessageToParent(event) {
            (window.ReactNativeWebView || window.parent || window).postMessage(JSON.stringify(event), '*');
        }
        window.addEventListener("message", function (events) {
            let infos = events.data;
            if (typeof events.data != "object") {
                infos = JSON.parse(events.data);
            }
            // if (events.source === iframeWindow) {
            if (infos.event === "infoDelivery" && infos.info && infos.info.currentTime) {
                var time = Math.floor(infos.info.currentTime);
                if (time !== lastTimeUpdate) {
                    lastTimeUpdate = time;
                    (window.ReactNativeWebView || window.parent || window).postMessage(JSON.stringify({ eventType: infos.event, data: { currentTime: time } }), '*');
                }
            }
            if (infos.event === "initialDelivery" && infos.info) {
                (window.ReactNativeWebView || window.parent || window).postMessage(JSON.stringify({ eventType: infos.event, data: infos.info }), '*');
            }
            // }
            switch (infos.event) {
                case "playVideo":
                    player.playVideo();
                    break;
                case "pauseVideo":
                    player.pauseVideo();
                    break;
                case "stopVideo":
                    player.stopVideo();
                    break;
                case "volumeOff":
                    player.mute();
                    break;
                case "volumeOn":
                    player.unMute()
                    break;
            }
        })
    </script>
</body>
</html>`
}