// TODO: 현재 네트워크 에러 분기는 테스트용
// TODO: API 연동 후 홈 데이터 조회 실패 상태값으로 교체
// TODO: 다시 시도 버튼에 실제 홈 재조회 함수 연결


import React, { useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../components/ScreenLayout';
import NetworkErrorView from '../components/network/NetworkErrorView';
import { HomeCardItem, HomeGroupSummary } from '../types/screen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 24;
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  // 테스트용: true면 네트워크 에러 화면을 강제로 보여줌
  const [isNetworkErrorTest, setIsNetworkErrorTest] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  const me = { displayName: '나기' };
  const groups: HomeGroupSummary[] = [
    {
      id: 'g1',
      name: '회식주의자',
      coverImage: require('../assets/images/group1.png'),
    },
  ];

  const cards: HomeCardItem[] =
    groups.length > 0
      ? [
          ...groups.map((group) => ({ type: 'group' as const, group })),
          { type: 'add' as const },
        ]
      : [{ type: 'add' as const }];

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);

    // 테스트용: 1초 뒤 성공한 것처럼 처리
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsRetrying(false);
    setIsNetworkErrorTest(false);
  };

  // HomeStack 안에서 직접 push → 뒤로가기 시 HomeScreen으로 복귀
  const onPressGroupCard = (group: HomeGroupSummary) => {
    navigation.navigate('GroupDashboard', {
      groupId: group.id,
      groupName: group.name,
    });
  };

  // 모임 생성: RootNavigator 모달 스택으로 진입
  // → 탭 히스토리와 완전 분리되어 완료/취소 후 HomeScreen으로 자연스럽게 복귀
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

  // 테스트용: 에러 상태면 HomeScreen 대신 네트워크 에러 화면 표시
  if (isNetworkErrorTest) {
    return (
      <NetworkErrorView
        title="인터넷 연결이 끊어졌어요"
        description="Wi-Fi 또는 모바일 데이터 연결을 확인한 뒤 다시 시도해주세요!"
        buttonText={isRetrying ? '다시 시도 중...' : '다시 시도'}
        imageSource={require('../assets/icons/error_hamco.png')}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <ScreenLayout>
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

      <Text style={{ marginTop: 16, textAlign: 'center', color: '#6B7280' }}>
        좌우로 넘겨서 모임 카드와 추가 카드를 볼 수 있어요
      </Text>

      <Pressable onPress={() => navigation.navigate('OcrTest')}>
        <Text>OCR 테스트 페이지로 이동</Text>
      </Pressable>
    </ScreenLayout>
  );
}