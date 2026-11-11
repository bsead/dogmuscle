// 개 근육 교실 화면 동작. 자료는 levels.js (FIGS, L1M, L1GLOS, L1BODY, L1PLAN, LV_DATA)
const $=s=>document.querySelector(s);
const NS='http://www.w3.org/2000/svg';
function el(t,a={},p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function smooth(p){const n=p.length,mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let d='M'+mid(p[n-1],p[0]).join(',');
  for(let k=0;k<n;k++){const c=p[k],m=mid(c,p[(k+1)%n]);d+=` Q${c[0]},${c[1]} ${m[0]},${m[1]}`}return d+'Z'}
const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}

// ---------- level ----------
L1M.forEach(m=>m.fig='dog');
const LEVELS=[{n:1,key:'dog',title:'첫걸음',sub:'몸 전체 겉근육 8개',plan:L1PLAN,figs:['dog'],M:L1M,glos:L1GLOS,body:L1BODY},...LV_DATA];
LEVELS.forEach(L=>(L.M||[]).forEach(m=>m.lv=L.n));
const qLv=+(new URLSearchParams(location.search).get('lv')||0);
const savedLv=+(store('dm_lv')||0);
const LVN=(qLv>=1&&qLv<=LEVELS.length)?qLv:((savedLv>=1&&savedLv<=LEVELS.length)?savedLv:1);
const lvChanged=savedLv&&savedLv!==LVN;
store('dm_lv',LVN);
const L=LEVELS[LVN-1];
const REVIEW=!!L.moves;
const M=REVIEW?LEVELS.filter(x=>x.M).flatMap(x=>x.M):L.M;
const GLOS=REVIEW?[...new Map(LEVELS.filter(x=>x.glos).flatMap(x=>x.glos).map(g=>[g[0],g])).values()]:L.glos;
const BODY=L.body||[];
const byId=Object.fromEntries(M.map(m=>[m.id,m]));
const NM=M.length;

// ---------- figure ----------
// 화면 폭에 맞춰 글자·점·결 줄 굵기를 키운다 (폰에서 너무 작지 않게)
function fitSvg(svg){
  const W=+svg.dataset.w,u=+svg.dataset.u||1,w=svg.getBoundingClientRect().width;
  if(!W||!w)return u;
  const ppu=w/W,tk=Math.max(u,12.5/(30*ppu)),fu=Math.max(u,2.2/(5*ppu));
  svg.style.setProperty('--tk',tk);svg.style.setProperty('--u',fu);return tk;
}
function fitIn(root){(root||document).querySelectorAll('svg[data-w]').forEach(fitSvg)}
let figSeq=0;
function buildFig(host,fk){
  const F=FIGS[fk],u=Math.max(F.W,F.H)/2010,id='f'+(++figSeq);
  host.innerHTML='';host.classList.toggle('tall',!!F.tall);
  const svg=el('svg',{viewBox:`0 0 ${F.W} ${F.H}`,role:'img','aria-label':F.alt,'data-w':F.W,'data-u':u},host);
  svg.style.setProperty('--u',u);
  const defs=el('defs',{},svg);
  const mk2=el('marker',{id:id+'pull',viewBox:'0 0 10 10',refX:6,refY:5,markerWidth:3.2,markerHeight:3.2,orient:'auto'},defs);
  el('path',{d:'M0,0 L10,5 L0,10 z',fill:'#111'},mk2);
  el('image',{href:F.img,x:0,y:0,width:F.W,height:F.H},svg);
  const gM=el('g',{},svg),gF=el('g',{},svg),gK=el('g',{},svg),gL=el('g',{},svg);
  const shapes={};
  M.filter(m=>m.fig===fk).forEach(m=>{
    const d=smooth(m.poly);
    const cp=el('clipPath',{id:id+'c'+m.id},defs);el('path',{d},cp);
    shapes[m.id]=el('path',{d,class:'mus',fill:m.color,'fill-opacity':0,stroke:m.color,'stroke-opacity':0,'stroke-width':6*u,'data-id':m.id},gM);
  });
  return {svg,defs,gM,gF,gK,gL,shapes,id,fk,u};
}
function drawFibers(F,m,pull){
  F.gF.innerHTML='';F.gK.innerHTML='';
  if(!m||!F.shapes[m.id])return;const u=fitSvg(F.svg);
  const g=el('g',{'clip-path':`url(#${F.id}c${m.id})`},F.gF);
  for(let k=0;k<m.n;k++){
    const t=m.n==1?.5:k/(m.n-1),a=lerp(m.fa[0],m.fa[1],t),b=lerp(m.fb[0],m.fb[1],t);
    el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:pull?'fib rev':'fib',stroke:'#fff','stroke-opacity':.95,style:`animation-delay:${-(k%4)*.25}s`},g);
  }
  const o=m.om,i=m.im;
  [[o,'#1f9d55','이는곳'],[i,'#d1495b','닿는곳']].forEach(([p,c,txt],idx)=>{
    const gg=el('g',{class:'mk'},F.gK);
    el('circle',{cx:p[0],cy:p[1],r:17*u,fill:c,stroke:'#fff','stroke-width':6*u},gg);
    const q=idx?o:i,left=p[0]<q[0];
    const t=el('text',{x:p[0]+(left?-26:26)*u,y:p[1]-24*u,fill:c,'text-anchor':left?'end':'start'},gg);t.textContent=txt;
  });
  if(pull){
    const v=[o[0]-i[0],o[1]-i[1]],Ln=Math.hypot(...v),w=[v[0]/Ln,v[1]/Ln],len=Math.min(Ln*.55,Math.max(260*F.u,80*u));
    const s=[i[0]+w[0]*30*u,i[1]+w[1]*30*u],e=[i[0]+w[0]*len,i[1]+w[1]*len];
    const gp=el('g',{class:'pull'},F.gK);
    el('line',{x1:s[0],y1:s[1],x2:e[0],y2:e[1],stroke:'#111','stroke-width':14*u,'stroke-linecap':'round','marker-end':`url(#${F.id}pull)`},gp);
    const t=el('text',{x:e[0],y:e[1]-22*u,fill:'#111','text-anchor':'middle',class:'lbl'},gp);t.textContent='당김';
  }
}
function setLook(F,mode,sel){
  for(const id in F.shapes){const s=F.shapes[id];let fo=0,so=0;
    if(mode==='all'){fo=.38;so=.9}else if(mode==='hint'){fo=.22;so=.6}
    else if(mode==='focus'){if(id===sel){fo=.32;so=1}else{fo=.06;so=.25}}
    s.setAttribute('fill-opacity',fo);s.setAttribute('stroke-opacity',so);s.setAttribute('stroke',byId[id].color)}
}
function drawLabels(F,ids){
  F.gL.innerHTML='';fitSvg(F.svg);
  const W=FIGS[F.fk].W;ids.filter(id=>F.shapes[id]).forEach(id=>{const m=byId[id];const t=el('text',{x:m.lp[0],y:m.lp[1],fill:m.color,class:'lbl','text-anchor':m.lp[0]>W*.6?'end':'start'},F.gL);t.textContent=m.ko});
}
function figNote(fk){const F=FIGS[fk];return `그림: ${F.alt.replace(' 그림','')} · ${F.dir}`}
function chipHTML(m,attr){return `<button class="chip" ${attr}><i style="background:${m.color}"></i>${m.ko}</button>`}
function lvTag(m){return REVIEW?`<span class="lvtag">레벨 ${m.lv}</span>`:''}

