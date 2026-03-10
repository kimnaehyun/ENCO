// src/screens/group/GroupChatScreen.tsx
import { Button, Text, View, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { open } from '@op-engineering/op-sqlite';
import { CommonParams } from '../../types/common';
import ChatInput from '../../components/groupChat/ChatInput';
import SubmitButton from '../../components/groupChat/SubmitButton';
import ChatMessage from '../../components/groupChat/ChatMessage';
import { useState, useEffect } from 'react';
import { Message } from '../../types/group';

const db = open({ name: 'chat.db' });

db.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    host TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

export default function GroupChatScreen() {
  const route = useRoute();
  const params = (route.params ?? {}) as CommonParams;
  const [msg, setMsg] = useState<string>('');
  const [msgHost, setMsgHost] = useState('Me');
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = () => {
    const result = db.executeSync(
      'SELECT * FROM messages ORDER BY created_at ASC',
    );
    setMessages((result.rows as Message[]) ?? []);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = () => {
    if (!msg.trim()) return;
    db.execute(
      'INSERT INTO messages (content, host, created_at) VALUES (?, ?, ?)',
      [msg, msgHost, new Date().toISOString()],
    );
    setMsg('');
    fetchMessages();
  };

  return (
    <View className="flex-1">
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        className="border border-black border-solid"
      >
        <Text style={{ fontSize: 20, fontWeight: '900' }}>
          커뮤니티(톡방) {params.groupName ? `- ${params.groupName}` : ''}
        </Text>
      </View>
      <View>
        <Text>{msgHost}</Text>
        <Button title="Me" onPress={() => setMsgHost('Me')} />
        <Button title="Not Me" onPress={() => setMsgHost('Not Me')} />
      </View>

      <FlatList
        className="flex-1"
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <ChatMessage
            content={item.content}
            host={item.host}
            isMe={item.host === 'Me'}
            created_at={item.created_at}
          />
        )}
      />

      <View className="flex-row border border-black border-solid p-3 items-center">
        <ChatInput
          msg={msg}
          msgValue={setMsg}
          className="flex-[9] bg-gray-300 rounded-xl px-4 max-h-40"
        />
        <SubmitButton
          onPress={handleSubmit}
          className="flex-[1] ml-5 rounded-full h-10"
        />
      </View>
    </View>
  );
}
