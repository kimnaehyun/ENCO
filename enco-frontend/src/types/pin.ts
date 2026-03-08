type PinDotsProps = {
    length: number;
  filledCount: number;
}

type PinEntryProps = {
  title: string;
  resetKey?: number;
  length?: number;
  onComplete: (pin: string) => void;
};

type RandomKeypadProps = {
  resetKey?: number;      // 키패드 재셔플 트리거
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onReset: () => void;    // 전체삭제(핀 초기화)
};

export type {PinDotsProps, PinEntryProps, RandomKeypadProps}