// ---------- header, nav ----------
document.title=`개 근육 교실 · 레벨 ${L.n}`;
$('#lvName').textContent=`레벨 ${L.n} · ${L.title} · ${L.sub}`;
const tabs=[...document.querySelectorAll('#nav button')];
const TABNAMES=REVIEW?{basic:'움직임 카드',term:'이름 풀기',map:'근육 지도',find:'찾기 게임',quiz:'퀴즈'}:{basic:'기초',term:'이름 풀기',map:'근육 지도',body:'내 몸에서',find:'찾기 게임',quiz:'퀴즈'};
const QN=REVIEW?15:10;
const H2={basic:REVIEW?'움직임 카드: 이 동작에서 일하는 근육':(L.n>1?`기초: ${L.title}의 뼈와 관절`:'기초: 방향 말과 근육의 두 끝'),term:'이름 풀기: 영어를 조각내면 한글이 보여요',map:'근육 지도: 위치와 결 방향',body:'내 몸에서 찾기',find:'찾기 게임',quiz:`퀴즈 ${QN}문제`};
let tn=0;tabs.forEach(b=>{const t=b.dataset.t;if(t==='home'||t==='flash')return;
  if(!TABNAMES[t]){b.style.display='none';return}tn++;b.innerHTML=`<small>${tn}</small>${TABNAMES[t]}`;
  const h=document.querySelector(`#${t} h2`);if(h)h.textContent=`${tn}. ${H2[t]}`});
function go(t){if(!document.getElementById(t))t='home';
  tabs.forEach(b=>b.classList.toggle('on',b.dataset.t===t));document.querySelectorAll('main>section').forEach(s=>s.classList.toggle('on',s.id===t));
  window.scrollTo({top:0});store('dm_tab',t);
  fitIn(document.getElementById(t));
  if(t==='map'&&MF&&!showAll)selectM(cur,true);
  if(t==='basic'&&typeof drawBasicPts==='function')drawBasicPts();
  if(t==='find'&&!findState.started)findStart(false);
  if(t==='quiz'&&!quizState.started)quizStart();
}
tabs.forEach(b=>b.onclick=()=>go(b.dataset.t));

