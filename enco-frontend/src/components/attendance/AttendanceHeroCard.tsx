// src/components/attendance/AttendanceHeroCard.tsx
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';

type Props = {
  hasActiveEvent: boolean;
  isLoadFailed: boolean;
  alreadyAttendedToday: boolean;
  isAttending: boolean;
  onPressAttend: () => void;
};

export default function AttendanceHeroCard({
  hasActiveEvent,
  isLoadFailed,
  alreadyAttendedToday,
  isAttending,
  onPressAttend,
}: Props) {
  // GET 실패 → 버튼은 보이되 비활성화 (이벤트 부재와 구분)
  if (isLoadFailed) {
    return (
      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>⚠️</Text>
        <Text style={styles.heroTitle}>출석 정보를 불러오지 못했어요</Text>
        <Text style={styles.heroDesc}>잠시 후 다시 시도해주세요.</Text>
        <Pressable
          disabled
          style={[styles.attendButton, styles.attendButtonDisabled]}
        >
          <Text style={styles.attendButtonText}>출석하기</Text>
        </Pressable>
      </View>
    );
  }

  // 이벤트 자체가 없는 경우 → 버튼 없음
  if (!hasActiveEvent) {
    return (
      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>📭</Text>
        <Text style={styles.heroTitle}>진행 중인 출석 이벤트가 없어요</Text>
        <Text style={styles.heroDesc}>
          출석 이벤트가 시작되면 여기서 출석할 수 있어요.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroEmoji}>{alreadyAttendedToday ? '🎉' : '🌞'}</Text>
      <Text style={styles.heroTitle}>
        {alreadyAttendedToday ? '오늘도 출석 완료!' : '오늘도 출석하고'}
      </Text>
      <Text style={styles.heroTitle}>
        {alreadyAttendedToday ? '좋은 하루 보내세요' : '모임에 활력을 더해보세요'}
      </Text>
      <Text style={styles.heroDesc}>
        하루 한 번 출석하고 달력에 흔적을 남겨보세요.
      </Text>

      <Pressable
        onPress={onPressAttend}
        disabled={alreadyAttendedToday || isAttending}
        style={[
          styles.attendButton,
          (alreadyAttendedToday || isAttending) && styles.attendButtonDisabled,
        ]}
      >
        <Text style={styles.attendButtonText}>
          {alreadyAttendedToday
            ? '오늘 출석 완료 ✅'
            : isAttending
            ? '출석 중...'
            : '출석하기'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#1428A0',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
    marginBottom: 14,
  },
  heroEmoji: {
    fontSize: 34,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 20,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
    lineHeight: 30,
    textAlign: 'center',
  },
  heroDesc: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
    lineHeight: 20,
  },
  attendButton: {
    marginTop: 18,
    height: 54,
    minWidth: 180,
    borderRadius: 20,
    backgroundColor: '#1428A0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  attendButtonDisabled: {
    opacity: 0.5,
  },
  attendButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
});
