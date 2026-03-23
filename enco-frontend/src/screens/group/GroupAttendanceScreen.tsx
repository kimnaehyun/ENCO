import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import { useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';

type CalendarCell = {
  key: string;
  day: number | null;
  isToday: boolean;
  isAttended: boolean;
};

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const DAILY_REWARD = 100;

// TODO: 백엔드 연동 후 실제 모임원 수 / 오늘 투표 참여 인원 / 출석 데이터로 교체
const TOTAL_MEMBERS = 10;
const TODAY_VOTED_COUNT = 6;
const BASE_GROUP_BALANCE = 1200;

function calcStreak(dates: number[], today: number): number {
  let streak = 0;
  for (let d = today; d >= 1; d--) {
    if (dates.includes(d)) streak++;
    else break;
  }
  return streak;
}

function ProgressBar({
  ratio,
  threshold,
}: {
  ratio: number;
  threshold: number;
}) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${Math.min(ratio * 100, 100)}%`,
            backgroundColor: ratio >= threshold ? '#22C55E' : '#1428A0',
          },
        ]}
      />
      <View
        style={[
          styles.thresholdMarker,
          { left: `${Math.min(threshold * 100, 100)}%` },
        ]}
      />
    </View>
  );
}

export default function GroupAttendanceScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const groupName = params.groupName ?? '모임명';

  // TODO: 백엔드에서 받아올 목표 투표 비율
  const rewardThreshold: number = (params as any).rewardThreshold ?? 0.6;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayDate = today.getDate();

  // TODO: 백엔드 연동 후 실제 출석 데이터로 교체
  const [attendedDates, setAttendedDates] = useState<number[]>([2, 4, 7, 10]);

  const alreadyAttendedToday = attendedDates.includes(todayDate);
  const streak = calcStreak(attendedDates, todayDate);

  const voteParticipationRatio = TODAY_VOTED_COUNT / TOTAL_MEMBERS;
  const rewardUnlocked = voteParticipationRatio >= rewardThreshold;
  const requiredVoteCount = Math.ceil(TOTAL_MEMBERS * rewardThreshold);
  const currentGroupBalance = BASE_GROUP_BALANCE + (rewardUnlocked ? DAILY_REWARD : 0);

  const calendarCells = useMemo<CalendarCell[]>(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells: CalendarCell[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({
        key: `empty-${i}`,
        day: null,
        isToday: false,
        isAttended: false,
      });
    }

    for (let day = 1; day <= lastDate; day++) {
      cells.push({
        key: `day-${day}`,
        day,
        isToday: day === todayDate,
        isAttended: attendedDates.includes(day),
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({
        key: `tail-${cells.length}`,
        day: null,
        isToday: false,
        isAttended: false,
      });
    }

    return cells;
  }, [attendedDates, currentMonth, currentYear, todayDate]);

  const onPressAttend = () => {
    if (alreadyAttendedToday) return;
    setAttendedDates(prev => [...prev, todayDate].sort((a, b) => a - b));
  };

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>출석 체크</Text>
          <Text style={styles.headerSub}>{groupName}</Text>
        </View>

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
            disabled={alreadyAttendedToday}
            style={[
              styles.attendButton,
              alreadyAttendedToday && styles.attendButtonDisabled,
            ]}
          >
            <Text style={styles.attendButtonText}>
              {alreadyAttendedToday ? '오늘 출석 완료 ✅' : '출석하기'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardLeft]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{streak}일</Text>
            <Text style={styles.statLabel}>연속 출석</Text>
          </View>

          <View style={[styles.statCard, styles.statCardRight]}>
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={styles.statValue}>{currentGroupBalance}원</Text>
            <Text style={styles.statLabel}>모임통장</Text>
          </View>
        </View>

        <View style={styles.rewardCard}>
          <View style={styles.rewardTopRow}>
            <View style={styles.rewardFlexChild}>
              <Text style={styles.rewardTitle}>🗳️ 오늘의 투표 미션</Text>
              <Text style={styles.rewardDesc}>
                모임원 <Text style={styles.highlight}>{requiredVoteCount}명</Text> 이상이
                투표하면 모임통장에{' '}
                <Text style={styles.highlight}>하루 100원</Text>이 적립돼요.
              </Text>
            </View>

            <View
              style={[
                styles.rewardBadge,
                rewardUnlocked && styles.rewardBadgeUnlocked,
              ]}
            >
              <Text style={styles.rewardBadgeText}>
                {rewardUnlocked ? '달성!' : `+${DAILY_REWARD}원`}
              </Text>
            </View>
          </View>

          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>
              오늘 투표 참여 {TODAY_VOTED_COUNT}/{TOTAL_MEMBERS}명
            </Text>
            <Text
              style={[
                styles.progressPercent,
                rewardUnlocked && styles.progressPercentDone,
              ]}
            >
              {Math.round(voteParticipationRatio * 100)}%
            </Text>
          </View>

          <ProgressBar ratio={voteParticipationRatio} threshold={rewardThreshold} />

          {rewardUnlocked ? (
            <Text style={styles.rewardSuccessText}>
              오늘 목표를 달성해서 모임통장에 +{DAILY_REWARD}원 적립됐어요!
            </Text>
          ) : (
            <Text style={styles.rewardHintText}>
              {requiredVoteCount - TODAY_VOTED_COUNT}명만 더 투표하면 오늘 보상을 받을 수 있어요.
            </Text>
          )}
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeaderRow}>
            <Text style={styles.calendarTitle}>
              {currentYear}년 {currentMonth + 1}월
            </Text>
            <Text style={styles.calendarSummary}>
              이번 달 <Text style={styles.calendarSummaryStrong}>{attendedDates.length}일</Text> 출석
            </Text>
          </View>

          <View style={styles.weekRow}>
            {WEEK_LABELS.map(label => (
              <View key={label} style={styles.weekCell}>
                <Text style={styles.weekText}>{label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {calendarCells.map(cell => (
              <View key={cell.key} style={styles.dayCell}>
                {cell.day ? (
                  <View
                    style={[
                      styles.dayInner,
                      cell.isAttended && styles.attendedCell,
                      cell.isToday && styles.todayCell,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        cell.isAttended && styles.attendedText,
                        cell.isToday && styles.todayText,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.dayInner} />
                )}
              </View>
            ))}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotToday]} />
              <Text style={styles.legendText}>오늘</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotAttended]} />
              <Text style={styles.legendText}>출석 완료</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 22,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  headerSub: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },

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

  statsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#1428A0',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
  },

  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: '#1428A0',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
    marginBottom: 14,
  },
  rewardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  rewardTitle: {
    fontSize: 16,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 6,
  },
  rewardDesc: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    lineHeight: 20,
  },
  highlight: {
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
  },
  rewardBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  rewardBadgeUnlocked: {
    backgroundColor: '#DCFCE7',
  },
  rewardBadgeText: {
    fontSize: 13,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
  },

  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
  },
  progressPercent: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.bold,
  },
  progressPercentDone: {
    color: COLORS.success,
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  thresholdMarker: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginLeft: -1,
  },
  rewardSuccessText: {
    fontSize: 13,
    color: COLORS.success,
    fontFamily: FONT_FAMILY.bold,
    marginTop: 2,
  },
  rewardHintText: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    marginTop: 2,
  },

  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 22,
    shadowColor: '#1428A0',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 17,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  calendarSummary: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  calendarSummaryStrong: {
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
  },
  weekText: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    marginBottom: 8,
  },
  dayInner: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },
  todayCell: {
    backgroundColor: '#1428A0',
  },
  todayText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  attendedCell: {
    backgroundColor: '#818CF8',
  },
  attendedText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },

  legendRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendDotToday: {
    backgroundColor: '#1428A0',
  },
  legendDotAttended: {
    backgroundColor: '#818CF8',
  },
  legendText: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
  },

  scrollContent: {
    paddingBottom: 40,
  },
  statCardLeft: {
    flex: 1,
    marginRight: 8,
  },
  statCardRight: {
    flex: 1,
    marginLeft: 8,
  },
  rewardFlexChild: {
    flex: 1,
  },
});