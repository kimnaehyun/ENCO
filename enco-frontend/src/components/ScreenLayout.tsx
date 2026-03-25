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
      edges={noBottomSafe ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}
      style={{ flex: 1, backgroundColor: '#F0F4FF' }}
    >
      <View
        className={className}
        style={[{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }, style]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}