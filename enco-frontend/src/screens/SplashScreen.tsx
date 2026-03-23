import React from "react";
import { View, Image } from "react-native"
import Text from '@/components/typography';

import {images} from "../types/images"

export default function SplashScreen(){
    return(
        <View className="flex-1 items-center justify-center bg-[#F0F4FF]">
            <Image
            source={images.logo}
            style={{width:550, height: 300}} //여긴 반응형으로 사이즈 조절 필요
            resizeMode="contain"
            />
            <Text variant="h2">투명하게 관리하는</Text>
            <Text variant="h2">우리의 모임통장</Text>
        </View>

    )
}