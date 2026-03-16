import React from "react";
import {View, Image, Text} from "react-native"

import {images} from "../types/images"

export default function SplashScreen(){
    return(
        <View className="flex-1 items-center justify-center bg-[#F0F4FF]">
            <Image
            source={images.logo}
            style={{width:550, height: 300}} //여긴 반응형으로 사이즈 조절 필요
            resizeMode="contain"
            />
            <Text style ={{fontFamily:'GmarketSansTTFBold', fontSize :24}}>투명하게 관리하는</Text>
            <Text style ={{fontFamily:'GmarketSansTTFBold', fontSize :24}}>우리의 모임통장</Text>
        </View>

    )
}