// ---------- home ----------
$('#lvPick').innerHTML=LEVELS.map(x=>`<a class="lvcard${x.n===L.n?' on':''}" href="?lv=${x.n}"><b>레벨 ${x.n}</b><span>${x.title}</span><small>${x.sub}</small></a>`).join('');
$('#homeTitle').textContent=REVIEW?'오늘은 지금까지 배운 근육 31개를 움직임으로 묶어요':`오늘은 ${L.title}: ${L.sub}`;
$('#homeLead').innerHTML=REVIEW?'새 근육은 없어요. "이 동작에서 어떤 근육이 일할까?"를 생각하며 레벨 1~4를 한 번에 복습해요.':`한 번에 많이 외우지 않아요. 같은 ${NM}개를 <b>이름 → 그림 → 내 몸 → 게임 → 퀴즈</b>로 다섯 번 만나요.`;
$('#plan').innerHTML=L.plan.map(p=>`<li><b class="min">${p[0]}</b><div><b>${p[1]}</b><br>${p[2]}</div></li>`).join('')+(REVIEW?'':'<li><b class="min">집에서</b><div><b>복습 카드</b><br>눌러서 뒤집는 카드, 하루 두 번</div></li>');
$('#todayLabel').textContent=REVIEW?'오늘의 근육 31개':`오늘의 ${NM}개`;
$('#homeChips').innerHTML=M.map(m=>chipHTML(m,`data-go="${m.id}"`)).join('');
$('#homeChips').onclick=e=>{const b=e.target.closest('[data-go]');if(!b)return;go('map');selectM(M.findIndex(m=>m.id===b.dataset.go))};

