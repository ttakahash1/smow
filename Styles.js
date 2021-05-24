import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    position: 'relative',
    backgroundColor: 'white',
    flex: 1,
    zIndex: 11,
  },
  camera_view: {
    position: 'relative',
    flex: 1,
    backgroundColor: 'white',
    opacity: .1,
  },
  camera_back: {
    flex: 1,
    flexDirection: 'row-reverse',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
  },
  camera_back_none: {
    display: 'none',
    flex: 1,
    flexDirection: 'row-reverse',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
  },
  items: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    fontSize: 18,
    padding: 20,
    color: 'white'
  },
  spinner: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 10,
  }
});

export default styles;
