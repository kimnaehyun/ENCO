import {
  View,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Button,
} from 'react-native';
import { useEffect, useState } from 'react';
import { Text } from 'react-native-gesture-handler';
import { InteractionManager } from 'react-native';
import PointToggleButton from '../../payment/PointToggleButton';
import Geolocation from 'react-native-geolocation-service';
import BarcodeQR from './BarcodeQR';
import BarcodeCardRecommendation from './BarcodeCardRecommendation';
import { locationApi } from '@/services/payment/location';
import { getGroupCards } from '@/services/paymentService';
import { images } from '@/types/images';
import { voteApi } from '@/services/payment/vote';

export default function index({ groupId }: { groupId: number }) {
  const [cardNumber, setCardNumber] = useState<number>(0);
  const [isGPS, setIsGPS] = useState<boolean>(false);

  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const [cardsInfo, setCardsInfo] = useState<any>();
  const selectedCard = cardsInfo?.[cardNumber];
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

    // 화면 전환/렌더링이 완전히 끝난 뒤 실행
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
    const locationRequestNotification = async () => {
      try {
        const response = await voteApi.request(groupId);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };

    locationRequestNotification();
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
          true,
        );

        if (response.data?.result.barcode !== null) {
          clearInterval(intervalId);
          setIsGPS(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    locationCheck();
    intervalId = setInterval(locationCheck, 3000);

    return () => clearInterval(intervalId);
  }, [latitude, longitude]);

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
          selectedCard ? (
            <View className="items-center">
              <BarcodeQR cardId={selectedCard.cardId} />
            </View>
          ) : (
            <ActivityIndicator size="large" />
          )
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
