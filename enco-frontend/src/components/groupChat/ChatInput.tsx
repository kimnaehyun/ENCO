import { TextInput } from 'react-native';

export default function ChatInput({
  className,
  msgValue,
  msg,
}: {
  className: string;
  msgValue: React.Dispatch<React.SetStateAction<string>>;
  msg: string;
}) {
  return (
    <TextInput
      value={msg}
      onChangeText={msgValue}
      className={`border border-solid border-black ${className}`}
      multiline
    />
  );
}
