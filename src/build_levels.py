# content.py + 그림 좌표(json) + index.html의 레벨 1 자료 → docs/levels.js
import json,re,sys,os
sys.path.insert(0,os.path.dirname(__file__))
from content import L2,L3,L4,L5
here=os.path.dirname(os.path.abspath(__file__))
P=lambda n:json.load(open(os.path.join(here,n+'.json'),encoding='utf-8'))
geo={}
for f in ['fore','hind','head','trunk']:
    for m in P(f): geo[m['id']]=dict(m,fig=f)
def lv(L):
    out=dict(n=L['n'],key=L['key'],title=L['title'],sub=L['sub'],plan=L['plan'])
    if 'figs' in L: out['figs']=L['figs']
    for k in ['basic','moves']:
        if k in L: out[k]=L[k]
    if 'glos' in L: out['glos']=L['glos']
    if 'M' in L:
        ms=[]
        for m in L['M']:
            g=geo[m['id']];mm=dict(m);mm['fig']=m.get('fig',g['fig'])
            for k in ['poly','fa','fb','om','im','lp']: mm[k]=g[k]
            mm['n']=max(6,min(11,int(abs(g['fa'][1][0]-g['fa'][0][0])/12)+6))
            ms.append(mm)
        out['M']=ms
    if 'body' in L: out['body']=L['body']
    return out
FIGS=dict(
 dog=dict(img='img/dog_lateral.webp',W=2010,H=1190,alt='개 오른쪽 옆모습 겉근육 그림',dir='머리가 오른쪽'),
 fore=dict(img='img/fore.webp',W=828,H=2708,alt='개 오른쪽 앞다리 바깥쪽 근육 그림',dir='머리쪽이 오른쪽',tall=True),
 hind=dict(img='img/hind.webp',W=1001,H=2801,alt='개 오른쪽 뒷다리 바깥쪽 근육 그림',dir='머리쪽이 오른쪽',tall=True),
 head=dict(img='img/head.webp',W=860,H=478,alt='개 머리 왼쪽 옆모습 근육 그림',dir='머리(코)가 왼쪽'),
 trunk=dict(img='img/trunk.webp',W=1841,H=1264,alt='개 목과 가슴 오른쪽 깊은 층 근육 그림',dir='머리가 오른쪽'),
)
L1plan=[('10분','1. 기초','방향 말(머리쪽·꼬리쪽·등쪽·배쪽…)과 이는곳·닿는곳'),('15분','2. 이름 풀기','영어 이름을 조각으로 쪼개면 한글 이름이 보여요'),('20분','3. 근육 지도','그림에서 위치와 결 방향 보기, 하나씩 세 바퀴'),('10분','4. 내 몸에서 찾기','내 몸의 같은 근육에 손을 얹고 움직여 보기'),('10분','5. 찾기 게임','이름을 듣고 그림에서 눌러 찾기'),('10분','6. 퀴즈','10문제, 틀린 것만 다시')]
js='// 자동 생성: python src/build_levels.py (직접 고치지 말 것)\n'+open(os.path.join(here,'l1.js'),encoding='utf-8').read()+'\n'
js+='const FIGS='+json.dumps(FIGS,ensure_ascii=False)+';\n'
js+='const L1PLAN='+json.dumps(L1plan,ensure_ascii=False)+';\n'
js+='const LV_DATA='+json.dumps([lv(L) for L in [L2,L3,L4,L5]],ensure_ascii=False,indent=0)+';\n'
open(os.path.join(here,'..','docs','levels.js'),'w',encoding='utf-8',newline='\n').write(js)
print('ok',len(js))
