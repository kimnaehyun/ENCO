import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

export default function index() {
  const [hasPermission, setHasPermission] = useState(false);
  const device = useCameraDevice('back');

  useEffect(() => {
    const requestPermission = async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    };

    requestPermission();
  }, []);

  if (!hasPermission) return <Text>카메라 권한 필요</Text>;
  if (!device) return <Text>카메라 찾는 중...</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} device={device} isActive={true} />
      <View className="absolute inset-0 items-center justify-center">
        <View className="w-60 h-60 border-4 border-white rounded-xl" />
      </View>
    </View>
  );
}
