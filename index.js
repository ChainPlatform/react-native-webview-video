import { Component, createRef } from 'react';
import {
    Animated,
    Platform,
    View,
    ActivityIndicator,
    Pressable,
    Text,
    AppState
} from 'react-native';
import { DEFAULT_USER_AGENT, DEFAULT_YOUTUBE_URL, DEFAULT_VIMEO_URL, DEFAULT_VIDEOJS_URL, getTime } from './src/helpers';
import { youtubeHTML } from './src/sources/Youtube';
import { vimeoHTML } from './src/sources/Vimeo';
import { videoJSHTML } from './src/sources/VideoJS';
import PlaySVG from './src/icons/PlaySVG';
import PauseSVG from './src/icons/PauseSVG';
import VolumeOffSVG from './src/icons/VolumeOffSVG';
import VolumeOnSVG from './src/icons/VolumeOnSVG';
import WebView from 'react-native-webview';
import ReplaySVG from './src/icons/ReplaySVG';

export default class Video extends Component {
    constructor(props) {
        super(props);

        this.state = {
            onPlay: false,
            playerReady: false,
            playerPlaying: false,
            progressBar: "0%",
            progressTime: "00:00",
            totalTime: "00:00",
            duration: 0,
            volumeOn: true
        };
        this.webVideoRef = createRef();
        this.imageAnimated = new Animated.Value(0);
    }

    componentDidMount() {
        this.AppVideoState = AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.AppVideoState.remove();
    }

    componentDidUpdate(prevProps, prevState) {

    }

    _handleAppStateChange = currentAppState => {
        if (currentAppState === 'background' && this.state.playerPlaying) {
            this.setPlaying();
        }
    }

    onImageLoad = () => {
        Animated.timing(this.imageAnimated, {
            toValue: 1,
            useNativeDriver: Platform.OS === "web" ? false : true
        }).start(({ finished }) => { });
    }

    onMessageRecieved = event => {
        // console.log("Webview onMessage event ", event);
        try {
            let message;
            if (typeof event.nativeEvent.data == "object") {
                message = event.nativeEvent.data;
            } else {
                message = JSON.parse(event.nativeEvent.data);
            }
            const info = typeof message.eventType != "undefined" ? message.eventType : "";
            switch (info) {
                case 'playerStateChange':
                    if (message.data == 0) {
                        this.setState({ progressTime: this.state.totalTime });
                        if (typeof this.props.videoEnd != "undefined") {
                            this.props.videoEnd();
                        }
                        this.setStop();
                    }
                    break;
                case 'infoDelivery':
                    this.getProgressTime(message);
                    break;
                case "initialDelivery":
                    this.getProgressTime(message, true);
                    break;
                case 'playerReady':
                    if (typeof this.props.videoReady != "undefined") {
                        this.props.videoReady();
                    }
                    this.setPlayerReady();
                    break;
                case 'fullScreenChange':
                    // console.log("fullScreenChange ", message);
                    if (typeof this.props.onFullScreenChange != "undefined") {
                        this.props.onFullScreenChange(message.data);
                    }
                    break;
                case 'playerQualityChange':
                    // console.log("playerQualityChange ", message);
                    if (typeof this.props.videoQualityChange != "undefined") {
                        this.props.videoQualityChange(message.data);
                    }
                    break;
                case 'playerError':
                    // console.log("playerError ", message);
                    if (typeof this.props.playerError != "undefined") {
                        this.props.playerError();
                    }
                    break;
                case 'playbackRateChange':
                    // console.log("playbackRateChange ", message);
                    if (typeof this.props.videoRateChange != "undefined") {
                        this.props.videoRateChange(message.data);
                    }
                    break;
                default:
                    // console.log("default ", message);
                    break;
            }
        } catch (error) {
            console.warn('[react-native-video-webview]', error);
        }
    }

