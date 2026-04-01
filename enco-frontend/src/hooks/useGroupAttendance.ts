// src/hooks/useGroupAttendance.ts
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { postAttend, getMyAttendance } from '../services/authService';

export type AttendanceEvent = {
  eventId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalDays: number;
  rewardPoint: number;
  targetMemberCount: number;
  currentMemberCount: number;
};

function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function stampsToDateNumbers(stamps: string[]): number[] {
  const today = new Date();
  const prefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  return stamps
    .filter(s => s.startsWith(prefix))
    .map(s => parseInt(s.split('-')[2], 10))
    .sort((a, b) => a - b);
}

export function useGroupAttendance(groupId?: string) {
  const todayDate = new Date().getDate();
  const numericGroupId = groupId ? Number(groupId) : NaN;

  const [stamps, setStamps] = useState<string[]>([]);
  const [attendedDates, setAttendedDates] = useState<number[]>([]);
  const [isAttending, setIsAttending] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalAttendanceInEvent, setTotalAttendanceInEvent] = useState(0);
  const [event, setEvent] = useState<AttendanceEvent | null>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(numericGroupId)) {
      console.log('[MyAttendance] groupId 없음 → 스킵');
      return;
    }
    console.log(
      '[MyAttendance] groupId:',
      numericGroupId,
      'refreshKey:',
      refreshKey,
    );
    setIsLoadingAttendance(true);
    setAttendanceError(null);
    getMyAttendance(numericGroupId)
      .then(res => {
        console.log('[MyAttendance] success:', res);
        console.log('[MyAttendance] event:', res.result.event);
        console.log(
          '[MyAttendance] rewardPoint:',
          res.result.event.rewardPoint,
        );
        console.log('[MyAttendance] streakDays:', res.result.streakDays);
        console.log(
          '[MyAttendance] totalAttendanceInEvent:',
          res.result.totalAttendanceInEvent,
        );
        console.log('[MyAttendance] stamps:', res.result.stamps);
        const converted = stampsToDateNumbers(res.result.stamps);
        const today = todayISODate();
        console.log('[MyAttendance] 오늘 날짜:', today);
        console.log(
          '[MyAttendance] 오늘 출석 여부:',
          res.result.stamps.includes(today),
        );
        console.log('[MyAttendance] 이번달 출석일 변환 결과:', converted);
        setStamps(res.result.stamps);
        setStreak(res.result.streakDays);
        setTotalAttendanceInEvent(res.result.totalAttendanceInEvent);
        setEvent(res.result.event);
        setAttendedDates(converted);
      })
      .catch(error => {
        console.error('[MyAttendance] failed:', error);
        console.error('[MyAttendance] status:', error?.response?.status);
        console.error('[MyAttendance] data:', error?.response?.data);
        setAttendanceError('출석 정보를 불러오지 못했습니다.');
      })
      .finally(() => {
        setIsLoadingAttendance(false);
      });
  }, [numericGroupId, refreshKey]);

  const alreadyAttendedToday = stamps.includes(todayISODate());
  const hasActiveEvent = event !== null;

  const onPressAttend = async () => {
    console.log('[Attend] 출석 버튼 클릭');
    console.log('[Attend] groupId:', numericGroupId);
    console.log('[Attend] alreadyAttendedToday:', alreadyAttendedToday);
    console.log('[Attend] isAttending:', isAttending);

    if (alreadyAttendedToday || isAttending) {
      console.log('[Attend] 중복 방지로 요청 취소');
      return;
    }

    if (!Number.isFinite(numericGroupId)) {
      console.error('[Attend] 유효하지 않은 groupId:', groupId);
      Alert.alert('오류', '유효하지 않은 모임 ID입니다.');
      return;
    }

    console.log('[Attend] submit start → groupId:', numericGroupId);
    setIsAttending(true);
    try {
      const res = await postAttend(numericGroupId);
      console.log('[Attend] success:', res);
      console.log('[Attend] attendanceId:', res.result.attendanceId);
      console.log('[Attend] attendedAt:', res.result.attendedAt);
      console.log('[Attend] streakDays:', res.result.streakDays);
      console.log(
        '[Attend] totalAttendanceInEvent:',
        res.result.totalAttendanceInEvent,
      );
      console.log('[Attend] isRewardGranted:', res.result.isRewardGranted);

      const rewardLine = res.result.isRewardGranted
        ? '\n오늘 리워드가 지급되었어요!'
        : '';
      Alert.alert(
        '출석 완료',
        `연속 출석 ${res.result.streakDays}일\n이번 출석 이벤트 ${res.result.totalAttendanceInEvent}회 참여${rewardLine}`,
      );
      // 서버 최신 데이터 전체 재조회 (currentMemberCount 등 포함)
      setRefreshKey(prev => prev + 1);
    } catch (error: unknown) {
      const errorCode = (error as { response?: { data?: { code?: string } } })
        ?.response?.data?.code;
      if (errorCode === 'NO_ACTIVE_EVENT') {
        console.log('[Attend] NO_ACTIVE_EVENT → 활성 이벤트 없음');
        Alert.alert('출석 불가', '현재 진행 중인 출석 이벤트가 없습니다.');
      } else {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? '출석 처리 중 오류가 발생했습니다.';
        Alert.alert('출석 실패', message);
      }
    } finally {
      setIsAttending(false);
    }
  };

  const refresh = useCallback(() => setRefreshKey(prev => prev + 1), []);

  return {
    attendedDates,
    isAttending,
    streak,
    alreadyAttendedToday,
    onPressAttend,
    event,
    isLoadingAttendance,
    attendanceError,
    totalAttendanceInEvent,
    hasActiveEvent,
    refresh,
  };
}
