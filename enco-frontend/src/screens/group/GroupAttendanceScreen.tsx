import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

export default function GroupAttendanceScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const groupName = params.groupName ?? '모임명';

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayDate = today.getDate();

  const [attendedDates, setAttendedDates] = useState<number[]>([2, 4, 7, 10]);

  const alreadyAttendedToday = attendedDates.includes(todayDate);

  const calendarCells = useMemo<CalendarCell[]>(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells: CalendarCell[] = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push({
        key: `empty-${i}`,
        day: null,
        isToday: false,
        isAttended: false,
      });
    }

    for (let day = 1; day <= lastDate; day += 1) {
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>출석 체크</Text>
          <Text style={styles.headerSub}>{groupName}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            오늘 출석 {alreadyAttendedToday ? '완료' : '가능'}
          </Text>
          <Text style={styles.summaryDesc}>
            하루에 한 번만 출석할 수 있어요.
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
              {alreadyAttendedToday ? '오늘 출석 완료' : '출석하기'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>
            {currentYear}년 {currentMonth + 1}월
          </Text>

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
                      cell.isToday && styles.todayCell,
                      cell.isAttended && styles.attendedCell,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        cell.isToday && styles.todayText,
                        cell.isAttended && styles.attendedText,
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
              <View style={[styles.legendDot, { backgroundColor: '#1428A0' }]} />
              <Text style={styles.legendText}>오늘</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#818CF8' }]} />
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
    fontSize: 20,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },
  headerSub: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
  },
  summaryDesc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
  },
  attendButton: {
    marginTop: 18,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#1428A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendButtonDisabled: {
    opacity: 0.5,
  },
  attendButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'GmarketSansTTFBold',
  },

  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  calendarTitle: {
    fontSize: 18,
    color: '#111827',
    fontFamily: 'GmarketSansTTFBold',
    marginBottom: 16,
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
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    marginBottom: 10,
  },
  dayInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'GmarketSansTTFMedium',
  },

  todayCell: {
    backgroundColor: '#1428A0',
  },
  todayText: {
    color: '#FFFFFF',
    fontFamily: 'GmarketSansTTFBold',
  },

  attendedCell: {
    backgroundColor: '#818CF8',
  },
  attendedText: {
    color: '#FFFFFF',
    fontFamily: 'GmarketSansTTFBold',
  },

  legendRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 16,
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
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'GmarketSansTTFMedium',
  },
});