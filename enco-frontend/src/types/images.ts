export const images = {
  logo: require('../assets/icons/ENCOLOGO_hamco.png'),
  phone: require('../assets/icons/phone_hamco.png'),
  welcome: require('../assets/icons/welcom_hamco.png'),
  homeIcon: require('../assets/icons/home.png'),
  profileIcon: require('../assets/icons/Profile.png'),
  walletIcon: require('../assets/icons/Wallet.png'),
  settingIcon: require('../assets/icons/setting.png'),
  alertCircleIcon: require('../assets/icons/alert-circle.png'),
  balanceIcon: require('../assets/icons/balance.png'),
  chatIcon: require('../assets/icons/chat.png'),
  notificationIcon: require('../assets/icons/Notification.png'),
  paymentIcon: require('../assets/icons/payment.png'),
  voteIcon: require('../assets/icons/vote.png'),
  internetPaymentHamco: require('../assets/icons/internet_payment_hamco.png'),
  left_arrow: require('../assets/icons/left_arrow.png'),
  right_arrow: require('../assets/icons/right_arrow.png'),
  cardDone: require('../assets/icons/delivery_hamco.png'),
  qr: [
    require('../assets/images/qr0.png'),
    require('../assets/images/qr1.png'),
    require('../assets/images/qr2.png'),
    require('../assets/images/qr3.png'),
  ],
  card1: require('../assets/images/card1.png'),
  card2: require('../assets/images/card2.png'),
  card3: require('../assets/images/card3.png'),
  card4: require('../assets/images/card4.png'),
  user: require('../assets/images/user.png'),

  // 프로필 이미지 (profileUrl 번호 → 이미지)
  profiles: [
    require('../assets/images/user.png'),        // 0: 폴백 (기본)
    require('../assets/profiles/profile_1.png'),  // 1
    require('../assets/profiles/profile_2.png'),  // 2
    require('../assets/profiles/profile_3.png'),  // 3
    require('../assets/profiles/profile_4.png'),  // 4
    require('../assets/profiles/profile_5.png'),  // 5
    require('../assets/profiles/profile_6.png'),  // 6
    require('../assets/profiles/profile_7.png'),  // 7
    require('../assets/profiles/profile_8.png'),  // 8
    require('../assets/profiles/profile_9.png'),  // 9
    require('../assets/profiles/profile_10.png'), // 10
  ] as const,
};

/**
 * profileUrl 번호로 프로필 이미지 소스를 반환합니다.
 * 유효하지 않은 번호면 기본 user 이미지를 반환합니다.
 */
export function getProfileImage(profileUrl?: string | number | null) {
  const idx = Number(profileUrl);
  if (!isNaN(idx) && idx >= 1 && idx <= 10) {
    return images.profiles[idx];
  }
  return images.profiles[0]; // 기본 폴백
}
