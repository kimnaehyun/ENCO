import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenLayoutProps } from '../types/layout';

export default function ScreenLayout({
  children,
  style,
  className,
  noBottomSafe,
}: ScreenLayoutProps & { noBottomSafe?: boolean }) {
  return (
    <SafeAreaView
      edges={
        noBottomSafe
          ? ['top', 'left', 'right']
          : ['top', 'left', 'right', 'bottom']
      }
      className="flex-1 bg-[#F0F4FF]"
    >
      <View className={`flex-1 px-4 pt-3 ${className ?? ''}`} style={style}>
        {children}
      </View>
    </SafeAreaView>
  );
}
