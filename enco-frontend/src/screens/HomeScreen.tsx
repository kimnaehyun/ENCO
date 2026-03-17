import React from 'react';
import { Dimensions, FlatList, Pressable, Text, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../components/ScreenLayout';
import { HomeCardItem, HomeGroupSummary } from '../types/screen';
import {images} from "../types/images"
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 24;
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const me = { displayName: '나기' };
  const groups: HomeGroupSummary[] = [
    {
      id: 'g1',
      name: '회식주의자',
      coverImage: { uri: 'https://cdn-lostark.game.onstove.com/2022/event/220126_event_M3YUrtR2/images/pc/card5_f.png' },
    },
  ];

  const cards: HomeCardItem[] =
    groups.length > 0
      ? [
          ...groups.map((group) => ({ type: 'group' as const, group })),
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
        <Pressable
          onPress={() => onPressGroupCard(item.group)}
          style={{
            width: CARD_WIDTH,
            height: 200,
            borderRadius: 24,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* 배경 이미지 */}
          <Image
            source={item.group.coverImage}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* 어두운 오버레이 */}
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
          />

          {/* 콘텐츠 */}
          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
              padding: 22,
            }}
          >
            {/* 상단 뱃지 */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'GmarketSansTTFMedium' }}>
                  모임통장
                </Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, letterSpacing: 2 }}>···</Text>
            </View>

            {/* 하단 정보 */}
            <View>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 13,
                  fontFamily: 'GmarketSansTTFMedium',
                  marginBottom: 6,
                }}
              >
                {item.group.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 22,
                    fontFamily: 'GmarketSansTTFBold',
                  }}
                >
                  대시보드 보기
                </Text>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 18 }}>→</Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={onPressCreateGroup}
        style={{
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
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: '#EEF2FF',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 28, color: '#1428A0' }}>+</Text>
        </View>
        <Text style={{ fontSize: 16, color: '#111827', fontFamily: 'GmarketSansTTFBold' }}>
          모임 추가하기
        </Text>
        <Text style={{ marginTop: 6, fontSize: 13, color: '#9CA3AF', fontFamily: 'GmarketSansTTFMedium' }}>
          새 모임을 만들어보세요
        </Text>
      </Pressable>
    );
  };

  return (
    <ScreenLayout style={{ backgroundColor: '#F0F4FF' }}>
      {/* 헤더 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
          marginBottom: 28,
        }}
      >
        {/* 프로필 아바타 + 인사말 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: '#1428A0',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>🙂</Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 13,
                color: '#9CA3AF',
                fontFamily: 'GmarketSansTTFMedium',
                marginBottom: 4,
              }}
            >
              안녕하세요 👋
            </Text>
            <Text style={{ fontSize: 22, fontFamily: 'GmarketSansTTFBold', color: '#111827' }}>
              {me.displayName ? `${me.displayName}님` : '환영합니다'}
            </Text>
          </View>
        </View>

        {/* 설정 버튼 (추후 구현) */}
        <Pressable
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#E8EEFF',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image 
          source={images.settingIcon}
          style={{width:25, height: 25}}
          />
        </Pressable>
      </View>

      {/* 섹션 타이틀 */}
      <Text
        style={{
          fontSize: 15,
          fontFamily: 'GmarketSansTTFBold',
          color: '#374151',
          marginBottom: 14,
        }}
      >
        내 모임 카드
      </Text>

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