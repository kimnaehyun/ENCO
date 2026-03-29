import { View, ActivityIndicator, PermissionsAndroid, Platform, Pressable, StyleSheet } from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import { useEffect, useRef, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { locationApi } from '@/services/payment/location';
import { useNavigation } from '@react-navigation/native';

export default function LocationVerification({ groupId }: { groupId: number }) {
  const [verified, setVerified] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [nearbyCount, setNearbyCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const navigation = useNavigation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let watchId: number;

    const startGPS = () => {
      Geolocation.getCurrentPosition(
        position => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        error => console.log(error),
        { enableHighAccuracy: true, timeout: 10000 },
      );

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
    if (verified) return;
    if (latitude === 0 && longitude === 0) return;

    const locationCheck = async () => {
      try {
        const response = await locationApi.check(groupId, latitude, longitude, false);
        const result = response.data?.result;
        if (result) {
          setNearbyCount(result.nearbyMemberCount);
          setTotalCount(result.totalMemberCount);
        }
        if (result?.barcode !== null) {
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
    <View style={styles.overlay}>
      <View style={styles.card}>
        {verified ? (
          <>
            <Text style={styles.title}>위치 인증 완료</Text>
            <Text style={styles.description}>현장 결제 인증이 완료되었습니다.</Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="#1428A0" style={styles.spinner} />
            <Text style={styles.title}>위치 인증 중...</Text>
            <Text style={styles.description}>현재 위치를 확인하고 있습니다.</Text>
            {nearbyCount !== null && totalCount !== null && (
              <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.primary, fontFamily: FONT_FAMILY.bold }}>
                {`현장 반경 15m 내 인원: ${nearbyCount} / ${totalCount}명`}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    shadowColor: '#1428A0',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  spinner: {
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    textAlign: 'center',
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.muted,
    textAlign: 'center',
  },
  confirmButton: {
    marginTop: 24,
    width: '100%',
    height: 46,
    borderRadius: 14,
    backgroundColor: '#1428A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: '#FFFFFF',
  },
});
