// src/screens/group/GroupInviteEntryScreen.tsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { acceptInvite } from '../../services/inviteService';
import { GroupStackParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type GroupInviteEntryRouteProp = RouteProp<
  GroupStackParamList,
  'GroupInviteEntry'
>;
type GroupInviteEntryNavigationProp = NativeStackNavigationProp<
  GroupStackParamList,
  'GroupInviteEntry'
>;

/**
 * 초대 딥링크로 진입했을 때 보여주는 화면.
 *
 * route.params로 inviteToken을 전달받습니다.
 * 딥링크 URL 예시: enco://invite?token=fb510545-...
 * → RootNavigator의 linking config에서 파싱하여
 *   GroupInviteEntry 화면에 { inviteToken } params로 전달됩니다.
 */
export default function GroupInviteEntryScreen() {
  const navigation = useNavigation<GroupInviteEntryNavigationProp>();
  const route = useRoute<GroupInviteEntryRouteProp>();
  const params = route.params ?? {};

  const inviteToken = params.inviteToken ?? '';
  const groupName = params.groupName ?? '모임';

  const [loading, setLoading] = useState(false);

  const onPressJoin = async () => {
    if (!inviteToken) {
      Alert.alert('오류', '유효하지 않은 초대 링크입니다.');
      return;
    }

    try {
      setLoading(true);

      // 초대 수락 API 호출
      const response = await acceptInvite(inviteToken);
      const { groupId, groupName: joinedGroupName } = response.result;

      // 성공 → 모임 정보와 함께 Decision 또는 Success 화면으로 이동
      navigation.navigate('GroupInviteSuccess', {
        groupId,
        groupName: joinedGroupName,
      });
    } catch (error: unknown) {
      console.error(
        '초대 수락 실패:',
        (error as { response?: { data?: unknown } })?.response?.data ??
          (error as { message?: string }).message,
      );
    } finally {
      setLoading(false);
    }
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

          <Pressable
            onPress={onPressJoin}
            disabled={loading}
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>가입하기</Text>
            )}
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
    marginBottom: 22,
  },
  groupName: {
    fontSize: 24,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
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
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
});