// ---------- basic ----------
let drawBasicPts=null;
function basicLevel(){
  const B=L.basic;$('#basicL1').style.display='none';
  const fk=B.fig||L.figs[0];
  let h=`<p class="lead">${B.lead}</p><div class="grid2"><div class="card"><div class="fig" id="bFig"></div><div class="legend"><span>${figNote(fk)}</span></div>`;
  if(L.figs.length>1)h+=L.figs.filter(f=>f!==fk).map(f=>`<div class="fig" id="bFig_${f}" style="margin-top:10px"></div><div class="legend"><span>${figNote(f)}</span></div>`).join('');
  h+=`</div><div><div class="card"><b>오늘의 핵심</b><ol class="keys">${B.keys.map(k=>`<li>${k}</li>`).join('')}</ol></div>
   <div class="card"><b>오늘 쓰는 동작 말</b><div class="glos" style="margin-top:10px">${B.words.map(w=>`<div><b>${w[0]}</b>${w[1]}</div>`).join('')}</div></div></div></div>`;
  $('#basicLv').innerHTML=h;
  const F=buildFig($('#bFig'),fk);
  drawBasicPts=()=>{F.gK.innerHTML='';const u=fitSvg(F.svg);
  B.pts.forEach(([x,y,t,pos])=>{const g=el('g',{class:'mk'},F.gK);el('circle',{cx:x,cy:y,r:14*u,fill:'#1d6fa5',stroke:'#fff','stroke-width':5*u},g);
    const right=x>FIGS[fk].W*.6,up=pos==='up';
    const tx=el('text',{x:up?x:x+(right?-22*u:22*u),y:up?y-26*u:y+10*u,fill:'#1d6fa5','text-anchor':up?'start':(right?'end':'start')},g);tx.textContent=t})};
  drawBasicPts();
  L.figs.filter(f=>f!==fk).forEach(f=>buildFig($('#bFig_'+f),f));
}
function basicMoves(){
  $('#basicL1').style.display='none';
  $('#basicLv').innerHTML=`<p class="lead">개가 하는 동작마다 여러 근육이 함께 일해요. 근육 이름을 누르면 그 카드 안에 그림이 열려요. 먼저 학생들에게 "어떤 근육이 일할까?"를 묻고 나서 눌러 보세요.</p>
   <div class="tcards" id="moveCards" style="grid-auto-flow:dense">${L.moves.map(v=>`<div class="tcard bcard" data-mv="${v.id}">
    <h3>${v.name}</h3><div class="muted" style="margin-bottom:8px">${v.desc}</div>
    <div class="chips">${v.ids.map(id=>byId[id]).map(m=>chipHTML(m,`data-mvm="${m.id}"`)).join('')}</div>
    <div class="note">${v.tip}</div><div class="fig" style="display:none;margin-top:10px"></div><div class="legend mvleg" style="display:none"></div></div>`).join('')}</div>`;
  let open=null;
  $('#moveCards').onclick=e=>{const b=e.target.closest('[data-mvm]');if(!b)return;const card=b.closest('[data-mv]'),host=card.querySelector('.fig'),leg=card.querySelector('.mvleg');
    if(open&&open!==card){open.querySelector('.fig').style.display='none';open.querySelector('.mvleg').style.display='none';open.classList.remove('wide');open.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'))}
    const m=byId[b.dataset.mvm];open=card;card.classList.add('wide');host.style.display='block';leg.style.display='';
    card.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));
    const F=buildFig(host,m.fig);setLook(F,'focus',m.id);drawFibers(F,m);drawLabels(F,[m.id]);
    leg.innerHTML=`<span><b style="color:${m.color}">${m.ko}</b> (레벨 ${m.lv}): ${m.act}</span>`;host.scrollIntoView({behavior:'smooth',block:'nearest'})};
}
if(REVIEW)basicMoves();else if(L.n>1)basicLevel();
else initBasicL1();
function initBasicL1(){
  const F0=FIGS.dog,W=F0.W,H=F0.H;
  const host=$('#dirFig');
  const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,'data-w':W,'data-u':1},host);
  el('image',{href:F0.img,x:0,y:0,width:W,height:H,opacity:.55},svg);
  const defs=el('defs',{},svg);
  const mk=el('marker',{id:'dar',viewBox:'0 0 10 10',refX:5,refY:5,markerWidth:3,markerHeight:3,orient:'auto-start-reverse'},defs);
  el('path',{d:'M0,0 L10,5 L0,10 z',fill:'context-stroke'},mk);
  const body=el('g',{class:'dir'},svg),limb=el('g',{class:'dir'},svg);
  function arrow(g,x1,y1,x2,y2,c,t1,t2,tp1,tp2){
    el('line',{x1,y1,x2,y2,stroke:c,'stroke-width':16,'stroke-linecap':'round','marker-start':'url(#dar)','marker-end':'url(#dar)'},g);
    const a=el('text',{x:tp1[0],y:tp1[1],fill:c,'text-anchor':'middle'},g);a.textContent=t1;
    const b=el('text',{x:tp2[0],y:tp2[1],fill:c,'text-anchor':'middle'},g);b.textContent=t2;
  }
  arrow(body,560,250,1260,250,'#c0392b','꼬리쪽 caudal','머리쪽 cranial',[620,215],[1180,215]);
  arrow(body,820,330,820,1000,'#1d6fa5','등쪽 dorsal','배쪽 ventral',[820,315],[820,1060]);
  arrow(limb,1630,620,1630,1120,'#2a9d6f','몸쪽 proximal','먼쪽 distal',[1700,600],[1700,1160]);
  arrow(limb,560,820,560,1150,'#2a9d6f','몸쪽','먼쪽',[640,840],[640,1150]);
  function show(k){body.style.display=(k==='body'||k==='all')?'':'none';limb.style.display=(k==='limb'||k==='all')?'':'none'}
  show('all');
  document.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>show(b.dataset.dir));
  // lever demo
  const lh=$('#lever');const ls=el('svg',{viewBox:'0 0 520 320'},lh);
  const J=[300,232],O=[80,220],IN=70;
  el('rect',{x:40,y:220,width:272,height:24,rx:12,fill:'#e8e1cf',stroke:'#8a826e','stroke-width':2},ls);
  const t1=el('text',{x:130,y:300,'font-size':18,'font-weight':700,fill:'#5b6270'},ls);t1.textContent='움직이지 않는 뼈';
  const arm=el('g',{},ls);
  el('rect',{x:288,y:220,width:200,height:24,rx:12,fill:'#e8e1cf',stroke:'#8a826e','stroke-width':2},arm);
  const t2=el('text',{x:380,y:272,'font-size':18,'font-weight':700,fill:'#5b6270'},arm);t2.textContent='움직이는 뼈';
  const mus=el('path',{fill:'#e07a7a',stroke:'#b34747','stroke-width':2},ls);
  const fib=el('g',{stroke:'#fff','stroke-width':2,'stroke-opacity':.7},ls);
  el('circle',{cx:J[0],cy:J[1],r:9,fill:'#8a826e'},ls);
  el('circle',{cx:O[0],cy:O[1],r:9,fill:'#1f9d55',stroke:'#fff','stroke-width':3},ls);
  const iDot=el('circle',{r:9,fill:'#d1495b',stroke:'#fff','stroke-width':3},ls);
  const oT=el('text',{x:44,y:272,'font-size':18,'font-weight':800,fill:'#1f9d55'},ls);oT.textContent='이는곳';
  const iT=el('text',{'font-size':18,'font-weight':800,fill:'#d1495b'},ls);iT.textContent='닿는곳';
  const L0=Math.hypot(J[0]+IN-O[0],0);let ang=0,target=0;
  function render(){
    arm.setAttribute('transform',`rotate(${-ang} ${J[0]} ${J[1]})`);
    const r=ang*Math.PI/180,ix=J[0]+IN*Math.cos(r)-12*Math.sin(r),iy=J[1]-IN*Math.sin(r)-12*Math.cos(r);
    iDot.setAttribute('cx',ix);iDot.setAttribute('cy',iy);iT.setAttribute('x',ix-34);iT.setAttribute('y',iy-22);
    const dx=ix-O[0],dy=iy-O[1],len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,nx=uy,ny=-ux;
    const th=26*Math.sqrt(L0/len)*(L0/len);
    const m1=[O[0]+dx*.3+nx*th,O[1]+dy*.3+ny*th],m2=[O[0]+dx*.7+nx*th,O[1]+dy*.7+ny*th];
    const m3=[O[0]+dx*.7-nx*th*.35,O[1]+dy*.7-ny*th*.35],m4=[O[0]+dx*.3-nx*th*.35,O[1]+dy*.3-ny*th*.35];
    mus.setAttribute('d',`M${O[0]},${O[1]} C${m1} ${m2} ${ix},${iy} C${m3} ${m4} ${O[0]},${O[1]}Z`);
    fib.innerHTML='';
    for(const k of [-.15,.15,.45,.75]){const ox=nx*th*k,oy=ny*th*k;el('line',{x1:O[0]+dx*.22+ox,y1:O[1]+dy*.22+oy,x2:O[0]+dx*.78+ox,y2:O[1]+dy*.78+oy},fib)}
  }
  function tick(){ang+=(target-ang)*.1;render();if(Math.abs(target-ang)>.3)requestAnimationFrame(tick);else{ang=target;render()}}
  render();
  $('#leverBtn').onclick=()=>{target=target?0:70;$('#leverBtn').textContent=target?'근육 풀기 (이완)':'근육 줄이기 (수축)';tick()};
}