    getContent() {
        let loadContent = null;
        const videoId = typeof this.props.videoId != "undefined" ? this.props.videoId : "";
        const videoType = typeof this.props.videoType != "undefined" ? this.props.videoType : "";
        const videoSource = typeof this.props.videoSource != "undefined" ? this.props.videoSource : "";
        switch (videoSource) {
            case "youtube":
                if (typeof this.props.useRemote != "undefined" && this.props.useRemote == true) {
                    loadContent = { uri: DEFAULT_YOUTUBE_URL + '?videoId=' + videoId + '&videoType=' + videoType };
                } else {
                    loadContent = { html: youtubeHTML(videoId, videoType) };
                }
                break;
            case "vimeo":
                if (typeof this.props.useRemote != "undefined" && this.props.useRemote == true) {
                    loadContent = { uri: DEFAULT_VIMEO_URL + '?videoId=' + videoId + '&videoType=' + videoType };
                } else {
                    loadContent = { html: vimeoHTML(videoId, videoType) };
                }
                break;
            case "direct":
                if (typeof this.props.useRemote != "undefined" && this.props.useRemote == true) {
                    loadContent = { uri: DEFAULT_VIDEOJS_URL + '?videoId=' + videoId + '&videoType=' + videoType };
                } else {
                    loadContent = { html: videoJSHTML(videoId) };
                }
                break;
            default:
                break;
        }
        return loadContent;
    }

    render() {
        const content = this.getContent();
        const buttonColor = typeof this.props.buttonColor != "undefined" ? this.props.buttonColor : "#FFFFFF";
        const largeButtonWidth = typeof this.props.largeButtonWidth != "undefined" ? this.props.largeButtonWidth : 60;
        return (<View pointerEvents={this.state.playerReady ? "auto" : "none"}
            style={{
                alignItems: 'flex-start',
                alignSelf: 'flex-start',
                textAlign: 'flex-start',
                width: '100%',
            }}>
            <View pointerEvents="none"
                style={{
                    alignItems: 'flex-start',
                    alignSelf: 'flex-start',
                    textAlign: 'flex-start',
                    width: '100%',
                    aspectRatio: 16 / 9
                }}>
                {this.renderWebview(content)}
                {this.renderLoading()}
            </View>
            {
                this.props.poster != "undefined" && !this.state.playerPlaying ?
                    <Pressable style={{
                        width: '100%',
                        aspectRatio: 16 / 9,
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        top: 0,
                    }}
                        onPress={() => { this.setPlaying(); }}>
                        <Animated.Image
                            source={{ uri: this.props.poster }}
                            style={[{
                                width: '100%',
                                aspectRatio: 16 / 9
                            }, { opacity: this.imageAnimated }]}
                            onLoad={this.onImageLoad()}
                        />
                        <View style={{
                            backgroundColor: content ? "#00000030" : "transparent",
                            width: '100%',
                            aspectRatio: 16 / 9,
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            top: 0,
                        }}>
                            {
                                content ? <View style={{
                                    width: largeButtonWidth,
                                    height: largeButtonWidth,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'flex-start',
                                }}>
                                    {!this.state.playerPlaying && this.state.onPlay ?
                                        <ReplaySVG width={largeButtonWidth} color={buttonColor} /> :
                                        <PlaySVG width={largeButtonWidth} color={buttonColor} />}
                                </View> : null
                            }
                        </View>
                    </Pressable>
                    : null
            }
            {content != null ? this.renderControls() : null}
        </View>);
    }

