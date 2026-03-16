import React, { useState } from 'react';
import NetworkErrorView from '../../components/network/NetworkErrorView';

export default function NetworkErrorTestScreen() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);

    try {
      // 나중에는 여기서 API 재요청
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <NetworkErrorView
      title="인터넷 연결이 끊어졌어요"
      description={`Wi-Fi 또는 모바일 데이터 연결을 확인한 뒤\n다시 시도해주세요!\n\n재시도 횟수: ${retryCount}`}
      buttonText={isRetrying ? '다시 시도 중...' : '다시 시도'}
      imageSource={require('../../assets/icons/error_hamco.png')}
      onRetry={handleRetry}
    />
  );
}