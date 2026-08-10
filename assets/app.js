const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];
$('.hamb')?.addEventListener('click',()=>$('.nav').classList.toggle('open'));
$$('.faq-q').forEach(q=>q.addEventListener('click',()=>q.parentElement.classList.toggle('open')));
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{const group=b.closest('[data-filterbar]'); $$('[data-filter]',group).forEach(x=>x.classList.remove('active'));b.classList.add('active'); const val=b.dataset.filter; $$('.filter-item').forEach(c=>c.classList.toggle('hide',val!=='all'&&c.dataset.cat!==val));}));
$$('.slot').forEach(s=>s.addEventListener('click',()=>{$$('.slot').forEach(x=>x.classList.remove('selected'));s.classList.add('selected');const out=$('#selected-time');if(out)out.textContent=s.textContent.trim()}));
$$('.day').forEach(d=>d.addEventListener('click',()=>{if(!d.textContent.trim())return;$$('.day').forEach(x=>x.classList.remove('selected'));d.classList.add('selected')}));
let bookingStep=1;
function syncBooking(){ $$('.step').forEach((s,i)=>s.classList.toggle('active',i<bookingStep)); $$('.booking-pane').forEach((p,i)=>p.classList.toggle('hide',i!==bookingStep-1)); $('#prevStep')?.classList.toggle('hide',bookingStep===1); if($('#nextStep')) $('#nextStep').textContent=bookingStep===5?'Hoàn tất đặt lịch':'Tiếp tục →'; }
$('#nextStep')?.addEventListener('click',()=>{ if(bookingStep<5){bookingStep++;syncBooking()}else{alert('TEHIRA đã nhận yêu cầu đặt lịch. Bộ phận tư vấn sẽ liên hệ xác nhận với anh/chị.'); bookingStep=1;syncBooking()}});
$('#prevStep')?.addEventListener('click',()=>{if(bookingStep>1){bookingStep--;syncBooking()}}); syncBooking();
$('#contactForm')?.addEventListener('submit',e=>{e.preventDefault();alert('Cảm ơn anh/chị. TEHIRA đã nhận thông tin và sẽ liên hệ sớm.');e.target.reset()});
$('#newsletterForm')?.addEventListener('submit',e=>{e.preventDefault();alert('Đăng ký nhận bản tin TEHIRA thành công.');e.target.reset()});

/* ===== Video workshop: tự phát (muted) khi cuộn tới, dừng khi rời khỏi ===== */
(function(){
  const v=$('.video-sec video'); if(!v) return;
  v.muted=true; let interacted=false;
  const unmute=()=>{ interacted=true; v.muted=false; if(v.volume<0.1)v.volume=1;
    ['pointerdown','keydown','wheel','touchstart'].forEach(ev=>removeEventListener(ev,unmute)); };
  ['pointerdown','keydown','wheel','touchstart'].forEach(ev=>addEventListener(ev,unmute,{passive:true}));
  if(!('IntersectionObserver' in window)){ const p=v.play&&v.play(); if(p&&p.catch)p.catch(()=>{}); return; }
  const io=new IntersectionObserver(es=>{es.forEach(e=>{
    if(e.isIntersecting){ if(interacted)v.muted=false; const p=v.play(); if(p&&p.catch) p.catch(()=>{}); }
    else if(!v.paused){ v.pause(); }
  });},{threshold:.4});
  io.observe(v);
})();

/* ===== WOW: reveal khi cuộn · thanh tiến trình · ánh sáng theo con trỏ · thẻ nghiêng 3D ===== */
(function(){
  // Reveal on scroll
  const rev=$$('[data-reveal]');
  if(rev.length){
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver((es,o)=>{es.forEach(e=>{if(e.isIntersecting){const el=e.target,d=+el.dataset.delay||0;setTimeout(()=>el.classList.add('in'),d);o.unobserve(el);}});},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
      rev.forEach(el=>io.observe(el));
    } else rev.forEach(el=>el.classList.add('in'));
  }
  // Scroll progress
  const prog=$('.scroll-prog');
  if(prog){ const upd=()=>{const h=document.documentElement,max=h.scrollHeight-h.clientHeight;prog.style.width=(max>0?h.scrollTop/max*100:0)+'%';}; addEventListener('scroll',upd,{passive:true}); addEventListener('resize',upd); upd(); }
  // Cursor-follow glow (chỉ chuột thật)
  const glow=$('.cursor-glow');
  if(glow && matchMedia('(pointer:fine)').matches){
    let gx=innerWidth/2,gy=innerHeight/2,cx=gx,cy=gy;
    addEventListener('pointermove',e=>{gx=e.clientX;gy=e.clientY;},{passive:true});
    (function loop(){cx+=(gx-cx)*.16;cy+=(gy-cy)*.16;glow.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;requestAnimationFrame(loop);})();
  }
  // Thẻ dịch vụ: nghiêng 3D + sheen theo con trỏ
  if(matchMedia('(pointer:fine)').matches){
    $$('.service').forEach(card=>{
      card.insertAdjacentHTML('beforeend','<span class="glow"></span>');
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect(), px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
        card.style.transform=`perspective(900px) rotateY(${(px-.5)*11}deg) rotateX(${(.5-py)*11}deg) translateY(-6px)`;
        card.style.setProperty('--mx',px*100+'%'); card.style.setProperty('--my',py*100+'%');
      });
      card.addEventListener('pointerleave',()=>{card.style.transform='';});
    });
  }
})();

