import { View, Text, Button } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

export default function HomeScreen({ navigation }: any) {
  const { user, login, logout } = useAuthStore();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>HomeScreen</Text>
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
      <Button
        title="Go to Detail"
        onPress={() => navigation.navigate('Detail')}
      />
      <Text>{user ?? '로그인 안됨'}</Text>
      <Button title="로그인" onPress={() => login('kim')} />
      <Button title="로그아웃" onPress={logout} />
    </View>
  );
}
