# react-viewer-mobile

react image viewer for mobile

## Introduction

[react-viewer](https://github.com/infeng/react-viewer) for mobile.

## Installation

```bash
npm install react-viewer-mobile --save
```

## Usage

```javascript
import * as React from 'react';
import Viewer from 'react-viewer-mobile';
import 'react-viewer-mobile/dist/index.css';

class App extends React.Component<any, any> {
  constructor() {
    super();

    this.state = {
      visible: false,
    };
  }

  render() {
    return (
      <div>
        <button onClick={() => { this.setState({ visible: !this.state.visible }); } }>show</button>
        <Viewer
        visible={this.state.visible}
        images={[src: '', alt: '']}
        />
      </div>
    );
  }
}
```

## Props

| props       | type         | default | description                 | required |
|-------------|--------------|---------|-----------------------------|----------|
| visible     | string       |  false  | Viewer visible             | true |
| images      | {src: string, alt: string}[]     | []      | image source array | true  |
| activeIndex | number       | 0       | active image index | false |
| zIndex      | number       | 1000    | Viewer css z-index | false |

## Gesture support

- slide
- pinch


## License

MIT
