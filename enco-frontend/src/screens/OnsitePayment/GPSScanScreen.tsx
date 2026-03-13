import { useEffect, useState } from 'react';
import {
  View,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Button,
} from 'react-native';
import { Text } from 'react-native-gesture-handler';
import Geolocation from 'react-native-geolocation-service';

type Location = {
  latitude: number;
  longitude: number;
};

export default function GPSScanScreen({ navigation }: any) {
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
    <View className="flex-1 items-center justify-center">
      {currentLocation ? (
        <View>
          <Text className="text-xl">
            {currentLocation.latitude} / {currentLocation.longitude}
          </Text>
          <Button
            title="결제 방법 선택 페이지로"
            onPress={() => navigation.navigate('PaymentMethod')}
          />
        </View>
      ) : (
        <View>
          <ActivityIndicator size="large" />
          <Text className="text-xl">위치 찾는 중...</Text>
        </View>
      )}
    </View>
  );
}
