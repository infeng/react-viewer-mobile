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
    if (!this.props.touch) {
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