// ---------- term ----------
$('#termLead').textContent=REVIEW?'레벨 1~4의 근육 31개예요. 한글을 가리고 조각만 보고 맞혀 보세요.':'영어 근육 이름은 라틴어 조각의 조합이에요. 조각 뜻만 알면 한글 이름을 거의 그대로 만들 수 있어요. 한글은 수의학용어집 이름이고, 괄호 안은 사람 의학에서 쓰는 이름이에요.';
$('#glosTitle').textContent=`${REVIEW?'지금까지 배운':'오늘 쓰는'} 조각 ${GLOS.length}개`;
$('#glos').innerHTML=GLOS.map(g=>`<div><b>${g[0]}</b>${g[1]}</div>`).join('');
function partsHTML(m){return m.parts.map(p=>`<div class="part"><b>${p[0]}</b><span>${p[1]}</span></div>`).join('<span class="plus">+</span>')}
$('#tcards').innerHTML=M.map(m=>`<div class="tcard" data-id="${m.id}">${lvTag(m)}
  <div class="full">${m.en}</div>
  <div class="parts">${partsHTML(m)}</div>
  <div class="ans" style="color:${m.color}">= ${m.ko}${m.med?`<small>(${m.med})</small>`:''}</div>
  <div class="muted" style="margin-top:6px;line-height:1.5">${m.why}</div>
  <button class="btn sm ghost reveal" style="display:none">보기</button></div>`).join('');
$('#termHide').onclick=()=>document.querySelectorAll('#tcards .tcard').forEach(c=>{c.classList.add('hide');c.querySelector('.reveal').style.display=''});
$('#termShow').onclick=()=>document.querySelectorAll('#tcards .tcard').forEach(c=>{c.classList.remove('hide');c.querySelector('.reveal').style.display='none'});
$('#tcards').onclick=e=>{const b=e.target.closest('.reveal');if(!b)return;const c=b.closest('.tcard');c.classList.remove('hide');b.style.display='none'};

// ---------- map ----------
let MF=null,cur=0,showAll=false,pull=false,names=false,visits=new Array(NM).fill(0);
function ensureMF(fk){if(MF&&MF.fk===fk)return;MF=buildFig($('#mapFig'),fk);
  Object.values(MF.shapes).forEach(s=>s.addEventListener('click',()=>selectM(M.findIndex(m=>m.id===s.dataset.id))));
  $('#mapDir').textContent=figNote(fk)}
