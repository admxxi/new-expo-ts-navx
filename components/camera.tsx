import { Button, StyleSheet, Pressable } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import React, { useRef, useState, useEffect } from 'react';
import { Audio } from 'expo-av'; // Import the Audio module

import { Text, View } from './Themed';
import { useCameraPermissions } from "expo-camera";

export default function TabOneScreen() {
  const qrLock = useRef(false);
  const [values, setQrCodeValues] = useState('');
  const [lastScan, setLastScan] = useState('');
  const cameraRef = useRef(null);
  const [beep_a, setBeepA] = useState(null);
  const [beep_b, setBeepB] = useState(null);
  const [soundFlag, setSoundFlag] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);

  const preloadSoundA = async () => {
    console.log('Loading Sound A');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/beep.mp3')
    );
    setBeepA(sound);
  };

  const preloadSoundB = async () => {
    console.log('Loading Sound B');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/beep.mp3')
    );
    setBeepB(sound);
  };

  async function playSound() {
    const newSoundFlag = soundFlag + 1;
    if (newSoundFlag > 1) {
      setSoundFlag(0);
    } else {
      setSoundFlag(newSoundFlag);
    }

    if (soundFlag == 0 && beep_a) {
      await beep_a.playAsync();
      preloadSoundA();
    }

    if (soundFlag == 1 && beep_b) {
      await beep_b.playAsync();
      preloadSoundB();
    }

    console.log('Playing Sound: ' + soundFlag.toString());
  }

  // preload sound
  useEffect(() => {
    preloadSoundA();
    preloadSoundB();
  }, []);

  const avoidRepetition = false;
  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (data && !qrLock.current) {
      qrLock.current = true;

      if (avoidRepetition && lastScan === data) {
        console.log('repeated');
      } else {
        playSound().then(() => {});
        setQrCodeValues((prevValues) => prevValues + data + '\n');
      }

      setLastScan(data);
      setTimeout(() => {
        qrLock.current = false;
      }, 200);
    }
  };

  useEffect(() => {
    if (values.length > 600) {
      setQrCodeValues('');
    }
  }, [values]);

  useEffect(() => {
    playSound();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ScanActive</Text>
      {!isPermissionGranted ? (
      <Pressable onPress={requestPermission}>
        <Text>Request Permissions</Text>
      </Pressable>) : <Text>Camera Access Granted</Text>}
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <CameraView
        ref={cameraRef}
        style={{ width: 300, height: 350 }}
        facing="back" // Use the back camera
        zoom={0} // No zoom
        mode="picture" // Capture mode
        mute={false} // Sound
        autofocus="on" // Enable autofocus
        enableTorch={false} // Torch setting
        videoQuality="720p"
        videoStabilizationMode="standard"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'], // Types of barcodes to scan
        }}
        onBarcodeScanned={handleBarcodeScanned} // Handle scanned barcodes
        onCameraReady={() => console.log('Camera is ready')} // Optional callback
        onMountError={(event) => console.error(event)} // Error handling
      />

      <Text style={styles.title2}>{values}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  title2: {
    position: "absolute",
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: 'white',
    color: 'black',
    padding: 10,
    lineHeight: 20,
  },
});
