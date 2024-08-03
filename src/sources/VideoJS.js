export function videoJSHTML(videoId, jsVersion = "", jsLink = "", cssLink = "") {
    jsVersion = jsVersion ? jsVersion : "8.17.1";
    cssLink = cssLink ? cssLink : `https://cdnjs.cloudflare.com/ajax/libs/video.js/${jsVersion}/video-js.min.css`;
    jsLink = jsLink ? jsLink : `https://cdnjs.cloudflare.com/ajax/libs/video.js/${jsVersion}/video.min.js`;
    return `<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1">
    <title>VideoJS Player Webview</title>
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

        .embed-container {
            position: relative;
            aspect-ratio: 16 / 9;
            overflow: hidden;
            max-width: 100%;
            width: 100%;
            height: 100%;
        }

        .embed-container iframe,
        .embed-container object,
        .embed-container embed {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        .embed-container .video-js {
            padding-top: 0px;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
        }
    </style>
</head>

<body>
    <div class="embed-container">
        <video id="player" class="video-js"></video>
    </div>
    <link href="${cssLink}" rel="stylesheet">
    <script>
        function sendMessageToParent(event) {
            (window.ReactNativeWebView || window.parent || window).postMessage(JSON.stringify(event), '*');
        }
        let tag = document.createElement('script');
        tag.src = '${jsLink}';
        let lastTimeUpdate = 0;
        let player;
        let options = {
            userActions: {
                click: false,
                doubleClick: false
            },
                hotkeys: false,
                autoplay: false,
                controls: false,
                loop: false,
                disablePictureInPicture: true,
                experimentalSvgIcons: false,
                controlBar: false,
                autoSetup: false,
                playsinline: true,
                sources: [{
                    src: '${videoId}',
                }]
        };
        // type: 'videoType'
        tag.onload = () => {
            player = videojs('player', options, function onPlayerReady() {
                sendMessageToParent({ eventType: "playerReady", data: null });
            });
            player.one("loadedmetadata", () => {
                var duration = player.duration();
                sendMessageToParent({ eventType: "initialDelivery", data: { duration: duration, currentTime: 0 } });
            });
            player.on('ended', function () {
                sendMessageToParent({ eventType: "playerStateChange", data: 0 });
            });
            player.on('timeupdate', function () {
                var time = Math.floor(this.currentTime());
                if (time !== lastTimeUpdate) {
                    lastTimeUpdate = time;
                    sendMessageToParent({ eventType: "infoDelivery", data: { currentTime: time } })
                }
            });
            player.on('ratechange', function (infos) {
                sendMessageToParent({ eventType: "playbackRateChange", data: infos })
            });
            player.on('error', function (infos) {
                sendMessageToParent({ eventType: "playerError", data: infos })
            });
        };
        tag.onerror = () => { };
        let firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.addEventListener("message", function (events) {
            let infos = events.data;
            if (typeof events.data != "object") {
                infos = JSON.parse(events.data);
            }
            switch (infos.event) {
                case "playVideo":
                    player.play();
                    break;
                case "pauseVideo":
                    player.pause();
                    break;
                case "stopVideo":
                    player.pause();
                    break;
                case "volumeOff":
                    player.volume(0);
                    break;
                case "volumeOn":
                    player.volume(1);
                    break;
            }
        })
    </script>
</body>

</html>`
}