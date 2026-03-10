// src/screens/group/GroupChatScreen.tsx
import { Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';

import { CommonParams } from '../../types/common';
import ChatInput from '../../components/groupChat/ChatInput';
import SubmitButton from '../../components/groupChat/SubmitButton';

export default function GroupChatScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;

  return (
    <View className="flex-1">
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        className=" border border-black border-solid "
      >
        <Text style={{ fontSize: 20, fontWeight: '900' }}>
          커뮤니티(톡방) {params.groupName ? `- ${params.groupName}` : ''}
        </Text>
      </View>
      <View className="flex-1">
        <Text>채팅창</Text>
      </View>
      <View className="flex-row border border-black border-solid p-3 items-center">
        <ChatInput className="flex-[9] bg-gray-300 rounded-xl px-4 max-h-40" />
        <SubmitButton className="flex-[1] ml-5 rounded-full h-10" />
      </View>
    </View>
  );
}
