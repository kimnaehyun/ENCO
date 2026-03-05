import React from "react";
import {View , Text ,ActivityIndicator, Image} from "react-native"

import {images} from "../assets/images"

export default function SplashScreen(){
    return(
        <View style ={{flex : 1, alignItems:"center",justifyContent:"center"}}>
            <Image
            source={images.logo}
            style={{width:150, height: 150}} //여긴 반응형으로 사이즈 조절 필요
            resizeMode="contain"
            />

        </View>

    )
}