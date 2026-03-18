<div align="center">

# ENCO

</div>

모임을 더 안전하고 똑똑하게 관리하는 방법<br>
모임관리는 **간편하게** 
지출 내역은 **투명하게**

> 모임관리는 **간편하게** 지출 내역은 **투명하게** **ENCO**

- **개발 기간** : 2026.02.19 ~ 2025.03.30 **(5주)**
- **플랫폼** : Fintech
- **개발 인원** : 6명 <br><br>

<img src="./readme-assets/ENCOLOGO_hamco.png" />

</div> <br>

## 🔎 목차

<div align="center">

### <a href="#developers">🌟 팀원 구성</a>

### <a href="#techStack">🛠️ 기술 스택</a>

### <a href="#systemArchitecture">🌐 시스템 아키텍처</a>

### <a href="#skills">📲 기능 구성</a>

### <a href="#feature"> 🏛️ 기능 시연</a>

### <a href="#directories">📂 디렉터리 구조</a>

### <a href="#projectDeliverables">📦 프로젝트 산출물</a>

</div>
<br>

## 🌟 팀원 구성

<a name="developers"></a>

<div align="center">

<table width="100%">
    <tr>
        <td width="33%" align="center" valign="bottom">
            <a href="https://github.com/LOIS-N">
                <img src="./readme-assets/kys.png" width="160px" />
            </a>
        </td>
        <td width="33%" align="center" valign="bottom">
            <a href="https://github.com/sujin31">
                <img src="./readme-assets/khy1.png" width="160px" />
            </a>
        </td>
        <td width="33%" align="center" valign="bottom">
            <a href="https://github.com/mathmatice180521">
                <img src="./readme-assets/knh.png" width="160px" />
            </a>
        </td>
    </tr>
    <tr>
        <td width="33%" align="center" valign="top">
            <hr> <a href="https://github.com/ssafy14cici">
                <b>김윤성</b><br>(Leader & Infra & AI)
            </a>
        </td>
        <td width="33%" align="center" valign="top">
            <hr> <a href="https://github.com/ssafy14cici">
                <b>고혜역</b><br>(Frontend & Back sub & AI sub)
            </a>
        </td>
        <td width="33%" align="center" valign="top">
            <hr> <a href="https://github.com/ssafy14cici">
                <b>김내현</b><br>(Frontend)
            </a>
        </td>
    </tr>
    <tr>
        <td width="33%" valign="top">
            <sub>
                - 프로젝트 총괄 및 전체 서비스 아키텍처 설계 <br>
                - Jenkins 기반의 빌드/배포 파이프라인구축 <br>
                - Docker compose 멀티 컨테이너 서비스 구조 설계 및 배포 <br>
                - Spring: 회원 관리, 댓글, 좋아요 API 구현, 파일 저장 로직 구현 <br>
                - 작품 추천 시스템 파이프라인 설계
            </sub>
        </td>
        <td width="33%" valign="top">
            <sub>
                - 사용자 로그 기반 추천용 데이터 전처리 및 AI 서버·OpenAI REST 연동 구조 설계 <br>
                - AOP + 비동기·독립 트랜잭션으로 로그 자동 수집 처리 <br>
                - 로그 집계 취향 분석 구현, Redis로 동시성 및 정합성 확보 <br>
                - 회원관리, 작품, 감상평, 팬레터, 콜렉트북 등 API 전반 구현 <br>
                - API 명세서 & 요구사항 정의서 설계
            </sub>
        </td>
        <td width="33%" valign="top">
            <sub>
                - 작품 추천 시스템 파이프 라인 설계 <br>
                - 사진 더미 데이터 생산 및 추천 알고리즘 학습을 위한 유저 로그 로직 설정 <br>
                - CLIP, SASRec을 사용한 데이터 임베딩 <br>
                - TwoTower을 사용하여 사용자 로그 기반 추천 모델 설계/학습 <br>
                - Runpod, BentoML을 이용한 외부 AI 추론 서버 구축
            </sub>
        </td>
    </tr>
