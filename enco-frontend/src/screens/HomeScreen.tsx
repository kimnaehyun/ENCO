import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import ScreenLayout from '../components/ScreenLayout';
import { HomeCardItem, HomeGroupSummary } from '../types/screen';
import { images, getProfileImage } from '../types/images';
import { useAuthStore } from '../store/useAuthStore';
import { GetMyPage } from '../services/userService';
import { getMyGroups } from '../services/groupService';

type HomeStackParamList = {
  GroupDashboard: {
    groupId: string;
    groupName: string;
    isAdmin: boolean;
  };
  GroupCreate: undefined;
};

const SCREEN_SIDE_PADDING = 16;
const CARD_HORIZONTAL_INSET = 28;
const CARD_ASPECT_RATIO = 800 / 1100;
const MAX_CARD_WIDTH = 304;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  const { width: screenWidth } = useWindowDimensions();

  const user = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);
  const setProfile = useAuthStore(s => s.setProfile);

  const [groups, setGroups] = useState<HomeGroupSummary[]>([]);

  useEffect(() => {
    if (profile) return;

    GetMyPage()
      .then(({ result }) => setProfile(result))
      .catch(() => {});
  }, [profile, setProfile]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getMyGroups();

        const mappedGroups: HomeGroupSummary[] = data.result.map(group => ({
          id: String(group.groupId),
          name: group.groupName,
          role: group.role,
          coverImage: group.card?.frontImageUrl
            ? {
                uri: group.card.frontImageUrl.replace(/^http:\/\//, 'https://'),
              }
            : images.card1,
        }));

        setGroups(mappedGroups);
      } catch (error: unknown) {
        console.error(
          'error.response?.status:',
          (error as { response?: { status?: number } })?.response?.status,
        );
        console.error(
          'error.response?.data:',
          (error as { response?: { data?: unknown } })?.response?.data,
        );
      }
    };

    fetchGroups();
  }, []);

  const displayName = profile?.name ?? user ?? '';

  const cards: HomeCardItem[] =
    groups.length > 0
      ? [
          ...groups.map(group => ({ type: 'group' as const, group })),
          { type: 'add' as const },
        ]
      : [{ type: 'add' as const }];

  const cardWidth = Math.min(
    screenWidth - CARD_HORIZONTAL_INSET * 2,
    MAX_CARD_WIDTH,
  );
  const imageHeight = cardWidth / CARD_ASPECT_RATIO;

  const onPressGroupCard = (group: HomeGroupSummary) => {
    navigation.navigate('GroupDashboard', {
      groupId: group.id,
      groupName: group.name,
      isAdmin:
        group.role === 'ADMIN' ||
        group.role === 'LEADER' ||
        group.role === 'TREASURER',
    });
  };

  const onPressCreateGroup = () => {
    navigation.navigate('GroupCreate');
  };

  const renderGroupCard = (group: HomeGroupSummary) => {
    return (
      <View style={[styles.cardSlide, { width: screenWidth }]}>
        <Pressable
          onPress={() => onPressGroupCard(group)}
          style={[styles.groupCard, { width: cardWidth }]}
        >
          <View style={[styles.cardImageBox, { height: imageHeight }]}>
            <Image
              source={group.coverImage}
              style={styles.cardBgImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.cardFooter}>
            <Text
              style={styles.cardGroupName}
              numberOfLines={2}
              ellipsizeMode="tail"
              allowFontScaling={false}
            >
              {group.name}
            </Text>

            <View style={styles.cardBottomRow}>
              <Text
                style={styles.cardDashboardText}
                numberOfLines={1}
                ellipsizeMode="tail"
                allowFontScaling={false}
              >
                대시보드 바로가기
              </Text>

              <View style={styles.cardArrowCircle}>
                <Image
                  source={images.right_arrow}
                  style={styles.cardArrowIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  const renderAddCard = () => {
    return (
      <View style={[styles.cardSlide, { width: screenWidth }]}>
        <Pressable
          onPress={onPressCreateGroup}
          style={[styles.groupCard, { width: cardWidth }]}
        >
          <View style={[styles.addImageCard, { height: imageHeight }]}>
            <View style={styles.addIconCircle}>
              <Text style={styles.addIconText} allowFontScaling={false}>
                +
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardGroupName} allowFontScaling={false}>
              모임 추가하기
            </Text>

            <View style={styles.cardBottomRow}>
              <Text style={styles.cardDashboardText} allowFontScaling={false}>
                새 모임 만들기
              </Text>

              <View style={styles.cardArrowCircle}>
                <Image
                  source={images.right_arrow}
                  style={styles.cardArrowIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  const renderCard = ({ item }: { item: HomeCardItem }) => {
    if (item.type === 'group') {
      return renderGroupCard(item.group);
    }

    return renderAddCard();
  };

  return (
    <ScreenLayout style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Image
              source={getProfileImage(profile?.profileUrl)}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.profileTextBox}>
            <Text style={styles.greeting} allowFontScaling={false}>
              안녕하세요 👋
            </Text>
            <Text
              style={styles.username}
              allowFontScaling={false}
              numberOfLines={1}
            >
              {displayName ? `${displayName}님` : '환영합니다'}
            </Text>
          </View>
        </View>

        <Pressable style={styles.settingButton}>
          <Image
            source={images.settingIcon}
            style={styles.settingIcon}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle} allowFontScaling={false}>
          내 모임 카드
        </Text>

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
          snapToInterval={screenWidth}
          decelerationRate="fast"
          removeClippedSubviews={false}
          style={styles.cardList}
          contentContainerStyle={styles.cardListContent}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: SCREEN_SIDE_PADDING,
  },

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
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EEF2FF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileTextBox: {
    flex: 1,
    minWidth: 0,
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
    flexShrink: 0,
  },
  settingIcon: {
    width: 25,
    height: 25,
  },

  cardSection: {
    flex: 1,
    minHeight: 0,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.subtle,
    marginBottom: 14,
  },

  cardList: {
    marginHorizontal: -SCREEN_SIDE_PADDING,
  },
  cardListContent: {
    paddingBottom: 24,
  },
  cardSlide: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  groupCard: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },

  cardImageBox: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    // backgroundColor: '#1C2340',
  },
  cardBgImage: {
    width: '100%',
    height: '100%',
  },

  cardFooter: {
    width: '100%',
    marginTop: 14,
    paddingHorizontal: 15,
  },
  cardGroupName: {
    width: '100%',
    fontSize: 20,
    lineHeight: 28,
    color: COLORS.dark,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 10,
    textAlign: 'left',
  },
  cardBottomRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDashboardText: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
    fontSize: 14,
    lineHeight: 18,
    color: COLORS.muted,
    fontFamily: FONT_FAMILY.medium,
    textAlign: 'left',
  },
  cardArrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardArrowIcon: {
    width: 16,
    height: 16,
  },

  addImageCard: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C7D2FE',
  },
  addIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#DCE6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconText: {
    fontSize: 32,
    lineHeight: 36,
    color: COLORS.brand,
    fontFamily: FONT_FAMILY.bold,
  },
});
