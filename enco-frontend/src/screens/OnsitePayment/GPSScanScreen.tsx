import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function GPSScanScreen({ navigation }: any) {
  useEffect(() => {
    // GPS 스캔 로직을 여기에 추가할 수 있습니다. 예: GPS 권한 요청, 위치 정보 가져오기 등
    // GPS 스캔이 완료되면 PaymentMethodScreen으로 이동
    const timer = setTimeout(() => {
      navigation.replace('PaymentMethod');
    }, 2000);
    timer;
    return () => clearTimeout(timer);
  }, []);
  return (
    <View className="flex h-full justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}
