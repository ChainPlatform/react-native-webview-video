import { Component } from 'react';
import Svg, { Path } from 'react-native-svg';

export default class PauseSVG extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let origin_width = 512;
        let origin_height = 512;
        let height = typeof this.props.width != "undefined" ? (this.props.width * origin_height) / origin_width : 0;
        return (
            <Svg fill={this.props.color} width={this.props.width} height={height} viewBox="0 0 512 512">
                <Path d="M208 432h-48a16 16 0 01-16-16V96a16 16 0 0116-16h48a16 16 0 0116 16v320a16 16 0 01-16 16zM352 432h-48a16 16 0 01-16-16V96a16 16 0 0116-16h48a16 16 0 0116 16v320a16 16 0 01-16 16z" />
            </Svg>
        );

    }
}