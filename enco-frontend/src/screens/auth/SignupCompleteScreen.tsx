import React from "react";
import { View, Pressable, Image } from "react-native"
import Text from '@/components/typography';;
import { AuthScreenProps } from "../../types/navigation";
import { images } from "../../types/images";

export default function SignupCompleteScreen({
  route,
  navigation,
}: AuthScreenProps<"SignupComplete">) {
  const userName = route.params?.userName ?? "사용자";

  return (
    <View className="flex-1 bg-[#F0F4FF] justify-center items-center px-6">
      <Image
        source={images.welcome}
        className="w-[220px] h-[220px]"
        resizeMode="contain"
      />

      {/* 환영 텍스트 */}
      <Text weight="bold"
        className="text-[#111827] text-3xl text-center mt-6"
        
      >
        환영합니다
      </Text>
      <Text weight="bold"
        className="text-3xl text-center"
        
      >
        <Text className="text-[#1428A0]">{userName}</Text>
        <Text className="text-[#111827]">님!</Text>
      </Text>

      {/* 로그인하러 가기 버튼 */}
      <Pressable
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: "AuthLanding" }],
          })
        }
        className="bg-[#1428A0] rounded-2xl h-14 px-16 items-center justify-center mt-16"
      >
        <Text weight="bold" color="white" className="text-xl">
          로그인하러 가기
        </Text>
      </Pressable>
    </View>
  );
}