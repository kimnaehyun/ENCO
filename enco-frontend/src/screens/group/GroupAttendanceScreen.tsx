import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import { useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { useGroupAttendance } from '../../hooks/useGroupAttendance';
import AttendanceHeroCard from '../../components/attendance/AttendanceHeroCard';

type CalendarCell = {
  key: string;
  day: number | null;
  isToday: boolean;
  isAttended: boolean;
};

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const DAILY_REWARD = 100;


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

  const {
    attendedDates,
    isAttending,
    streak,
    alreadyAttendedToday,
    onPressAttend,
    event,
    totalAttendanceInEvent,
    hasActiveEvent,
    isLoadingAttendance,
    attendanceError,
  } = useGroupAttendance(params.groupId);

  useEffect(() => {
    console.log('[AttendanceScreen] 화면 마운트');
    console.log('[AttendanceScreen] groupId:', params.groupId);
    console.log('[AttendanceScreen] groupName:', groupName);
  }, []);

  const totalMembers = event?.targetMemberCount ?? 0;
  const todayAttendedCount = event?.currentMemberCount ?? 0;
  const voteParticipationRatio = totalMembers > 0 ? todayAttendedCount / totalMembers : 0;
  const rewardUnlocked = voteParticipationRatio >= rewardThreshold;
  const requiredVoteCount = Math.ceil(totalMembers * rewardThreshold);

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

        {isLoadingAttendance && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#1428A0" />
            <Text style={styles.loadingText}>출석 정보를 불러오는 중...</Text>
          </View>
        )}

        {!isLoadingAttendance && attendanceError && (
          <View style={styles.errorRow}>
            <Text style={styles.errorText}>{attendanceError}</Text>
          </View>
        )}

        {!isLoadingAttendance && event && (
          <View style={styles.eventInfoCard}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventDesc}>{event.description}</Text>
            <Text style={styles.eventPeriod}>
              {event.startDate} ~ {event.endDate}
            </Text>
          </View>
        )}

        <AttendanceHeroCard
          hasActiveEvent={hasActiveEvent}
          isLoadFailed={!!attendanceError}
          alreadyAttendedToday={alreadyAttendedToday}
          isAttending={isAttending}
          onPressAttend={onPressAttend}
        />

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardLeft]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{streak}일</Text>
            <Text style={styles.statLabel}>연속 출석</Text>
          </View>

          <View style={[styles.statCard, styles.statCardRight]}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={styles.statValue}>{totalAttendanceInEvent}회</Text>
            <Text style={styles.statLabel}>이번 모임 출석</Text>
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
              오늘 투표 참여 {todayAttendedCount}/{totalMembers}명
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
              {requiredVoteCount - todayAttendedCount}명만 더 투표하면 오늘 보상을 받을 수 있어요.
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

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },

  errorRow: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
  },

  eventInfoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  eventName: {
    fontSize: 15,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 6,
    lineHeight: 18,
  },
  eventPeriod: {
    fontSize: 12,
    color: '#6366F1',
    fontFamily: FONT_FAMILY.bold,
  },
});