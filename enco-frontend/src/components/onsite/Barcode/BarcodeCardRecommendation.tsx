import { Animated, Dimensions } from 'react-native';
import { useRef } from 'react';
import BarcodeCard from './BarcodeCard';
import { ITEM_SIZE } from '@/constants/carousel';

const { width } = Dimensions.get('window');

export default function BarcodeCardRecommendation({
  onSelectCard,
  cardsInfo,
}: {
  onSelectCard: React.Dispatch<React.SetStateAction<number>>;
  cardsInfo: { image: string; cardId: string | number }[];
}) {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <Animated.FlatList
      className="flex-1"
      data={cardsInfo}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_SIZE}
      decelerationRate="fast"
      scrollEnabled={(cardsInfo?.length ?? 0) > 1}
      contentContainerStyle={{
        alignItems: 'center',
        paddingHorizontal: (width - ITEM_SIZE) / 2,
      }}
      keyExtractor={(_, index) => index.toString()}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true },
      )}
      scrollEventThrottle={16}
      renderItem={({ item, index }) => (
        <BarcodeCard item={item} index={index} scrollX={scrollX} />
      )}
      onMomentumScrollEnd={event => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / ITEM_SIZE);
        if (cardsInfo?.[index] !== undefined) {
          onSelectCard(index);
        }
      }}
    />
  );
}
