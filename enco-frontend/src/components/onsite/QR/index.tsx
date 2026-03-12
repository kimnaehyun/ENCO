import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const BOX_SIZE = 240;
const boxX = (width - BOX_SIZE) / 2;
const boxY = (height - BOX_SIZE) / 2;

export default function QRScanner() {
  const navigation = useNavigation<any>();
  const device = useCameraDevice('back');

  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    };

    requestPermission();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (scanned) return;

      const code = codes[0];
      if (!code) return;

      const value = code.value;
      const frame = code.frame;

      if (!frame || !value) return;

      const centerX = frame.x + frame.width / 2;
      const centerY = frame.y + frame.height / 2;

      const insideBox =
        centerX > boxX &&
        centerX < boxX + BOX_SIZE &&
        centerY > boxY &&
        centerY < boxY + BOX_SIZE;

      if (!insideBox) return;

      try {
        const data = JSON.parse(value);

        if (data?.type === 'payment') {
          setScanned(true);

          navigation.navigate('PaymentSuccess', {
            storeName: data.storeName,
            amount: data.amount,
          });
        }
      } catch (e) {
        console.log('Invalid QR:', value);
      }
    },
  });

  if (!hasPermission) return <Text>카메라 권한 필요</Text>;
  if (!device) return <Text>카메라 찾는 중...</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />

      <View className="absolute inset-0 items-center justify-center">
        <View
          style={{
            width: BOX_SIZE,
            height: BOX_SIZE,
            borderWidth: 4,
            borderColor: 'white',
            borderRadius: 16,
          }}
        />
      </View>
    </View>
  );
}
