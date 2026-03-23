import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import { CommonActions, useNavigation } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';

export default function GroupInviteSuccessScreen() {
  const navigation = useNavigation<any>();
  const groupName = '모임명';

  const onPressConfirm = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'GroupDashboard',
            params: {
              groupId: 'G1',
              groupName,
            },
          },
        ],
      })
    );
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image
            source={require('../../assets/icons/complete_hamco.png')}
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.groupName}>[{groupName}]</Text>
          <Text style={styles.title}>가입완료!</Text>


          <Pressable onPress={onPressConfirm} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>모임홈으로</Text>
          </Pressable>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#F0F4FF',
    borderRadius: 26,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    minHeight: 610,
    justifyContent: 'center',
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    lineHeight: 34,
    marginBottom: 26,
  },
  groupName: {
    marginTop: 12,
    marginBottom: 2,
    fontSize: 24,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
    lineHeight: 30,
  },
  primaryButton: {
    minWidth: 246,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#1428A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 24,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
});