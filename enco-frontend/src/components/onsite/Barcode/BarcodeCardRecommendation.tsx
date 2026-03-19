import { Animated, Dimensions } from 'react-native';
import { useRef } from 'react';
import Card from './BarcodeCard';
import { CARD_WIDTH, ITEM_SIZE } from '@/constants/carousel';
import { images } from '@/types/images';

const { width } = Dimensions.get('window');

const data = [
  { image: images.card1 },
  { image: images.card2 },
  { image: images.card3 },
  { image: images.card4 },
];

export default function BarcodeCardRecommendation({
  onSelectCard,
}: {
  onSelectCard: React.Dispatch<React.SetStateAction<number>>;
}) {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <Animated.FlatList
      className="flex-1"
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_SIZE}
      decelerationRate="fast"
      contentContainerStyle={{
        alignItems: 'center',
        paddingHorizontal: (width - CARD_WIDTH) / 2,
      }}
      keyExtractor={(_, index) => index.toString()}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true },
      )}
      scrollEventThrottle={16}
      renderItem={({ item, index }) => (
        <Card item={item} index={index} scrollX={scrollX} />
      )}
      onMomentumScrollEnd={event => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / ITEM_SIZE);
        onSelectCard(index);
      }}
    />
  );
}
