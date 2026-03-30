# ENCO 포팅 매뉴얼
## 1. 프로젝트 개요
### 1.1 프로젝트명

ENCO

### 1.2 프로젝트 소개

ENCO는 모임 자금 관리 과정에서 발생하는 불투명한 지출, 거래내역 확인의 불편함, 증빙 누락 문제를 개선하기 위한 스마트 모임통장 서비스이다.
사용자는 모임 자금을 투명하게 공유할 수 있으며, OCR 기반 영수증 증빙, 거래내역 시각화, AI 기반 추천 기능을 통해 보다 편리하게 모임 자금을 관리할 수 있다.

### 1.3 주요 기능
모임 생성 및 모임통장 관리
모임원 참여 및 자금 공유
거래내역 조회 및 시각화
영수증 OCR 기반 증빙 등록
카드 이미지 및 프로필 이미지 관리
실시간 알림 및 채팅
벡터 검색 기반 추천 기능
## 2. 시스템 구성

ENCO 프로젝트는 다음과 같이 구성되어 있다.

Frontend
React Native 기반 Android 애플리케이션
Backend
auth-service: 인증 및 회원 관리
payment-service: 모임, 결제, 거래내역, 카드/이미지 관리
chat-service: 채팅 및 실시간 알림 관련 기능
Database
MySQL
MongoDB
Storage
MinIO
AI / 검색
ChromaDB
임베딩 적재 스크립트
Infra
Docker / Docker Compose
Cloudflare Proxy
Reverse Proxy 기반 API 라우팅
## 3. 실제 프로젝트 구조

이전 작업 기록 기준으로 확인된 디렉토리 구조는 다음과 같다.
```
/home/ubuntu/
├─ auth/                  # auth-service
├─ chat/                  # chat-service
├─ chroma/                # ChromaDB 적재 및 관련 코드
├─ backend-infra/         # docker compose 및 인프라 컨테이너 관리
├─ minio/                 # MinIO 데이터 저장 경로
└─ ...
```
로컬 개발 환경에서는 다음 프론트엔드 프로젝트가 사용되었다.

\S14P21E104\enco-frontend
## 4. 사용 기술 및 실행 환경
### 4.1 Backend
Java 17
Spring Boot 3.5.11
Gradle 기반 빌드
### 4.2 Frontend
React Native
Android Studio
Node.js / npm
### 4.3 Database / Storage / Infra
MySQL
MongoDB 7.0.x
MinIO
Docker Compose
ChromaDB
Cloudflare
### 4.4 권장 서버 환경
Ubuntu 22.04 LTS
Docker / Docker Compose 설치 완료 상태
OpenJDK 17
Node.js 18 이상
Python 3.10 이상
## 5. 백엔드 서비스 구성

현재 대화에서 확인된 실제 서비스 및 컨테이너는 다음과 같다.

구분	이름	비고
인증 서비스	auth-service	Spring Boot
결제 서비스	payment-service	Spring Boot
채팅 서비스	chat-service	Spring Boot
MySQL 컨테이너	auth-mysql	인증 DB 연결 시 사용 확인
MongoDB 컨테이너	chat-mongo	채팅 DB 연결 시 사용 확인
Chroma 관련 컨테이너	chroma	API 호출 주소에서 확인
채팅 컨테이너	chat	docker logs -f chat로 확인

payment-service용 MySQL 컨테이너명은 대화에서 명확히 확정되지 않았으므로, 실제 docker ps 결과 기준으로 반영해야 한다.

## 6. 프론트엔드 실제 패키지 구조

대화에서 확인된 Android 패키지 경로는 다음과 같다.

android/app/src/main/java/com/enco/docScan/DocumentScannerLauncher.kt
android/app/src/main/java/com/enco/docScan/DocumentScannerModule.kt
android/app/src/main/java/com/enco/docScan/DocumentScannerPackage.kt
android/app/src/main/java/com/enco/image/ImageCompressionModule.kt
android/app/src/main/java/com/enco/image/ImageCompressionPackage.kt
android/app/src/main/java/com/enco/MainActivity.kt
android/app/src/main/java/com/enco/MainApplication.kt

실제 선언된 package는 다음과 같이 확인되었다.

package com.frontend.docScan
package com.frontend.image
package com.frontend

즉, 디렉토리명에 com/enco가 포함되어 있으나 실제 package 선언은 com.frontend 기준으로 관리되고 있다.
포팅 시 이 불일치가 빌드 문제를 유발하지 않도록 반드시 확인해야 한다.

## 7. 사전 설치
### 7.1 공통 패키지
```bash
sudo apt update
sudo apt install -y git curl vim unzip build-essential
```
### 7.2 Java 17 설치
```bash
sudo apt install -y openjdk-17-jdk
java -version
```
### 7.3 Docker 설치
```bash
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
docker --version
````
### 7.4 Docker Compose 확인
```bash
docker compose version
```
### 7.5 Python 설치
```bash
sudo apt install -y python3 python3-pip python3-venv
python3 --version
```
### 7.6 Node.js 설치
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```
## 8. 환경변수 및 외부 설정

