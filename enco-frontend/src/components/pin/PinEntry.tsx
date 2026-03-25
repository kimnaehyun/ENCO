import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Text from '@/components/typography';
import RandomKeypad from './RandomKeypad';
import PinDots from './PinDots';
import { PinEntryProps } from '../../types/pin';

export default function PinEntry({
  title,
  resetKey = 0,
  length = 4,
  onComplete,
  footerContent,
}: PinEntryProps) {
  const [pin, setPin] = useState('');
  const completedRef = useRef(false);

  useEffect(() => {
    setPin('');
    completedRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (pin.length === length && !completedRef.current) {
      completedRef.current = true;
      onComplete(pin);
    }
  }, [pin, length]);

  const handleDigit = (d: string) => {
    setPin(prev => {
      if (prev.length >= length) return prev;
      return prev + d;
    });
  };

  const handleBackspace = () => {
    setPin(p => p.slice(0, -1));
    completedRef.current = false;
  };

  const handleReset = () => {
    setPin('');
    completedRef.current = false;
  };

  return (
    <View className="flex-1 bg-[#F0F4FF]">
      {/* 상단 타이틀 + dots */}
      <View className="flex-1 items-center justify-center gap-10 px-6">
        <Text
          weight="bold"
          className="text-[#111827] text-3xl text-center leading-10"
        >
          {title}
        </Text>
        <PinDots length={length} filledCount={pin.length} />
        {footerContent && (
          <View className="items-center mt-2">{footerContent}</View>
        )}
      </View>

      {/* 하단 키패드 */}
      <View
        className="bg-white rounded-t-3xl px-5 pt-5 pb-10"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <RandomKeypad
          resetKey={resetKey}
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onReset={handleReset}
        />
      </View>
    </View>
  );
}
