import * as React from 'react';

export interface ViewerCanvasProps {
  prefixCls: string;
  imgSrc: string;
  visible: boolean;
  width: number;
  height: number;
  top: number;
  left: number;
  onChangeImgState: (width: number, height: number, top: number, left: number) => void;
  onResize: () => void;
  onZoom: (targetX: number, targetY: number, direct: number, scale: number) => void;
  zIndex: number;
}

export interface ViewerCanvasState {
  isMouseDown?: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default class ViewerCanvas extends React.Component<ViewerCanvasProps, ViewerCanvasState> {

  constructor() {
    super();

    this.state = {
      isMouseDown: false,
      mouseX: 0,
      mouseY: 0,
    };

    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize, false);
  }

  handleResize(e) {
    this.props.onResize();
  }

  componentWillReceiveProps(nextProps: ViewerCanvasProps) {

  }

  render() {
    let imgStyle: React.CSSProperties = {
      width: `${this.props.width}px`,
      height: `${this.props.height}px`,
      marginTop: `${this.props.top}px`,
      marginLeft: this.props.left ? `${this.props.left}px` : 'auto',
    };

    let imgClass = '';
    if (!this.state.isMouseDown) {
      imgClass += ` ${this.props.prefixCls}-image-transition`;
    }

    let style = {
      zIndex: this.props.zIndex,
    };

    let imgNode = null;
    if (this.props.imgSrc !== '') {
      imgNode = <img
      className={imgClass}
      src={this.props.imgSrc}
      style={imgStyle}
      />;
    }

    return (
      <div
      className={`${this.props.prefixCls}-canvas`}
      style={style}
      >
        {imgNode}
      </div>
    );
  }
}
