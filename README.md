# FLATPOINT Project Planner

React + Vite와 일반 CSS로 만든 개인 프로젝트 일정 관리 앱입니다. 기본 일정은 2026년 10월 22일~11월 4일의 14개 작업입니다. 서버나 유료 서비스는 필요하지 않습니다.

## 로컬 실행

Node.js 22 이상과 npm을 사용합니다.

```bash
npm ci
npm run dev
```

터미널에 표시된 주소로 접속하세요. 클라우드에서 기본 npm 캐시에 쓰기 권한이 없다면 `npm ci --cache /workspace/.npm-cache`를 사용하세요.

```bash
npm run build
npm run preview
```

프로덕션 결과물은 `dist/`에 생성됩니다.

## 기능과 저장

- 전체 진행률, 남은 작업, 오늘의 미완료 작업 수
- 오늘 일정과 다음 일정 안내, 날짜순 전체 일정
- 완료 체크, 일정 추가·수정·삭제, 검색과 완료 상태 필터
- 전체 초기화: 확인 후 기본 14개 일정과 미완료 상태 복원
- 일정과 완료 상태를 브라우저 localStorage의 `flatpoint-planner-v1`에 자동 저장

오늘 날짜는 사용자 기기의 현지 날짜를 따릅니다. 데이터는 브라우저·사이트 주소별로 저장되며 다른 기기로 동기화되지 않습니다. 브라우저 데이터를 삭제하면 기록도 사라집니다. 저장이 불가능한 환경에서는 화면에 안내합니다. 초기 일정의 날짜를 지나면 미완료 작업은 ‘기한 지남’으로 표시합니다.

## Netlify 배포

1. 이 프로젝트를 GitHub 저장소에 올립니다.
2. Netlify에서 **Add new project → Import an existing project**로 해당 저장소를 연결합니다.
3. 빌드 명령 `npm run build`, 게시 디렉터리 `dist`를 사용합니다. `netlify.toml`에 이미 설정되어 있습니다. 환경 변수나 API 키는 필요하지 않습니다.
4. 배포 후 사이트에 접속합니다.

수동 배포는 로컬에서 `npm ci && npm run build` 후 `dist` 폴더를 Netlify에 업로드하면 됩니다. `public/_redirects`가 빌드 시 `dist/_redirects`로 복사되어 모든 경로를 `index.html`로 연결하므로 하위 경로에서 새로고침해도 앱이 열립니다.

## 구조

```text
src/App.jsx                 대시보드, 상태 관리, localStorage
src/components/TaskForm.jsx 일정 추가·수정 모달
src/components/TaskRow.jsx  일정 행과 작업 버튼
src/data.js                 기본 일정, 날짜 및 데이터 유효성 검사
src/styles.css              반응형 스타일
public/_redirects           Netlify SPA 라우팅
netlify.toml                Netlify 빌드 설정
```

글꼴은 Google Fonts 무료 글꼴을 사용하며 연결이 불가능하면 시스템 글꼴로 표시합니다.
