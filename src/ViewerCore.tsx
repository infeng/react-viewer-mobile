import * as React from 'react';
import './style/index.less';
import ViewerProps, { ImageDecorator } from './ViewerProps';
import ViewerCanvas from './ViewerCanvas';

const MAX_SIZE_SCALE: number = .9;
const DEFAULT_IMAGE_WIDTH: number = 300;
const DEFAULT_IMAGE_HEIGHT: number = 300;

function noop() {}

interface Point {
  x: number;
  y: number;
}

export interface ViewerCoreState {
  visible: boolean;
  activeIndex: number;
  width: number;
  height: number;
  top: number;
  left: number;
  scale: number;
  imageWidth: number;
  imageHeight: number;
  touch: boolean;
  swiperDistance: number;
}

export default class ViewerCore extends React.Component<ViewerProps, Partial<ViewerCoreState>> {
  static defaultProps = {
    visible: false,
    onClose: noop,
    images: [],
    activeIndex: 0,
    zIndex: 1000,
  };

  prefixCls: string;
  touchStartTime: number;
  startScale: number;
  startX: number;
  startY: number;
  moveX: number;
  moveY: number;
  zoomCenterX: number;
  zoomCenterY: number;
  touchDistance: number;
  pinchScale: number;
  containerWidth: number;
  containerHeight: number;
  multiTouch: boolean;

  // test
  text1: string;
  text2: string;

  constructor(props) {
    super(props);

    this.prefixCls = 'react-viewer-mobile';
    this.touchStartTime = 0;
    this.touchDistance = 0;
    this.startX = this.startY = 0;
    this.moveX = this.moveY = 0;
    this.pinchScale = 1;
    this.state = {
      visible: this.props.visible,
      activeIndex: this.props.activeIndex,
      scale: 1,
      touch: false,
      swiperDistance: 0,
    };

    this.containerWidth = window.innerWidth;
    this.containerHeight = window.innerHeight;
  }

  handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 1) {
      this.touchDistance = this.getDistance({
        x: e.touches[0].pageX,
        y: e.touches[0].pageY,
      }, {
        x: e.touches[1].pageX,
        y: e.touches[1].pageY,
      });
      this.zoomCenterX = e.touches[0].pageX + (e.touches[1].pageX - e.touches[0].pageX) / 2;
      this.zoomCenterY = e.touches[0].pageY + (e.touches[1].pageY - e.touches[0].pageY) / 2;
      this.multiTouch = true;
    }else {
      this.touchStartTime = Date.now();
    }
    this.moveX = this.startX = e.touches[0].pageX;
    this.moveY = this.startY = e.touches[0].pageY;
    this.startScale = this.state.scale;
    this.setState({
      touch: true,
    });
  }

  handleTouchMove(e) {
    if (e.touches.length > 1) {
      let touchDistance = this.getDistance({
        x: e.touches[0].pageX,
        y: e.touches[0].pageY,
      }, {
        x: e.touches[1].pageX,
        y: e.touches[1].pageY,
      });
      let pinchScale = touchDistance / this.touchDistance;
      let newScale = this.state.scale + this.startScale * (pinchScale - this.pinchScale);
      this.handleZoom(this.zoomCenterX, this.zoomCenterY, newScale);
      this.pinchScale = pinchScale;
    }else {
      if (this.state.scale > 1) {
        let newLeft = this.state.left + e.touches[0].pageX - this.moveX;
        let newTop = this.state.top + e.touches[0].pageY - this.moveY;
        this.setState({
          left: newLeft,
          top: newTop,
        });
      }else {
        let swiperDistance = this.state.swiperDistance + e.touches[0].pageX - this.moveX;
        this.setState({
          swiperDistance: swiperDistance,
        });
      }
      this.moveX = e.touches[0].pageX;
      this.moveY = e.touches[0].pageY;
    }
  }

  handleTouchEnd(e) {
    if (e.touches.length === 0) {
      this.setState({
        touch: false,
      });
      if (this.multiTouch) {
        if (this.state.scale < 1) {
          setTimeout(() => {
            this.resetImage();
          }, 0);
        }
      }else {
        if (this.state.swiperDistance !== 0) {
          let criticalValue = this.containerWidth * .4;
          if (this.state.swiperDistance > -criticalValue &&
          this.state.swiperDistance < criticalValue) {
            this.setState({
              swiperDistance: 0,
            });
          }else if (this.state.swiperDistance <= -criticalValue) {
            let newActiveIndex = this.state.activeIndex + 1;
            if (newActiveIndex === this.props.images.length) {
              newActiveIndex = this.state.activeIndex;
            }
            this.loadImg(newActiveIndex);
          }else {
            let newActiveIndex = this.state.activeIndex - 1;
            if (newActiveIndex < 0) {
              newActiveIndex = this.state.activeIndex;
            }
            this.loadImg(newActiveIndex);
          }
        }else {
          let touchInterval = Date.now() - this.touchStartTime;
          if (Math.abs(this.moveX - this.startX) > 10 ||
          Math.abs(this.moveY - this.startY) > 10) {
          }else {
            if (touchInterval < 500) {
              this.props.onClose();
            }
          }
        }
      }
      this.startX = this.startY = this.moveX = this.moveY = null;
      this.pinchScale = 1;
      this.touchDistance = null;
      this.multiTouch = false;
    }else {
      this.moveX = e.touches[0].pageX;
      this.moveY = e.touches[0].pageY;
    }
  }

  resetImage() {
    const [ width, height ] = this.getImgWidthHeight(this.state.imageWidth, this.state.imageHeight);
    let left = ( this.containerWidth - width ) / 2;
    let top = (this.containerHeight - height) / 2;
    this.setState({
      width: width,
      height: height,
      left: left,
      top:  top,
      scale: 1,
    });
  }

  getImageCenterXY() {
    return {
      x: this.state.left + this.state.width / 2,
      y: this.state.top + this.state.height / 2,
    };
  }

  getImgWidthHeight(imgWidth, imgHeight) {
    let width = 0;
    let height = 0;
    let maxWidth = this.containerWidth * MAX_SIZE_SCALE;
    let maxHeight = this.containerHeight * MAX_SIZE_SCALE;
    width = Math.min(maxWidth, imgWidth);
    height = (width / imgWidth) * imgHeight;
    if (height > maxHeight) {
      height = maxHeight;
      width = (height / imgHeight) * imgWidth;
    }
    return [width, height];
  }

  getDistance(startPoint: Point, endPoint: Point) {
    let xLen = Math.abs(endPoint.x - startPoint.x);
    let yLen = Math.abs(endPoint.y - startPoint.y);
    return Math.sqrt(xLen * xLen + yLen * yLen);
  }

  loadImg(activeIndex, firstLoad: boolean = false) {
    let imgSrc = '';
    let images = this.props.images || [];
    if (images.length > 0) {
      imgSrc = images[activeIndex].src;
    }
    let img = new Image();
    img.src = imgSrc;
    if (firstLoad) {
      this.setState({
        activeIndex: activeIndex,
        width: 0,
        height: 0,
        left: this.containerWidth / 2,
        top:  this.containerHeight / 2,
        scale: 1,
        swiperDistance: 0,
      });
    }else {
      this.setState({
        activeIndex: activeIndex,
        swiperDistance: 0,
      });
    }
    img.onload = () => {
      let imgWidth = img.width;
      let imgHeight = img.height;
      if (firstLoad) {
        setTimeout(() => {
          this.setState({
            imageWidth: imgWidth,
            imageHeight: imgHeight,
          });
          let imgCenterXY = this.getImageCenterXY();
          this.handleZoom(imgCenterXY.x, imgCenterXY.y, 1);
        }, 0);
      }else {
        const [ width, height ] = this.getImgWidthHeight(imgWidth, imgHeight);
        let left = ( this.containerWidth - width ) / 2;
        let top = (this.containerHeight - height) / 2;
        this.setState({
          activeIndex: activeIndex,
          width: width,
          height: height,
          left: left,
          top:  top,
          imageWidth: imgWidth,
          imageHeight: imgHeight,
          scale: 1,
        });
      }
    };
    img.onerror = () => {
      this.setState({
        activeIndex: activeIndex,
        imageWidth: 0,
        imageHeight: 0,
      });
    };
  }

  handleZoom(targetX, targetY, scale) {
    let diffScale = scale - this.state.scale;
    let imgCenterXY = this.getImageCenterXY();
    let diffX = targetX - imgCenterXY.x;
    let diffY = targetY - imgCenterXY.y;
    const [ width, height ] = this.getImgWidthHeight(this.state.imageWidth, this.state.imageHeight);
    let diffWidth = this.state.width * diffScale;
    let diffHeight = this.state.height * diffScale;
    // when image width is 0, set original width
    if (diffWidth === 0) {
      diffWidth = width;
      diffHeight = height;
    }
    this.setState({
      width: this.state.width + diffWidth,
      height: this.state.height + diffHeight,
      top: this.state.top - diffHeight / 2 - diffY * diffScale,
      left: this.state.left - diffWidth / 2 - diffX * diffScale,
      scale: scale,
    });
  }

  componentDidMount() {
    this.loadImg(this.props.activeIndex, true);
  }

  componentWillReceiveProps(nextProps: ViewerProps) {
    if (this.props.visible !== nextProps.visible) {
      this.loadImg(nextProps.activeIndex, true);
      setTimeout(() => {
        this.setState({
          visible: nextProps.visible,
          swiperDistance: 0,
        });
      }, 10);
      return;
    }
    if (this.state.activeIndex !== nextProps.activeIndex) {
      this.loadImg(nextProps.activeIndex);
      return;
    }
  }

  render() {
    let className = `${this.prefixCls}`;

    let viewerStryle: React.CSSProperties = {
      opacity: this.state.visible ? 1 : 0,
    };

    if (!this.state.visible) {
      viewerStryle.display = 'none';
    }
    if (this.state.visible) {
      viewerStryle.display = 'block';
    }

    let zIndex = this.props.zIndex;

    let activeImg: ImageDecorator = {
      src: '',
      alt: '',
    };
    let images = this.props.images || [];
    if (this.state.visible) {
      if (images.length > 0 && this.state.activeIndex >= 0) {
        activeImg = images[this.state.activeIndex];
      }
    }

    let translateXs = [];
    let deviceWidth = this.containerWidth;
    for (let i = 0; i < this.state.activeIndex; i++) {
      let translateX = -deviceWidth * (this.state.activeIndex - i) + this.state.swiperDistance;
      translateXs.push(translateX);
    }
    for (let i = this.state.activeIndex; i < this.props.images.length; i++) {
      let translateX = deviceWidth * (i - this.state.activeIndex) + this.state.swiperDistance;
      translateXs.push(translateX);
    }

    return (
      <div
      className={className}
      style={viewerStryle}
      onTouchStart={this.handleTouchStart.bind(this)}
      onTouchMove={this.handleTouchMove.bind(this)}
      onTouchEnd={this.handleTouchEnd.bind(this)}
      >
        <div className={`${this.prefixCls}-mask`} style={{zIndex: zIndex}}></div>
        {this.props.images.map((image, index) => {
          if (index === this.state.activeIndex) {
            return (
              <ViewerCanvas
              key={index}
              prefixCls={this.prefixCls}
              imgSrc={image.src}
              visible={this.props.visible}
              width={this.state.width}
              height={this.state.height}
              top={this.state.top}
              left={this.state.left}
              zIndex={zIndex + 5}
              touch={this.state.touch}
              translateX={translateXs[index]}
              />
            );
          }else {
            return (
              <ViewerCanvas
              key={index}
              prefixCls={this.prefixCls}
              imgSrc={image.src}
              visible={this.props.visible}
              width={DEFAULT_IMAGE_WIDTH}
              height={DEFAULT_IMAGE_HEIGHT}
              top={(this.containerHeight - DEFAULT_IMAGE_HEIGHT) / 2}
              left={(this.containerHeight - DEFAULT_IMAGE_WIDTH) / 2}
              zIndex={zIndex + 5}
              touch={this.state.touch}
              translateX={translateXs[index]}
              />
            );
          }

        })}
        <div style={{position: 'absolute',top: 0, left: 0, zIndex: zIndex + 10}}>{this.text1}</div>
        <div style={{position: 'absolute',top: 20, left: 0, zIndex: zIndex + 10}}>{this.text2}</div>
      </div>
    );
  }
}
