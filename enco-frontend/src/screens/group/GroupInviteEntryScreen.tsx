import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenLayout from '../../components/ScreenLayout';

export default function GroupInviteEntryScreen() {
  const groupName = '모임명';

  const onPressJoin = () => {
    // TODO: 다음 단계에서 가입 수락 화면으로 연결
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image
            source={require('../../assets/icons/invite_hamco.png')}
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.groupName}>[{groupName}]</Text>
          <Text style={styles.title}>초대받았어요</Text>

          <Pressable onPress={onPressJoin} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>가입하기</Text>
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
    backgroundColor: '#F3F3F3',
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
    marginBottom: 22,
  },
  groupName: {
    fontSize: 24,
    color: '#1428A0',
    fontFamily: 'GmarketSansTTFBold',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    color: '#111111',
    fontFamily: 'GmarketSansTTFBold',
    marginBottom: 26,
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
    color: '#FFFFFF',
    fontFamily: 'GmarketSansTTFBold',
  },
});