$('#mapAll').textContent=REVIEW?'이 그림 근육 모두':(L.figs.length>1?'이 그림 근육 모두':`${NM}개 한꺼번에`);
$('#mapChips').innerHTML=REVIEW?LEVELS.filter(x=>x.M).map(x=>`<div class="chiprow"><span class="lvtag">레벨 ${x.n}</span>${x.M.map(m=>chipHTML(m,`data-k="${M.indexOf(m)}"`)).join('')}</div>`).join(''):M.map((m,k)=>chipHTML(m,`data-k="${k}"`)).join('');
$('#mapChips').onclick=e=>{const b=e.target.closest('[data-k]');if(b)selectM(+b.dataset.k)};
function selectM(k,redraw){
  cur=(k+NM)%NM;showAll=false;const m=M[cur];if(!redraw)visits[cur]++;$('#mapAll').classList.remove('on');
  ensureMF(m.fig);setLook(MF,'focus',m.id);drawFibers(MF,m,pull);drawLabels(MF,names?Object.keys(MF.shapes):[]);
  document.querySelectorAll('#mapChips .chip').forEach(c=>c.classList.toggle('on',+c.dataset.k===cur));
  $('#mapInfo').innerHTML=`${lvTag(m)}<h3 style="color:${m.color}">${m.ko}${m.med?` <small style="font-size:16px;color:var(--sub)">(${m.med})</small>`:''}</h3>
   <div class="en">${m.en}</div><div class="parts">${partsHTML(m)}</div>
   <dl><dt>위치</dt><dd>${m.where}</dd><dt class="o">이는곳</dt><dd>${m.o}</dd><dt class="i">닿는곳</dt><dd>${m.i}</dd>
   <dt>결 방향</dt><dd>${m.fiber}</dd><dt>하는 일</dt><dd>${m.act}</dd></dl>${m.note?`<div class="note">${m.note}</div>`:''}`;
  const laps=Math.min(...visits);
  $('#lap').textContent=`${cur+1} / ${NM} · ${laps>=1?laps+'바퀴 돎':'첫 바퀴'}`;
}
$('#prevM').onclick=()=>selectM(cur-1);
$('#nextM').onclick=()=>selectM(cur+1);
$('#mapAll').onclick=()=>{showAll=!showAll;$('#mapAll').classList.toggle('on',showAll);if(showAll){setLook(MF,'all');drawFibers(MF,null);drawLabels(MF,Object.keys(MF.shapes));document.querySelectorAll('#mapChips .chip').forEach(c=>c.classList.remove('on'))}else selectM(cur)};
$('#mapPull').onclick=()=>{pull=!pull;$('#mapPull').classList.toggle('on',pull);if(!showAll)selectM(cur)};
$('#mapNames').onclick=()=>{names=!names;$('#mapNames').classList.toggle('on',names);if(showAll)return;drawLabels(MF,names?Object.keys(MF.shapes):[])};
selectM(0);visits.fill(0);visits[0]=1;

// ---------- body ----------
const bodyDone=new Set();let bodyOpen=null;
function bodyRender(){
  bodyOpen=null;
  $('#bcards').innerHTML=BODY.map(b=>{const m=byId[b.id];return `<div class="tcard bcard" data-card="${b.id}">
  <h3><i style="background:${m.color}"></i>${m.ko}</h3>
  <dl><dt>어디</dt><dd>${b.where}</dd><dt>해 보기</dt><dd>${b.how}</dd><dt>느낌</dt><dd>${b.feel}</dd><dt>개는?</dt><dd>${b.dog}</dd></dl>
  <div class="row"><button class="btn sm ghost chk" data-done="${b.id}">느꼈어요</button><button class="btn sm ghost" data-see="${b.id}">개 그림에서 보기</button></div>
  <div class="fig" id="bfig${b.id}" style="display:none;margin-top:10px"></div></div>`}).join('');
  bodyMark();
}
function bodyMark(){
  BODY.forEach(b=>{const d=bodyDone.has(b.id),c=$(`[data-card="${b.id}"]`),k=$(`[data-done="${b.id}"]`);
    c.classList.toggle('done',d);k.classList.toggle('on',d);k.textContent=d?'✓ 느꼈어요':'느꼈어요'});
  $('#bodyCount').textContent=`느낀 근육 ${bodyDone.size} / ${BODY.length}`;
}
function bodyShow(id){
  if(bodyOpen){$('#bfig'+bodyOpen).style.display='none';$('#bfig'+bodyOpen).innerHTML='';$(`[data-see="${bodyOpen}"]`).textContent='개 그림에서 보기';$(`[data-card="${bodyOpen}"]`).classList.remove('wide')}
  if(bodyOpen===id){bodyOpen=null;return}
  bodyOpen=id;$(`[data-card="${id}"]`).classList.add('wide');const host=$('#bfig'+id);host.style.display='block';
  const F=buildFig(host,byId[id].fig);setLook(F,'focus',id);drawFibers(F,byId[id]);
  $(`[data-see="${id}"]`).textContent='그림 닫기';
  host.scrollIntoView({behavior:'smooth',block:'nearest'});
}
$('#bcards').onclick=e=>{
  const d=e.target.closest('[data-done]'),v=e.target.closest('[data-see]');
  if(d){const id=d.dataset.done;bodyDone.has(id)?bodyDone.delete(id):bodyDone.add(id);bodyMark()}
  if(v)bodyShow(v.dataset.see);
};
$('#bodyReset').onclick=()=>{bodyDone.clear();bodyRender()};
if(BODY.length)bodyRender();

// ---------- find game ----------
let FF=null;
const findState={started:false,order:[],k:0,score:0,hard:false,done:false,answered:false};
function ensureFF(fk){if(FF&&FF.fk===fk)return;FF=buildFig($('#findFig'),fk);
  Object.values(FF.shapes).forEach(s=>s.addEventListener('click',()=>findClick(s.dataset.id)));$('#findDir').textContent=figNote(fk)}
