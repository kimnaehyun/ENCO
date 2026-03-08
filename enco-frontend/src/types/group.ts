import { RouteProp } from "@react-navigation/native";
import { GroupStackParamList } from "./navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type CardRecommendRouteProp = RouteProp<GroupStackParamList, 'GroupCardRecommend'>;

type GroupCardItem = {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  summary: string;
  detail: string;
};

type GroupPinSetupProps = NativeStackScreenProps<GroupStackParamList, "GroupPinSetup">;

export type {CardRecommendRouteProp, GroupCardItem, GroupPinSetupProps}