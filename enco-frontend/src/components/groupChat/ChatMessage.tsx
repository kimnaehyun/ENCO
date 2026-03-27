import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Text, { FONT_FAMILY, COLORS } from '@/components/typography';
import React from 'react';
import { getProfileImage } from '../../types/images';
import { ChatMsgProps } from '../../types/chat';

export default function ChatMessage({
  content,
  senderId,
  senderName,
  senderProfileImage,
  senderImageUrl,
  isMe,
  created_at,
  status = 'sent',
  onRetry,
  onCancel,
}: ChatMsgProps) {

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isMe) {
    return (
      <View style={styles.userMessageRow}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          {/* 상태 표시 */}
          {status === 'sending' && (
            <ActivityIndicator
              size="small"
              color="#999"
              style={{ marginRight: 4 }}
            />
          )}
          {status === 'failed' && (
            <View style={{ flexDirection: 'row', marginRight: 6 }}>
              <TouchableOpacity onPress={onRetry} style={{ marginRight: 4 }}>
                <Text style={styles.retryText}>재전송</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onCancel}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
            </View>
          )}
          {status === 'sent' && (
            <Text style={styles.timeText}>{formatTime(created_at)}</Text>
          )}

          {/* 메시지 버블 */}
          <View
            style={[
              styles.userBubble,
              status === 'failed' && { backgroundColor: '#ffcccc' },
            ]}
          >
            <Text style={styles.userBubbleText}>{content}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.otherMessageRow}>
      <Image
        style={styles.avatar}
        source={getProfileImage(senderProfileImage)}
        resizeMode="contain"
      />
      <View>
        <Text style={styles.senderText}>{senderName ?? senderId}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <View style={styles.otherBubble}>
            <Text style={styles.otherBubbleText}>{content}</Text>
          </View>
          <Text style={styles.timeText}>{formatTime(created_at)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 내 메시지
  userMessageRow: {
    alignItems: 'flex-end',
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  userBubble: {
    maxWidth: '72%',
    backgroundColor: '#3B6EF6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 22,
    borderTopRightRadius: 6,
  },
  userBubbleText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT_FAMILY.medium,
  },

  // 상대 메시지
  otherMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  senderText: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginBottom: 4,
    fontFamily: FONT_FAMILY.medium,
  },
  otherBubble: {
    maxWidth: '72%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 22,
    borderTopLeftRadius: 6,
  },
  otherBubbleText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },

  // 공통
  timeText: {
    fontSize: 11,
    color: COLORS.placeholder,
    marginLeft: 6,
    marginBottom: 4,
  },
  retryText: {
    fontSize: 12,
    color: '#3B82F6',
  },
  cancelText: {
    fontSize: 12,
    color: COLORS.error,
  },
});
