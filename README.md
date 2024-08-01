# React Native Video Webview
React Native library that provides a Video component that renders media content such as videos with custom controls for react-native and react-native-web. Support Youtube and Vimeo.

When use react-native-web please guild setup in https://www.npmjs.com/package/@chainplatform/react-native-web-webview

<a href="https://npmjs.com/package/react-native-webview-video">
  <img src="https://img.shields.io/npm/v/react-native-webview-video.svg"></img>
  <img src="https://img.shields.io/npm/dt/react-native-webview-video.svg"></img>
</a>
<a href="https://twitter.com/intent/follow?screen_name=doansan"><img src="https://img.shields.io/twitter/follow/doansan.svg?label=Follow%20@doansan" alt="Follow @doansan"></img></a>

<p align="center">
  <img src="https://i.imgur.com/jsaRvR3.png" width="340px"></img>
  <img src="https://i.imgur.com/umyFYQb.png" width="340px"></img>
</p>

### Install
```
npm install react-native-webview-video --save
```
or
```
yarn add react-native-webview-video
```


### Usage

Note: Set useRemote={true} if export web as mini app.

```js
import React from 'react';
import {StyleSheet} from 'react-native';
import Video from 'react-native-webview-video';

class App extends React.Component {

  render() {
    return (
      <View style={{flex:1}}>
          <Video
            videoId={"wJ1rCGK06bk"}
            videoType={"youtube"}
            useRemote={false}
            poster={"https://i.imgur.com/jsaRvR3.png"}
          />
      </View>
    );
  }
}
```