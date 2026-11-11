# 개 근육 교실

반려동물과 학생용 수업 웹페이지. 한 레벨이 한 차시(70~80분)이고, 같은 근육을 기초 → 이름 풀기 → 근육 지도 → 내 몸에서 찾기 → 찾기 게임 → 퀴즈 → 복습 카드로 반복한다.

- 주소: https://bsead.github.io/dogmuscle/ (레벨 바로 열기: `?lv=2`)
- 레벨 1 첫걸음(몸 전체 겉근육 8) · 2 앞다리(8) · 3 뒷다리(7) · 4 머리와 몸통(8) · 5 종합: 움직임과 재활(레벨 1~4 근육 31개, 움직임 카드)

## 파일

- `docs/index.html`: 화면 틀과 CSS
- `docs/app.js`: 동작 (레벨 고르기, 그림, 게임, 퀴즈)
- `docs/levels.js`: 자료. **직접 고치지 말고** `python -I -X utf8 src/build_levels.py`로 만든다
  - `src/l1.js`: 레벨 1 자료
  - `src/content.py`: 레벨 2~5 글(이는곳·닿는곳·하는 일·내 몸에서·움직임 카드)
  - `src/fore.json`·`hind.json`·`head.json`·`trunk.json`: 그림 위 근육 영역. `src/mk_fore.py`·`mk_hind.py`·`mk_l4.py`가 만든다
  - `src/overlay.py 좌표.json 그림 출력.jpg`: 좌표를 그림에 겹쳐 확인

## 그림 (모두 퍼블릭 도메인)

- `dog_lateral.webp` (2010×1190 좌표): Sisson(1910) Fig. 230, Wikimedia Commons
- `fore.webp` (828×2708): Ellenberger & Baum(1891) Fig. 72, 오른쪽 앞다리 바깥면
- `hind.webp` (1001×2801): 같은 책 Fig. 86, 오른쪽 뒷다리 바깥면 (넓적다리두갈래근·볼기근 떼어 냄)
- `trunk.webp` (1841×1264): 같은 책 Fig. 53, 목·가슴 깊은 층
- `head.webp` (860×478): Ellenberger·Baum·Dittrich, Der Hund Tafel 14 Fig. 36, Wikimedia Commons
- 책 PDF: https://archive.org/details/systematischeund00elleuoft

## 용어·내용

- 한글 용어: 수의학용어 term.anidap.net (VT). `python -I -X utf8 src/anidap.py 용어...`
- 앞정강근(tibialis cranialis)은 용어집에 없어 사람 의학 이름을 씀
- 이는곳·닿는곳·하는 일: NC State 수의대 근골격 실습서(Gerard & Cobb), Ellenberger & Baum(1891)
