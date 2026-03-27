import { View, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import { Text } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { locationApi } from '@/services/payment/location';
import { useNavigation } from '@react-navigation/native';

export default function LocationVerification({ groupId }: { groupId: number }) {
  const [verified, setVerified] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    let watchId: number;

    const startWatch = () => {
      watchId = Geolocation.watchPosition(
        position => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        error => console.log(error),
        { enableHighAccuracy: true, distanceFilter: 0 },
      );
    };

    const task = InteractionManager.runAfterInteractions(() => {
      if (Platform.OS === 'android') {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ).then(granted => {
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            startWatch();
          }
        });
      } else {
        startWatch();
      }
    });

    return () => {
      task.cancel();
      if (watchId !== undefined) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (latitude === 0 && longitude === 0) return;

    let intervalId: ReturnType<typeof setInterval>;

    const locationCheck = async () => {
      try {
        const response = await locationApi.check(
          groupId,
          latitude,
          longitude,
          false,
        );

        if (response.data?.result.barcode !== null) {
          clearInterval(intervalId);
          setVerified(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    locationCheck();
    intervalId = setInterval(locationCheck, 3000);

    return () => clearInterval(intervalId);
  }, [latitude, longitude]);

  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="bg-white rounded-[20px] w-full py-16 items-center">
        {verified ? (
          <>
            <Text className="text-5xl mb-4">✅</Text>
            <Text className="text-xl font-bold text-gray-800">위치 인증 완료</Text>
            <Text className="text-sm text-gray-500 mt-2">현장 결제 인증이 완료되었습니다.</Text>
            <Text
              className="text-base text-blue-500 mt-6"
              onPress={() => navigation.goBack()}
            >
              돌아가기
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" className="mb-4" />
            <Text className="text-lg font-bold text-gray-800">위치 인증 중...</Text>
            <Text className="text-sm text-gray-500 mt-2">
              현재 위치를 확인하고 있습니다.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
