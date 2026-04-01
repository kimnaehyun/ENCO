import {
  View,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from 'node_modules/@react-navigation/native-stack/lib/typescript/src/types';

export default function index() {
  const route = useRoute();
  const { groupId, isLeader } = route.params as {
    groupId: number;
    isLeader: boolean;
  };
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cardNumber, setCardNumber] = useState<number>(0);
  const [isGPS, setIsGPS] = useState<boolean>(false);

  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const [cardsInfo, setCardsInfo] = useState<
    { image: string; cardId: string | number }[]
  >([]);
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

  const [memberCount, setMemberCount] = useState<{
    nearby: number;
    total: number;
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
        const result = response.data?.result;
        if (result) {
          setMemberCount({
            nearby: result.nearbyMemberCount,
            total: result.totalMemberCount,
          });
        }
        if (result?.barcode !== null) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsGPS(true);
          setBarcodeInfo(result.barcode);
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
      // 실제 결제 금액/매장명 입력값 (임시: 하드코딩)
      const amount = 149000; // TODO: 실제 결제 금액 입력값으로 대체
      const merchantName = '아웃백 스테이크하우스 명지 스타필드점'; // TODO: 실제 매장명 입력값으로 대체
      await onsiteBarcodePayment(
        barcodeInfo.barcodeNumber,
        Number(selectedCard.cardId),
        pointUsage,
        amount,
        merchantName,
      );
      // 결제 완료 시 스택을 PaymentSuccess만 남기고 리셋
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'PaymentSuccess',
            params: { storeName: merchantName, amount },
          },
        ],
      });
    } catch (error: unknown) {
      const errorMessage = (
        error as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      console.log(errorMessage);
      Alert.alert('결제 실패', errorMessage ?? '알 수 없는 오류');
    }
  };

  return (
    <View className="flex-1 gap-3">
      {/* QR + 포인트를 하나의 모듈 카드로 묶음 */}
      <View
        style={{
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
        }}
      >
        {/* QR 코드 영역 */}
        {isGPS ? (
          selectedCard && barcodeInfo ? (
            <Pressable onPress={handlePayment}>
              <BarcodeQR
                cardId={Number(selectedCard.cardId)}
                qrData={barcodeInfo.qrData}
              />
            </Pressable>
          ) : (
            <View
              style={{
                width: 210,
                height: 210,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          )
        ) : (
          <View
            style={{
              width: 210,
              height: 210,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" />
            <Text
              style={{
                fontFamily: 'GmarketSansTTFMedium',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              주변 모임원 찾는 중...
            </Text>
            {memberCount && (
              <Text
                style={{
                  fontFamily: 'GmarketSansTTFMedium',
                  textAlign: 'center',
                  marginTop: 4,
                  color: '#1428A0',
                  fontSize: 16,
                }}
              >
                {memberCount.nearby} / {memberCount.total}명
              </Text>
            )}
          </View>
        )}

        {/* 구분선 */}
        <View
          style={{
            width: '100%',
            height: 1,
            backgroundColor: '#F0F4FF',
            marginVertical: 16,
          }}
        />

        {/* 포인트 영역 */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFMedium' }}>
              보유 포인트
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#1428A0',
                fontFamily: 'GmarketSansTTFMedium',
              }}
            >
              {point}P
            </Text>
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
