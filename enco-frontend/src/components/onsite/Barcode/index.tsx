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
import { locationApi } from '@/services/payment/location';
import { getGroupCards } from '@/services/paymentService';
import { images } from '@/types/images';

export default function index({ groupId }: { groupId: number }) {
  const [cardNumber, setCardNumber] = useState<number>(0);
  const [isGPS, setIsGPS] = useState<boolean>(false);

  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const [cardsInfo, setCardsInfo] = useState<any>();

  useEffect(() => {
    const fetchCards = async () => {
      const response = await getGroupCards(groupId);
      console.log(response);

      const mapped = response.result.map(item => ({
        image: images.card1, // 임시 폴백
        cardId: item.cardId,
      }));
      setCardsInfo(mapped);
    };
    fetchCards();
  }, []);

  useEffect(() => {
    // 위도/경도가 0이면 아직 GPS 못 받은 것 → API 호출 안 함
    if (latitude === 0 && longitude === 0) return;

    const locationCheck = async () => {
      try {
        const response = await locationApi.check(
          groupId,
          latitude,
          longitude,
          true,
        );
        console.log(response.data);
        // TODO: 응답에 따라 setIsGPS(true) 처리
      } catch (error) {
        console.log(error);
      }
    };

    locationCheck();
  }, [latitude, longitude]); // GPS 업데이트될 때마다 재호출

  useEffect(() => {
    let watchId: number;

    const startWatch = () => {
      watchId = Geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
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
              위도:{latitude.toFixed(6) ?? '가져오는 중'}
              {'\n'}
              경도: {longitude.toFixed(6) ?? '가져오는 중'}
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
        <BarcodeCardRecommendation
          onSelectCard={setCardNumber}
          cardsInfo={cardsInfo}
        />
      </View>
    </View>
  );
}
