// src/components/attendance/AttendanceDashboardCard.tsx
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';

type Props = {
  alreadyAttendedToday: boolean;
  attendedCount: number;
  totalMembers: number;
  rewardThreshold: number;
  height: number;
  onPress: () => void;
};

export default function AttendanceDashboardCard({
  alreadyAttendedToday,
  attendedCount,
  totalMembers,
  rewardThreshold,
  height,
  onPress,
}: Props) {
  const attendanceRatio = totalMembers > 0 ? attendedCount / totalMembers : 0;
  const requiredCount = Math.ceil(totalMembers * rewardThreshold);

  const mood = useMemo(() => {
    if (alreadyAttendedToday) {
      return {
        title: '오늘 출석 완료!',
        subtitle: '좋은 하루 보내세요',
        accent: '#22C55E',
        imageSource: require('../../assets/icons/welcom_hamco.png'),
      };
    }
    if (attendanceRatio === 0) {
      return {
        title: '아직 아무도 출석하지 않았어요',
        subtitle: '첫 출석을 시작해보세요',
        accent: '#EF4444',
        imageSource: require('../../assets/icons/sad_hamco.png'),
      };
    }
    if (attendanceRatio < rewardThreshold) {
      return {
        title: '조금만 더 출석하면 목표 달성!',
        subtitle: `${requiredCount - attendedCount}명만 더 출석하면 돼요`,
        accent: '#1428A0',
        imageSource: require('../../assets/icons/run_hamco.png'),
      };
    }
    return {
      title: '오늘 출석 목표 달성!',
      subtitle: '모임 분위기가 아주 좋아요',
      accent: '#22C55E',
      imageSource: require('../../assets/icons/welcom_hamco.png'),
    };
  }, [alreadyAttendedToday, attendanceRatio, rewardThreshold, attendedCount, requiredCount]);

  return (
    <Pressable onPress={onPress} style={[styles.card, { minHeight: height }]}>
      <View style={styles.header}>
        <Text style={styles.title}>오늘의 출석 체크</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            출석률 {Math.round(attendanceRatio * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.inner}>
        <Image
          source={mood.imageSource}
          style={styles.moodImage}
          resizeMode="contain"
        />
        <Text style={styles.moodTitle}>{mood.title}</Text>
        <Text style={styles.moodSubtitle}>{mood.subtitle}</Text>

        <View style={styles.progressWrap}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(attendanceRatio * 100, 100)}%`,
                  backgroundColor: mood.accent,
                },
              ]}
            />
          </View>
        </View>

        <Text style={styles.membersText}>
          {attendedCount} / {totalMembers}명 출석
        </Text>

        <Text
          style={[
            styles.rewardText,
            { color: attendanceRatio >= rewardThreshold ? '#22C55E' : '#6B7280' },
          ]}
        >
          {attendanceRatio >= rewardThreshold
            ? '오늘 보상 목표 달성!'
            : `${requiredCount}명 목표까지 ${requiredCount - attendedCount}명 남음`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
  },
  badge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.bold,
    color: '#1428A0',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodImage: {
    width: 88,
    height: 88,
    marginBottom: 12,
  },
  moodTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  moodSubtitle: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  progressWrap: {
    width: '80%',
    marginBottom: 10,
  },
  progressBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  membersText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.muted,
    marginBottom: 6,
  },
  rewardText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
  },
});