ENCO는 다수의 외부 연동 요소를 사용하므로 환경변수 및 설정 파일이 반드시 필요하다.

### 8.1 주요 설정 항목
MySQL 계정 및 비밀번호
MongoDB root 계정 및 비밀번호
JWT Secret
MinIO Access Key / Secret Key
Firebase 설정 파일
OCR / AI API Key
ChromaDB 연결 주소
8.2 Firebase

모바일 푸시 알림 기능을 위해 Firebase 설정이 필요하다.

Android 앱 내부: google-services.json
서버 측: Firebase Service Account Key

누락 시 FCM 알림 수신 및 서버 발송 기능이 정상 동작하지 않는다.

### 8.3 Cloudflare

대화상 확인된 외부 설정은 다음과 같다.

DDoS 공격 방어 활성화
크롤링 봇 차단
Cloudflare Proxy를 통해 원본 서버로 요청 전달

즉, 사용자 요청은 Cloudflare를 먼저 거친 뒤 원본 서버로 프록시된다.

## 9. 실제 저장소 및 파일 경로
### 9.1 MinIO 저장 경로

대화에서 확인된 카드 이미지 저장 경로는 다음과 같다.

/home/ubuntu/minio/data/enco/card/

예시 URL은 다음과 같은 형식을 사용하였다.

http://api.ssafywte.site/payment-service/api/v1/files/image/card/{filename}

즉, MinIO 내부 파일은 payment-service의 파일 조회 API를 통해 외부로 제공되는 구조이다.

### 9.2 카드 이미지 URL 예시

다음과 같은 실제 URL 형식이 사용되었다.

http://api.ssafywte.site/payment-service/api/v1/files/image/card/c3bd4738-ecfe-46bd-8b0d-257a834f16ca_travel_1.png

## 10. 데이터베이스 구성
### 10.1 MySQL

대화에서 다음 DB명이 확인되었다.

auth_db
travel_db 추정 사용

또한 card_products 테이블과 back_image_url 컬럼 수정 작업이 수행되었다.
따라서 payment-service에서는 카드, 모임, 거래, 이미지 URL 등의 정형 데이터를 MySQL에서 관리하는 것으로 볼 수 있다.

### 10.2 MongoDB

채팅 관련 데이터 저장소로 MongoDB가 사용되며, 실제 접속 예시는 다음과 같다.
```bash
docker exec -it chat-mongo mongosh -u root -p ssafy1234 --authenticationDatabase admin
10.3 ChromaDB
```
벡터 검색을 위한 컬렉션으로 다음이 확인되었다.

lodgings

컬렉션 조회 예시는 다음과 같다.
```bash
docker exec -it chat sh -c "curl -s http://chroma:8000/api/v2/tenants/default_tenant/databases/default_database/collections"
```
## 11. 백엔드 실행 방법
### 11.1 인프라 컨테이너 실행
cd ~/backend-infra
docker compose up -d
### 11.2 특정 컨테이너 재실행 예시
docker compose up -d chat-mongo
### 11.3 실행 컨테이너 확인
docker ps
### 11.4 로그 확인
docker logs -f auth
docker logs -f chat
docker logs -f payment
docker logs -f nginx

대화에서 실제로 사용한 로그 확인 방식은 다음과 같다.

docker logs -f chat
## 12. 프론트엔드 실행 방법
### 12.1 프로젝트 이동
cd C:\test\S14P21E104\enco-frontend
### 12.2 의존성 설치
npm install
### 12.3 Android 실행
npm run android
### 12.4 Metro 수동 실행
npm start
### 12.5 Android 관련 주의사항
Android Studio 설치 필요
Emulator 또는 실제 Android 단말 연결 필요
google-services.json 배치 필요
Gradle 캐시 충돌 시 clean 필요
cd android
./gradlew clean

Windows 환경에서는 다음과 같이 실행할 수 있다.

cd android
gradlew clean
## 13. AI / OCR / 임베딩 포팅
### 13.1 OCR

대화 기준으로 OCR 흐름에는 다음 요소가 포함되어 있다.

영수증 이미지 선택
ML Kit / Doc Scanner 관련 모듈 사용
OCR 결과 검수
거래내역 등록

프론트엔드 네이티브 모듈은 다음과 같이 구성되어 있다.

DocumentScannerLauncher.kt
DocumentScannerModule.kt
DocumentScannerPackage.kt
ImageCompressionModule.kt
ImageCompressionPackage.kt
### 13.2 Chroma 임베딩 적재

/home/ubuntu/chroma 경로에서 Python 스크립트 기반 적재 작업이 수행되었다.

실행 예시는 다음과 같다.

cd ~/chroma
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python embedding.py
### 13.3 Chroma 데이터 확인
curl http://localhost:8000/api/v2/tenants/default_tenant/databases/default_database/collections

또는 컨테이너 내부에서:

docker exec -it chat sh -c "curl -s http://chroma:8000/api/v2/tenants/default_tenant/databases/default_database/collections"