function findStart(hard){Object.assign(findState,{started:true,order:shuffle(M.map(m=>m.id)).slice(0,REVIEW?10:NM),k:0,score:0,hard,done:false});findShow()}
function findShow(){
  const S=findState;S.answered=false;
  if(S.k>=S.order.length){S.done=true;ensureFF(byId[S.order[S.order.length-1]].fig);drawFibers(FF,null);setLook(FF,'all');drawLabels(FF,Object.keys(FF.shapes));
    $('#findPrompt').innerHTML=`끝! ${S.score} / ${S.order.length}`;$('#findFb').className='fb';$('#findFb').textContent=S.score===S.order.length?(S.hard?'색 없이 다 맞혔어요. 최고예요!':'다 맞혔어요. 이제 "색 없이"로 도전!'):'한 판 더 하면 더 잘 보여요.';$('#findScore').textContent='';return}
  const m=byId[S.order[S.k]];ensureFF(m.fig);drawFibers(FF,null);drawLabels(FF,[]);
  setLook(FF,S.hard?'none':'hint');
  $('#findPrompt').innerHTML=`<em>${m.ko}</em> 을(를) 눌러요`;
  $('#findScore').textContent=`${S.k+1} / ${S.order.length} · 맞힘 ${S.score}`;
  $('#findFb').className='fb';$('#findFb').textContent=S.hard?'색 힌트 없음':'';
}
function findClick(got){
  const S=findState;if(S.done||S.answered)return;const want=S.order[S.k];S.answered=true;
  const m=byId[want];
  setLook(FF,'focus',want);drawFibers(FF,m);drawLabels(FF,[want]);
  if(got===want){S.score++;$('#findFb').className='fb ok';$('#findFb').textContent=`정답! ${m.ko}: ${m.where}`}
  else{const g=byId[got];FF.shapes[got].setAttribute('fill-opacity',.45);$('#findFb').className='fb no';$('#findFb').textContent=`그건 ${g.ko}예요. ${m.ko}는 색이 진한 곳이에요.`}
  $('#findScore').textContent=`${S.k+1} / ${S.order.length} · 맞힘 ${S.score}`;
}
$('#findNext').onclick=()=>{const S=findState;if(S.done){findStart(S.hard);return}if(!S.answered)return;S.k++;findShow()};
$('#findRestart').onclick=()=>findStart(false);
$('#findHard').onclick=()=>findStart(true);
$('#findLead').textContent=`이름을 보고 그림에서 그 근육을 눌러요. 처음엔 색이 보이고, "색 없이"를 누르면 색이 사라져요.${REVIEW?' 문제마다 그림이 바뀔 수 있어요.':''}`;

// ---------- quiz ----------
const quizState={started:false,qs:[],k:0,score:0,wrong:[]};
function opts4(ans,pool){return shuffle([ans,...shuffle([...new Set(pool)].filter(x=>x!==ans)).slice(0,3)])}
function makeQs(onlyIds){
  const ids=onlyIds&&onlyIds.length?onlyIds:M.map(m=>m.id);
  const types=REVIEW?['move','term','pic','act','move','fiber']:['term','pic','act','fiber','part'];const qs=[];
  const pool=shuffle(ids);let t=0,mvs=REVIEW?shuffle(L.moves):[];
  while(qs.length<QN){
    const m=byId[pool[qs.length%pool.length]];let ty=types[(t++)%types.length];
    if(ty==='move'){const mv=mvs[qs.length%mvs.length];const a=byId[shuffle(mv.ids)[0]];
      qs.push({mid:a.id,q:`<b>${mv.name}</b><br><span class="muted">${mv.desc}</span><br>이때 일하는 근육은?`,a:a.ko,o:opts4(a.ko,M.filter(x=>!mv.ids.includes(x.id)).map(x=>x.ko)),ex:`${mv.name}: ${mv.ids.map(i=>byId[i].ko).join(', ')}`});continue}
    if(ty==='term')qs.push({mid:m.id,q:`<b>${m.en}</b><br><span class="muted">${m.parts.map(p=>p[0]).join(' + ')}</span><br>한글 이름은?`,a:m.ko,o:opts4(m.ko,M.map(x=>x.ko)),ex:`${m.parts.map(p=>p[0]+'('+p[1]+')').join(' + ')} → ${m.ko}`});
    else if(ty==='pic')qs.push({mid:m.id,pic:true,q:'그림에서 색칠된 근육은?',a:m.ko,o:opts4(m.ko,M.filter(x=>x.fig===m.fig).map(x=>x.ko).concat(M.map(x=>x.ko))),ex:`${m.ko}: ${m.where}`});
    else if(ty==='act')qs.push({mid:m.id,q:`이 일을 하는 근육은?<br><span class="muted">"${m.act}"</span>`,a:m.ko,o:opts4(m.ko,M.map(x=>x.ko)),ex:`${m.ko}의 닿는곳은 ${m.i}`});
    else if(ty==='fiber')qs.push({mid:m.id,q:`<b>${m.ko}</b>의 닿는곳은?`,a:m.i,o:opts4(m.i,M.map(x=>x.i)),ex:`이는곳 ${m.o} → 닿는곳 ${m.i}`});
    else{const p=m.parts[0];const all=GLOS.map(g=>g[1]).concat(M.flatMap(x=>x.parts.map(y=>y[1])));
      qs.push({mid:m.id,q:`조각 <b style="font-family:Georgia,serif;font-style:italic">${p[0]}</b> 의 뜻은?`,a:p[1],o:opts4(p[1],all),ex:`${p[0]} = ${p[1]} (예: ${m.en} → ${m.ko})`})}
  }
  return qs;
}
function quizStart(only){Object.assign(quizState,{started:true,qs:makeQs(only),k:0,score:0,wrong:[]});quizShow()}
function quizShow(){
  const S=quizState,box=$('#quizBox');
  if(S.k>=S.qs.length){
    const w=[...new Set(S.wrong)];
    box.innerHTML=`<div class="muted">결과</div><div class="big">${S.score} / ${S.qs.length}</div>
     ${w.length?`<p>헷갈린 근육: <b>${w.map(id=>byId[id].ko).join(', ')}</b></p>`:'<p>모두 맞혔어요!</p>'}
     <div class="row">${w.length?'<button class="btn" id="qRetry">틀린 근육만 다시</button>':''}<button class="btn ghost" id="qNew">새로 ${QN}문제</button></div>`;
    if(w.length)$('#qRetry').onclick=()=>quizStart(w);$('#qNew').onclick=()=>quizStart();return;
  }
  const q=S.qs[S.k];
  box.innerHTML=`<div class="row" style="justify-content:space-between"><span class="muted">${S.k+1}번 / ${S.qs.length}</span><span class="muted">맞힘 ${S.score}</span></div>
   <div class="bar"><i style="width:${S.k/S.qs.length*100}%"></i></div>
   ${q.pic?'<div class="fig" id="quizFig" style="margin-bottom:10px"></div>':''}
   <div class="prompt" style="font-weight:700;line-height:1.5">${q.q}</div>
   <div class="opts">${q.o.map(o=>`<button class="opt">${o}</button>`).join('')}</div>
   <div class="fb" id="qfb"></div><div class="row" style="margin-top:8px"><button class="btn" id="qNext" style="display:none">다음 ▶</button></div>`;
  if(q.pic){const F=buildFig($('#quizFig'),byId[q.mid].fig);setLook(F,'focus',q.mid);drawFibers(F,byId[q.mid])}
  box.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
    if(box.dataset.lock==='1')return;box.dataset.lock='1';
    const ok=b.textContent===q.a;
    box.querySelectorAll('.opt').forEach(x=>{if(x.textContent===q.a)x.classList.add('ok')});
    if(ok){S.score++;$('#qfb').className='fb ok';$('#qfb').textContent='정답! '+q.ex}
    else{b.classList.add('no');S.wrong.push(q.mid);$('#qfb').className='fb no';$('#qfb').textContent='아쉬워요. '+q.ex}
    $('#qNext').style.display='';$('#qNext').onclick=()=>{box.dataset.lock='0';S.k++;quizShow()};
  });
  box.dataset.lock='0';
}

