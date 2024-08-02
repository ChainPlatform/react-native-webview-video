import { Component } from 'react';
import Svg, { G, Path } from 'react-native-svg';

export default class ReorderSVG extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let origin_width = 36;
        let origin_height = 36;
        let height = typeof this.props.width != "undefined" ? (this.props.width * origin_height) / origin_width : 0;
        return (
            <Svg width={this.props.width} height={height} fill={this.props.color} viewBox="0 0 36 36">
                <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <Path d="M32.133,12.215 C31.358,11.787 30.382,12.069 29.955,12.845 L29.437,13.782 C27.665,8.358 22.563,4.426 16.555,4.426 C9.081,4.426 3,10.507 3,17.981 C3,25.455 9.081,31.536 16.555,31.536 C17.441,31.536 18.159,30.818 18.159,29.933 C18.159,29.048 17.441,28.33 16.555,28.33 C10.849,28.33 6.206,23.687 6.206,17.98 C6.206,12.273 10.849,7.632 16.555,7.632 C21.08,7.632 24.927,10.556 26.33,14.61 L25.454,14.127 C24.679,13.699 23.703,13.98 23.276,14.756 C22.848,15.532 23.129,16.507 23.905,16.934 L27.074,18.682 C27.335,19.213 27.875,19.583 28.508,19.583 C28.668,19.583 28.819,19.552 28.964,19.509 C28.973,19.509 28.98,19.512 28.989,19.512 C29.554,19.512 30.101,19.214 30.395,18.683 L32.763,14.391 C33.191,13.618 32.909,12.643 32.133,12.215 Z" fill={this.props.color} fillRule="nonzero" />
                </G>
            </Svg>
        );
    }
}