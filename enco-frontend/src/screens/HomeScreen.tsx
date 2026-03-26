import React , {useState, useEffect} from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View, Image } from 'react-native'
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';;
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../components/ScreenLayout';
import { HomeCardItem, HomeGroupSummary } from '../types/screen';
import { images, getProfileImage } from '../types/images';
import { useAuthStore } from '../store/useAuthStore';
import { fetchMyPage } from '../services/userService';
import { getMyGroups } from '../services/groupService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 24;
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const user = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);
  const setProfile = useAuthStore(s => s.setProfile);

  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<HomeGroupSummary[]>([]);

  // 프로필이 없으면 API에서 가져오기 (로그인 응답에서 이미 저장된 경우 스킵)
  useEffect(() => {
    if (!profile) {
      setLoading(true);
      fetchMyPage()
        .then(data => setProfile(data))
        .catch(() => {}) // 마이페이지 API 미지원 시 무시 (로그인 응답 데이터 사용)
        .finally(() => setLoading(false));
    }
  }, [profile]);

  const displayName = profile?.name ?? user ?? '';

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getMyGroups();
        console.log('내 모임 목록 조회 성공:', data);
        console.log('내 모임 배열:', data.result);

        const mappedGroups: HomeGroupSummary[] = data.result.map(group => ({
          id: String(group.groupId),
          name: group.groupName,
          coverImage: group.card?.frontImageUrl
            ? { uri: `https://api.ssafywte.site${group.card.frontImageUrl}` }
            : {
                uri: 'https://dummy.image/default-card.png',
              },
        }));

        setGroups(mappedGroups);
      } catch (error: any) {
        console.error('내 모임 목록 조회 실패:', error);
        console.error('error.response?.status:', error?.response?.status);
        console.error('error.response?.data:', error?.response?.data);
      }
    };

    fetchGroups();
  }, []);

  const cards: HomeCardItem[] =
    groups.length > 0
      ? [
          ...groups.map(group => ({ type: 'group' as const, group })),
          { type: 'add' as const },
        ]
      : [{ type: 'add' as const }];

  // HomeStack 안에서 직접 push → 뒤로가기 시 HomeScreen으로 복귀
  const onPressGroupCard = (group: HomeGroupSummary) => {
    navigation.navigate('GroupDashboard', {
      groupId: group.id,
      groupName: group.name,
    });
  };

  const onPressCreateGroup = () => {
    navigation.navigate('GroupCreate');
  };

  const renderCard = ({ item }: { item: HomeCardItem }) => {
    if (item.type === 'group') {
      return (
        <Pressable onPress={() => onPressGroupCard(item.group)} style={styles.groupCard}>
          {/* 배경 이미지 */}
          <Image source={item.group.coverImage} style={styles.cardBgImage} resizeMode="cover" />

          {/* 어두운 오버레이 */}
          <View style={styles.cardOverlay} />

          {/* 콘텐츠 */}
          <View style={styles.cardContent}>
            {/* 상단 뱃지 */}
            <View style={styles.cardBadgeRow}>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>모임통장</Text>
              </View>
              <Text style={styles.cardDots}>···</Text>
            </View>

            {/* 하단 정보 */}
            <View>
              <Text style={styles.cardGroupName}>{item.group.name}</Text>
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardDashboardText}>대시보드 보기</Text>
                <View style={styles.cardArrowCircle}>
                  <Image source={images.right_arrow} />
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable onPress={onPressCreateGroup} style={styles.addCard}>
        <View style={styles.addIconCircle}>
          <Text style={styles.addIconText}>+</Text>
        </View>
        <Text style={styles.addTitle}>모임 추가하기</Text>
        <Text style={styles.addSubtitle}>새 모임을 만들어보세요</Text>
      </Pressable>
    );
  };

  return (
    <ScreenLayout style={{ backgroundColor: '#F0F4FF' }}>
      {/* 헤더 */}
      <View style={styles.header}>
        {/* 프로필 아바타 + 인사말 */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Image
              source={getProfileImage(profile?.profileUrl)}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
          <View>
            <Text style={styles.greeting}>안녕하세요 👋</Text>
            <Text style={styles.username}>
              {displayName ? `${displayName}님` : '환영합니다'}
            </Text>
          </View>
        </View>

        {/* 설정 버튼 (추후 구현) */}
        <Pressable style={styles.settingButton}>
          <Image source={images.settingIcon} style={styles.settingIcon} />
        </Pressable>
      </View>

      {/* 섹션 타이틀 */}
      <Text style={styles.sectionTitle}>내 모임 카드</Text>

      {/* 카드 슬라이더 */}
      <FlatList
        data={cards}
        keyExtractor={(item, index) =>
          item.type === 'group' ? item.group.id : `add-${index}`
        }
        renderItem={renderCard}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingRight: HORIZONTAL_PADDING }}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
      />

    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  // ── 헤더 ──────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 28,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EEF2FF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 4,
  },
  username: {
    fontSize: 22,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.dark,
  },
  settingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIcon: {
    width: 25,
    height: 25,
  },

  // ── 섹션 타이틀 ───────────────────────────────────
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.subtle,
    marginBottom: 14,
  },

  // ── 모임 카드 ─────────────────────────────────────
  groupCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardBgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 22,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  cardBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONT_FAMILY.medium,
  },
  cardDots: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    letterSpacing: 2,
  },
  cardGroupName: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 6,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDashboardText: {
    color: COLORS.white,
    fontSize: 22,
    fontFamily: FONT_FAMILY.bold,
  },
  cardArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── 모임 추가 카드 ────────────────────────────────
  addCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C7D2FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addIconText: {
    fontSize: 28,
    color: COLORS.brand,
  },
  addTitle: {
    fontSize: 16,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
  },
  addSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
  },
});