    renderWebview(content) {
        return (content != null ? <WebView
            {...this.props}
            ref={this.webVideoRef}
            allowsFullscreenVideo={false}
            allowsInlineMediaPlayback
            scalesPageToFit={false}
            onMessage={this.onMessageRecieved}
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['*']}
            overScrollMode={"never"}
            nestedScrollEnabled={true}
            automaticallyAdjustContentInsets={true}
            javaScriptEnabled={true}
            mixedContentMode="compatibility"
            source={content}
            userAgent={
                typeof this.props.forceAndroidAutoplay != "undefined"
                    ? Platform.select({ android: DEFAULT_USER_AGENT, ios: '' })
                    : ''
            }
            onShouldStartLoadWithRequest={event => { return true; }}
        /> : null)
    }

    renderControls() {
        const buttonWidth = typeof this.props.buttonWidth != "undefined" ? this.props.buttonWidth : 30;
        const progressBarHeight = typeof this.props.progressBarHeight != "undefined" ? this.props.progressBarHeight : 8;
        const progressBarPadding = typeof this.props.progressBarPadding != "undefined" ? this.props.progressBarPadding : 2;
        const progressBarContainerHeight = typeof this.props.progressBarContainerHeight != "undefined" ? this.props.progressBarContainerHeight : 12;
        const progressBarContainerColor = typeof this.props.progressBarContainerColor != "undefined" ? this.props.progressBarContainerColor : "#171a1d";
        const buttonColor = typeof this.props.buttonColor != "undefined" ? this.props.buttonColor : "#FFFFFF";
        const textColor = typeof this.props.textColor != "undefined" ? this.props.textColor : "#a8afb5";
        const textSize = typeof this.props.textSize != "undefined" ? this.props.textSize : 12;
        const textContainerMinWidth = typeof this.props.textContainerMinWidth != "undefined" ? this.props.textContainerMinWidth : 38;
        const progressBarColor = typeof this.props.progressBarColor != "undefined" ? this.props.progressBarColor : "#5fcf80"
        const spacing = typeof this.props.spacing != "undefined" ? this.props.spacing : 5
        return <View style={[{
            backgroundColor: "#55616c",
            padding: 8,
            paddingTop: 6,
            paddingBottom: 6
        }, typeof this.props.controlsStyle != "undefined" ? this.props.controlsStyle : {}, {
            flex: 1,
            width: "100%",
            marginTop: -1,
        }]}>
            <View style={{
                justifyContent: 'space-between',
                flexDirection: "row",
                flex: 1,
            }}>
                <Pressable style={{
                    width: buttonWidth,
                    height: buttonWidth,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                }}
                    onPress={() => { this.setPlaying(); }}>
                    {
                        this.state.playerPlaying ?
                            <PauseSVG width={buttonWidth} color={buttonColor} /> :
                            (!this.state.playerPlaying && this.state.onPlay ?
                                <ReplaySVG width={buttonWidth} color={buttonColor} /> :
                                <PlaySVG width={buttonWidth} color={buttonColor} />)
                    }
                </Pressable>
                <Pressable style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    width: buttonWidth,
                    height: buttonWidth,
                    marginLeft: spacing,
                    marginRight: spacing
                }}
                    onPress={() => { this.setVolume(); }}>
                    {
                        this.state.volumeOn ?
                            <VolumeOnSVG width={buttonWidth} color={buttonColor} /> :
                            <VolumeOffSVG width={buttonWidth} color={buttonColor} />
                    }
                </Pressable>
                <View style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    flexGrow: 1,
                    flexBasis: 0
                }}>
                    <View style={{
                        justifyContent: 'space-between',
                        flexDirection: "row",
                        flex: 1,
                        width: '100%'
                    }}>
                        <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            marginLeft: spacing,
                            marginRight: spacing,
                            minWidth: textContainerMinWidth
                        }}>
                            <Text style={{
                                fontSize: textSize,
                                fontWeight: '600',
                                color: textColor
                            }}>{this.state.progressTime}</Text>
                        </View>
                        <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            paddingLeft: spacing,
                            paddingRight: spacing,
                            flexGrow: 1,
                            flexBasis: 0,
                        }}>
                            <View style={{
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                backgroundColor: progressBarContainerColor,
                                borderRadius: progressBarContainerHeight / 2,
                                width: "100%",
                                height: progressBarContainerHeight
                            }}>
                                <View style={{
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'flex-start',
                                    borderRadius: progressBarContainerHeight / 2,
                                    width: "100%",
                                    paddingLeft: progressBarPadding,
                                    paddingRight: progressBarPadding
                                }}>
                                    <View style={{
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        backgroundColor: progressBarColor,
                                        borderRadius: progressBarHeight / 2,
                                        width: this.state.progressBar,
                                        height: progressBarHeight
                                    }} />
                                </View>
                            </View>
                        </View>
                        <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            marginLeft: spacing,
                            marginRight: spacing,
                            fontWeight: '600',
                            minWidth: textContainerMinWidth
                        }}>
                            <Text style={{
                                fontSize: textSize,
                                color: textColor
                            }}>{this.state.totalTime}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    }

    setVideoStop() {
        if (this.webVideoRef && this.webVideoRef.current) {
            this.webVideoRef.current.postMessage(JSON.stringify({ event: "stopVideo", data: null }), '*');
            if (typeof this.props.videoStop != "undefined") {
                this.props.videoStop();
            }
        }
        this.setState({ playerPlaying: false, onPlay: false, progressBar: "0%", progressTime: "00:00" });
    }

    setVideoPause() {
        if (this.webVideoRef && this.webVideoRef.current) {
            this.webVideoRef.current.postMessage(JSON.stringify({ event: "pauseVideo", data: null }), '*');
            if (this.state.playerPlaying && typeof this.props.videoPause != "undefined") {
                this.props.videoPause();
            }
        }
        this.setState({ playerPlaying: false, onPlay: false });
    }

    setVideoPlay() {
        if (this.webVideoRef && this.webVideoRef.current) {
            if (!this.state.playerPlaying && this.state.onPlay) {
                this.setState({ progressBar: "0%", progressTime: "00:00" });
            }
            this.webVideoRef.current.postMessage(JSON.stringify({ event: "playVideo", data: null }), '*');
            if (!this.state.playerPlaying && typeof this.props.videoPlaying != "undefined") {
                this.props.videoPlaying();
            }
        }
        this.setState({ playerPlaying: true, onPlay: true });
    }

    setPlayerReady() {
        this.setState({ playerReady: true, playerPlaying: false, onPlay: false, progressBar: "0%", progressTime: "00:00" });
    }

    setStop() {
        this.webVideoRef.current.postMessage(JSON.stringify({ event: "stopVideo", data: null }), '*');
        this.setState({ playerPlaying: false, progressBar: "100%" });
    }

    setPlaying() {
        if (!this.state.playerPlaying && this.state.onPlay) {
            this.setState({ progressBar: "0%", progressTime: "00:00" });
        }
        let state = this.state.playerPlaying ? "pauseVideo" : "playVideo";
        this.webVideoRef.current.postMessage(JSON.stringify({ event: state, data: null }), '*');
        if (!this.state.playerPlaying && typeof this.props.videoPlaying != "undefined") {
            this.props.videoPlaying();
        }
        if (this.state.playerPlaying && typeof this.props.videoPause != "undefined") {
            this.props.videoPause();
        }
        this.setState({ playerPlaying: !this.state.playerPlaying, onPlay: !this.state.onPlay });
    }

    setVolume() {
        let state = !this.state.volumeOn ? "volumeOn" : "volumeOff";
        this.webVideoRef.current.postMessage(JSON.stringify({ event: state, data: null }), '*');
        this.setState({ volumeOn: !this.state.volumeOn });
    }

    getProgressTime(message, isInit = false) {
        if (typeof message.data != "undefined") {
            let totalTime = typeof message.data.duration != "undefined" ? message.data.duration : 0;
            let currentTime = typeof message.data.currentTime != "undefined" ? message.data.currentTime : 0;
            let progressTime = getTime(currentTime);
            if ((progressTime != "00:00" && progressTime != this.state.progressTime) || isInit) {
                if (typeof this.props.videoDuration != "undefined") {
                    this.props.videoDuration({ currentTime: currentTime, duration: totalTime });
                }
                if (currentTime > 0) {
                    let progressBar = ((currentTime * 100) / this.state.duration) + "%";
                    this.setState({ progressBar: progressBar });
                }
                this.setState({ progressTime: progressTime });
                if (isInit) {
                    const duration = getTime(totalTime);
                    this.setState({ totalTime: duration, duration: totalTime });
                }
            }
        }
    }

    renderLoading() {
        return !this.state.playerReady && (
            <View style={{
                flex: 1,
                zIndex: 1000,
                width: "100%",
                aspectRatio: 16 / 9,
                backgroundColor: typeof this.props.loadingBackgoundColor != "undefined" ? this.props.loadingBackgoundColor : '#FEFEFE',
                alignItems: 'center',
                justifyContent: 'center',
                position: "absolute"
            }}>
                <ActivityIndicator animating={true}
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: "center"
                    }}
                    size={Platform.OS === "web" ? "large" : "small"}
                    color={typeof this.props.loadingColor != "undefined" ? this.props.loadingColor : "#DDDDDD"}
                />
            </View>
        )
    }
}