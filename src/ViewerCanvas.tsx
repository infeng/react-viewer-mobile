import * as React from 'react';

export interface ViewerCanvasProps {
  prefixCls: string;
  imgSrc: string;
  visible: boolean;
  width: number;
  height: number;
  top: number;
  left: number;
  zIndex: number;
  touch: boolean;
  translateX: number;
}

export default class ViewerCanvas extends React.Component<ViewerCanvasProps, any> {

  constructor() {
    super();
  }

  render() {
    let imgStyle: React.CSSProperties = {
      width: `${this.props.width}px`,
      height: `${this.props.height}px`,
      marginTop: `${this.props.top}px`,
      marginLeft: this.props.left ? `${this.props.left}px` : 'auto',
    };

    let imgClass = '';
    let canvasClass = `${this.props.prefixCls}-canvas`;
    if (!this.props.touch) {
      imgClass += ` ${this.props.prefixCls}-image-transition`;
      canvasClass += ` ${this.props.prefixCls}-canvas-transition`;
    }

    let canvasStyle = {
      zIndex: this.props.zIndex,
      transform: `translateX(${this.props.translateX}px)`,
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
      className={canvasClass}
      style={canvasStyle}
      >
        {imgNode}
      </div>
    );
  }
}
