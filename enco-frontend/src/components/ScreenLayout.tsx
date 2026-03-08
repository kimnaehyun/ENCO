import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenLayoutProps } from '../types/layout';

export default function ScreenLayout({children, style}: ScreenLayoutProps) {
  return (
    <SafeAreaView style={{ flex: 1}}>
      <View style={[{flex: 1, paddingHorizontal: 16, paddingTop: 12}, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}