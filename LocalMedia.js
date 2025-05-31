import { Component, createRef } from 'react';
import { Platform, View } from 'react-native';
import { DEFAULT_LOCAL_URL } from './src/helpers';
import { localJSHTML } from './src/sources/LocalMedia';
import WebView from 'react-native-webview';

export default class LocalMedia extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.webVideoRef = createRef();
    }

    getContent(videoType, liveVideo, seekTo) {
        let loadContent = null;
        const videoId = typeof this.props.videoId != "undefined" ? this.props.videoId : "";
        if (typeof this.props.useRemote != "undefined" && this.props.useRemote == true) {
            loadContent = { uri: DEFAULT_LOCAL_URL + '?videoId=' + videoId + '&videoType=' + videoType + '&liveVideo=' + liveVideo + '&seekTo=' + seekTo };
        } else {
            loadContent = { html: localJSHTML(videoId, liveVideo, seekTo, videoType) };
        }
        return loadContent;
    }

    render() {
        const videoType = typeof this.props.videoType != "undefined" ? this.props.videoType : "";
        const seekTo = typeof this.props.seekTo != "undefined" ? this.props.seekTo : "";
        const liveVideo = typeof this.props.liveVideo != "undefined" ? this.props.liveVideo : false;
        const height = typeof this.props.height != "undefined" ? this.props.height : 70;
        const content = this.getContent(videoType, liveVideo, seekTo);
        return (<View pointerEvents={"auto"}
            style={{
                alignItems: 'flex-start',
                alignSelf: 'flex-start',
                textAlign: 'flex-start',
                width: '100%',
            }}>
            <View pointerEvents="auto"
                style={[{
                    alignItems: 'flex-start',
                    alignSelf: 'flex-start',
                    textAlign: 'flex-start',
                    width: '100%'
                }, videoType == "video" ? { aspectRatio: 16 / 9 } : { height: height }]}>
                {this.renderWebview(content)}
            </View>
        </View>);
    }

    renderWebview(content) {
        return (content != null ? <WebView
            {...this.props}
            ref={this.webVideoRef}
            allowsFullscreenVideo={false}
            allowsInlineMediaPlayback
            scalesPageToFit={false}
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
}