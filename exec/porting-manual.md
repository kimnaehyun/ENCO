# 서버 포팅 매뉴얼

## 1. 개요

본 문서는 현재 운영 중인 ENCO 서버 구성 및 포팅 절차를 정리한 문서이다.
서비스는 Docker 기반으로 구성되어 있으며, 애플리케이션 컨테이너와 공용 인프라를 개별 디렉터리의 `docker-compose.yml`로 운영한다.

현재 확인된 운영 특성은 다음과 같다.

- 백엔드 서비스는 개별 Docker Compose로 실행된다.
- 공용 인프라는 별도 Compose로 관리된다.
- 외부 진입점은 Nginx가 담당한다.
- Jenkins는 별도 Compose 서비스가 아니라 Jenkins Job 내부 Pipeline Script로 빌드 및 배포된다.
- 모니터링은 Grafana, Loki, Alloy 조합으로 구성된다.
- 일부 볼륨 경로가 `/home/ubuntu/...` 절대경로에 의존하므로 신규 서버에서도 동일 경로를 유지하는 것이 안전하다.

---

## 2. 전체 아키텍처

### 2.1 서비스 구성

| 구분 | 서비스명 | 역할 | 내부 포트 | 비고 |
|---|---|---|---|---|
| API Gateway | apigateway | 백엔드 진입점, 서비스 라우팅 | 8081 | 외부 API 요청 수신 |
| Auth | auth | 인증/인가 | 8082 | MySQL, Redis, Kafka 의존 |
| Payment | payment | 결제/카드 관련 기능 | 8083 | MySQL, MinIO 의존 |
| Chat | chat | 채팅 및 AI 연동 | 8084 | MongoDB, Chroma, Firebase 의존 |
| Travel | travel | 여행 상품 기능 | 8085 | MySQL, MinIO 의존 |
| Website | website | 정적 웹 서비스 | 80 | Nginx 뒤에서 프록시 |
| MinIO | minio | 객체 스토리지 | 9000, 9001 | 업로드 파일 저장 |
| Chroma | chroma | 벡터 DB | 8000 | Chat 서비스 연동 |
| MySQL | auth-mysql | 인증 DB | 3306 | 호스트 127.0.0.1:3306 바인딩 |
| MySQL | payment-mysql | 결제 DB | 3306 | 호스트 127.0.0.1:3307 바인딩 |
| MySQL | travel-mysql | 여행 DB | 3306 | 호스트 127.0.0.1:3308 바인딩 |
| MongoDB | chat-mongo | 채팅 DB | 27017 | 호스트 127.0.0.1:27017 바인딩 |
| Redis | redis | 캐시/세션 | 6379 | 호스트 127.0.0.1:6379 바인딩 |
| Kafka | kafka | 이벤트 브로커 | 9092 | 내부 통신용 |
| Nginx | nginx | 리버스 프록시, TLS 종단 | 80, 443 | 도메인 라우팅 |
| Grafana | grafana | 로그 대시보드 | 3000 | logs 도메인 연결 |
| Loki | loki | 로그 저장소 | 3100 | Alloy가 전송 |
| Alloy | alloy | Docker 로그 수집기 | - | Docker socket 사용 |

### 2.2 네트워크 구성

- `app-net`
  - 백엔드 서비스, 데이터 스토리지, Nginx가 연결되는 공용 네트워크
- `monitoring`
  - Grafana, Loki, Alloy, Nginx가 연결되는 모니터링 네트워크

주의사항:

- 일부 Compose는 `app-net`, `monitoring` 을 external network로 가정한다.
- 신규 서버에서 Docker network를 사전에 생성해야 한다.

---

## 3. 운영 디렉터리 구조

운영 기준 주요 디렉터리는 다음과 같다.

