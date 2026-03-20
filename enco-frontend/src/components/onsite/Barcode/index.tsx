import {
  View,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Button,
} from 'react-native';
import { useEffect, useState } from 'react';

import { Text } from 'react-native-gesture-handler';

import PointToggleButton from '../../payment/PointToggleButton';
import Geolocation from 'react-native-geolocation-service';
import BarcodeQR from './BarcodeQR';
import BarcodeCardRecommendation from './BarcodeCardRecommendation';

export default function index() {
  const [cardNumber, setCardNumber] = useState<number>(0);
  const [isGPS, setIsGPS] = useState<boolean>(false);

  type Location = {
    latitude: number;
    longitude: number;
  };
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  useEffect(() => {
    let watchId: number;

    const startWatch = () => {
      watchId = Geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        error => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,
        },
      );
    };

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

    return () => {
      if (watchId !== undefined) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);
  return (
    <View className="flex-1 gap-3">
      <View className="flex-1 rounded-[20px] py-8 bg-white justify-center">
        {isGPS ? (
          <BarcodeQR cardNumber={cardNumber} className="w-full h-full" />
        ) : (
          <View className="items-center">
            <ActivityIndicator size="large" />
            <Text>
              GPS로 주변 모임원 찾는 중...
              {'\n'}
              위도:{currentLocation?.latitude.toFixed(6) ?? '가져오는 중'}
              {'\n'}
              경도: {currentLocation?.longitude.toFixed(6) ?? '가져오는 중'}
            </Text>
            <Button
              title="다음으로"
              onPress={() => {
                setIsGPS(true);
              }}
            />
          </View>
        )}
      </View>
      <View className="flex-row justify-between items-center bg-white rounded-full py-4 pl-10 pr-4">
        <Text className="text-xl font-medium">회식주의자</Text>
        <PointToggleButton />
      </View>
      <View className="flex-1">
        <BarcodeCardRecommendation onSelectCard={setCardNumber} />
      </View>
    </View>
  );
}
