// src/screens/group/GroupLedgerScreen.tsx
import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { LedgerItem } from '../../types/group';

// ─── helpers ───
function formatMoney(n: number) {
  const sign = n >= 0 ? '+' : '-';
  return `${sign}${Math.abs(n).toLocaleString()}원`;
}
function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function fmtDate(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function addMonths(d: Date, n: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}
function shortDate(dateStr: string) {
  const parts = dateStr.split('-');
  return `${parseInt(parts[1])}.${parseInt(parts[2])}`;
}

// ─── 달력 모달 ───
function CalendarModal({ selected, onSelect, onClose, title }: {
  selected: Date | null; onSelect: (d: Date) => void; onClose: () => void; title: string;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const weeks: number[][] = [];
  let day = 1;
  let nextDay = 1;
  for (let w = 0; w < 6; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      if (w === 0 && d < firstDay) week.push(-(prevMonthDays - firstDay + d + 1));
      else if (day > daysInMonth) { week.push(-(100 + nextDay)); nextDay++; }
      else { week.push(day); day++; }
    }
    weeks.push(week);
    if (day > daysInMonth && w >= 4) break;
  }

  const goMonth = (dir: number) => {
    let m = viewMonth + dir, y = viewYear;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setViewMonth(m); setViewYear(y);
  };

  const isSelected = (d: number) => {
    if (!selected || d <= 0) return false;
    return selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === d;
  };

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }} onPress={onClose}>
        <Pressable onPress={() => {}} style={{ width: '88%', backgroundColor: '#fff', borderRadius: 24, padding: 20 }}>
          <Text style={{ fontSize: 15, fontFamily: 'GmarketSansTTFBold', color: '#111827', textAlign: 'center', marginBottom: 16 }}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
            <Pressable onPress={() => goMonth(-1)} hitSlop={12}><Text style={{ fontSize: 20, color: '#374151' }}>{'<'}</Text></Pressable>
            <Text style={{ fontSize: 16, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>{viewYear}년 {viewMonth + 1}월</Text>
            <Pressable onPress={() => goMonth(1)} hitSlop={12}><Text style={{ fontSize: 20, color: '#374151' }}>{'>'}</Text></Pressable>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {dayNames.map((dn, i) => (
              <View key={dn} style={{ flex: 1, alignItems: 'center', paddingBottom: 8 }}>
                <Text style={{ fontSize: 12, fontFamily: 'GmarketSansTTFMedium', color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : '#9CA3AF' }}>{dn}</Text>
              </View>
            ))}
          </View>
          {weeks.map((week, wi) => (
            <View key={wi} style={{ flexDirection: 'row' }}>
              {week.map((d, di) => {
                const other = d <= 0;
                const display = other ? (d > -100 ? Math.abs(d) : Math.abs(d) - 100) : d;
                const sel = !other && isSelected(d);
                return (
                  <Pressable key={di} onPress={() => { if (!other) { onSelect(new Date(viewYear, viewMonth, d)); onClose(); } }}
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: sel ? 1.5 : 0, borderColor: '#1428A0' }}>
                      <Text style={{ fontSize: 14, fontFamily: 'GmarketSansTTFMedium', color: other ? '#D1D5DB' : sel ? '#1428A0' : '#374151' }}>{display || ''}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── 타입 ───
type PeriodPreset = '1m' | '3m' | 'custom';
type SortOrder = 'latest' | 'oldest';
type TxFilter = 'all' | 'deposit' | 'withdraw';

export default function GroupLedgerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const groupName = params.groupName ?? '모임명';
  const isAdmin = !!params.isAdmin;

  // ── mock 데이터 ──
  const items: LedgerItem[] = useMemo(() => [
    { id: 'l1', date: '2026-03-09', amount: +10, title: '모임원출석', memo: '김채아', hasReceipt: false, needsSettle: false, isSettled: true, settleMembers: [] },
    { id: 'l2', date: '2026-03-08', amount: +10000, title: '김싸피 모임비 납입', memo: '', hasReceipt: false, needsSettle: false, isSettled: true, settleMembers: [] },
    { id: 'l3', date: '2026-03-08', amount: +10000, title: '이싸피 모임비 납입', memo: '', hasReceipt: false, needsSettle: false, isSettled: true, settleMembers: [] },
    { id: 'l4', date: '2026-03-07', amount: +10000, title: '최싸피 모임비 납입', memo: '', hasReceipt: false, needsSettle: false, isSettled: true, settleMembers: [] },
    { id: 'l5', date: '2026-03-05', amount: -50000, title: '3월 정기모임', memo: '', hasReceipt: true, needsSettle: true, isSettled: false,
      settleMembers: [
        { id: 'm1', name: '김싸피', isPaid: true }, { id: 'm2', name: '고싸피', isPaid: false },
        { id: 'm3', name: '장싸피', isPaid: true }, { id: 'm4', name: '정싸피', isPaid: false },
      ],
    },
  ], []);

  const balance = 854440;
  const paidAmount = 854000;
  const pointAmount = 443;

  // ── 필터 상태 ──
  const today = useMemo(() => new Date(), []);
  const [filterVisible, setFilterVisible] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'start' | 'end' | null>(null);

  // 바텀시트 내 임시 상태 (조회 누르기 전)
  const [tmpPreset, setTmpPreset] = useState<PeriodPreset>('1m');
  const [tmpStart, setTmpStart] = useState<Date>(addMonths(today, -1));
  const [tmpEnd, setTmpEnd] = useState<Date>(today);
  const [tmpSort, setTmpSort] = useState<SortOrder>('latest');
  const [tmpTx, setTmpTx] = useState<TxFilter>('all');

  // 적용된 필터 (조회 누른 후)
  const [appliedFilter, setAppliedFilter] = useState<{
    start: Date; end: Date; sort: SortOrder; tx: TxFilter;
  } | null>(null);

  const handlePreset = (preset: PeriodPreset) => {
    setTmpPreset(preset);
    if (preset === '1m') { setTmpStart(addMonths(today, -1)); setTmpEnd(today); }
    else if (preset === '3m') { setTmpStart(addMonths(today, -3)); setTmpEnd(today); }
  };

  const handleQuery = () => {
    setAppliedFilter({ start: tmpStart, end: tmpEnd, sort: tmpSort, tx: tmpTx });
    setFilterVisible(false);
  };

  const clearFilter = () => {
    setAppliedFilter(null);
    setTmpPreset('1m');
    setTmpStart(addMonths(today, -1));
    setTmpEnd(today);
    setTmpSort('latest');
    setTmpTx('all');
  };

  // ── 필터 적용된 아이템 ──
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (appliedFilter) {
      const startStr = fmtDate(appliedFilter.start);
      const endStr = fmtDate(appliedFilter.end);
      result = result.filter(it => it.date >= startStr && it.date <= endStr);

      if (appliedFilter.tx === 'deposit') result = result.filter(it => it.amount >= 0);
      else if (appliedFilter.tx === 'withdraw') result = result.filter(it => it.amount < 0);

      result.sort((a, b) =>
        appliedFilter.sort === 'latest' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
      );
    } else {
      result.sort((a, b) => b.date.localeCompare(a.date));
    }

    return result;
  }, [items, appliedFilter]);

  // 누적 잔액
  const runningBalances = useMemo(() => {
    const result: Record<string, number> = {};
    let running = balance;
    const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
    sorted.forEach(it => { result[it.id] = running; running -= it.amount; });
    return result;
  }, [items, balance]);

  // 칩 스타일
  const chip = (active: boolean) => ({
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: active ? '#1428A0' : '#F3F4F6',
  });
  const chipTxt = (active: boolean) => ({
    fontSize: 13 as number, fontFamily: 'GmarketSansTTFBold' as const,
    color: active ? '#FFFFFF' : '#374151',
  });

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* 헤더 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>모임 장부</Text>
        </View>

        {/* 잔액 카드 */}
        <View style={{
          backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 20, marginBottom: 16,
          shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
        }}>
          <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', marginBottom: 4 }}>현재 모임 통장 잔액</Text>
          <Text style={{ fontSize: 28, fontFamily: 'GmarketSansTTFBold', color: '#111827', textAlign: 'right', marginBottom: 12 }}>{balance.toLocaleString()}원</Text>
          <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>납부 금액</Text>
            <Text style={{ fontSize: 13, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>{paidAmount.toLocaleString()}원</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium' }}>포인트 금액</Text>
            <Text style={{ fontSize: 13, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>{pointAmount.toLocaleString()}원</Text>
          </View>
        </View>

        {/* 버튼 행: 정산하기 + 필터 + 필터 해제 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          {isAdmin && (
            <Pressable
              onPress={() => navigation.navigate('OcrTest', { groupName, groupId: params.groupId })}
              style={{ backgroundColor: '#1428A0', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12 }}
            >
              <Text style={{ fontSize: 14, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>정산하기</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setFilterVisible(true)}
            style={{
              backgroundColor: appliedFilter ? '#EEF2FF' : '#FFFFFF', borderRadius: 16,
              paddingHorizontal: 20, paddingVertical: 12,
              borderWidth: appliedFilter ? 1.5 : 0, borderColor: '#1428A0',
              shadowColor: '#1428A0', shadowOpacity: 0.06, shadowRadius: 8, elevation: 1,
            }}
          >
            <Text style={{ fontSize: 14, color: appliedFilter ? '#1428A0' : '#374151', fontFamily: 'GmarketSansTTFBold' }}>
              {appliedFilter ? '필터 변경' : '필터'}
            </Text>
          </Pressable>
          {appliedFilter && (
            <Pressable onPress={clearFilter} style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
              <Text style={{ fontSize: 13, color: '#EF4444', fontFamily: 'GmarketSansTTFBold' }}>초기화</Text>
            </Pressable>
          )}
        </View>

        {/* 적용된 필터 요약 칩 */}
        {appliedFilter && (
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12, marginTop: 8 }}>
            <View style={{ backgroundColor: '#EEF2FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#C7D2FE' }}>
              <Text style={{ fontSize: 12, fontFamily: 'GmarketSansTTFBold', color: '#1428A0' }}>
                {fmtDate(appliedFilter.start)} ~ {fmtDate(appliedFilter.end)}
              </Text>
            </View>
            <View style={{ backgroundColor: '#EEF2FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#C7D2FE' }}>
              <Text style={{ fontSize: 12, fontFamily: 'GmarketSansTTFBold', color: '#1428A0' }}>
                {appliedFilter.tx === 'all' ? '전체' : appliedFilter.tx === 'deposit' ? '입금' : '출금'}
              </Text>
            </View>
            <View style={{ backgroundColor: '#EEF2FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#C7D2FE' }}>
              <Text style={{ fontSize: 12, fontFamily: 'GmarketSansTTFBold', color: '#1428A0' }}>
                {appliedFilter.sort === 'latest' ? '최신순' : '과거순'}
              </Text>
            </View>
          </View>
        )}

        {/* 거래 내역 리스트 */}
        <View style={{ gap: 8, marginTop: 8 }}>
          {filteredItems.length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium' }}>조회 결과가 없습니다.</Text>
            </View>
          ) : (
            filteredItems.map((it) => {
              const isPositive = it.amount >= 0;
              const members = it.settleMembers ?? [];
              const paidCount = members.filter(m => m.isPaid).length;
              const totalCount = members.length;
              const settled = it.isSettled ?? true;

              return (
                <Pressable
                  key={it.id}
                  onPress={() => navigation.navigate('GroupLedgerDetail', { item: it, balance: runningBalances[it.id], isAdmin, groupName })}
                  style={{
                    backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 16,
                    shadowColor: '#1428A0', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <Text style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium' }}>{shortDate(it.date)}</Text>
                        {it.needsSettle && (
                          <View style={{ backgroundColor: settled ? '#22C55E' : '#EF4444', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 10, color: '#fff', fontFamily: 'GmarketSansTTFBold' }}>
                              {settled ? '정산완료' : `정산미완료 ${paidCount}/${totalCount}`}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 15, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>{it.title}</Text>
                      {it.memo ? <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium', marginTop: 4 }}>{it.memo}</Text> : null}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 18, fontFamily: 'GmarketSansTTFBold', color: isPositive ? '#1428A0' : '#EF4444' }}>{formatMoney(it.amount)}</Text>
                      <Text style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium', marginTop: 2 }}>{(runningBalances[it.id] ?? 0).toLocaleString()}원</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        {/* PDF 다운로드 (필터 적용 시만 노출) */}
        {appliedFilter && (
          <Pressable
            onPress={() => Alert.alert('PDF 다운로드', '장부 PDF가 생성되었습니다. (임시)')}
            style={{ backgroundColor: '#111827', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 16 }}
          >
            <Text style={{ fontSize: 15, color: '#FFFFFF', fontFamily: 'GmarketSansTTFBold' }}>PDF 다운로드</Text>
          </Pressable>
        )}

      </ScrollView>

      {/* ── 필터 바텀시트 ── */}
      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }} onPress={() => setFilterVisible(false)}>
          <Pressable onPress={() => {}} style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 36 }}>

            {/* 핸들 바 */}
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 20 }} />

            <Text style={{ fontSize: 17, fontFamily: 'GmarketSansTTFBold', color: '#111827', marginBottom: 20 }}>조회조건</Text>

            {/* 조회기간 */}
            <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium', marginBottom: 8 }}>조회기간</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {([['1m', '1개월'], ['3m', '3개월'], ['custom', '직접입력']] as const).map(([key, label]) => (
                <Pressable key={key} onPress={() => handlePreset(key)} style={chip(tmpPreset === key)}>
                  <Text style={chipTxt(tmpPreset === key)}>{label}</Text>
                </Pressable>
              ))}
            </View>

            {tmpPreset === 'custom' ? (
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                <Pressable onPress={() => { setFilterVisible(false); setTimeout(() => setCalendarTarget('start'), 300); }}
                  style={{ flex: 1, backgroundColor: '#F3F4F6', borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: '#374151', fontFamily: 'GmarketSansTTFMedium' }}>{fmtDate(tmpStart)}</Text>
                </Pressable>
                <View style={{ justifyContent: 'center' }}><Text style={{ color: '#9CA3AF' }}>~</Text></View>
                <Pressable onPress={() => { setFilterVisible(false); setTimeout(() => setCalendarTarget('end'), 300); }}
                  style={{ flex: 1, backgroundColor: '#F3F4F6', borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: '#374151', fontFamily: 'GmarketSansTTFMedium' }}>{fmtDate(tmpEnd)}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ backgroundColor: '#F3F4F6', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 13, color: '#374151', fontFamily: 'GmarketSansTTFMedium', textAlign: 'center' }}>
                  {fmtDate(tmpStart)} ~ {fmtDate(tmpEnd)}
                </Text>
              </View>
            )}

            {/* 정렬 */}
            <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium', marginBottom: 8 }}>정렬</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {([['latest', '최신순'], ['oldest', '과거순']] as const).map(([key, label]) => (
                <Pressable key={key} onPress={() => setTmpSort(key)} style={chip(tmpSort === key)}>
                  <Text style={chipTxt(tmpSort === key)}>{label}</Text>
                </Pressable>
              ))}
            </View>

            {/* 조회구분 */}
            <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: 'GmarketSansTTFMedium', marginBottom: 8 }}>조회구분</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
              {([['all', '전체'], ['deposit', '입금'], ['withdraw', '출금']] as const).map(([key, label]) => (
                <Pressable key={key} onPress={() => setTmpTx(key)} style={chip(tmpTx === key)}>
                  <Text style={chipTxt(tmpTx === key)}>{label}</Text>
                </Pressable>
              ))}
            </View>

            {/* 조회 버튼 */}
            <Pressable onPress={handleQuery} style={{ backgroundColor: '#1428A0', borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, color: '#FFFFFF', fontFamily: 'GmarketSansTTFBold' }}>조회</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── 달력 모달 (직접입력 시) ── */}
      {calendarTarget && (
        <CalendarModal
          title={calendarTarget === 'start' ? '조회기간 시작일' : '조회기간 종료일'}
          selected={calendarTarget === 'start' ? tmpStart : tmpEnd}
          onSelect={(d) => {
            if (calendarTarget === 'start') setTmpStart(d); else setTmpEnd(d);
            // 달력 닫고 바텀시트 다시 열기
            setCalendarTarget(null);
            setTimeout(() => setFilterVisible(true), 300);
          }}
          onClose={() => {
            setCalendarTarget(null);
            setTimeout(() => setFilterVisible(true), 300);
          }}
        />
      )}
    </ScreenLayout>
  );
}