| 경로 | 설명 |
|---|---|
| `/home/ubuntu/apigateway` | API Gateway 배포 디렉터리 |
| `/home/ubuntu/auth` | Auth 배포 디렉터리 |
| `/home/ubuntu/payment` | Payment 배포 디렉터리 |
| `/home/ubuntu/chat` | Chat 배포 디렉터리 |
| `/home/ubuntu/travel` | Travel 배포 디렉터리 |
| `/home/ubuntu/minio` | MinIO 배포 디렉터리 |
| `/home/ubuntu/chroma` | Chroma 배포 디렉터리 |
| `/home/ubuntu/backend-infra` | 공용 인프라 배포 디렉터리 |
| `/home/ubuntu/backend-infra/monitoring` | 모니터링 배포 디렉터리 |
| `/home/ubuntu/nginx` | Nginx 설정 및 인증서 디렉터리 |
| `/home/ubuntu/secrets` | Firebase 등 민감정보 파일 저장 위치 |
| `/home/ubuntu/jenkins-data` | Jenkins 홈 데이터 및 Job 설정 |

---

## 4. 사전 준비 사항

### 4.1 서버 기본 패키지

신규 서버에는 아래 구성요소가 필요하다.

- Docker Engine
- Docker Compose Plugin
- Git
- SSL 인증서 배치용 디렉터리
- Jenkins 운영 시 Java 및 Jenkins 런타임
- 필요 시 Node.js 20 이상
- 필요 시 Gradle Wrapper 실행 가능 환경

### 4.2 필수 디렉터리 생성

아래 경로를 운영 서버와 동일하게 준비하는 것을 권장한다.

- `/home/ubuntu/secrets`
- `/home/ubuntu/travel/upload`
- `/home/ubuntu/payment/upload/cards`
- `/home/ubuntu/minio/data`
- `/home/ubuntu/chroma/data`
- `/home/ubuntu/nginx/certs`
- `/home/ubuntu/nginx/conf.d`

### 4.3 Docker Network 생성

```bash
docker network create app-net
docker network create monitoring
```

### 4.4 환경변수 및 Secret 준비

현재 운영 구조상 각 서비스 디렉터리에 `.env` 파일이 존재한다.
문서 작성 시에는 실제 민감값을 노출하지 않고, 키 목록만 관리하는 것을 권장한다.

주요 관리 대상은 다음과 같다.

- DB 접속 정보
- JWT Secret
- Redis 접속 정보
- Kafka 접속 정보
- MinIO 계정 정보
- Firebase 서비스 계정 JSON
- OCR API 정보
- GMS API 정보
- 도메인별 외부 URL

추가 준비 파일:

- `/home/ubuntu/secrets/firebase-admin.json`
- `/home/ubuntu/nginx/certs/origin.crt`
- `/home/ubuntu/nginx/certs/origin.key`

---

## 5. 서비스 의존성

### 5.1 공용 인프라

공용 인프라는 다음 서비스를 포함한다.

- auth-mysql
- payment-mysql
- travel-mysql
- chat-mongo
- redis
- kafka

### 5.2 백엔드 애플리케이션 의존성

| 서비스 | 주요 의존성 |
|---|---|
| apigateway | auth, payment, chat, travel |
| auth | auth-mysql, redis, kafka |
| payment | payment-mysql, minio, kafka |
| chat | chat-mongo, chroma, kafka, firebase-admin.json |
| travel | travel-mysql, minio, kafka |

### 5.3 외부 노출 구조

Nginx 기준 도메인 매핑은 다음과 같다.

| 도메인 | 대상 |
|---|---|
| `ssafywte.site` | website |
| `www.ssafywte.site` | website |
| `api.ssafywte.site` | apigateway |
| `jenkins.ssafywte.site` | jenkins |
| `logs.ssafywte.site` | grafana |

추가 노출 구조:

- `/ws-stomp` 는 API Gateway로 WebSocket 프록시된다.
- `/images/products/` 는 `/home/ubuntu/travel/upload/` 를 alias로 노출한다.
- `/images/cards/` 는 `/home/ubuntu/payment/upload/cards` 를 alias로 노출한다.

---

## 6. 포팅 절차

### 6.1 운영 파일 및 디렉터리 이관

아래 디렉터리를 신규 서버로 복사한다.

- `/home/ubuntu/apigateway`
- `/home/ubuntu/auth`
- `/home/ubuntu/payment`
- `/home/ubuntu/chat`
- `/home/ubuntu/travel`
- `/home/ubuntu/minio`
- `/home/ubuntu/chroma`
- `/home/ubuntu/backend-infra`
- `/home/ubuntu/nginx`
- `/home/ubuntu/secrets`
- `/home/ubuntu/jenkins-data`
- 웹사이트 배포 스크립트 또는 프론트 배포 산출물