// ---------- flash ----------
let deck=[];
function fBuild(){
  deck=shuffle(M.flatMap(m=>{const c=[
    {q:m.en,a:`<b style="color:${m.color};font-size:22px">${m.ko}</b>${m.med?` (${m.med})`:''}<br>${m.parts.map(p=>p[0]+' '+p[1]).join(' + ')}`},
    {q:`${m.ko}<br><small style="font-size:16px;color:var(--sub)">하는 일은?</small>`,a:m.act}];
    if(!REVIEW)c.splice(1,0,{q:`${m.ko}<br><small style="font-size:16px;color:var(--sub)">어디서 → 어디로?</small>`,a:`<b style="color:var(--o)">이는곳</b> ${m.o}<br><b style="color:var(--i)">닿는곳</b> ${m.i}<br>${m.fiber}`});
    return c}));fShow();
}
function fShow(){
  $('#flashCard').classList.remove('open');
  if(!deck.length){$('#fq').textContent='다 외웠어요! 🎉';$('#fa').innerHTML='';$('#fLeft').innerHTML='<button class="btn sm ghost" id="fRe">처음부터</button>';$('#fRe').onclick=fBuild;return}
  $('#fq').innerHTML=deck[0].q;$('#fa').innerHTML=deck[0].a;$('#fLeft').textContent=`남은 카드 ${deck.length}`;
}
$('#flashCard').onclick=()=>$('#flashCard').classList.toggle('open');
$('#fKnow').onclick=()=>{if(!deck.length)return;deck.shift();fShow()};
$('#fAgain').onclick=()=>{if(!deck.length)return;const c=deck.shift();deck.splice(Math.min(3,deck.length),0,c);fShow()};
fBuild();

// restore tab (레벨을 바꿨으면 첫 화면)
if(!lvChanged){const t=store('dm_tab');if(t&&(TABNAMES[t]||t==='flash'))go(t)}

// 화면 크기가 바뀌면 다시 맞춤
let rzT=0;addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{const s=document.querySelector('main>section.on');fitIn(s);if(s&&s.id==='map'&&!showAll)selectM(cur,true);if(s&&s.id==='basic'&&drawBasicPts)drawBasicPts()},200)});