/* ===== WOW 2: đếm số · con trỏ ring · nút nam châm · tiêu đề theo chữ · parallax hero ===== */
(function(){
  const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine=matchMedia('(pointer:fine)').matches;

  // 1) Đếm số tăng dần
  const nums=$$('.num[data-count]');
  if(nums.length){
    const fmt=n=>Math.round(n).toLocaleString('vi-VN');
    const run=el=>{const target=+el.dataset.count,suf=el.dataset.suffix||'';
      if(RM){el.textContent=fmt(target)+suf;return;}
      const dur=1700;let st=null;
      const step=ts=>{if(st==null)st=ts;const p=Math.min(1,(ts-st)/dur),e=1-Math.pow(1-p,3);el.textContent=fmt(target*e)+suf;if(p<1)requestAnimationFrame(step);else el.textContent=fmt(target)+suf;};
      requestAnimationFrame(step);};
    if('IntersectionObserver' in window){const io=new IntersectionObserver((es,o)=>{es.forEach(e=>{if(e.isIntersecting){run(e.target);o.unobserve(e.target);}});},{threshold:.5});nums.forEach(n=>io.observe(n));}
    else nums.forEach(run);
  }

  // 2) Con trỏ ring bám theo + phình khi rê vào phần tử tương tác
  const ring=$('.cursor-ring');
  if(ring && fine && !RM){
    let rx=innerWidth/2,ry=innerHeight/2,tx=rx,ty=ry;
    addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;ring.classList.toggle('hot',!!(e.target.closest&&e.target.closest('a,button,.btn,.service,.book,video,.faq-q')));},{passive:true});
    (function l(){rx+=(tx-rx)*.22;ry+=(ty-ry)*.22;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(l);})();
  }

  // 3) Nút CTA nam châm
  if(fine && !RM){
    $$('.btn').forEach(b=>{
      b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-(r.left+r.width/2))*.25}px,${(e.clientY-(r.top+r.height/2))*.4}px)`;});
      b.addEventListener('pointerleave',()=>{b.style.transform='';});
    });
  }

  // 4) Tiêu đề Hero hiện theo từng chữ
  const h1=$('.hero h1');
  if(h1 && !RM){
    h1.style.opacity='1';h1.style.transform='none';h1.style.animation='none';
    let wi=0;
    (function process(node){[...node.childNodes].forEach(ch=>{
      if(ch.nodeType===3){const frag=document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(tok=>{
          if(tok===''||/^\s+$/.test(tok))frag.appendChild(document.createTextNode(tok));
          else{const s=document.createElement('span');s.className='w';s.textContent=tok;s.style.animationDelay=(0.12+wi*0.07)+'s';wi++;frag.appendChild(s);}
        });node.replaceChild(frag,ch);
      } else if(ch.nodeType===1 && ch.tagName!=='BR') process(ch);
    });})(h1);
  }

  // 5) Parallax cuộn cho Hero (desktop)
  const copy=$('.hero .copy'), stage=$('.hero .stage');
  if(!RM && matchMedia('(min-width:1051px)').matches){
    addEventListener('scroll',()=>{const y=scrollY;if(y>1000)return;if(copy)copy.style.transform=`translateY(${y*.12}px)`;if(stage)stage.style.transform=`translateY(${y*-.06}px)`;},{passive:true});
  }

  // 6) Bụi vàng bay lơ lửng toàn trang (canvas) — rõ nét & lấp lánh
  const c=$('.stardust');
  if(c && !RM){
    const ctx=c.getContext('2d'); const dpr=Math.min(2,window.devicePixelRatio||1); let w,h,parts,t=0;
    const size=()=>{w=c.width=innerWidth*dpr;h=c.height=innerHeight*dpr;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';};
    const init=()=>{const n=Math.min(90,Math.round(innerWidth/16));parts=Array.from({length:n},()=>({
      x:Math.random()*w,y:Math.random()*h,
      r:(Math.random()*2.6+0.9)*dpr,
      s:(Math.random()*0.5+0.15)*dpr,
      d:Math.random()*Math.PI*2,
      tw:Math.random()*0.06+0.02,           // tốc độ lấp lánh
      o:Math.random()*0.45+0.4              // độ sáng nền
    }));};
    size();init(); addEventListener('resize',()=>{size();init();});
    // Vệt sao vàng li ti bắn ra theo con trỏ
    const trail=[];
    if(matchMedia('(pointer:fine)').matches){
      let lx=0,ly=0;
      addEventListener('pointermove',e=>{const x=e.clientX*dpr,y=e.clientY*dpr;const dist=Math.hypot(x-lx,y-ly);const count=Math.min(4,1+Math.floor(dist/(13*dpr)));
        for(let i=0;i<count;i++)trail.push({x:x+(Math.random()-0.5)*9*dpr,y:y+(Math.random()-0.5)*9*dpr,vx:(Math.random()-0.5)*0.7*dpr,vy:((Math.random()-0.5)*0.7-0.15)*dpr,r:(Math.random()*1.8+0.7)*dpr,life:1});
        lx=x;ly=y;if(trail.length>150)trail.splice(0,trail.length-150);},{passive:true});
    }
    (function draw(){ t+=0.016; ctx.clearRect(0,0,w,h);
      ctx.shadowColor='rgba(230,175,100,.95)';
      for(const p of parts){
        p.y-=p.s; p.x+=Math.sin(t+p.d)*0.3*dpr;
        if(p.y<-10)p.y=h+10; if(p.x<-10)p.x=w+10; if(p.x>w+10)p.x=-10;
        const tw=0.55+0.45*Math.sin(t*10*p.tw*20+p.d);
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.3);
        ctx.fillStyle='rgba(214,152,86,'+(p.o*tw)+')';
        ctx.shadowBlur=9*dpr; ctx.fill();
      }
      ctx.shadowColor='rgba(238,188,112,1)';
      for(let i=trail.length-1;i>=0;i--){const s=trail[i];s.x+=s.vx;s.y+=s.vy;s.vy+=0.006*dpr;s.life-=0.028;
        if(s.life<=0){trail.splice(i,1);continue;}
        ctx.beginPath(); ctx.arc(s.x,s.y,Math.max(0.1,s.r*s.life),0,6.3);
        ctx.fillStyle='rgba(242,192,122,'+s.life+')'; ctx.shadowBlur=8*dpr; ctx.fill();}
      requestAnimationFrame(draw); })();
  } else if(c){ c.remove(); }
})();

/* ===== Before/After kéo trượt ===== */
(function(){
  const ba=$('.ba'); if(!ba) return;
  const set=v=>{v=Math.max(0,Math.min(100,v));ba.style.setProperty('--pos',v+'%');ba.setAttribute('aria-valuenow',Math.round(v));};
  const fromX=x=>{const r=ba.getBoundingClientRect();set((x-r.left)/r.width*100);};
  let drag=false;
  ba.addEventListener('pointerdown',e=>{drag=true;try{ba.setPointerCapture(e.pointerId);}catch(_){}
    fromX(e.clientX);});
  ba.addEventListener('pointermove',e=>{if(drag)fromX(e.clientX);});
  ba.addEventListener('pointerup',()=>drag=false);
  ba.addEventListener('pointercancel',()=>drag=false);
  ba.addEventListener('keydown',e=>{const cur=parseFloat(ba.style.getPropertyValue('--pos'))||50;if(e.key==='ArrowLeft')set(cur-4);else if(e.key==='ArrowRight')set(cur+4);});
})();

/* ===== 2 vòng sao quanh quả cầu; lướt xuống TẤT CẢ sao bay chậm xuống, mỗi ô ~3 sao; lướt lên bay trở lại (LẶP) ===== */
(function(){
  const orb=$('.orb'); if(!orb) return;
  const section=$('.after');
  const cards=section?$$('.service',section):[];
  const cardsN=cards.length||5, PER=3;
  const DOWN=3000, UP=2700, ARC=78;
  const RINGS=[
    {R:0.72, yf:0.40, dir:1,  tilt:0.0, spd:0.70},   // vòng trong
    {R:1.05, yf:0.30, dir:-1, tilt:0.5, spd:0.54}    // vòng ngoài nghiêng, ngược chiều
  ];
  const layer=document.createElement('div'); layer.className='orbit-fx'; document.body.appendChild(layer);
  const stars=[]; let idx=0; const TOTAL=PER*cardsN;
  for(let k=0;k<PER;k++) for(let ci=0;ci<cardsN;ci++){
    const el=document.createElement('span'); el.className='ostar'; el.textContent='✦'; layer.appendChild(el);
    stars.push({el,ring:idx%2,ph:idx*(Math.PI*2/TOTAL),state:'orbit',p:0,sx:0,sy:0,
      card:cards[ci]||null, fx:(k-1)*0.24, fy:(k-1)*0.05, fl:idx*1.3, stag:idx*0.026});
    idx++;
  }
  const ease=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
  function orbitPos(st,t){
    const o=orb.getBoundingClientRect();
    const cx=o.left+o.width/2, cy=o.top+o.height/2, rc=RINGS[st.ring];
    const ang=t*rc.spd*rc.dir+st.ph;
    const ex=Math.cos(ang)*o.width*rc.R, ey=Math.sin(ang)*o.width*rc.R*rc.yf;
    const ct=Math.cos(rc.tilt), stt=Math.sin(rc.tilt);
    return {x:cx+ex*ct-ey*stt, y:cy+ex*stt+ey*ct, front:(Math.sin(ang)+1)/2, ang, onScreen:o.bottom>-60&&o.top<innerHeight+60};
  }
  function cardPos(st){const c=st.card.getBoundingClientRect();return {x:c.left+c.width*(0.5+st.fx), y:c.top+c.height*(0.32+st.fy)};}
  let last=performance.now();
  function tick(now){
    const dt=Math.min(50,now-last); last=now; const t=now/1000;
    stars.forEach(st=>{
      const op0=orbitPos(st,t); let x,y,sc=1,op=1,rot=0,fs;
      if(st.state==='orbit'){ x=op0.x;y=op0.y;sc=0.7+op0.front*0.75;op=op0.onScreen?0.5+op0.front*0.5:0;rot=op0.ang*40;fs=12+op0.front*11; }
      else if(st.state==='service'){ const cp=cardPos(st);x=cp.x;y=cp.y+Math.sin(t*2+st.fl)*4;sc=1.05;op=1;rot=t*30;fs=20; }
      else {
        st.p+=dt/(st.state==='toService'?DOWN:UP);
        if(st.p<0){ // chờ so le: giữ nguyên vị trí "nhà" (đang quỹ đạo / đang ở ô)
          if(st.state==='toService'){ x=op0.x;y=op0.y;sc=0.7+op0.front*0.75;op=op0.onScreen?0.5+op0.front*0.5:0;rot=op0.ang*40;fs=12+op0.front*11; st.sx=op0.x;st.sy=op0.y; }
          else { const cp=cardPos(st);x=cp.x;y=cp.y;sc=1.05;op=1;rot=t*30;fs=20; st.sx=cp.x;st.sy=cp.y; }
        } else {
          const pc=Math.min(1,st.p), e=ease(pc), tgt=st.state==='toService'?cardPos(st):op0;
          x=st.sx+(tgt.x-st.sx)*e; y=st.sy+(tgt.y-st.sy)*e - Math.sin(pc*Math.PI)*ARC;
          sc=1+Math.sin(pc*Math.PI)*0.55; op=1; rot=pc*(st.state==='toService'?420:-420); fs=15+Math.sin(pc*Math.PI)*6;
          if(st.p>=1){ if(st.state==='toService'){st.state='service'; if(st.card){st.card.classList.add('sparkled');setTimeout(()=>st.card.classList.remove('sparkled'),800);}} else st.state='orbit'; st.p=0; }
        }
      }
      st.el.style.fontSize=fs+'px'; st.el.style.opacity=op;
      st.el.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%) scale(${sc}) rotate(${rot}deg)`;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  function go(toService){
    stars.forEach(st=>{
      if(!st.card) return;
      const r=st.el.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
      if(toService && (st.state==='orbit'||st.state==='toOrbit')){ st.sx=cx;st.sy=cy;st.state='toService';st.p=-st.stag; }
      else if(!toService && (st.state==='service'||st.state==='toService')){ st.sx=cx;st.sy=cy;st.state='toOrbit';st.p=-st.stag; }
    });
  }
  if(section && 'IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>{es.forEach(e=>go(e.isIntersecting));},{threshold:.25});
    io.observe(section);
  }
})();
