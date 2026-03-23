import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';
import ScreenLayout from '../../components/ScreenLayout';

const TAGS = ['여행', '음식'];

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueWrap}>{children}</View>
    </View>
  );
}

export default function GroupInviteDecisionScreen() {
  const navigation = useNavigation<any>();

  const groupName = '모임명';
  const intro = '회식좋아하는사람들';
  const createdAt = '2026.2.19';
  const dues = '매월 / 15일 / 10,000원 / 80%';
  const groundRules =
    '1. 아프면 사형\n2. 일정공유 잘하기\n3. MM 확인 체크하기\n4. 부드러운 말투로 대화해용';

  const onPressReject = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'App',
            state: {
              routes: [{ name: ROUTES.TAB_HOME }],
            },
          },
        ],
      })
    );
  };

  const onPressAccept = () => {
    navigation.navigate('GroupInviteSuccess');
  };

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>모임 가입</Text>
        </View>

        <View style={styles.card}>
          <InfoRow label="모임명">
            <Text style={styles.groupName}>{groupName}</Text>
          </InfoRow>

          <InfoRow label="모임소개">
            <Text style={styles.valueText}>{intro}</Text>
          </InfoRow>

          <InfoRow label="목적">
            <View style={styles.tagWrap}>
              {TAGS.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </InfoRow>

          <InfoRow label="모임 개설일">
            <Text style={styles.valueText}>{createdAt}</Text>
          </InfoRow>

          <View style={styles.infoRowNoBorder}>
            <Text style={styles.infoLabel}>회비</Text>
            <View style={styles.infoValueWrap}>
              <Text style={styles.valueText}>{dues}</Text>
            </View>
          </View>
        </View>

        <View style={styles.ruleCard}>
          <Text style={styles.sectionTitle}>그라운드룰</Text>
          <Text style={styles.ruleText}>{groundRules}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable onPress={onPressReject} style={styles.rejectButton}>
          <Text style={styles.rejectButtonText}>거절하기</Text>
        </Pressable>

        <Pressable onPress={onPressAccept} style={styles.acceptButton}>
          <Text style={styles.acceptButtonText}>수락하기</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoRowNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  infoLabel: {
    width: 86,
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
  },
  infoValueWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  groupName: {
    fontSize: 18,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'right',
  },
  valueText: {
    fontSize: 14,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'right',
  },

  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },

  ruleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#1428A0',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.subtle,
    fontFamily: FONT_FAMILY.medium,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#ff0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
  acceptButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#1428A0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
  },
});