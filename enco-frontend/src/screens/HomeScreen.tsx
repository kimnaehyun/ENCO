// src/screens/HomeScreen.tsx
import React from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../navigation/routes';
import ScreenLayout from '../components/ScreenLayout';

type GroupSummary = {
  id: string;
  name: string;
  coverImage?: any;
};

type CardItem =
  | { type: 'group'; group: GroupSummary }
  | { type: 'add' };

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 24;
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const me = { displayName: '나기' };
  const groups: GroupSummary[] = [
    {
      id: 'g1',
      name: '회식주의자',
      coverImage: require('../assets/images/group1.png'),
    },
  ];

  const cards: CardItem[] =
    groups.length > 0
      ? [
          ...groups.map((group) => ({ type: 'group' as const, group })),
          { type: 'add' as const },
        ]
      : [{ type: 'add' as const }];

  const onPressGroupCard = (group: GroupSummary) => {
    navigation.navigate(ROUTES.TAB_GROUP as any, {
      screen: ROUTES.GROUP_DASHBOARD,
      params: {
        groupId: group.id,
        groupName: group.name,
      },
    });
  };

  const onPressCreateGroup = () => {
    navigation.navigate(ROUTES.TAB_GROUP as any, {
      screen: ROUTES.GROUP_CREATE,
    });
  };

  const renderCard = ({ item }: { item: CardItem }) => {
    if (item.type === 'group') {
      return (
        <Pressable
          onPress={() => onPressGroupCard(item.group)}
          style={{
            width: CARD_WIDTH,
            height: 180,
            borderRadius: 16,
            backgroundColor: '#D1D5DB',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600' }}>
            {item.group.name} 모임통장
          </Text>
          <Text style={{ marginTop: 8, color: '#374151' }}>
            눌러서 대시보드로 이동
          </Text>
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={onPressCreateGroup}
        style={{
          width: CARD_WIDTH,
          height: 180,
          borderRadius: 16,
          backgroundColor: '#E5E7EB',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: '#9CA3AF',
        }}
      >
        <Text style={{ fontSize: 40, fontWeight: '300', color: '#4B5563' }}>+</Text>
        <Text style={{ marginTop: 8, fontSize: 17, fontWeight: '700', color: '#111827' }}>
          모임 추가하기
        </Text>
        <Text style={{ marginTop: 6, color: '#6B7280' }}>
          새 모임을 만들어보세요
        </Text>
      </Pressable>
    );
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginTop: 8,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#E5E7EB',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text>🙂</Text>
        </View>

        <Text style={{ fontSize: 22, fontWeight: '700' }}>
          {me.displayName ? `${me.displayName}님 환영합니다` : '님 환영합니다'}
        </Text>
      </View>

      {/* Card Slider */}
      <View style={{ marginTop: 24 }}>
        <FlatList
          data={cards}
          keyExtractor={(item, index) =>
            item.type === 'group' ? item.group.id : `add-${index}`
          }
          renderItem={renderCard}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingRight: HORIZONTAL_PADDING,
          }}
          ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        />
      </View>

      {/* 안내 텍스트 */}
      <Text style={{ marginTop: 16, textAlign: 'center', color: '#6B7280' }}>
        좌우로 넘겨서 모임 카드와 추가 카드를 볼 수 있어요
      </Text>
    </ScreenLayout>
  );
}