## 14. 배포 및 재배포 절차
### 14.1 기본 절차
서버에 소스코드 반영
환경변수 및 설정 파일 반영
Docker Compose 실행
서비스 로그 확인
DB 연결 및 외부 연동 확인
모바일 앱에서 API 연동 확인
### 14.2 재배포 예시
```bash
git pull origin develop
cd ~/backend-infra
docker compose down
docker compose up -d --build
```
## 15. 실행 확인 절차
### 15.1 MySQL 확인
docker exec -it auth-mysql mysql -uroot -p

DB 목록 확인:

SHOW DATABASES;

특정 DB 확인:

SHOW DATABASES LIKE 'auth_db';
### 15.2 MongoDB 확인
docker exec -it chat-mongo mongosh -u root -p ssafy1234 --authenticationDatabase admin
### 15.3 Chroma 확인
curl http://localhost:8000/api/v2/tenants/default_tenant/databases/default_database/collections
### 15.4 MinIO 파일 확인

MinIO 내부 저장 경로 또는 서비스 API를 통해 확인한다.

예시:

/home/ubuntu/minio/data/enco/card/
http://api.ssafywte.site/payment-service/api/v1/files/image/card/...
### 15.5 프론트 기능 확인

다음 기능이 정상 동작하는지 점검한다.

로그인
모임 생성
거래내역 조회
카드 이미지 조회
영수증 OCR
채팅 및 알림
대시보드 시각화
## 16. 운영 중 자주 사용하는 명령어
### 16.1 컨테이너 상태 확인
docker ps
docker ps -a
### 16.2 로그 확인
docker logs -f <container_name>
### 16.3 MySQL 접속
docker exec -it auth-mysql mysql -uroot -p
### 16.4 MongoDB 접속
docker exec -it chat-mongo mongosh -u root -p ssafy1234 --authenticationDatabase admin
### 16.5 디스크 용량 확인
```bash
df -h
du -sh /home/ubuntu/chroma/data
```
### 16.6 Docker 볼륨 확인
```bash
docker volume ls
```
## 17. 트러블슈팅
### 17.1 npm run android 실행 후 반응이 없는 경우

원인 후보:

Metro 서버 미실행
Android Emulator 미연결
Gradle 빌드 정지
환경변수 또는 Android SDK 문제

조치:

npm start
npm run android

필요 시:

cd android
./gradlew clean
### 17.2 MongoDB 초기화 또는 재생성 문제

실제 작업에서 다음 흐름이 사용되었다.
```bash
docker stop chat-mongo
docker rm chat-mongo
docker compose up -d chat-mongo
```
단, 볼륨명이 예상과 다를 수 있으므로 docker volume ls로 실제 볼륨명을 확인한 뒤 삭제해야 한다.

### 17.3 MySQL 데이터는 비었는데 서버 오류가 발생하는 경우

가능한 원인:

테이블 자체 삭제
초기 데이터 누락
다른 서비스의 외래키 참조 실패
환경변수 기준 DB가 실제와 다름
JPA 스키마와 실제 DB 불일치

확인 항목:

DB 스키마 존재 여부
필수 테이블 존재 여부
더미 데이터 필요 여부
애플리케이션 로그
### 17.4 drop collection 의미

MongoDB에서 drop collection은 문서만 삭제하는 것이 아니라 컬렉션 자체를 제거한다.
즉, SQL의 DELETE FROM이 아니라 DROP TABLE에 가깝다.

### 17.5 SSE 오류 예시

다음 로그가 확인된 바 있다.

[NotificationSetup] SSE 에러:
stream was reset: INTERNAL_ERROR
xhrStatus: 200
xhrState: 4

가능 원인:

서버가 SSE 스트림을 중간에 종료
프록시 또는 로드밸런서 타임아웃
HTTP/2 설정 충돌
인증 토큰 만료
장시간 연결 유지 실패

확인 대상:

chat-service 로그
프록시 설정
SSE 응답 헤더
토큰 갱신 타이밍
### 17.6 패키지 경로 불일치 문제

디렉토리 경로와 package 선언이 다를 경우 Android 빌드 시 오류가 발생할 수 있다.

확인된 사례:

경로: com/enco/...
package: com.frontend...

포팅 시 package refactor 여부를 반드시 점검해야 한다.

### 17.7 Chroma 임베딩 적재 실패

이전 작업에서 OpenAI embedding endpoint 호출 중 400 오류가 발생했고, 이후 gemini-embedding-001로 변경하여 정상 동작한 사례가 있었다.
따라서 포팅 시에는 다음을 확인해야 한다.

실제 사용 임베딩 모델
엔드포인트 주소
요청 body 형식
API 키 유효성
## 18. 보안 및 운영 유의사항
.env, Firebase 키, API 키는 Git에 커밋하지 않는다.
DB 포트는 외부에 직접 노출하지 않는 것을 권장한다.
Cloudflare를 통해 외부 요청을 보호한다.
로그에 비밀번호나 토큰이 노출되지 않도록 주의한다.
MinIO 파일 경로와 공개 URL 매핑 규칙을 명확히 관리한다.