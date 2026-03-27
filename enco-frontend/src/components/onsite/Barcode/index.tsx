import {
  View,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { Text } from 'react-native-gesture-handler';
import { InteractionManager } from 'react-native';
import PointToggleButton from '../../payment/PointToggleButton';
import Geolocation from 'react-native-geolocation-service';
import BarcodeQR from './BarcodeQR';
import BarcodeCardRecommendation from './BarcodeCardRecommendation';
import { locationApi } from '@/services/payment/location';
import { getGroupCards, onsiteBarcodePayment } from '@/services/paymentService';
import { voteApi } from '@/services/payment/vote';
import { getPoint } from '@/services/authService';

export default function index({ groupId }: { groupId: number }) {
  const [cardNumber, setCardNumber] = useState<number>(0);
  const [isGPS, setIsGPS] = useState<boolean>(false);

  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const [cardsInfo, setCardsInfo] = useState<any>();
  const selectedCard = cardsInfo?.[cardNumber];

  const [pointUsage, setPointUsage] = useState<boolean>(true);

  const [point, setPoint] = useState<boolean>(true);
  useEffect(() => {
    const fetchPoint = async () => {
      const response = await getPoint(groupId);
      setPoint(response.result);
    };
    fetchPoint();
  }, []);

  const [barcodeInfo, setBarcodeInfo] = useState<{
    barcodeNumber: string;
    expiredAt: string;
    qrData: string;
  } | null>(null);

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
      const mapped = response.result.map(item => ({
        image: item.frontCardImageUrl,
        cardId: item.cardId,
      }));
      console.log(response);

      setCardsInfo(mapped);
    };
    fetchCards();
  }, []);

  useEffect(() => {
    const locationRequestNotification = async () => {
      try {
        const response = await voteApi.request(groupId);
        console.log(response.data);
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
          setBarcodeInfo(response.data.result.barcode);
          console.log('qr');

          console.log(response.data);
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
  const handlePayment = async () => {
    if (!barcodeInfo || !selectedCard) return;

    try {
      const response = await onsiteBarcodePayment(
        barcodeInfo.barcodeNumber,
        selectedCard.cardId,
        pointUsage,
      );
      Alert.alert('결제 성공', JSON.stringify(response));
    } catch (error: any) {
      console.log(error.response?.data);
      Alert.alert(
        '결제 실패',
        error.response?.data?.message ?? '알 수 없는 오류',
      );
    }
  };
  return (
    <View className="flex-1 gap-3">
      <View className="flex-1 rounded-[20px] py-8 bg-white justify-center">
        {isGPS ? (
          selectedCard && barcodeInfo ? (
            <View className="items-center">
              <Pressable onPress={handlePayment}>
                <BarcodeQR
                  cardId={selectedCard.cardId}
                  qrData={barcodeInfo.qrData}
                />
              </Pressable>
            </View>
          ) : (
            <ActivityIndicator size="large" />
          )
        ) : (
          <View className="items-center">
            <ActivityIndicator size="large" />
            <Text>
              주변 모임원 찾는 중...
              {'\n'}
              위도:{latitude.toFixed(6) ?? '가져오는 중'}
              {'\n'}
              경도: {longitude.toFixed(6) ?? '가져오는 중'}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-row justify-between items-center bg-white rounded-full py-4 pl-10 pr-4">
        <View className="flex-row">
          <Text className="text-[20px]">보유 포인트</Text>
          <Text className="text-[#1428A0] text-[20px]">{point}P</Text>
        </View>
        <PointToggleButton
          pointUsage={pointUsage}
          pointUsageFn={(usage: boolean) => setPointUsage(usage)}
        />
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
