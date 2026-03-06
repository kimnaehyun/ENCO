// src/screens/group/GroupInfoScreen.tsx
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../components/ScreenLayout';

type Params = {
  groupId?: string;
  groupName?: string;
  isAdmin?: boolean; // ✅ 추가
};

function SectionCard({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <View
      style={{
        marginTop: 14,
        borderRadius: 24,
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 18,
        paddingVertical: 18,
        minHeight: 74,
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
}

function EditField({
  value,
  onChange,
  multiline,
  minHeight,
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  minHeight?: number;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      style={{
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: minHeight ?? 44,
        textAlignVertical: multiline ? 'top' : 'center',
        color: '#111827',
      }}
      placeholderTextColor="#6B7280"
    />
  );
}

export default function GroupInfoScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as Params;

  const groupName = params.groupName ?? '모임명';
  const isAdmin = !!params.isAdmin;

  const initial = useMemo(
    () => ({
      intro: '모임 소개(임시)\n- 간단한 소개 문장을 여기에 표시',
      purpose: '목적(임시)\n- 예: 회식/스터디/여행 준비',
      createdAt: '2026-03-05',
      dues: '월 10,000원 / 매월 5일',
      groundRules:
        '그라운드룰(임시)\n- 정산은 모임 후 24시간 내\n- 지출은 영수증 첨부\n- 미납 시 자동 알림\n- 투표로 결제 승인',
    }),
    []
  );

  const [isEdit, setIsEdit] = useState(false);

  const [intro, setIntro] = useState(initial.intro);
  const [purpose, setPurpose] = useState(initial.purpose);
  const [createdAt, setCreatedAt] = useState(initial.createdAt);
  const [dues, setDues] = useState(initial.dues);
  const [groundRules, setGroundRules] = useState(initial.groundRules);

  const onPressClose = () => {
    if (isEdit) {
      Alert.alert('확인', '수정 중인 내용이 있습니다. 나갈까요?', [
        { text: '취소', style: 'cancel' },
        { text: '나가기', style: 'destructive', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    navigation.goBack();
  };

  const onToggleEditOrSave = () => {
    if (!isAdmin) return;

    if (!isEdit) {
      setIsEdit(true);
      return;
    }

    // ✅ 저장(임시)
    Alert.alert('저장', '모임 설정이 저장되었습니다(임시).', [
      {
        text: '확인',
        onPress: () => setIsEdit(false),
      },
    ]);

    // TODO: 실제 저장 로직
    // await api.updateGroupInfo(params.groupId, { intro, purpose, createdAt, dues, groundRules })
  };

  return (
    <ScreenLayout>
      {/* Header: 좌측 모임명 / 우측 닫기 + (관리자면 수정/저장) */}
      <View
        style={{
          height: 56,
          borderRadius: 12,
          backgroundColor: '#F3F4F6',
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <Text numberOfLines={1} style={{ fontSize: 20, fontWeight: '900', flex: 1, paddingRight: 12 }}>
          {groupName}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={onPressClose} hitSlop={12}>
            <Text style={{ fontSize: 16, fontWeight: '900' }}>닫기</Text>
          </Pressable>

          {isAdmin && (
            <Pressable onPress={onToggleEditOrSave} hitSlop={12}>
              <Text style={{ fontSize: 16, fontWeight: '900' }}>{isEdit ? '저장' : '수정하기'}</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Sections */}
      <SectionCard title="모임소개">
        {isAdmin && isEdit ? (
          <EditField value={intro} onChange={setIntro} multiline minHeight={90} />
        ) : (
          <Text style={{ color: '#374151', lineHeight: 20 }}>{intro}</Text>
        )}
      </SectionCard>

      <SectionCard title="목적">
        {isAdmin && isEdit ? (
          <EditField value={purpose} onChange={setPurpose} multiline minHeight={70} />
        ) : (
          <Text style={{ color: '#374151', lineHeight: 20 }}>{purpose}</Text>
        )}
      </SectionCard>

      <SectionCard title="모임 개설일">
        {isAdmin && isEdit ? (
          <EditField value={createdAt} onChange={setCreatedAt} />
        ) : (
          <Text style={{ color: '#374151', lineHeight: 20 }}>{createdAt}</Text>
        )}
      </SectionCard>

      <SectionCard title="회비">
        {isAdmin && isEdit ? (
          <EditField value={dues} onChange={setDues} />
        ) : (
          <Text style={{ color: '#374151', lineHeight: 20 }}>{dues}</Text>
        )}
      </SectionCard>

      <View
        style={{
          marginTop: 14,
          borderRadius: 24,
          backgroundColor: '#E5E7EB',
          paddingHorizontal: 18,
          paddingVertical: 18,
          minHeight: 150,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 8 }}>그라운드룰</Text>
        {isAdmin && isEdit ? (
          <EditField value={groundRules} onChange={setGroundRules} multiline minHeight={140} />
        ) : (
          <Text style={{ color: '#374151', lineHeight: 20 }}>{groundRules}</Text>
        )}
      </View>

      {/* 편집 안내 */}
      {isAdmin && isEdit && (
        <Text style={{ marginTop: 16, textAlign: 'center', color: '#6B7280' }}>
          수정 후 우측 상단 “저장”을 눌러주세요.
        </Text>
      )}
    </ScreenLayout>
  );
}