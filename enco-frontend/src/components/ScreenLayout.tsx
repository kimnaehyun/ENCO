import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenLayoutProps } from '../types/layout';

export default function ScreenLayout({ children, style }: ScreenLayoutProps) {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']} 
      style={{ flex: 1, backgroundColor: '#F0F4FF' }}
    >
      <View style={[{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }, style]}>
        {children}
      </View>
    </SafeAreaView>
  )
}