주의사항:

- 절대경로 기반 volume mount가 많으므로 기존 경로를 유지하는 것이 가장 안전하다.
- 경로를 변경하면 compose와 nginx 설정을 함께 수정해야 한다.

### 6.2 공용 인프라 기동

먼저 데이터베이스와 메시징 인프라를 기동한다.

```bash
cd /home/ubuntu/backend-infra
docker compose up -d
```

기동 대상:

- MySQL 3개
- MongoDB
- Redis
- Kafka

### 6.3 스토리지 및 부가 서비스 기동

```bash
cd /home/ubuntu/minio
docker compose up -d

cd /home/ubuntu/chroma
docker compose up -d
```

### 6.4 백엔드 서비스 기동

권장 기동 순서는 다음과 같다.

1. auth
2. payment
3. travel
4. chat
5. apigateway

실행 예시:

```bash
cd /home/ubuntu/auth
docker compose up -d

cd /home/ubuntu/payment
docker compose up -d

cd /home/ubuntu/travel
docker compose up -d

cd /home/ubuntu/chat
docker compose up -d

cd /home/ubuntu/apigateway
docker compose up -d
```

### 6.5 Website 배포

현재 확인된 구조상 Nginx는 `website:80` 으로 웹 컨테이너를 프록시한다.
하지만 워크스페이스 루트에는 website용 `docker-compose.yml` 이 없고, Jenkins `webpage` Job이 `deploy-shopping-mall.sh` 스크립트를 직접 실행하는 방식이다.

즉 신규 서버 포팅 시 website는 다음 둘 중 하나로 처리해야 한다.

1. 기존 Jenkins Job과 `deploy-shopping-mall.sh` 를 함께 이관하여 동일 방식으로 배포
2. 별도 `docker-compose.yml` 또는 `docker run` 기반 방식으로 website 배포 표준화

정리하면, website는 소스만 옮기는 것으로 끝나지 않고 실제 배포 스크립트까지 함께 확보해야 한다.

### 6.6 Nginx 기동

인증서와 설정 파일을 준비한 뒤 Nginx를 실행한다.

```bash
cd /home/ubuntu/nginx
docker compose up -d
```

필수 확인 항목:

- `/home/ubuntu/nginx/conf.d/default.conf`
- `/home/ubuntu/nginx/certs/origin.crt`
- `/home/ubuntu/nginx/certs/origin.key`

### 6.7 모니터링 기동

```bash
cd /home/ubuntu/backend-infra/monitoring
docker compose up -d
```

모니터링 구성:

- Grafana
- Loki
- Alloy

Alloy는 Docker socket을 읽어 각 컨테이너 로그를 Loki로 전달한다.

---

## 7. Jenkins 포팅

### 7.1 운영 방식

Jenkins는 별도 Compose 서비스 정의로 확인되지 않았으며, Jenkins Job 내부 Pipeline Script를 통해 빌드와 배포를 수행한다.

현재 확인된 배포 흐름은 다음과 같다.

- GitLab 특정 브랜치 변경 감지
- 지정 경로 변경 여부 확인
- Gradle 빌드 수행
- Docker 이미지 빌드
- 대상 디렉터리에서 `docker compose up -d` 또는 `docker compose up -d --force-recreate` 실행
- 필요 시 Mattermost 알림 전송

### 7.2 신규 서버 이관 대상

신규 서버로 아래 항목을 함께 이관해야 한다.

- Jenkins 홈 데이터 전체
- Job 설정 XML
- Jenkins Credentials
- GitLab Webhook 및 Plugin 설정
- Mattermost Webhook 설정
- Jenkins가 사용하는 배포 디렉터리
- Jenkins Docker 이미지 또는 설치 방식

권장 이관 대상 경로:

- `/home/ubuntu/jenkins-data`
- `/home/ubuntu/jenkins-docker`

### 7.3 Jenkins 관련 주의사항

현재 Nginx는 `jenkins` 라는 업스트림 이름으로 Jenkins에 프록시한다.
따라서 신규 서버에서는 아래 둘 중 하나가 만족되어야 한다.

