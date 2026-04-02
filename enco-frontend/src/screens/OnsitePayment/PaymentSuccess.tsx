import { View, BackHandler, StyleSheet, Pressable } from 'react-native';
import React, { useEffect } from 'react';
import {
  CommonActions,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import ScreenLayout from '@/components/ScreenLayout';
import { RootStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type PaymentSuccessNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PaymentSuccess'
>;
type PaymentSuccessRouteProp = RouteProp<RootStackParamList, 'PaymentSuccess'>;

export default function PaymentSuccess() {
  const navigation = useNavigation<PaymentSuccessNavigationProp>();
  const route = useRoute<PaymentSuccessRouteProp>();
  const { storeName, amount } = route.params;

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'App' }],
      }),
    );
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goHome();
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  return (
    <ScreenLayout>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>결제 완료</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>매장</Text>
            <Text style={styles.infoValue}>{storeName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>결제 금액</Text>
            <Text style={styles.infoValueBold}>
              {Number(amount).toLocaleString()}원
            </Text>
          </View>

          <Pressable onPress={goHome} style={styles.confirmButton}>
            <Text style={styles.confirmText}>홈으로</Text>
          </Pressable>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
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
  title: {
    fontSize: 22,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F0F4FF',
    marginVertical: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.muted,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.dark,
  },
  infoValueBold: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: '#1428A0',
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
