import { CARD_WIDTH, SPACING } from '@/constants/carousel';
import { Image, Animated } from 'react-native';

export default function BarcodeCard({
  item,
  index,
  scrollX,
}: {
  item: any;
  index: number;
  scrollX: Animated.Value;
}) {
  const inputRange = [
    (index - 1) * (CARD_WIDTH + SPACING),
    index * (CARD_WIDTH + SPACING),
    (index + 1) * (CARD_WIDTH + SPACING),
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        width: CARD_WIDTH,
        marginHorizontal: SPACING / 2,
        transform: [{ scale }],
        opacity,
      }}
    >
      <Image
        source={item.image}
        style={{
          width: '100%',
          height: 256,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
