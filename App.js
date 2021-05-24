import * as React from 'react';
import {
  Icon,
  View,
  Text,
  Item,
  Toast,
  Spinner
} from 'native-base';
import {
  SafeAreaView
} from 'react-native';
import styles from './Styles';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
// import * as FaceDetector from 'expo-face-detector';
// import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as tf from '@tensorflow/tfjs';
import {
  cameraWithTensors,
  detectGLCapabilities,
  renderToGLView,
  toTexture
} from '@tensorflow/tfjs-react-native';
// import * as mobilenet from '@tensorflow-models/mobilenet';
import * as blazeface from '@tensorflow-models/blazeface';
// import { Svg, Circle, Rect } from 'react-native-svg';
import {
  PerspectiveCamera,
  Scene,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial
} from "three";
import ExpoTHREE from 'expo-three';
// import GopherSvg from './components/GopherSvg';
import GopherMask from './components/GopherMask';
const TensorCamera = cameraWithTensors(Camera);

const resizeTex = {
  width: 152,
  height: 200
}

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isTFReady: false,
      isModelReady: false,
      hasPermission: null,
      isCameraRunning: false,
      type: Camera.Constants.Type.front,
      isTaking: false,
      faces: null,
      width: 152,
      height: 200,
      hasError: false
    }
    this.renderFaceDetector = this.renderFaceDetector.bind(this);
    this.handleCameraStream = this.handleCameraStream.bind(this);
    this.setLayoutSize = this.setLayoutSize.bind(this);
    this.isFrontCamera = this.isFrontCamera.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true
    };
  }

  async componentDidMount() {
    try {
      await tf.ready();
      this.setState({
        isTFReady: true
      });
      const model = await blazeface.load();
      this.model = model;
      this.setState({
        isModelReady: true,
      });
      const cp = await Camera.requestPermissionsAsync();
      const mp = await MediaLibrary.requestPermissionsAsync();
      this.setState({
        hasPermission: (cp.status === 'granted' && mp.status === 'granted')
      });

    } catch(err) {
      console.error(err);
    }
  }

  componentDidUpdate() {
    if (this.rafID) {
      cancelAnimationFrame(this.rafID);
    }
  }
  // カメラの描画毎に呼ばれる
  // ここで顔検出および、GLの操作を行う。
  handleCameraStream(images, updatePreview, gl) {
    const loop = async () => {
      // if (typeof this.rafID === 'undefined') {
      //   detectGLCapabilities(gl);
      // }
      if (typeof this.model !== 'undefined') {
        const imageTensor = images.next().value;
        const flipHolizen = this.isFrontCamera();
        // 顔のランドマークを検出する
        const faces = await this.model.estimateFaces(imageTensor, false, flipHolizen);

        this.setState({faces: faces});
        // 破棄しないとメモリーリークをおこす。
        tf.dispose(imageTensor);
        updatePreview();
        gl.endFrameEXP();
      }
      this.rafID = requestAnimationFrame(loop);
    }
    loop();
  }

  renderFaceDetector() {
    const resizeRate = {
      width: (this.state.width / resizeTex.width),
      height: (this.state.height / resizeTex.height)
    }
    if (this.state.faces !== null) {
      return this.state.faces.map((face, index) => {
        return (
          <GopherMask
            key={index}
            face={face}
            resizeRate={resizeRate}
            isFrontCamera={this.isFrontCamera()}
          />
        );
      });
    }
  };

  isFrontCamera() {
    return (this.state.type === Camera.Constants.Type.front);
  }

  componentWillUnmount() {
    if (this.refID) {
      cancelAnimationFrame(this.refID);
    }
  }

  setLayoutSize(e) {
    // const width = e.nativeEvent.layout.width - (e.nativeEvent.layout.width % 4);
    this.setState({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  renderHasError() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1 }}>
          <Text>Error has occured. Please restart this app.</Text>
        </View>
      );
    }
  }

  render() {
    if (!this.state.isTFReady) {
      return (
        <View style={styles.loading}>
          <Text>Now loading TensorFlow.</Text>
        </View>
      );
    } else if (!this.state.isModelReady) {
      return (
        <View style={styles.loading}>
          <Text>Now loading BlazeFace.</Text>
        </View>
      );
    } else if (this.state.hasPermission === null) {
      return (
        <View style={styles.loading}>
          <Text>Please wait.</Text>
        </View>
      );
    }
    let textureDims;
    if (Platform.OS === 'ios') {
      textureDims = {
        height: 1920,
        width: 1080,
      };
     } else {
      textureDims = {
        height: 1200,
        width: 1600,
      };
     }
    return (
      <React.Fragment>
        <SafeAreaView style={styles.container}>
          <TensorCamera
            onLayout={this.setLayoutSize}
            style={styles.camera_view}
            type={this.state.type}
            zoom={0}
            cameraTextureHeight={textureDims.height}
            cameraTextureWidth={textureDims.width}
            resizeHeight={resizeTex.height}
            resizeWidth={resizeTex.width}
            resizeDepth={3}
            autorender={false}
            onReady={this.handleCameraStream}
            ref={ref => (this.camera = ref)}/>
          {this.renderFaceDetector()}
        </SafeAreaView>
        {this.renderSpinner()}
        <View style={styles.camera_back}>
          <Item
            style={styles.items}
            onPress={() => {
              const newType = (this.state.type === Camera.Constants.Type.back)
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back;
              this.setState({type: newType});
            }}>
            <Text style={styles.btn}>
              {
                (this.state.type === Camera.Constants.Type.back)
                ? 'Switch to Front'
                : 'Switch to Back'
              }
            </Text>
          </Item>
          <Item
            style={styles.items}
            onPress={async() => {
              // this.toggleTakingState(true);
              // this.toggleTakingState(false);
            }}
          >
            <Text style={styles.btn}> Take a Picture </Text>
          </Item>
        </View>
      </React.Fragment>
    );
  }

  toggleTakingState(bool) {
    setTimeout(() => {
      this.setState({ isTaking: bool })
    }, 1);
  }

  renderSpinner() {
    if (!this.state.isTaking) {
      return null;
    }
    return <Spinner style={styles.spinner}/>;
  }
}
