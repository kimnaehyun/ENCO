// src/screens/group/GroupLedgerScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View, Platform, PermissionsAndroid } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';
import { CommonParams } from '../../types/common';
import { LedgerItem } from '../../types/group';
import { getGroupDashboardReport } from '../../services/paymentService';
import { generatePDF } from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';

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
      <Pressable style={calStyles.calOverlay} onPress={onClose}>
        <Pressable onPress={() => {}} style={calStyles.calCard}>
          <Text style={calStyles.calTitle}>{title}</Text>
          <View style={calStyles.calNavRow}>
            <Pressable onPress={() => goMonth(-1)} hitSlop={12}>
              <Text style={calStyles.calNavArrow}>{'<'}</Text>
            </Pressable>
            <Text style={calStyles.calMonthLabel}>{viewYear}년 {viewMonth + 1}월</Text>
            <Pressable onPress={() => goMonth(1)} hitSlop={12}>
              <Text style={calStyles.calNavArrow}>{'>'}</Text>
            </Pressable>
          </View>
          <View style={calStyles.calDayNamesRow}>
            {dayNames.map((dn, i) => (
              <View key={dn} style={calStyles.calDayNameCell}>
                <Text style={[
                  calStyles.calDayNameText,
                  { color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : '#9CA3AF' },
                ]}>{dn}</Text>
              </View>
            ))}
          </View>
          {weeks.map((week, wi) => (
            <View key={wi} style={calStyles.calWeekRow}>
              {week.map((d, di) => {
                const other = d <= 0;
                const display = other ? (d > -100 ? Math.abs(d) : Math.abs(d) - 100) : d;
                const sel = !other && isSelected(d);
                return (
                  <Pressable
                    key={di}
                    onPress={() => { if (!other) { onSelect(new Date(viewYear, viewMonth, d)); onClose(); } }}
                    style={calStyles.calDayCell}
                  >
                    <View style={[calStyles.calDayInner, sel && calStyles.calDayInnerSelected]}>
                      <Text style={[
                        calStyles.calDayText,
                        { color: other ? '#D1D5DB' : sel ? '#1428A0' : '#374151' },
                      ]}>{display || ''}</Text>
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
  const groupId = params.groupId ?? '';

  const [balance, setBalance] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [pointAmount, setPointAmount] = useState(0);

  useEffect(() => {
    const fetchLedgerSummary = async () => {
      try {
        console.log('ledger groupId 확인:', groupId);

        const reportData = await getGroupDashboardReport(groupId);
        console.log('모임비 대시보드 조회 성공:', reportData);
        console.log('모임비 대시보드 result:', reportData.result);

        const result = reportData.result;
        setBalance(result.balance ?? 0);
        setPaidAmount(result.paidAmount ?? 0);
        setPointAmount(result.pointAmount ?? 0);
      } catch (error: any) {
        console.error('모임비 대시보드 조회 실패:', error);
        console.error('error.response?.status:', error?.response?.status);
        console.error('error.response?.data:', error?.response?.data);
      }
    };

    fetchLedgerSummary();
  }, [groupId]);

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

  // ── PDF 생성 및 저장 ──
  const handleExportPDF = useCallback(async () => {
    if (!appliedFilter) return;

    // Android 저장소 권한 요청 (API 23~29, API 30+ 은 scoped storage라 불필요)
    if (Platform.OS === 'android' && Number(Platform.Version) < 30) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: '저장소 접근 권한',
            message: 'PDF 파일을 다운로드 폴더에 저장하려면 저장소 권한이 필요합니다.',
            buttonPositive: '허용',
            buttonNegative: '거부',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('권한 필요', '저장소 권한이 거부되어 PDF를 저장할 수 없습니다.');
          return;
        }
      } catch (err) {
        console.error('권한 요청 실패:', err);
        return;
      }
    }

    const filterLabel = appliedFilter.tx === 'all' ? '전체' : appliedFilter.tx === 'deposit' ? '입금' : '출금';
    const sortLabel = appliedFilter.sort === 'latest' ? '최신순' : '과거순';

    const totalDeposit = filteredItems.filter(it => it.amount >= 0).reduce((sum, it) => sum + it.amount, 0);
    const totalWithdraw = filteredItems.filter(it => it.amount < 0).reduce((sum, it) => sum + Math.abs(it.amount), 0);

    const rows = filteredItems.map(it => {
      const isPositive = it.amount >= 0;
      return `
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #E5E7EB; font-size:13px; color:#6B7280;">${it.date}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #E5E7EB; font-size:13px; color:#111827; font-weight:600;">${it.title}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #E5E7EB; font-size:13px; color:${isPositive ? '#1428A0' : '#EF4444'}; text-align:right; font-weight:700;">
            ${formatMoney(it.amount)}
          </td>
          <td style="padding:10px 12px; border-bottom:1px solid #E5E7EB; font-size:13px; color:#6B7280; text-align:right;">
            ${(runningBalances[it.id] ?? 0).toLocaleString()}원
          </td>
        </tr>`;
    }).join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Helvetica Neue', sans-serif; padding: 32px; color: #111827; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            .subtitle { font-size: 13px; color: #6B7280; margin-bottom: 24px; }
            .summary-box {
              background: #F9FAFB; border-radius: 12px; padding: 16px 20px;
              margin-bottom: 24px; display: flex; gap: 24px;
            }
            .summary-item { font-size: 13px; color: #6B7280; }
            .summary-value { font-size: 15px; font-weight: 700; color: #111827; margin-top: 2px; }
            .filter-info { font-size: 12px; color: #9CA3AF; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th {
              padding: 10px 12px; text-align: left; font-size: 12px;
              color: #9CA3AF; border-bottom: 2px solid #E5E7EB; font-weight: 600;
            }
            th:nth-child(3), th:nth-child(4) { text-align: right; }
            .footer { margin-top: 32px; font-size: 11px; color: #D1D5DB; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${groupName} 모임 장부</h1>
          <p class="subtitle">조회기간: ${fmtDate(appliedFilter.start)} ~ ${fmtDate(appliedFilter.end)}</p>

          <div class="summary-box">
            <div>
              <div class="summary-item">현재 잔액</div>
              <div class="summary-value">${balance.toLocaleString()}원</div>
            </div>
            <div>
              <div class="summary-item">입금 합계</div>
              <div class="summary-value" style="color:#1428A0;">+${totalDeposit.toLocaleString()}원</div>
            </div>
            <div>
              <div class="summary-item">출금 합계</div>
              <div class="summary-value" style="color:#EF4444;">-${totalWithdraw.toLocaleString()}원</div>
            </div>
          </div>

          <p class="filter-info">필터: ${filterLabel} · ${sortLabel} · ${filteredItems.length}건</p>

          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>내용</th>
                <th style="text-align:right;">금액</th>
                <th style="text-align:right;">잔액</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <p class="footer">생성일시: ${new Date().toLocaleString('ko-KR')} · 본 문서는 모임 장부 앱에서 자동 생성되었습니다.</p>
        </body>
      </html>
    `;

    try {
      const pdfFileName = `${groupName}_장부_${fmtDate(appliedFilter.start)}_${fmtDate(appliedFilter.end)}.pdf`;

      const options = {
        html,
        fileName: pdfFileName.replace('.pdf', ''),
        ...(Platform.OS === 'ios' ? { directory: 'Documents' } : {}),
      };

      const file = await generatePDF(options);

      if (!file.filePath) {
        Alert.alert('오류', 'PDF 파일 경로를 가져올 수 없습니다.');
        return;
      }

      if (Platform.OS === 'android') {
        const destPath = `${RNFS.DownloadDirectoryPath}/${pdfFileName}`;
        await RNFS.copyFile(file.filePath, destPath);
        Alert.alert('저장 완료', `PDF가 다운로드 폴더에 저장되었습니다.\n${pdfFileName}`);
      } else {
        Alert.alert('저장 완료', `PDF가 저장되었습니다.\n${pdfFileName}`);
      }
    } catch (err: any) {
      console.error('PDF 생성 실패:', err);
      Alert.alert('오류', 'PDF 생성에 실패했습니다. 다시 시도해주세요.');
    }
  }, [appliedFilter, filteredItems, runningBalances, groupName, balance]);

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 헤더 */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>모임 장부</Text>
        </View>

        {/* 잔액 카드 */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceCardLabel}>현재 모임 통장 잔액</Text>
          <Text style={styles.balanceCardAmount}>{balance.toLocaleString()}원</Text>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>납부 금액</Text>
            <Text style={styles.summaryValue}>{paidAmount.toLocaleString()}원</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>포인트 금액</Text>
            <Text style={styles.summaryValue}>{pointAmount.toLocaleString()}원</Text>
          </View>
        </View>

        {/* 버튼 행: 정산하기 + 필터 + 필터 해제 */}
        <View style={styles.filterButtonRow}>
          {isAdmin && (
            <Pressable
              onPress={() => navigation.navigate('OcrTest', { groupName, groupId: params.groupId })}
              style={styles.settleButton}
            >
              <Text style={styles.settleButtonText}>정산하기</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setFilterVisible(true)}
            style={[styles.filterButton, appliedFilter && styles.filterButtonActive]}
          >
            <Text style={[styles.filterButtonText, appliedFilter && styles.filterButtonTextActive]}>
              {appliedFilter ? '필터 변경' : '필터'}
            </Text>
          </Pressable>
          {appliedFilter && (
            <Pressable onPress={clearFilter} style={styles.clearFilterButton}>
              <Text style={styles.clearFilterText}>초기화</Text>
            </Pressable>
          )}
        </View>

        {/* 적용된 필터 요약 칩 */}
        {appliedFilter && (
          <View style={styles.appliedChipRow}>
            <View style={styles.appliedChip}>
              <Text style={styles.appliedChipText}>
                {fmtDate(appliedFilter.start)} ~ {fmtDate(appliedFilter.end)}
              </Text>
            </View>
            <View style={styles.appliedChip}>
              <Text style={styles.appliedChipText}>
                {appliedFilter.tx === 'all' ? '전체' : appliedFilter.tx === 'deposit' ? '입금' : '출금'}
              </Text>
            </View>
            <View style={styles.appliedChip}>
              <Text style={styles.appliedChipText}>
                {appliedFilter.sort === 'latest' ? '최신순' : '과거순'}
              </Text>
            </View>
          </View>
        )}

        {/* 거래 내역 리스트 */}
        <View style={styles.ledgerList}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>조회 결과가 없습니다.</Text>
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
                  style={styles.ledgerItem}
                >
                  <View style={styles.ledgerItemInner}>
                    <View style={styles.ledgerItemLeft}>
                      <View style={styles.ledgerItemTopRow}>
                        <Text style={styles.ledgerItemDate}>{shortDate(it.date)}</Text>
                        {it.needsSettle && (
                          <View style={[
                            styles.settleBadge,
                            { backgroundColor: settled ? '#22C55E' : '#EF4444' },
                          ]}>
                            <Text style={styles.settleBadgeText}>
                              {settled ? '정산완료' : `정산미완료 ${paidCount}/${totalCount}`}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.ledgerItemTitle}>{it.title}</Text>
                      {it.memo ? (
                        <Text style={styles.ledgerItemMemo}>{it.memo}</Text>
                      ) : null}
                    </View>
                    <View style={styles.ledgerItemRight}>
                      <Text style={[
                        styles.ledgerItemAmount,
                        { color: isPositive ? '#1428A0' : '#EF4444' },
                      ]}>
                        {formatMoney(it.amount)}
                      </Text>
                      <Text style={styles.ledgerItemBalance}>
                        {(runningBalances[it.id] ?? 0).toLocaleString()}원
                      </Text>
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
            onPress={() => handleExportPDF()}
            style={styles.pdfButton}
          >
            <Text style={styles.pdfButtonText}>PDF로 저장</Text>
          </Pressable>
        )}

      </ScrollView>

      {/* ── 필터 바텀시트 ── */}
      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setFilterVisible(false)}>
          <Pressable onPress={() => {}} style={styles.sheet}>

            {/* 핸들 바 */}
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>조회조건</Text>

            {/* 조회기간 */}
            <Text style={styles.sheetSectionLabel}>조회기간</Text>
            <View style={styles.chipRow}>
              {([['1m', '1개월'], ['3m', '3개월'], ['custom', '직접입력']] as const).map(([key, label]) => (
                <Pressable
                  key={key}
                  onPress={() => handlePreset(key)}
                  style={[styles.chip, tmpPreset === key && styles.chipActive]}
                >
                  <Text style={[styles.chipText, tmpPreset === key && styles.chipTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            {tmpPreset === 'custom' ? (
              <View style={styles.dateInputRow}>
                <Pressable
                  onPress={() => { setFilterVisible(false); setTimeout(() => setCalendarTarget('start'), 300); }}
                  style={styles.dateInputButton}
                >
                  <Text style={styles.dateInputText}>{fmtDate(tmpStart)}</Text>
                </Pressable>
                <View style={styles.dateInputSeparator}>
                  <Text style={styles.dateInputTilde}>~</Text>
                </View>
                <Pressable
                  onPress={() => { setFilterVisible(false); setTimeout(() => setCalendarTarget('end'), 300); }}
                  style={styles.dateInputButton}
                >
                  <Text style={styles.dateInputText}>{fmtDate(tmpEnd)}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.dateRangeDisplay}>
                <Text style={styles.dateRangeText}>
                  {fmtDate(tmpStart)} ~ {fmtDate(tmpEnd)}
                </Text>
              </View>
            )}

            {/* 정렬 */}
            <Text style={styles.sheetSectionLabel}>정렬</Text>
            <View style={styles.chipRow}>
              {([['latest', '최신순'], ['oldest', '과거순']] as const).map(([key, label]) => (
                <Pressable
                  key={key}
                  onPress={() => setTmpSort(key)}
                  style={[styles.chip, tmpSort === key && styles.chipActive]}
                >
                  <Text style={[styles.chipText, tmpSort === key && styles.chipTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            {/* 조회구분 */}
            <Text style={styles.sheetSectionLabel}>조회구분</Text>
            <View style={styles.chipRow}>
              {([['all', '전체'], ['deposit', '입금'], ['withdraw', '출금']] as const).map(([key, label]) => (
                <Pressable
                  key={key}
                  onPress={() => setTmpTx(key)}
                  style={[styles.chip, tmpTx === key && styles.chipActive]}
                >
                  <Text style={[styles.chipText, tmpTx === key && styles.chipTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            {/* 조회 버튼 */}
            <Pressable onPress={handleQuery} style={styles.queryButton}>
              <Text style={styles.queryButtonText}>조회</Text>
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

// ─── 달력 모달 스타일 ───
const calStyles = StyleSheet.create({
  calOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calCard: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
  },
  calTitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 16,
  },
  calNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  calNavArrow: {
    fontSize: 20,
    color: COLORS.subtle,
  },
  calMonthLabel: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  calDayNamesRow: {
    flexDirection: 'row',
  },
  calDayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
  },
  calDayNameText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.medium,
  },
  calWeekRow: {
    flexDirection: 'row',
  },
  calDayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  calDayInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayInnerSelected: {
    borderWidth: 1.5,
    borderColor: '#1428A0',
  },
  calDayText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.medium,
  },
});

// ─── 화면 스타일 ───
const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },

  // ── 헤더 ──────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },

  // ── 잔액 카드 ─────────────────────────────
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  balanceCardLabel: {
    fontSize: 13,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 4,
  },
  balanceCardAmount: {
    fontSize: 28,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    textAlign: 'right',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  summaryValue: {
    fontSize: 13,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },

  // ── 필터 버튼 행 ──────────────────────────
  filterButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  settleButton: {
    backgroundColor: '#1428A0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settleButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#1428A0',
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.bold,
  },
  filterButtonTextActive: {
    color: COLORS.brand,
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  clearFilterText: {
    fontSize: 13,
    color: COLORS.error,
    fontFamily: FONT_FAMILY.bold,
  },

  // ── 적용된 필터 칩 ────────────────────────
  appliedChipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
    marginTop: 8,
  },
  appliedChip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  appliedChipText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.brand,
  },

  // ── 거래 내역 리스트 ──────────────────────
  ledgerList: {
    gap: 8,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
  },
  ledgerItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#1428A0',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  ledgerItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ledgerItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  ledgerItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  ledgerItemDate: {
    fontSize: 13,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
  },
  settleBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  settleBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  ledgerItemTitle: {
    fontSize: 15,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  ledgerItemMemo: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    marginTop: 4,
  },
  ledgerItemRight: {
    alignItems: 'flex-end',
  },
  ledgerItemAmount: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
  },
  ledgerItemBalance: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    marginTop: 2,
  },

  // ── PDF 버튼 ──────────────────────────────
  pdfButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  pdfButtonText: {
    fontSize: 15,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },

  // ── 필터 바텀시트 ─────────────────────────
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
    marginBottom: 20,
  },
  sheetSectionLabel: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#1428A0',
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.subtle,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  dateInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dateInputButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 13,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },
  dateInputSeparator: {
    justifyContent: 'center',
  },
  dateInputTilde: {
    color: COLORS.placeholder,
  },
  dateRangeDisplay: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dateRangeText: {
    fontSize: 13,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'center',
  },
  queryButton: {
    backgroundColor: '#1428A0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  queryButtonText: {
    fontSize: 15,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
});