1. `jenkins` 라는 이름의 컨테이너 또는 네트워크 별칭으로 Jenkins를 운영
2. Nginx 설정에서 Jenkins 대상 주소를 실제 런타임 주소로 수정

---

## 8. 데이터 이관

### 8.1 데이터베이스

이관 대상:

- auth DB
- payment DB
- travel DB
- chat MongoDB

권장 절차:

1. 기존 서버에서 dump 생성
2. 신규 서버 DB 컨테이너 기동
3. dump import 수행
4. 서비스 연결 확인

참고:

- 루트 경로에 `payment_db_before_schema_recovery.sql` 파일이 존재하므로 필요 시 결제 DB 복구 기준 자료로 활용 가능하다.

### 8.2 업로드 파일

이관 대상:

- `/home/ubuntu/travel/upload`
- `/home/ubuntu/payment/upload`
- `/home/ubuntu/minio/data`

이미지 업로드와 정적 파일 노출은 Nginx alias 및 MinIO에 의존하므로, 데이터베이스만 복구해서는 정상 동작하지 않는다.

### 8.3 Chroma 데이터

이관 대상:

- `/home/ubuntu/chroma/data`

해당 데이터가 없으면 기존 임베딩 및 벡터 인덱스가 유실될 수 있다.

---

## 9. 검증 절차

### 9.1 컨테이너 상태 확인

```bash
docker ps
```

확인 대상:

- apigateway
- auth
- payment
- chat
- travel
- minio
- chroma
- nginx
- grafana
- loki
- alloy
- auth-mysql
- payment-mysql
- travel-mysql
- chat-mongo
- redis
- kafka

### 9.2 네트워크 확인

```bash
docker network inspect app-net
docker network inspect monitoring
```

### 9.3 도메인 확인

브라우저 또는 curl로 아래 주소를 점검한다.

- `https://ssafywte.site`
- `https://api.ssafywte.site`
- `https://jenkins.ssafywte.site`
- `https://logs.ssafywte.site`

### 9.4 로그 확인

```bash
docker logs apigateway --tail 100
docker logs auth --tail 100
docker logs payment --tail 100
docker logs chat --tail 100
docker logs travel --tail 100
docker logs nginx --tail 100
```

### 9.5 기능 확인

- 로그인 및 인증 기능
- 상품 조회 기능
- 결제 API 동작 여부
- 채팅 연결 및 WebSocket 통신
- 이미지 업로드 및 조회
- Grafana 로그 수집 여부
- Jenkins 수동 빌드 및 자동 배포 여부

---

## 10. 운영상 주의사항

### 10.1 절대경로 의존

현재 Compose와 Nginx 설정은 `/home/ubuntu/...` 경로에 강하게 의존한다.
신규 서버에서도 동일한 경로 구조를 유지하는 것이 안전하다.

### 10.2 민감정보 관리

현재 `.env` 파일에 운영 환경 정보가 직접 포함되어 있는 구조이므로 포팅 시에는 다음을 권장한다.

- DB 비밀번호 변경
- JWT Secret 재발급
- MinIO 계정 변경
- Firebase 키 재검토 또는 재발급
- 외부 API Key 교체
- Jenkins Credentials 재등록

### 10.3 누락 가능 자산 확인

현재 워크스페이스에서 직접 확인된 것은 아래까지이다.

- 서비스별 Docker Compose
- Nginx 프록시 설정
- Jenkins Job Script
- Website Dockerfile

반면 아래 항목은 별도 위치에서 관리될 가능성이 있다.

- Jenkins 실제 실행 스크립트 또는 Jenkins 컨테이너 런타임 정의
- website 배포 스크립트 `deploy-shopping-mall.sh`
- DNS 또는 Cloudflare 설정
- SSL 인증서 발급 절차
- 백업 및 복구 스크립트

따라서 포팅 전에 위 항목의 실제 저장 위치를 추가 확인하는 것이 좋다.

---

## 11. 권장 포팅 순서 요약

1. 신규 서버에 Docker 및 기본 패키지 설치
2. `/home/ubuntu/...` 디렉터리 구조 생성
3. `app-net`, `monitoring` 네트워크 생성
4. `.env`, 인증서, Secret 파일 이관
5. DB 및 스토리지 데이터 이관
6. 공용 인프라 기동
7. MinIO, Chroma 기동
8. 백엔드 서비스 기동
9. website 배포 스크립트 또는 Jenkins Job 이관
10. Nginx 기동
11. 모니터링 기동
12. Jenkins Job 수동 실행 및 배포 검증
13. 도메인 및 기능 테스트 수행