</table>

<br>

<table width="100%">
    <tr>
        <td width="33%" align="center" valign="bottom">
            <a href="https://github.com/ssafy14cici">
                <img src="./readme-assets/kca1.png" width="160px" />
            </a>
        </td>
        <td width="33%" align="center" valign="bottom">
            <a href="https://github.com/ssafy14cici">
                <img src="./readme-assets/jhs.png" width="160px" />
            </a>
        </td>
        <td width="33%" align="center" valign="bottom">
            <a href="https://github.com/ssafy14cici">
                <img src="./readme-assets/jhe.png" width="160px" />
            </a>
        </td>
    </tr>
    <tr>
        <td width="33%" align="center" valign="top">
            <hr>
            <a href="https://github.com/ssafy14cici">
                <b>김채아</b><br>(Frontend & Presentation & Design)
            </a>
        </td>
        <td width="33%" align="center" valign="top">
            <hr>
            <a href="https://github.com/ssafy14cici">
                <b>정희수</b><br>(Backend Leader)
            </a>
        </td>
        <td width="33%" align="center" valign="top">
            <hr>
            <a href="https://github.com/ssafy14cici">
                <b>장하은</b><br>(Backend)
            </a>
        </td>
    </tr>
    <tr>
        <td width="33%" valign="top">
            <sub>
                - React 기반 작품상세 페이지 API 연동 및 상태 기반 UI 설계·구현 <br>
                - 서비스 운영 필수 이용자 지침·약관 페이지 구조 설계 및 UI 일관성 정비 <br>
                - 중간·최종 발표 발표자 및 PR 리딩 <br>
                - Premiere, Movavi 기반 영상 포트폴리오 제작 및 PowerPoint·Canva 활용 발표 자료 기획·디자인 총괄 <br>
                - Grok 및 Veo, Sora 활용 AI 영상 및 이미지 콘텐츠 제작
            </sub>
        </td>
        <td width="33%" valign="top">
            <sub>
                - React + TypeScript + Vite 기반 FE 아키텍처 설계, 라우팅/전역 상태(Zustand) 구축 <br>
                - 로그인/회원가입(이메일 인증 포함) 및 role 기반 Guard로 인증·권한 플로우 구현 <br>
                - AppLayout·Navbar 전역 UI 구현(라우트 기반 navVariant 분기, 반응형, 모달/전환 UX 정리) <br>
                - 작품 피드/상세/검색 + 정렬/토글/무한 스크롤로 탐색 UX 완성 <br>
                - 리뷰·댓글 CRUD, 팔로우·팬레터(답변 포함) 등 커뮤니티/상호작용 기능 연동 <br>
                - QR 티켓 발급·스캔 수집 → 콜렉트북 + ‘너의 취향은’(MBTI)·리마인드 퀴즈 기능 구현
            </sub>
        </td>
        <td width="33%" valign="top">
            <sub>
                - Three.js + React Three Fiber(@react-three/drei) 기반 3D 전시장 FE 구현, 씬 구조/카메라·조명/환경(HDRI) 세팅 <br>
                - Blender로 에셋 커스텀, 간판/패널 등 오브젝트 제작 후 GLB 통합 <br>
                - 웨이포인트 동선 설계로 관람 흐름 최적화, 조작법 오버레이로 초기 진입 UX 보완 <br>
                - 대용량 GLB/텍스처 로딩 병목을 에셋/텍스처 최적화 + 브라우저 캐싱으로 개선 <br>
                - AppLayout·Navbar/메뉴 IA 정리로 전역 탐색 흐름·화면 일관성 개선, 팬레터·티켓(디자인 추가)·프로필·회원가입 등 주요 페이지 UI(CSS) 구현 및 전역 스크롤/BGM/폰트/푸터 설정 반영
            </sub>
        </td>
    </tr>
</table>

</div>