import {
  View,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
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

export default function index({ groupId, isLeader = true }: { groupId: number; isLeader?: boolean }) {
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

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 최신 lat/lng를 stale closure 없이 참조하기 위한 ref
  const latRef = useRef(0);
  const lngRef = useRef(0);
  latRef.current = latitude;
  lngRef.current = longitude;

  // GPS watchPosition (단일 등록)
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
    if (!isLeader) return;
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

  // 폴링 시작 함수 — latRef/lngRef로 최신 좌표를 참조해 stale closure 방지
  const startPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const locationCheck = async () => {
      const lat = latRef.current;
      const lng = lngRef.current;
      if (lat === 0 && lng === 0) return;
      try {
        const response = await locationApi.check(groupId, lat, lng, isLeader);
        if (response.data?.result.barcode !== null) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsGPS(true);
          setBarcodeInfo(response.data.result.barcode);
          console.log('qr', response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    locationCheck();
    intervalRef.current = setInterval(locationCheck, 3000);
  }, [groupId, isLeader]);

  // 위치가 처음 잡히거나 변경될 때 폴링 시작
  useEffect(() => {
    if (latitude === 0 && longitude === 0) return;
    startPolling();
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [latitude, longitude]);

  // 카드가 변경되면 QR 재생성
  useEffect(() => {
    if (!isGPS) return;
    setBarcodeInfo(null);
    startPolling();
  }, [cardNumber]);

  const handlePayment = async () => {
    if (!barcodeInfo || !selectedCard) return;

    try {
      await onsiteBarcodePayment(
        barcodeInfo.barcodeNumber,
        selectedCard.cardId,
        pointUsage,
      );
      setBarcodeInfo(null);
      setIsGPS(false);
      Alert.alert('결제 성공');
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
      {/* QR + 포인트를 하나의 모듈 카드로 묶음 */}
      <View style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 20,
        alignItems: 'center',
        shadowColor: '#1428A0',
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}>
        {/* QR 코드 영역 */}
        {isGPS ? (
          selectedCard && barcodeInfo ? (
            <Pressable onPress={handlePayment}>
              <BarcodeQR
                cardId={selectedCard.cardId}
                qrData={barcodeInfo.qrData}
              />
            </Pressable>
          ) : (
            <View style={{ width: 210, height: 210, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          )
        ) : (
          <View style={{ width: 210, height: 210, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text style={{ fontFamily: 'GmarketSansTTFMedium', textAlign: 'center', marginTop: 8 }}>
              주변 모임원 찾는 중...
              {'\n'}
              위도:{latitude.toFixed(6) ?? '가져오는 중'}
              {'\n'}
              경도: {longitude.toFixed(6) ?? '가져오는 중'}
            </Text>
          </View>
        )}

        {/* 구분선 */}
        <View style={{ width: '100%', height: 1, backgroundColor: '#F0F4FF', marginVertical: 16 }} />

        {/* 포인트 영역 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFMedium' }}>보유 포인트</Text>
            <Text style={{ fontSize: 16, color: '#1428A0', fontFamily: 'GmarketSansTTFMedium' }}>{point}P</Text>
          </View>
          <PointToggleButton
            pointUsage={pointUsage}
            pointUsageFn={(usage: boolean) => setPointUsage(usage)}
          />
        </View>
      </View>

      {/* 카드 캐러셀 */}
      <View className="flex-1">
        <BarcodeCardRecommendation
          onSelectCard={setCardNumber}
          cardsInfo={cardsInfo}
        />
      </View>
    </View>
  );
}