---

## 12. 운영 파일

- `/home/ubuntu/backend-infra/docker-compose.yml`
- `/home/ubuntu/backend-infra/monitoring/docker-compose.yml`
- `/home/ubuntu/backend-infra/monitoring/alloy/config.alloy`
- `/home/ubuntu/apigateway/docker-compose.yml`
- `/home/ubuntu/auth/docker-compose.yml`
- `/home/ubuntu/payment/docker-compose.yml`
- `/home/ubuntu/chat/docker-compose.yml`
- `/home/ubuntu/travel/docker-compose.yml`
- `/home/ubuntu/minio/docker-compose.yml`
- `/home/ubuntu/chroma/docker-compose.yml`
- `/home/ubuntu/nginx/docker-compose.yml`
- `/home/ubuntu/nginx/conf.d/default.conf`
- `/home/ubuntu/website/Dockerfile`
- `/home/ubuntu/jenkins-data/jobs/api-gateway/config.xml`
- `/home/ubuntu/jenkins-data/jobs/auth/config.xml`
- `/home/ubuntu/jenkins-data/jobs/chat/config.xml`
- `/home/ubuntu/jenkins-data/jobs/webpage/config.xml`

------------------------------------------------------------------------

## 13. 트러블슈팅

### 13.1 컨테이너는 정상 기동되었으나 API 호출 실패

**원인** - DB 연결 실패 - Kafka 연결 실패 - Redis 연결 실패

**확인**

``` bash
docker logs apigateway --tail 100
docker logs auth --tail 100
docker logs payment --tail 100
```

------------------------------------------------------------------------

### 13.2 Nginx 502 / 504 오류

**원인** - upstream 이름 불일치 - Docker network 연결 문제

**확인**

``` bash
docker network inspect app-net
docker logs nginx
```

------------------------------------------------------------------------

### 13.3 이미지 업로드 실패

**원인** - volume mount 누락 - nginx alias mismatch

------------------------------------------------------------------------

### 13.4 Grafana 로그 미수집

``` bash
docker logs alloy
docker logs loki
```

------------------------------------------------------------------------

## 14. 서비스 헬스체크 기준

  서비스       확인 방법          정상 기준
  ------------ ------------------ -----------
  apigateway   /actuator/health   UP
  auth         로그인 API         200
  payment      카드 조회          정상
  chat         WebSocket          연결 성공
  travel       상품 조회          정상

------------------------------------------------------------------------

## 15. Kafka / DB 초기화

``` bash
docker exec -it kafka kafka-topics.sh --create --topic payment-topic --bootstrap-server localhost:9092
```

------------------------------------------------------------------------

## 16. Jenkins Fallback 실행

``` bash
docker run -d -p 8080:8080 -v /home/ubuntu/jenkins-data:/var/jenkins_home jenkins/jenkins:lts
```

------------------------------------------------------------------------

## 17. Docker 운영 설정

``` yaml
restart: always
```

------------------------------------------------------------------------

## 18. 버전 관리

-   Docker: 작성 필요
-   MySQL: 8.x
-   MongoDB: 7.x

------------------------------------------------------------------------

## 19. DNS / Cloudflare

-   A Record 설정
-   SSL Mode: Full

------------------------------------------------------------------------

## 20. 보안 설정

``` bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
```

------------------------------------------------------------------------

## 21. 전체 실행 스크립트

``` bash
#!/bin/bash

cd /home/ubuntu/backend-infra && docker compose up -d
cd /home/ubuntu/minio && docker compose up -d
cd /home/ubuntu/chroma && docker compose up -d
cd /home/ubuntu/auth && docker compose up -d
cd /home/ubuntu/payment && docker compose up -d
cd /home/ubuntu/travel && docker compose up -d
cd /home/ubuntu/chat && docker compose up -d
cd /home/ubuntu/apigateway && docker compose up -d
cd /home/ubuntu/nginx && docker compose up -d
cd /home/ubuntu/backend-infra/monitoring && docker compose up -d
```
