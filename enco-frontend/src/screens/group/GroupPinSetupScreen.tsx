import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import PinEntry from '../../components/pin/PinEntry';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { createGroup } from '../../services/authService';
import { getMyGroups } from '../../services/groupService';
import { useAuthStore } from '../../store/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupPinSetup'>;

export default function GroupPinSetupScreen({ route, navigation }: Props) {
  const { groupName, address, tags, selectedCardId } = route.params;
  const profile = useAuthStore(s => s.profile);
  const user = useAuthStore(s => s.user);

  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const resetPinEntry = () => setResetKey(k => k + 1);

  const handleComplete = async (pin: string) => {
    if (step === 'set') {
      setFirstPin(pin);
      setError('');
      setStep('confirm');
      resetPinEntry();
      return;
    }

    if (pin !== firstPin) {
      setError('비밀번호가 맞지 않아요');
      resetPinEntry();
      return;
    }

    setError('');

    // ── createGroup API 호출 ──
    setSubmitting(true);
    try {
      const payload = {
        name: profile?.name ?? user ?? '',
        groupName,
        groupCategory: tags,
        cardProductId: Number(selectedCardId),
        password: pin,
      };
      console.log(
        '[GroupPinSetup] POST /groups/account 요청:',
        JSON.stringify(payload, null, 2),
      );

      const res = await createGroup(payload);
      console.log(
        '[GroupPinSetup] POST /groups/account 응답:',
        JSON.stringify(res, null, 2),
      );

      const { groupId, groupName: resGroupName } = res.result;

      // 내 모임 목록 재조회 → role로 관리자 여부 확인
      const myGroups = await getMyGroups();
      const myGroup = myGroups.result.find(g => g.groupId === groupId);
      const isAdmin =
        myGroup?.role === 'ADMIN' ||
        myGroup?.role === 'LEADER' ||
        myGroup?.role === 'TREASURER';

      // 성공 → 홈 + 대시보드로 이동
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'App',
            state: {
              routes: [
                {
                  name: 'HomeTab',
                  state: {
                    routes: [
                      { name: 'Home' },
                      {
                        name: 'GroupDashboard',
                        params: {
                          groupId: String(groupId),
                          groupName: resGroupName,
                          isAdmin,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      });
    } catch (err: unknown) {
      console.warn('[GroupPinSetup] 모임통장 개설 실패:', err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? '모임통장 개설에 실패했습니다. 다시 시도해주세요.';
      Alert.alert('개설 실패', message);
      // PIN 재입력할 수 있도록 리셋
      setStep('set');
      setFirstPin(null);
      resetPinEntry();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {submitting ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>모임통장 개설 중...</Text>
          <Text style={styles.loadingSubtitle}>잠시만 기다려주세요</Text>
        </View>
      ) : (
        <PinEntry
          key={`${step}-${resetKey}`}
          title={
            error
              ? `비밀번호가 맞지 않아요\n다시 입력해주세요`
              : step === 'set'
                ? `결제 비밀번호를\n설정해주세요`
                : `비밀번호를\n한 번 더 입력해주세요`
          }
          resetKey={resetKey}
          onComplete={handleComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 18,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 12,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
});
