import React from 'react';
import {
  View
} from 'native-base';
import { Image } from 'react-native';

const resizeLandmark = (landmark, rates) => {
  const newX = landmark[0] * rates.width;
  const newY = landmark[1] * rates.height;
  return [newX, newY];
}

const GopherMask = props => {
  const rate = props.resizeRate;
  // 顔全体のサイズおよび割合の算出
  let faceWidth = (props.isFrontCamera)
    ? props.face.topLeft[0] - props.face.bottomRight[0]
    : props.face.bottomRight[0] - props.face.topLeft[0];
  faceWidth = faceWidth * rate.width;
  let faceHeight = props.face.bottomRight[1] - props.face.topLeft[1];
  faceHeight = faceHeight * rate.height;
  const faceRatioH = faceHeight / faceWidth;

  const landmarks = props.face.landmarks;
  const rightEye = resizeLandmark(landmarks[0], rate);
  const leftEye = resizeLandmark(landmarks[1], rate);
  const nose = resizeLandmark(landmarks[2], rate);
  const mouth = resizeLandmark(landmarks[3], rate);
  const rightEar = resizeLandmark(landmarks[4], rate);
  const leftEar = resizeLandmark(landmarks[5], rate);;

  // 顔の傾きを求める
  const x_ = (props.isFrontCamera)
    ? rightEye[0] - leftEye[0]
    : leftEye[0] - rightEye[0];
  // 左右の耳の距離（y軸）
  const y_ = rightEye[1] - leftEye[1];
  // x_, y_の二点の傾きを求める
  // atan2はradianで返されるので、度数に変換する
  let degree = Math.atan2(y_, x_) * 180 / Math.PI;

  // それぞれのパーツのサイズを求める
  const eyeWidth = faceWidth * 0.45;
  const eyeHeight = eyeWidth;

  const ratio_mouth_height = 173 / 155;
  const mouthWidth = faceWidth / 3; // 凡そ顔の3分の1程度だと想定
  const mouthHeight = mouthWidth * ratio_mouth_height;

  return (
    <React.Fragment>
      <View
        style={{
          position: 'absolute',
          left: leftEye[0] - (eyeWidth / 2),
          top: leftEye[1] - (eyeHeight / 2),
          zIndex: 10,
      }}>
        <Image
          style={{
            width: eyeWidth,
            height: eyeHeight,
            resizeMode: 'contain',
            transform: [
              {rotate: degree + 'deg'}
            ],
          }}
          source={require('../assets/gopher_le.png')}/>
      </View>
      <View
        style={{
          position: 'absolute',
          left: rightEye[0] - (eyeWidth / 2),
          top: rightEye[1] - (eyeHeight / 2),
          zIndex: 203,
      }}>
        <Image
          style={{
            width: eyeWidth,
            height: eyeHeight,
            resizeMode: 'contain',
            transform: [
              {rotate: degree + 'deg'}
            ],
          }}
          source={require('../assets/gopher_re.png')}/>
      </View>
      <View
        style={{
          position: 'absolute',
          left: mouth[0] - (mouthWidth / 2),
          top: mouth[1] - (mouthHeight / 2),
          zIndex: 203
      }}>
        <Image
          style={{
            width: mouthWidth,
            height: mouthHeight,
            resizeMode: 'contain',
            transform: [
              {rotate: degree + 'deg'}
            ],
          }}
          source={require('../assets/gopher_mouth.png')}/>
      </View>
    </React.Fragment>
  );
}

export default GopherMask;
