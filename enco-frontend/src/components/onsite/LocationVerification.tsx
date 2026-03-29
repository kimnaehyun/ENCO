import { View, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import { Text } from 'react-native-gesture-handler';
import { useEffect, useRef, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { locationApi } from '@/services/payment/location';
import { useNavigation } from '@react-navigation/native';

export default function LocationVerification({ groupId }: { groupId: number }) {
  const [verified, setVerified] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const navigation = useNavigation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let watchId: number;

    const startGPS = () => {
      // 즉시 현재 위치 획득 (첫 응답 빠름)
      Geolocation.getCurrentPosition(
        position => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        error => console.log(error),
        { enableHighAccuracy: true, timeout: 10000 },
      );

      // 이후 위치 변화 감지
      watchId = Geolocation.watchPosition(
        position => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        error => console.log(error),
        { enableHighAccuracy: true, distanceFilter: 0 },
      );
    };

    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          startGPS();
        }
      });
    } else {
      startGPS();
    }

    return () => {
      if (watchId !== undefined) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    // 이미 인증 완료됐으면 더 이상 체크 불필요
    if (verified) return;
    if (latitude === 0 && longitude === 0) return;

    const locationCheck = async () => {
      try {
        const response = await locationApi.check(
          groupId,
          latitude,
          longitude,
          false,
        );

        if (response.data?.result.barcode !== null) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setVerified(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    // 이전 interval이 남아있으면 먼저 제거
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }
    locationCheck();
    intervalRef.current = setInterval(locationCheck, 3000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [latitude, longitude, verified]);

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
