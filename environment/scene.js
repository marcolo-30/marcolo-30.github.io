// ═══════════════════════════════════════════════════════════════════
// scene.js  —  Iron Lab 3D Scene  (devices, room, wall art)
// ═══════════════════════════════════════════════════════════════════

// ── helpers ─────────────────────────────────────────────────────────
function box(w,h,d,mat){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat)}
function cyl(rt,rb,h,seg,mat){return new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat)}
function sphere(r,ws,hs,mat){return new THREE.Mesh(new THREE.SphereGeometry(r,ws,hs),mat)}
function led(parent,x,y,z,col,r){
  r=r||0.016;
  const m=sphere(r,6,6,M.add(col||0x00ff44,1)); m.position.set(x,y,z); parent.add(m);
  const g=sphere(r*2.4,6,6,M.add(col||0x00ff44,0.15)); g.position.set(x,y,z); parent.add(g);
}
var clickables=[];
function reg(g,data){g.userData.cvData=data; clickables.push(g);}

function canvasTex(w,h,fn){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  fn(c.getContext('2d'),w,h);
  return new THREE.CanvasTexture(c);
}

// ── materials ─────────────────────────────────────────────────────
var M={
  std:(c,met,rou)=>new THREE.MeshStandardMaterial({color:c,metalness:met||0.5,roughness:rou||0.5}),
  add:(c,op)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op||0.8,blending:THREE.AdditiveBlending,depthWrite:false}),
  wire:(c,op)=>new THREE.MeshBasicMaterial({color:c,wireframe:true,transparent:true,opacity:op||0.4,blending:THREE.AdditiveBlending,depthWrite:false}),
  pcb:()=>new THREE.MeshStandardMaterial({color:0x1a5c2a,metalness:0.3,roughness:0.6})
};

// ═══════════════════════════════════════════════════════════════════
// ROOM
// ═══════════════════════════════════════════════════════════════════
// RW,RD,RH,BACK,LEFT,RIGHT defined in index.html before this file loads

var floorMat=M.std(0x000e18,0.9,0.3);
var floorMesh=new THREE.Mesh(new THREE.PlaneGeometry(RW+2,RD+2),floorMat);
floorMesh.rotation.x=-Math.PI/2; scene.add(floorMesh);

var gridHelper=new THREE.GridHelper(RW,14,0x003355,0x001a2e);
gridHelper.position.y=0.01; scene.add(gridHelper);

var wallMat=()=>M.std(0x0a1628,0.4,0.85); // navy blue
var backWallM=new THREE.Mesh(new THREE.PlaneGeometry(RW,RH),wallMat());
backWallM.position.set(0,RH/2,BACK); scene.add(backWallM);
var leftWallM=new THREE.Mesh(new THREE.PlaneGeometry(RD,RH),wallMat());
leftWallM.position.set(LEFT,RH/2,0); leftWallM.rotation.y=Math.PI/2; scene.add(leftWallM);
var rightWallM=new THREE.Mesh(new THREE.PlaneGeometry(RD,RH),wallMat());
rightWallM.position.set(RIGHT,RH/2,0); rightWallM.rotation.y=-Math.PI/2; scene.add(rightWallM);
var ceilMesh=new THREE.Mesh(new THREE.PlaneGeometry(RW+2,RD+2),wallMat());
ceilMesh.rotation.x=Math.PI/2; ceilMesh.position.y=RH; scene.add(ceilMesh);

// floor accent lines
[-3,0,3].forEach(x=>{
  const fl=box(0.03,0.012,RD*0.7,M.add(0x00d4ff,0.3)); fl.position.set(x,0.01,0); scene.add(fl);
});
// ceiling strips + lights
for(let i=-2;i<=2;i++){
  const s=box(0.07,0.03,4,M.add(0x00ccff,0.6)); s.position.set(i*2.5,RH-0.02,0); scene.add(s);
  const sl=new THREE.PointLight(0x00aaff,0.28,6); sl.position.set(i*2.5,RH-0.3,0); scene.add(sl);
}

// expose for dark/light mode
window.ROOM_MATS={floorMat,walls:[backWallM.material,leftWallM.material,rightWallM.material,ceilMesh.material],grid:gridHelper};

// ═══════════════════════════════════════════════════════════════════
// STAPLES CENTER MURAL  (left wall)
// ═══════════════════════════════════════════════════════════════════
function makeStaplesMural(){
  const tex=canvasTex(1024,921,function(ctx,W,H){
    // hardwood floor
    var wood=ctx.createLinearGradient(0,0,0,H);
    wood.addColorStop(0,'#c8873a'); wood.addColorStop(0.5,'#d4973f'); wood.addColorStop(1,'#b87030');
    ctx.fillStyle=wood; ctx.fillRect(0,0,W,H);
    for(var x=0;x<W;x+=18){ctx.strokeStyle='rgba(0,0,0,0.07)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    var cx=W/2,cy=H*0.55,cw=W*0.88,ch=H*0.80,x0=(W-cw)/2,y0=(H-ch)/2;
    // court outline
    ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.strokeRect(x0,y0,cw,ch);
    // half-court line
    ctx.beginPath();ctx.moveTo(W/2,y0);ctx.lineTo(W/2,y0+ch);ctx.stroke();
    // center circle
    ctx.beginPath();ctx.arc(cx,cy,ch*0.16,0,Math.PI*2);ctx.stroke();
    // Lakers paint
    var pw2=cw*0.29,ph2=ch*0.42;
    ctx.fillStyle='rgba(85,37,131,0.7)';
    ctx.fillRect(x0,cy-ph2/2,pw2,ph2);
    ctx.strokeRect(x0,cy-ph2/2,pw2,ph2);
    ctx.fillRect(x0+cw-pw2,cy-ph2/2,pw2,ph2);
    ctx.strokeRect(x0+cw-pw2,cy-ph2/2,pw2,ph2);
    // free-throw arcs
    ctx.beginPath();ctx.arc(x0+pw2,cy,ph2*0.38,Math.PI*0.5,Math.PI*1.5);ctx.stroke();
    ctx.beginPath();ctx.arc(x0+cw-pw2,cy,ph2*0.38,-Math.PI*0.5,Math.PI*0.5);ctx.stroke();
    // 3-pt arcs
    ctx.beginPath();ctx.arc(x0+pw2*0.28,cy,ch*0.4,-Math.PI*0.68,Math.PI*0.68);ctx.stroke();
    ctx.beginPath();ctx.arc(x0+cw-pw2*0.28,cy,ch*0.4,Math.PI*0.32,Math.PI*1.68);ctx.stroke();
    // corner 3-pt lines
    [cy-ph2*0.78,cy+ph2*0.78].forEach(function(ly){
      ctx.beginPath();ctx.moveTo(x0,ly);ctx.lineTo(x0+pw2*0.6,ly);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x0+cw,ly);ctx.lineTo(x0+cw-pw2*0.6,ly);ctx.stroke();
    });
    // center Lakers logo
    ctx.save();ctx.translate(cx,cy);
    ctx.beginPath();ctx.moveTo(0,-38);ctx.lineTo(28,-20);ctx.lineTo(28,14);ctx.lineTo(0,38);ctx.lineTo(-28,14);ctx.lineTo(-28,-20);ctx.closePath();
    ctx.fillStyle='rgba(85,37,131,0.65)';ctx.fill();
    ctx.strokeStyle='#FDB927';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#FDB927';ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('LAKERS',0,2);
    ctx.restore();
    // gold border
    ctx.strokeStyle='#FDB927';ctx.lineWidth=4;ctx.strokeRect(x0-4,y0-4,cw+8,ch+8);
    ctx.fillStyle='rgba(253,185,39,0.4)';ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.fillText('CRYPTO.COM ARENA',cx,y0+11);
  });

  var g=new THREE.Group();
  var pw=RD/2, ph=RH;  // back half of left wall
  var plane=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshBasicMaterial({map:tex}));
  g.add(plane);

  // arena fill light
  var arenaLight=new THREE.RectAreaLight(0xfff5dd,1.0,pw*0.8,ph*0.8);
  arenaLight.position.set(LEFT+1,RH/2,-5); arenaLight.lookAt(2,RH/2,-5);
  scene.add(arenaLight);

  g.position.set(LEFT+0.04, RH/2, -5); g.rotation.y=Math.PI/2;
  scene.add(g); reg(g,CV.staples);
}

// ═══════════════════════════════════════════════════════════════════
// BEACH MURAL  (right wall)
// ═══════════════════════════════════════════════════════════════════
function makeBeachMural(){
  var tex=canvasTex(1024,640,function(ctx,W,H){
    // sky
    var sky=ctx.createLinearGradient(0,0,0,H*0.55);
    sky.addColorStop(0,'#1a7ab5');sky.addColorStop(0.5,'#4db3e8');sky.addColorStop(1,'#a8dff0');
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H*0.55);
    // sun
    var sg=ctx.createRadialGradient(W*0.75,H*0.12,0,W*0.75,H*0.12,55);
    sg.addColorStop(0,'rgba(255,255,180,1)');sg.addColorStop(0.6,'rgba(255,220,80,0.7)');sg.addColorStop(1,'rgba(255,200,60,0)');
    ctx.fillStyle=sg;ctx.beginPath();ctx.arc(W*0.75,H*0.12,55,0,Math.PI*2);ctx.fill();
    // islands
    ctx.fillStyle='rgba(20,90,50,0.6)';
    ctx.beginPath();ctx.ellipse(W*0.18,H*0.44,80,35,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(W*0.82,H*0.44,60,25,0,0,Math.PI*2);ctx.fill();
    // ocean
    var ocean=ctx.createLinearGradient(0,H*0.48,0,H*0.72);
    ocean.addColorStop(0,'#0f7ab0');ocean.addColorStop(1,'#3ab8e8');
    ctx.fillStyle=ocean;ctx.fillRect(0,H*0.48,W,H*0.24);
    // waves
    ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=2;
    [0.51,0.56,0.61,0.66].forEach(function(y,i){
      ctx.beginPath();
      for(var x=0;x<W;x+=4)ctx.lineTo(x,H*y+Math.sin(x*0.04+i)*5);
      ctx.stroke();
    });
    ctx.strokeStyle='rgba(255,255,255,0.85)';ctx.lineWidth=4;
    ctx.beginPath();
    for(var x=0;x<W;x+=3)ctx.lineTo(x,H*0.7+Math.sin(x*0.025)*8);
    ctx.stroke();
    // wet sand
    var wet=ctx.createLinearGradient(0,H*0.7,0,H*0.76);
    wet.addColorStop(0,'#9abacc');wet.addColorStop(1,'#c8a870');
    ctx.fillStyle=wet;ctx.fillRect(0,H*0.7,W,H*0.06);
    // dry sand
    var sand=ctx.createLinearGradient(0,H*0.76,0,H);
    sand.addColorStop(0,'#d4b06a');sand.addColorStop(1,'#b88840');
    ctx.fillStyle=sand;ctx.fillRect(0,H*0.76,W,H*0.24);
    // sand ripples
    ctx.strokeStyle='rgba(150,110,50,0.25)';ctx.lineWidth=1;
    for(var i=0;i<7;i++){ctx.beginPath();for(var x=0;x<W;x+=5)ctx.lineTo(x,H*(0.79+i*0.026)+Math.sin(x*0.03+i)*3);ctx.stroke();}
    // palm left
    function palm(tx,ty,lean){
      ctx.save();ctx.translate(tx,ty);
      ctx.strokeStyle='#5a3a1a';ctx.lineWidth=8;
      ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(lean*40,-H*0.15,lean*60,-H*0.28);ctx.stroke();
      var fronds=[[-50,-20,-90,-60],[-30,-10,-80,-70],[0,0,-50,-80],[30,-10,20,-90],[50,-20,80,-70]];
      ctx.strokeStyle='#2d6a1a';ctx.lineWidth=4;
      fronds.forEach(function(f){
        ctx.beginPath();ctx.moveTo(lean*60,-H*0.28);ctx.quadraticCurveTo(lean*60+f[0],-H*0.28+f[1],lean*60+f[2],-H*0.28+f[3]);ctx.stroke();
      });
      ctx.fillStyle='#5a3010';
      ctx.beginPath();ctx.arc(lean*60+8,-H*0.285,7,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(lean*60-5,-H*0.275,6,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    palm(W*0.12,H*0.78,1);
    palm(W*0.88,H*0.78,-1);
    // seashells
    ctx.fillStyle='rgba(255,240,220,0.8)';
    [[W*0.3,H*0.9,8],[W*0.45,H*0.95,5],[W*0.6,H*0.88,7]].forEach(function(s){
      ctx.beginPath();ctx.ellipse(s[0],s[1],s[2],s[2]*0.6,0.4,0,Math.PI*2);ctx.fill();
    });
    ctx.fillStyle='rgba(255,255,255,0.1)';ctx.font='bold 40px serif';ctx.textAlign='center';ctx.fillText('MI PLAYA',W/2,H*0.6);
  });

  var g=new THREE.Group();
  var pw=RD/2, ph=RH;  // front half of left wall
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshBasicMaterial({map:tex})));
  // dividing strip between basketball / beach
  var divider=box(0.08,RH,0.18,M.add(0xffd700,0.8));
  divider.position.set(-pw/2,0,0); g.add(divider);
  // beach fill light
  var beachLight=new THREE.RectAreaLight(0xfff0cc,0.9,pw*0.8,ph*0.8);
  beachLight.position.set(LEFT+1,RH/2,5); beachLight.lookAt(2,RH/2,5);
  scene.add(beachLight);
  g.position.set(LEFT+0.04, RH/2, 5); g.rotation.y=Math.PI/2;
  scene.add(g); reg(g,CV.beach);
}

// ═══════════════════════════════════════════════════════════════════
// ACOUSTIC GUITAR
// ═══════════════════════════════════════════════════════════════════
function makeGuitar(x,y,z,rotY,rotZ){
  var g=new THREE.Group();
  var bMat=new THREE.MeshStandardMaterial({color:0x8b4513,metalness:0.1,roughness:0.6});
  var dkMat=M.std(0x3d1a00,0.1,0.8);
  var crMat=M.std(0xf5f0e0,0.05,0.9);
  var goMat=M.std(0xd4a017,0.9,0.1);
  var ebMat=M.std(0x111111,0.2,0.7);
  // body bouts
  var lo=new THREE.Mesh(new THREE.CylinderGeometry(0.52,0.52,0.065,32),bMat);
  lo.rotation.x=Math.PI/2; lo.position.y=-0.32; g.add(lo);
  var up=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.065,32),bMat);
  up.rotation.x=Math.PI/2; up.position.y=0.28; g.add(up);
  var waist=box(0.55,0.35,0.065,bMat); waist.position.y=-0.04; g.add(waist);
  // top plate
  var tp=new THREE.Mesh(new THREE.CircleGeometry(0.52,32),crMat);
  tp.rotation.x=Math.PI/2; tp.position.set(0,-0.32,0.033); g.add(tp);
  var tp2=new THREE.Mesh(new THREE.CircleGeometry(0.38,32),crMat);
  tp2.rotation.x=Math.PI/2; tp2.position.set(0,0.28,0.033); g.add(tp2);
  var tmid=box(0.55,0.35,0.004,crMat); tmid.position.set(0,-0.04,0.033); g.add(tmid);
  // sound hole
  var hole=new THREE.Mesh(new THREE.RingGeometry(0.09,0.14,32),M.std(0x5a3010,0.2,0.8));
  hole.rotation.x=Math.PI/2; hole.position.set(0,-0.32,0.036); g.add(hole);
  var rosette=new THREE.Mesh(new THREE.RingGeometry(0.14,0.16,32),goMat);
  rosette.rotation.x=Math.PI/2; rosette.position.set(0,-0.32,0.035); g.add(rosette);
  var holeFill=new THREE.Mesh(new THREE.CircleGeometry(0.09,32),ebMat);
  holeFill.rotation.x=Math.PI/2; holeFill.position.set(0,-0.32,0.037); g.add(holeFill);
  // bridge
  var bridge=box(0.32,0.04,0.02,ebMat); bridge.position.set(0,-0.52,0.037); g.add(bridge);
  // neck
  var neck=box(0.12,1.0,0.04,dkMat); neck.position.set(0,1.1,0); g.add(neck);
  var fb=box(0.11,0.95,0.014,ebMat); fb.position.set(0,1.1,0.024); g.add(fb);
  for(var fi=0;fi<13;fi++){var fr=box(0.11,0.007,0.007,M.std(0xcccccc,0.9,0.1));fr.position.set(0,0.66+fi*0.058,0.031);g.add(fr);}
  // headstock
  var hs=box(0.14,0.36,0.034,dkMat); hs.position.set(0,1.7,0); g.add(hs);
  // tuning pegs
  [-1,1].forEach(function(side){
    for(var t=0;t<3;t++){
      var peg=cyl(0.017,0.017,0.06,6,goMat); peg.rotation.z=Math.PI/2; peg.position.set(side*0.094,1.62+t*0.08,-0.01); g.add(peg);
    }
  });
  // strings
  for(var s=0;s<6;s++){
    var str=box(0.004+s*0.001,1.82,0.003,M.std(0xdddddd,0.95,0.05));
    str.position.set(-0.05+s*0.02,0.7,0.038); g.add(str);
  }
  // wall hook peg
  var hookPeg=cyl(0.014,0.014,0.09,6,M.std(0x888888,0.9,0.2));
  hookPeg.rotation.z=Math.PI/2; hookPeg.position.set(0,0.3,0.08); g.add(hookPeg);
  g.position.set(x,y,z); g.rotation.y=rotY; g.rotation.z=rotZ||0;
  g.userData.onClickFn=function(){if(window._playGuitar)window._playGuitar();};
  scene.add(g); reg(g,CV.beach);
}

// ═══════════════════════════════════════════════════════════════════
// DIATONIC ACCORDION
// ═══════════════════════════════════════════════════════════════════
function makeAccordion(x,y,z,rotY){
  var g=new THREE.Group();
  var bMat=new THREE.MeshStandardMaterial({color:0xcc1111,metalness:0.3,roughness:0.5});
  var blkMat=M.std(0x111111,0.5,0.7);
  var silMat=M.std(0xcccccc,0.9,0.1);
  var goMat2=M.std(0xd4a017,0.95,0.05);
  var pMat=M.std(0xf0f0ee,0.2,0.3);
  // treble box
  var tr=box(0.42,0.7,0.22,bMat); tr.position.set(0.32,0,0); g.add(tr);
  var grl=box(0.38,0.62,0.02,blkMat); grl.position.set(0.32,0,0.12); g.add(grl);
  for(var i=0;i<7;i++){var gl=box(0.36,0.007,0.012,silMat);gl.position.set(0.32,-0.25+i*0.082,0.13);g.add(gl);}
  // bass box
  var ba=box(0.38,0.7,0.22,bMat); ba.position.set(-0.3,0,0); g.add(ba);
  var bg=box(0.34,0.62,0.013,blkMat); bg.position.set(-0.3,0,-0.12); g.add(bg);
  // treble buttons
  for(var r=0;r<4;r++) for(var c=0;c<8;c++){
    var btn=sphere(0.022,6,6,pMat); btn.position.set(0.18,r*0.09-0.18+c*0.0001,0.12+r*0.028); g.add(btn);
  }
  // bass buttons
  for(var r2=0;r2<4;r2++) for(var c2=0;c2<5;c2++){
    var btn2=sphere(0.020,6,6,pMat); btn2.position.set(-0.24+r2*0.0001,r2*0.09-0.16+c2*0.0001,-0.08+r2*0.03); g.add(btn2);
  }
  // bellows
  for(var f=0;f<8;f++){
    var fold=box(0.08,0.66,0.24,f%2===0?blkMat:M.std(0x1a1a1a,0.3,0.8));
    fold.position.set(-0.26+f*0.065,0,0); fold.rotation.y=(f%2===0?1:-1)*0.18; g.add(fold);
    var gt=box(0.004,0.68,0.004,goMat2); gt.position.set(-0.26+f*0.065,0,0.122); g.add(gt);
    var gt2=box(0.004,0.68,0.004,goMat2); gt2.position.set(-0.26+f*0.065,0,-0.122); g.add(gt2);
  }
  // wall mount
  var mt=box(0.65,0.09,0.04,M.std(0x888888,0.8,0.3)); mt.position.set(0,0.4,-0.14); g.add(mt);
  var hk=box(0.04,0.17,0.04,M.std(0x888888,0.9,0.2)); hk.position.set(0,0.31,-0.14); g.add(hk);
  g.position.set(x,y,z); g.rotation.y=rotY||0;
  g.userData.onClickFn=function(){if(window._playAccordion)window._playAccordion();};
  scene.add(g); reg(g,CV.beach);
}

// ═══════════════════════════════════════════════════════════════════
// WORKBENCH
// ═══════════════════════════════════════════════════════════════════
function makeWorkbench(cx,cz,data){
  var g=new THREE.Group(); g.position.set(cx,0,cz);
  var tabW=7.0;
  var top=box(tabW,0.09,2.6,M.std(0x0d1f2e,0.7,0.3)); top.position.y=2.0; g.add(top);
  var trim=box(tabW+0.02,0.04,2.62,M.std(0x223344,0.95,0.1)); trim.position.y=2.04; g.add(trim);
  [[-3.4,-1.0],[-3.4,1.0],[3.4,-1.0],[3.4,1.0]].forEach(function(p){
    var leg=box(0.1,2.0,0.1,M.std(0x1a2d3a,0.95,0.2)); leg.position.set(p[0],1.0,p[1]); g.add(leg);
  });
  var shelf=box(tabW-0.2,0.05,2.4,M.std(0x0a1825,0.7,0.4)); shelf.position.y=0.7; g.add(shelf);
  var peg=box(tabW,1.6,0.05,M.std(0x0c1a26,0.5,0.8)); peg.position.set(0,2.9,-1.35); g.add(peg);
  for(var r=0;r<4;r++) for(var c=0;c<14;c++){
    var h=box(0.04,0.04,0.04,M.std(0x050e17,0.5,0.9)); h.position.set(-3.0+c*0.46,2.2+r*0.32,-1.32); g.add(h);
  }
  var lbar=box(tabW-0.2,0.05,0.16,M.add(0xfff5dd,0.5)); lbar.position.set(0,3.85,-0.75); g.add(lbar);
  scene.add(g); reg(g,data);
}

// ═══════════════════════════════════════════════════════════════════
// ELECTRONIC DEVICES
// ═══════════════════════════════════════════════════════════════════
var TY=2.05;

function makeRPi(wx,wz,ry){
  ry=ry||0; var g=new THREE.Group();
  g.add(box(0.85,0.018,0.58,new THREE.MeshStandardMaterial({color:0x1f6b2e,metalness:0.3,roughness:0.55})));
  var cpu=box(0.16,0.02,0.16,M.std(0x888888,0.9,0.2)); cpu.position.set(0,0.02,0.05); g.add(cpu);
  [-0.18,0.18].forEach(function(rx){var r=box(0.12,0.015,0.08,M.std(0x333333,0.8,0.3));r.position.set(rx,0.017,0.05);g.add(r);});
  // USB ports
  [0.0,0.18].forEach(function(uz){
    var p=box(0.102,0.057,0.072,M.std(0xaaaaaa,0.9,0.1)); p.position.set(0.44,0.025,uz-0.06); g.add(p);
  });
  // Ethernet
  var eth=box(0.102,0.067,0.142,M.std(0xaaaaaa,0.9,0.1)); eth.position.set(0.44,0.03,-0.2); g.add(eth);
  led(g,0.42,0.068,-0.21,0x00ff44,0.016); led(g,0.42,0.068,-0.19,0xffaa00,0.016);
  // GPIO (simplified 10 pins per row)
  for(var p=0;p<10;p++){
    var pin=box(0.018,0.04,0.018,M.std(0xd4a017,0.95,0.05)); pin.position.set(-0.18+p*0.04,0.03,0.26); g.add(pin);
    var pin2=box(0.018,0.04,0.018,M.std(0xd4a017,0.95,0.05)); pin2.position.set(-0.18+p*0.04,0.03,0.22); g.add(pin2);
  }
  led(g,0.35,0.028,0.27,0x00ff44,0.014); led(g,0.31,0.028,0.27,0xff2200,0.014);
  g.position.set(wx,TY+0.01,wz); g.rotation.y=ry; scene.add(g);
}

function makeESP32(wx,wz,ry){
  ry=ry||0; var g=new THREE.Group();
  g.add(box(0.52,0.014,0.28,M.pcb()));
  var shield=box(0.28,0.025,0.2,M.std(0xaaaaaa,0.9,0.1)); shield.position.set(0.04,0.02,0); g.add(shield);
  var antT=box(0.12,0.002,0.008,M.add(0xd4a017,0.6)); antT.position.set(-0.22,0.01,0); g.add(antT);
  var usb=box(0.03,0.02,0.055,M.std(0xaaaaaa,0.9,0.15)); usb.position.set(0.27,0.008,0); g.add(usb);
  for(var p=0;p<8;p++){
    var ph=box(0.016,0.035,0.016,M.std(0xd4a017,0.95,0.05)); ph.position.set(-0.16+p*0.046,0.024,0.14); g.add(ph);
    var ph2=box(0.016,0.035,0.016,M.std(0xd4a017,0.95,0.05)); ph2.position.set(-0.16+p*0.046,0.024,-0.14); g.add(ph2);
  }
  led(g,0.1,0.022,0.1,0x0088ff,0.014);
  g.position.set(wx,TY+0.008,wz); g.rotation.y=ry; scene.add(g);
}

function makeArduino(wx,wz,ry){
  ry=ry||0; var g=new THREE.Group();
  g.add(box(1.05,0.016,0.54,new THREE.MeshStandardMaterial({color:0x1a5099,metalness:0.3,roughness:0.6})));
  var chip=box(0.18,0.018,0.18,M.std(0x111111,0.8,0.3)); chip.position.set(0.1,0.017,0.05); g.add(chip);
  var usbB=box(0.09,0.07,0.085,M.std(0xaaaaaa,0.9,0.1)); usbB.position.set(0.53,0.03,-0.1); g.add(usbB);
  for(var p=0;p<14;p++){
    var ph=box(0.018,0.04,0.018,M.std(0xd4a017,0.95,0.05)); ph.position.set(-0.35+p*0.054,0.028,0.27); g.add(ph);
  }
  led(g,0.2,0.025,0.22,0xffaa00,0.015); led(g,0.24,0.025,0.22,0x00ff44,0.015);
  g.position.set(wx,TY+0.009,wz); g.rotation.y=ry; scene.add(g);
}

function makeMultimeter(wx,wz,ry){
  ry=ry||0; var g=new THREE.Group();
  g.add(box(0.38,0.74,0.10,M.std(0x1a1a1a,0.1,0.9)));
  g.add(box(0.36,0.72,0.12,new THREE.MeshStandardMaterial({color:0xc8a800,metalness:0.3,roughness:0.6})));
  var disp=box(0.24,0.16,0.02,new THREE.MeshStandardMaterial({color:0x88aacc,metalness:0.1,roughness:0.1,transparent:true,opacity:0.85}));
  disp.position.set(0,0.2,0.07); g.add(disp);
  var digit=box(0.14,0.08,0.01,M.add(0x00ff88,0.8)); digit.position.set(0,0.2,0.08); g.add(digit);
  var dial=cyl(0.1,0.1,0.025,24,M.std(0x111111,0.7,0.5)); dial.rotation.x=Math.PI/2; dial.position.set(0,-0.05,0.07); g.add(dial);
  [[-0.09,-0.28],[0.0,-0.28],[0.09,-0.28]].forEach(function(p,i){
    var s=cyl(0.022,0.022,0.025,8,M.std(i===1?0xcc0000:0x111111,0.7,0.5));
    s.rotation.x=Math.PI/2; s.position.set(p[0],p[1],0.075); g.add(s);
  });
  ['red','black'].forEach(function(col,i){
    var w=box(0.01,0.01,0.38,M.std(col==='red'?0xcc0000:0x111111,0.4,0.9));
    w.position.set(i===0?0.04:-0.04,0.005,0.24); g.add(w);
  });
  g.position.set(wx,TY+0.36,wz); g.rotation.y=ry; scene.add(g);
}

function makeOscilloscope(wx,wz,ry){
  ry=ry||0; var g=new THREE.Group();
  g.add(box(0.9,0.58,0.5,M.std(0x1a1a1a,0.6,0.7)));
  var front=box(0.88,0.56,0.05,M.std(0x111111,0.5,0.8)); front.position.z=0.252; g.add(front);
  var scr=box(0.5,0.38,0.02,new THREE.MeshStandardMaterial({color:0x001a00,metalness:0.1,roughness:0.1}));
  scr.position.set(-0.12,0.08,0.27); g.add(scr);
  var scrGlow=box(0.48,0.36,0.01,M.add(0x00ff44,0.14)); scrGlow.position.set(-0.12,0.08,0.278); g.add(scrGlow);
  var pts=[]; for(var i=0;i<60;i++) pts.push(-0.22+i*0.0075,0.08+Math.sin(i*0.5)*0.06,0.285);
  var wgeo=new THREE.BufferGeometry(); wgeo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  g.add(new THREE.Line(wgeo,new THREE.LineBasicMaterial({color:0x00ff44,blending:THREE.AdditiveBlending})));
  [[0.32,0.18],[0.32,-0.02],[0.32,-0.18]].forEach(function(p){
    var k=cyl(0.045,0.045,0.04,12,M.std(0x555555,0.7,0.4)); k.rotation.x=Math.PI/2; k.position.set(p[0],p[1],0.285); g.add(k);
  });
  led(g,0.38,0.24,0.282,0x00ff44,0.016);
  g.position.set(wx,TY+0.29,wz); g.rotation.y=ry; scene.add(g);
}

function makeRouter(wx,wz,ry){
  ry=ry||0; var g=new THREE.Group();
  g.add(box(1.1,0.1,0.7,M.std(0x111111,0.6,0.8)));
  [-0.35,0,0.35].forEach(function(ax,i){
    var ant=cyl(0.015,0.012,0.7,6,M.std(0x222222,0.6,0.7));
    ant.position.set(ax,0.4,-0.3); ant.rotation.z=(i-1)*0.12; g.add(ant);
  });
  [-0.36,-0.24,-0.12,0.0,0.12,0.24].forEach(function(lx,i){
    led(g,lx,-0.02,0.36,[0x00ff44,0xffaa00,0x0088ff,0x00ff44,0xffaa00,0x00ff44][i],0.014);
  });
  for(var p=0;p<4;p++){var lan=box(0.06,0.05,0.06,M.std(0x222222,0.7,0.4));lan.position.set(-0.24+p*0.16,0,0.35);g.add(lan);}
  g.position.set(wx,TY+0.05,wz); g.rotation.y=ry; scene.add(g);
}

function makeServer(wx,wz,ry){
  ry=ry||0; var g=new THREE.Group();
  g.add(box(2.2,0.18,0.85,M.std(0x1a1a1a,0.8,0.5)));
  var bezel=box(2.18,0.16,0.05,M.std(0x0d0d0d,0.7,0.6)); bezel.position.z=0.43; g.add(bezel);
  for(var d=0;d<4;d++){
    var bay=box(0.36,0.1,0.03,M.std(0x222222,0.7,0.5)); bay.position.set(-0.7+d*0.45,0,0.445); g.add(bay);
    led(g,-0.58+d*0.45,0.04,0.455,0x00ff44,0.013);
  }
  led(g,0.9,0,0.456,0x0088ff,0.013); led(g,0.95,0.04,0.456,0x00ff44,0.013);
  g.position.set(wx,TY+0.09,wz); g.rotation.y=ry; scene.add(g);
}

function makeBreadboard(wx,wz,ry){
  ry=ry||0; var g=new THREE.Group();
  g.add(box(0.95,0.016,0.56,new THREE.MeshStandardMaterial({color:0xf0f0e0,metalness:0,roughness:0.9})));
  var rr=box(0.85,0.003,0.025,M.add(0xff2200,0.6)); rr.position.set(0,0.009,0.24); g.add(rr);
  var rb=box(0.85,0.003,0.025,M.add(0x0044ff,0.6)); rb.position.set(0,0.009,0.22); g.add(rb);
  var rr2=box(0.85,0.003,0.025,M.add(0xff2200,0.6)); rr2.position.set(0,0.009,-0.22); g.add(rr2);
  var rb2=box(0.85,0.003,0.025,M.add(0x0044ff,0.6)); rb2.position.set(0,0.009,-0.24); g.add(rb2);
  var div=box(0.9,0.003,0.005,M.add(0x888888,0.4)); div.position.y=0.009; g.add(div);
  g.position.set(wx,TY+0.009,wz); g.rotation.y=ry; scene.add(g);
}

function makeSwitch(wx,wz,ry){
  ry=ry||0; var g=new THREE.Group();
  g.add(box(1.4,0.08,0.52,M.std(0x2a2a2a,0.7,0.6)));
  for(var p=0;p<8;p++){
    var port=box(0.07,0.055,0.04,M.std(0x111111,0.7,0.4)); port.position.set(-0.54+p*0.155,0,0.27); g.add(port);
    led(g,-0.556+p*0.155,0.028,0.278,[0x00ff44,0xffaa00][p%2],0.013);
  }
  g.position.set(wx,TY+0.04,wz); g.rotation.y=ry; scene.add(g);
}

function makeSolderingIron(wx,wz,ry){
  ry=ry||0; var g=new THREE.Group();
  var stand=cyl(0.15,0.18,0.04,12,M.std(0x333333,0.7,0.5)); stand.position.y=0.02; g.add(stand);
  var coil=new THREE.Mesh(new THREE.TorusGeometry(0.1,0.015,6,20),M.std(0x888888,0.9,0.2));
  coil.rotation.x=Math.PI/2; coil.position.y=0.07; g.add(coil);
  var iron=cyl(0.022,0.022,0.6,8,M.std(0xaaaaaa,0.8,0.3)); iron.position.set(0.12,0.15,0); iron.rotation.z=-0.3; g.add(iron);
  var heat=cyl(0.028,0.028,0.12,8,M.std(0xcc5500,0.5,0.5)); heat.position.set(0.26,0.08,0); heat.rotation.z=-0.3; g.add(heat);
  var tipGlow=sphere(0.015,6,6,M.add(0xff4400,0.6)); tipGlow.position.set(0.41,0.0,0); g.add(tipGlow);
  var hotL=new THREE.PointLight(0xff4400,0.4,0.5); hotL.position.set(0.41,0.1,0); g.add(hotL);
  var handle=cyl(0.026,0.022,0.28,8,new THREE.MeshStandardMaterial({color:0x2244aa,metalness:0.1,roughness:0.9}));
  handle.position.set(-0.06,0.26,0); handle.rotation.z=-0.3; g.add(handle);
  g.position.set(wx,TY,wz); g.rotation.y=ry; scene.add(g);
}

// ═══════════════════════════════════════════════════════════════════
// DIPLOMAS
// ═══════════════════════════════════════════════════════════════════
function makeDiploma(x,y,z,rotY,data,acColor){
  var g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rotY;
  g.add(box(1.1,0.82,0.06,new THREE.MeshStandardMaterial({color:0x1a0e05,metalness:0.3,roughness:0.8})));
  var fMat=new THREE.MeshStandardMaterial({color:acColor,metalness:0.95,roughness:0.1});
  var ft=box(1.12,0.04,0.065,fMat); ft.position.y=0.43; g.add(ft);
  var fb=box(1.12,0.04,0.065,fMat); fb.position.y=-0.43; g.add(fb);
  [-0.58,0.58].forEach(function(fx){var fs=box(0.04,0.86,0.065,fMat);fs.position.x=fx;g.add(fs);});
  var paper=box(1.0,0.74,0.01,new THREE.MeshStandardMaterial({color:0xf8f0d8,metalness:0,roughness:0.95})); paper.position.z=0.032; g.add(paper);
  var seal=new THREE.Mesh(new THREE.CircleGeometry(0.07,16),fMat.clone()); seal.rotation.x=Math.PI/2; seal.position.set(0,0.24,0.038); g.add(seal);
  var titleBar=box(0.7,0.022,0.01,fMat.clone()); titleBar.position.set(0,0.13,0.038); g.add(titleBar);
  [0.55,0.42,0.54,0.36,0.46,0.28,0.40,0.24].forEach(function(lw,i){
    var ln=box(lw,0.011,0.004,M.std(0x2a1f0e,0,1)); ln.position.set(0,-0.02-i*0.063,0.038); g.add(ln);
  });
  var ribbon=box(0.5,0.024,0.008,fMat.clone()); ribbon.position.set(0,-0.32,0.038); g.add(ribbon);
  var wire=box(0.004,0.15,0.004,M.std(0x888888,0.95,0.1)); wire.position.set(0,0.49,0); g.add(wire);
  var nail=cyl(0.008,0.008,0.04,6,M.std(0x999999,0.95,0.1)); nail.position.set(0,0.58,-0.03); nail.rotation.x=Math.PI/2; g.add(nail);
  var dL=new THREE.PointLight(acColor,0.22,3); dL.position.set(0,0,0.5); g.add(dL);
  scene.add(g); reg(g,data);
}

// ═══════════════════════════════════════════════════════════════════
// PEDESTAL + HELMET + GLOBE + SCREENS
// ═══════════════════════════════════════════════════════════════════
function pedestal(x,z){
  var base=cyl(0.7,0.9,0.14,20,M.std(0x111820,0.9,0.2)); base.position.set(x,0.07,z); scene.add(base);
  var ring=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.02,8,40),M.add(0x00d4ff,0.7));
  ring.rotation.x=Math.PI/2; ring.position.set(x,0.15,z); scene.add(ring);
}

function makeIronManSuit(px,pz,facingZ,data){
  // px,pz = base position; facingZ = +1 (facing +z) or -1 (facing -z)
  var g=new THREE.Group(); g.position.set(px,0,pz);
  var rz=facingZ>0?0:Math.PI; g.rotation.y=rz;

  var redMat=new THREE.MeshStandardMaterial({color:0xbb0000,metalness:0.96,roughness:0.07,emissive:0x1a0000,emissiveIntensity:0.25});
  var goldMat=new THREE.MeshStandardMaterial({color:0xc8900a,metalness:0.98,roughness:0.04,emissive:0x1a0a00,emissiveIntensity:0.18});
  var dkMat=M.std(0x0a0a0a,0.8,0.4);
  var arcMat=new THREE.MeshBasicMaterial({color:0x88eeff,blending:THREE.AdditiveBlending});

  // ── LEGS ──
  [-1,1].forEach(function(s){
    // upper leg
    var ul=cyl(0.16,0.14,0.7,12,redMat); ul.position.set(s*0.18,0.75,0); g.add(ul);
    // knee plate
    var kp=box(0.28,0.12,0.22,goldMat); kp.position.set(s*0.18,0.38,0.06); g.add(kp);
    // lower leg
    var ll=cyl(0.13,0.11,0.65,12,redMat); ll.position.set(s*0.18,0.04,0); g.add(ll);
    // shin guard
    var sg=box(0.22,0.52,0.12,goldMat); sg.position.set(s*0.18,0.03,0.12); g.add(sg);
    // boot
    var bt=box(0.26,0.16,0.38,redMat); bt.position.set(s*0.18,-0.3,0.06); g.add(bt);
    var btS=box(0.28,0.06,0.42,goldMat); btS.position.set(s*0.18,-0.39,0.06); g.add(btS);
    // boot thruster glow
    var thr=new THREE.Mesh(new THREE.CircleGeometry(0.07,16),M.add(0xff8800,0.7));
    thr.rotation.x=Math.PI/2; thr.position.set(s*0.18,-0.42,0.06); g.add(thr);
    var tl=new THREE.PointLight(0xff6600,0.3,1.2); tl.position.set(s*0.18,-0.5,0.06); g.add(tl);
  });

  // ── PELVIS / HIP ──
  var hip=box(0.5,0.18,0.32,redMat); hip.position.set(0,1.12,0); g.add(hip);
  var hipG=box(0.52,0.06,0.34,goldMat); hipG.position.set(0,1.22,0); g.add(hipG);

  // ── TORSO ──
  var torso=cyl(0.26,0.22,0.72,16,redMat); torso.position.set(0,1.68,0); g.add(torso);
  // chest plates
  [-1,1].forEach(function(s){
    var cp=box(0.22,0.38,0.08,goldMat); cp.position.set(s*0.17,1.72,0.22); g.add(cp);
    // shoulder ridge
    var sr=box(0.06,0.06,0.28,goldMat); sr.position.set(s*0.22,1.95,0.12); g.add(sr);
  });
  // back pack / thruster
  var bp=box(0.42,0.55,0.14,redMat); bp.position.set(0,1.68,-0.24); g.add(bp);

  // ── ARC REACTOR (chest) ──
  var arcRing=new THREE.Mesh(new THREE.TorusGeometry(0.085,0.018,12,32),M.std(0xaaaaaa,0.9,0.1));
  arcRing.position.set(0,1.72,0.28); g.add(arcRing);
  var arcCore=new THREE.Mesh(new THREE.CircleGeometry(0.07,24),arcMat);
  arcCore.position.set(0,1.72,0.295); g.add(arcCore);
  var arcL=new THREE.PointLight(0x55ddff,2.0,3.5); arcL.position.set(0,1.72,0.6); g.add(arcL);

  // ── SHOULDERS ──
  [-1,1].forEach(function(s){
    var sh=new THREE.Mesh(new THREE.SphereGeometry(0.21,16,12),redMat);
    sh.scale.set(1,0.85,0.9); sh.position.set(s*0.46,2.16,0); g.add(sh);
    var shTrim=new THREE.Mesh(new THREE.TorusGeometry(0.2,0.025,8,24),goldMat);
    shTrim.rotation.z=Math.PI/2; shTrim.position.set(s*0.46,2.16,0); g.add(shTrim);

    // ── UPPER ARM ──
    var ua=cyl(0.12,0.10,0.45,12,redMat); ua.position.set(s*0.54,1.85,0); g.add(ua);
    var uaTrim=box(0.24,0.06,0.06,goldMat); uaTrim.position.set(s*0.54,1.76,0.06); g.add(uaTrim);

    // ── ELBOW ──
    var elbow=new THREE.Mesh(new THREE.SphereGeometry(0.11,12,8),redMat);
    elbow.position.set(s*0.56,1.57,0); g.add(elbow);
    var elbowG=box(0.22,0.08,0.1,goldMat); elbowG.position.set(s*0.56,1.56,0.04); g.add(elbowG);

    // ── FOREARM ──
    var fa=cyl(0.10,0.085,0.44,12,redMat); fa.position.set(s*0.54,1.33,0.04); fa.rotation.z=s*0.18; g.add(fa);
    var faTrim=box(0.22,0.06,0.2,goldMat); faTrim.position.set(s*0.54,1.14,0.06); g.add(faTrim);

    // ── GAUNTLET / HAND ──
    var hand=box(0.20,0.14,0.22,redMat); hand.position.set(s*0.55,0.97,0.04); g.add(hand);
    var handG=box(0.22,0.06,0.24,goldMat); handG.position.set(s*0.55,0.90,0.04); g.add(handG);
    // repulsor palm
    var rep=new THREE.Mesh(new THREE.CircleGeometry(0.055,16),arcMat);
    rep.rotation.x=Math.PI/2; rep.position.set(s*0.55,0.84,0.04); g.add(rep);
    var rl=new THREE.PointLight(0x44ccff,0.4,1.5); rl.position.set(s*0.55,0.8,0.1); g.add(rl);
  });

  // ── NECK ──
  var neck=cyl(0.1,0.12,0.18,12,redMat); neck.position.set(0,2.22,0); g.add(neck);

  // ── HELMET ──
  var sk=new THREE.Mesh(new THREE.SphereGeometry(0.28,20,16),redMat);
  sk.scale.set(1,1.12,1); sk.position.set(0,2.62,0); g.add(sk);
  // face plate
  var fp=box(0.42,0.32,0.16,redMat); fp.position.set(0,2.56,0.18); g.add(fp);
  var fpBot=box(0.38,0.14,0.12,goldMat); fpBot.position.set(0,2.38,0.18); g.add(fpBot);
  // brow ridge
  var brow=box(0.5,0.08,0.1,goldMat); brow.position.set(0,2.72,0.2); g.add(brow);
  // back of helmet
  var hBack=box(0.5,0.4,0.12,redMat); hBack.position.set(0,2.62,-0.22); g.add(hBack);
  // side plates
  [-1,1].forEach(function(s){
    var hp=box(0.1,0.38,0.44,redMat); hp.position.set(s*0.25,2.6,0.02); g.add(hp);
    // eye slot
    var eye=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.055,0.04),
      new THREE.MeshBasicMaterial({color:0xfff0a0,blending:THREE.AdditiveBlending}));
    eye.position.set(s*0.13,2.62,0.28); g.add(eye);
    var eyeGlow=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.08,0.02),M.add(0xffd700,0.3));
    eyeGlow.position.set(s*0.13,2.62,0.27); g.add(eyeGlow);
    var el=new THREE.PointLight(0xffd700,0.7,2); el.position.set(s*0.13,2.62,0.7); g.add(el);
  });
  // chin
  var chin=box(0.34,0.1,0.14,goldMat); chin.position.set(0,2.33,0.2); g.add(chin);
  // helmet grill lines
  for(var gl=0;gl<4;gl++){
    var gr=box(0.36,0.014,0.02,M.add(0x00d4ff,0.5)); gr.position.set(0,2.42+gl*0.048,0.27); g.add(gr);
  }

  // ── DISPLAY STAND (pedestal) ──
  var pedBase=cyl(0.5,0.6,0.1,20,M.std(0x111820,0.9,0.3)); pedBase.position.set(0,-0.42,0); g.add(pedBase);
  var pedRing=new THREE.Mesh(new THREE.TorusGeometry(0.52,0.018,8,40),M.add(0x00d4ff,0.7));
  pedRing.rotation.x=Math.PI/2; pedRing.position.set(0,-0.37,0); g.add(pedRing);
  var pedL=new THREE.PointLight(0x00d4ff,0.6,2); pedL.position.set(0,-0.3,0); g.add(pedL);

  scene.add(g); g.userData.floatY=g.position.y; reg(g,data); return g;
}

// keep old makeHelmet as alias for compatibility (unused now)
function makeHelmet(x,z,data){ return makeIronManSuit(x,z,1,data); }

function makeGlobe(x,y,z,data){
  var g=new THREE.Group(); g.position.set(x,y,z);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1.3,24,16),M.wire(0x00d4ff,0.2)));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1.05,32,24),new THREE.MeshBasicMaterial({color:0x001833,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false})));
  for(var i=1;i<=5;i++){
    var lat=(i/6)*Math.PI-Math.PI/2, ri=Math.cos(lat)*1.12;
    var ring=new THREE.Mesh(new THREE.TorusGeometry(ri,0.007,4,48),M.add(0x00d4ff,0.3));
    ring.rotation.x=Math.PI/2; ring.position.y=Math.sin(lat)*1.12; g.add(ring);
  }
  for(var mi=0;mi<8;mi++){var mer=new THREE.Mesh(new THREE.TorusGeometry(1.12,0.007,4,48),M.add(0x00d4ff,0.15));mer.rotation.y=(mi/8)*Math.PI;g.add(mer);}
  g.add(new THREE.Mesh(new THREE.TorusGeometry(1.18,0.013,6,64),M.add(0x00d4ff,0.6)));
  var orbit=new THREE.Mesh(new THREE.TorusGeometry(1.9,0.011,4,80),M.add(0xffd700,0.35)); orbit.rotation.x=Math.PI/4; g.add(orbit);
  var dot=sphere(0.07,8,8,new THREE.MeshBasicMaterial({color:0xffd700,blending:THREE.AdditiveBlending}));
  g.add(dot); g.userData.orbitDot=dot; g.userData.orbitAngle=0;
  scene.add(g); reg(g,data); return g;
}

function makeHoloScreen(x,y,z,rotY,data){
  var g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=rotY;
  g.add(box(2.4,1.6,0.05,M.std(0x0a1825,0.9,0.2)));
  var scr=box(2.2,1.45,0.01,M.add(0x001a33,0.65)); scr.position.z=0.034; g.add(scr);
  for(var i=0;i<11;i++){var l=box(2.05,0.011,0.01,M.add(0x00d4ff,0.11));l.position.set(0,-0.65+i*0.13,0.04);g.add(l);}
  [[-1.05,.72],[1.05,.72],[-1.05,-.72],[1.05,-.72]].forEach(function(p){
    var br=box(0.15,0.15,0.01,M.add(0x00d4ff,0.7)); br.position.set(p[0],p[1],0.04); g.add(br);
  });
  var arm=box(0.06,1.2,0.06,M.std(0x111820,0.9,0.2)); arm.position.y=-1.4; g.add(arm);
  scene.add(g); reg(g,data);
}

// ═══════════════════════════════════════════════════════════════════
// MACBOOK PRO — open on the workbench
// ═══════════════════════════════════════════════════════════════════
function makeMacBook(wx,wy,wz,ry){
  ry=ry||0;
  var g=new THREE.Group();

  // base / bottom chassis
  var baseMat=new THREE.MeshStandardMaterial({color:0xc0c0c0,metalness:0.92,roughness:0.12});
  var base=new THREE.Mesh(new THREE.BoxGeometry(1.38,0.04,0.94),baseMat);
  g.add(base);

  // keyboard recess
  var keys=new THREE.Mesh(new THREE.BoxGeometry(1.18,0.005,0.62),
    new THREE.MeshStandardMaterial({color:0x888888,metalness:0.5,roughness:0.8}));
  keys.position.set(0,0.023,-0.04); g.add(keys);
  // key rows hint
  for(var r=0;r<4;r++) for(var c=0;c<13;c++){
    var k=new THREE.Mesh(new THREE.BoxGeometry(0.075,0.005,0.065),
      new THREE.MeshStandardMaterial({color:0x777777,metalness:0.3,roughness:0.9}));
    k.position.set(-0.52+c*0.085, 0.027, 0.22-r*0.082); g.add(k);
  }
  // trackpad
  var tp=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.005,0.24),
    new THREE.MeshStandardMaterial({color:0xaaaaaa,metalness:0.8,roughness:0.15}));
  tp.position.set(0,0.024,0.32); g.add(tp);

  // lid / screen (hinged open ~110°)
  var lidG=new THREE.Group();
  // lid back plate
  var lid=new THREE.Mesh(new THREE.BoxGeometry(1.38,0.022,0.94),baseMat);
  lid.position.set(0,0,0); lidG.add(lid);
  // Apple logo (back of lid)
  var logo=new THREE.Mesh(new THREE.CircleGeometry(0.09,16),
    new THREE.MeshStandardMaterial({color:0xd0d0d0,metalness:0.95,roughness:0.05}));
  logo.rotation.x=-Math.PI/2; logo.position.set(0,0.012,0); lidG.add(logo);

  // screen bezel
  var bezel=new THREE.Mesh(new THREE.BoxGeometry(1.32,0.01,0.88),
    new THREE.MeshStandardMaterial({color:0x111111,metalness:0.1,roughness:0.9}));
  bezel.position.set(0,-0.01,0.002); lidG.add(bezel);

  // screen content — portfolio webpage canvas
  var screenTex=canvasTex(1024,640,function(ctx,W,H){
    // dark background
    ctx.fillStyle='#0a0f1a'; ctx.fillRect(0,0,W,H);
    // navbar
    var nav=ctx.createLinearGradient(0,0,W,0);
    nav.addColorStop(0,'#0d1b2a'); nav.addColorStop(1,'#112233');
    ctx.fillStyle=nav; ctx.fillRect(0,0,W,52);
    ctx.fillStyle='#00d4ff'; ctx.font='bold 20px monospace'; ctx.textAlign='left';
    ctx.fillText('MARCO LOIZA', 24, 32);
    ctx.fillStyle='rgba(0,212,255,0.55)'; ctx.font='13px monospace';
    ['About','Projects','Research','Contact'].forEach(function(n,i){
      ctx.fillText(n, W-260+i*65, 33);
    });
    ctx.strokeStyle='rgba(0,212,255,0.2)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,52); ctx.lineTo(W,52); ctx.stroke();

    // hero section
    ctx.fillStyle='rgba(0,212,255,0.06)';
    ctx.fillRect(0,52,W,H*0.38);
    ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.font='bold 42px serif'; ctx.textAlign='left';
    ctx.fillText('Marco A. Loiza', 40, 115);
    ctx.fillStyle='#00d4ff'; ctx.font='22px monospace';
    ctx.fillText('PhD Researcher · AI · Multi-Agent Systems', 40, 148);
    ctx.fillStyle='rgba(200,220,255,0.7)'; ctx.font='15px sans-serif';
    ctx.fillText('Università della Calabria — DIMES', 40, 174);

    // CTA button
    ctx.strokeStyle='#00d4ff'; ctx.lineWidth=2;
    ctx.strokeRect(40, 192, 130, 34);
    ctx.fillStyle='#00d4ff'; ctx.font='13px monospace'; ctx.textAlign='center';
    ctx.fillText('VIEW PROJECTS', 105, 214);

    // project cards
    ctx.textAlign='left';
    var cards=[
      {t:'Multi-Agent LLM Platform',s:'UNICAL · Python · FastAPI',c:'#00d4ff'},
      {t:'IoT Sensor Mesh',s:'ESP32 · MQTT · Edge AI',c:'#ffd700'},
      {t:'RAG Architecture',s:'Vector DB · LangChain',c:'#00ff88'},
    ];
    cards.forEach(function(card,i){
      var cx=40+i*320, cy=H*0.52;
      ctx.fillStyle='rgba(0,212,255,0.07)';
      ctx.fillRect(cx,cy,300,130);
      ctx.strokeStyle=card.c+'44'; ctx.lineWidth=1;
      ctx.strokeRect(cx,cy,300,130);
      ctx.fillStyle=card.c; ctx.font='bold 15px monospace';
      ctx.fillText(card.t, cx+14, cy+28);
      ctx.fillStyle='rgba(180,210,255,0.65)'; ctx.font='12px sans-serif';
      ctx.fillText(card.s, cx+14, cy+52);
      // fake sparkline
      ctx.strokeStyle=card.c+'99'; ctx.lineWidth=1.5; ctx.beginPath();
      for(var p=0;p<10;p++) ctx.lineTo(cx+14+p*28, cy+90+Math.sin(p*0.9+i)*18);
      ctx.stroke();
    });

    // status bar
    ctx.fillStyle='rgba(0,212,255,0.08)';
    ctx.fillRect(0,H-26,W,26);
    ctx.fillStyle='rgba(0,212,255,0.4)'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText('marcoa.loizacarrillo@dimes.unical.it  ·  COSENZA, ITALY  ·  © 2025', 20, H-9);
    // scan line effect
    for(var sl=0;sl<H;sl+=4){
      ctx.fillStyle='rgba(0,0,0,0.06)';
      ctx.fillRect(0,sl,W,2);
    }
  });

  var scrMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.24,0.82),
    new THREE.MeshBasicMaterial({map:screenTex}));
  scrMesh.position.set(0,-0.006,-0.001); lidG.add(scrMesh);

  // screen glow
  var scrGlow=new THREE.PointLight(0x00aaff,0.6,2.5);
  scrGlow.position.set(0,0,0.1); lidG.add(scrGlow);

  // hinge the lid: pivot at back edge (z=-0.47), rotate ~110° forward
  lidG.position.set(0,0.032,-0.47);
  lidG.rotation.x=-(Math.PI/180)*110;
  g.add(lidG);

  g.position.set(wx,wy,wz); g.rotation.y=ry;
  scene.add(g);
  reg(g,CV.projects);
}

// ═══════════════════════════════════════════════════════════════════
// BASKETBALL  (3-D ball + mini hoop on left wall basketball zone)
// ═══════════════════════════════════════════════════════════════════
function makeBasketball(x,y,z){
  var g=new THREE.Group();
  var bMat=new THREE.MeshStandardMaterial({color:0xe05500,metalness:0.05,roughness:0.65});
  var ball=new THREE.Mesh(new THREE.SphereGeometry(0.34,32,32),bMat); g.add(ball);
  // seam lines
  function seam(axis){
    var pts=[];
    for(var i=0;i<=64;i++){
      var a=(i/64)*Math.PI*2;
      if(axis==='z') pts.push(new THREE.Vector3(Math.cos(a)*0.345,Math.sin(a)*0.345,0));
      else if(axis==='x') pts.push(new THREE.Vector3(0,Math.cos(a)*0.345,Math.sin(a)*0.345));
      else{var t=Math.PI/4;pts.push(new THREE.Vector3(Math.cos(a)*0.345,Math.sin(a)*Math.cos(t)*0.345,Math.sin(a)*Math.sin(t)*0.345));}
    }
    var geo=new THREE.BufferGeometry().setFromPoints(pts);
    g.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x111111,linewidth:2})));
  }
  seam('z'); seam('x'); seam('d');
  // subtle point light on ball
  var bl=new THREE.PointLight(0xff6600,0.5,2); bl.position.set(0,0.5,0); g.add(bl);
  g.position.set(x,y,z);
  g.userData.origPos={x:x,y:y,z:z};
  g.userData.onClickFn=function(){
    if(window._shootState) return;
    var ht=window._hoopTarget||{x:-6.42,y:5.28,z:-3.5};
    window._shootState={t:0,start:{x:g.position.x,y:g.position.y,z:g.position.z},target:ht,phase:'up'};
    if(window._playSwish) window._playSwish();
  };
  clickables.push(g);
  scene.add(g); window._bball=g; return g;
}

function makeMiniHoop(wallX,z){
  var g=new THREE.Group();
  // backboard — bigger
  var boardMat=new THREE.MeshStandardMaterial({color:0xf0f0f0,metalness:0.2,roughness:0.5,transparent:true,opacity:0.88});
  var board=new THREE.Mesh(new THREE.BoxGeometry(2.0,1.5,0.07),boardMat); g.add(board);
  // red target rect
  var rMat=M.std(0xcc0000,0.2,0.8);
  var rect=box(0.82,0.62,0.03,rMat); rect.position.set(0,-0.18,0.05); g.add(rect);
  var rectIn=box(0.54,0.40,0.03,new THREE.MeshStandardMaterial({color:0xffffff,metalness:0,roughness:1}));
  rectIn.position.set(0,-0.18,0.07); g.add(rectIn);
  // hoop ring — bigger (0.44 radius)
  var hoopMat=M.std(0xff4400,0.8,0.25);
  var hoop=new THREE.Mesh(new THREE.TorusGeometry(0.44,0.032,12,40),hoopMat);
  hoop.rotation.x=Math.PI/2; hoop.position.set(0,-0.52,0.58); g.add(hoop);
  // net — tapered cylinder wireframe
  var netGeo=new THREE.CylinderGeometry(0.42,0.26,0.65,18,1,true);
  var netMesh=new THREE.Mesh(netGeo,new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.55}));
  netMesh.position.set(0,-0.85,0.58); g.add(netMesh);
  // arm bracket
  var arm=box(0.08,0.08,0.65,M.std(0x888888,0.9,0.2)); arm.position.set(0,0.6,0.32); g.add(arm);
  var mount=box(0.45,0.14,0.14,M.std(0x555555,0.8,0.3)); mount.position.set(0,0.66,-0.06); g.add(mount);
  // spot on hoop
  var hs=new THREE.SpotLight(0xfff5dd,1.8,8,Math.PI/8,0.4);
  hs.position.set(wallX>0?wallX-3:wallX+3,RH-0.5,z);
  hs.target.position.set(wallX,5.0,z); scene.add(hs); scene.add(hs.target);
  g.position.set(wallX,5.8,z); g.rotation.y=Math.PI/2; scene.add(g);
  // store hoop world target for shoot animation
  // local ring at (0,-0.52,0.58), rotY=PI/2 → world x=wallX+0.58, y=5.8-0.52, z=z
  window._hoopTarget={x:wallX+0.58, y:5.28, z:z};
}

// ═══════════════════════════════════════════════════════════════════
// CHALKBOARD  (right wall — contains títulos / diplomas)
// ═══════════════════════════════════════════════════════════════════
function makeChalkboard(){
  var tex=canvasTex(2048,1536,function(ctx,W,H){
    // board background — dark green
    var bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#173324'); bg.addColorStop(1,'#0f2218');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    // chalk dust texture
    for(var i=0;i<8000;i++){
      ctx.fillStyle='rgba(255,255,255,'+( Math.random()*0.025)+')';
      ctx.fillRect(Math.random()*W,Math.random()*H,Math.random()<0.5?2:1,1);
    }
    // smear marks
    ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=30;
    for(var s=0;s<6;s++){ctx.beginPath();ctx.moveTo(Math.random()*W,Math.random()*H);ctx.lineTo(Math.random()*W,Math.random()*H);ctx.stroke();}
    // ── NAME ──
    ctx.fillStyle='rgba(255,255,255,0.93)';
    ctx.font='bold 96px Georgia,serif';
    ctx.textAlign='center';
    ctx.fillText('MARCO A. LOIZA CARRILLO', W/2, 110);
    // underline
    ctx.strokeStyle='rgba(255,255,180,0.7)'; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(W*0.1,138); ctx.lineTo(W*0.9,138); ctx.stroke();
    // subtitle
    ctx.fillStyle='rgba(180,255,200,0.82)';
    ctx.font='italic 48px Georgia,serif';
    ctx.fillText('PhD Candidate · AI & Multi-Agent Systems · UNICAL', W/2, 195);

    // ── EDUCACIÓN ──
    function sectionTitle(label,y){
      ctx.fillStyle='rgba(255,255,150,0.92)';
      ctx.font='bold 58px "Courier New",monospace';
      ctx.textAlign='left'; ctx.fillText(label, W*0.06, y);
      ctx.strokeStyle='rgba(255,255,150,0.45)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(W*0.06,y+16); ctx.lineTo(W*0.94,y+16); ctx.stroke();
    }
    function entry(icon,main,sub,y){
      ctx.fillStyle='rgba(255,255,255,0.88)';
      ctx.font='bold 44px Georgia,serif'; ctx.textAlign='left';
      ctx.fillText(icon+' '+main, W*0.07, y);
      ctx.fillStyle='rgba(180,210,255,0.72)';
      ctx.font='36px Georgia,serif';
      ctx.fillText(sub, W*0.1, y+48);
    }
    sectionTitle('[ EDUCACIÓN ]', 280);
    entry('◆','PhD — Ingeniería Informática','Università della Calabria (UNICAL) · En curso · 2024–', 355);
    entry('◆','M.Sc. — Ingeniería Informática','Università della Calabria (UNICAL)', 475);
    entry('◆','B.Sc. — Ingeniería de Sistemas','Universidad · Venezuela', 595);

    // ── HABILIDADES ──
    sectionTitle('[ HABILIDADES ]', 710);
    var skills=[['Python','#88ffcc'],['AI / ML','#88ffcc'],['Multi-Agent','#88ffcc'],['LLMs','#88ffcc'],['FastAPI','#aaddff'],
                ['IoT','#aaddff'],['ESP32','#aaddff'],['Three.js','#aaddff'],['Docker','#ffddaa'],['MQTT','#ffddaa']];
    ctx.font='bold 40px "Courier New",monospace';
    skills.forEach(function(s,i){
      var col=i%5, row=Math.floor(i/5);
      ctx.fillStyle=s[1];
      ctx.textAlign='left';
      ctx.fillText('◆ '+s[0], W*0.06+col*(W*0.188), 800+row*80);
    });

    // ── CONTACTO ──
    sectionTitle('[ CONTACTO ]', 1010);
    ctx.fillStyle='rgba(200,240,255,0.82)';
    ctx.font='40px "Courier New",monospace'; ctx.textAlign='left';
    ctx.fillText('📧  marcoa.loizacarrillo@dimes.unical.it', W*0.08, 1090);
    ctx.fillText('🏛   DIMES · Università della Calabria · Cosenza, Italy', W*0.08, 1160);

    // chalk tray chalk pieces
    for(var c=0;c<5;c++){
      ctx.fillStyle='rgba(255,255,255,'+( 0.5+Math.random()*0.3)+')';
      ctx.fillRect(W*0.12+c*W*0.16, H-52, 38+Math.random()*20, 14);
    }
    // bottom edge dust
    var dust=ctx.createLinearGradient(0,H-80,0,H);
    dust.addColorStop(0,'rgba(255,255,255,0)'); dust.addColorStop(1,'rgba(255,255,255,0.08)');
    ctx.fillStyle=dust; ctx.fillRect(0,H-80,W,80);
  });

  var bw=RD*0.78, bh=RH*0.78;
  var boardMesh=new THREE.Mesh(new THREE.PlaneGeometry(bw,bh),new THREE.MeshBasicMaterial({map:tex}));

  var g=new THREE.Group(); g.add(boardMesh);
  // wooden frame
  var fMat=M.std(0x3d1a00,0.25,0.8);
  var ft=0.18;
  [[0, bh/2+ft/2],[0,-(bh/2+ft/2)]].forEach(function(p){var f=box(bw+ft*2,ft,0.14,fMat);f.position.set(p[0],p[1],-0.07);g.add(f);});
  [[bw/2+ft/2,0],[-(bw/2+ft/2),0]].forEach(function(p){var f=box(ft,bh+ft*2,0.14,fMat);f.position.set(p[0],p[1],-0.07);g.add(f);});
  // chalk tray
  var tray=box(bw+0.36,0.1,0.3,M.std(0x5a3010,0.3,0.7)); tray.position.set(0,-(bh/2+ft+0.03),-0.08); g.add(tray);
  // eraser on tray
  var eraser=box(0.22,0.08,0.1,new THREE.MeshStandardMaterial({color:0xf0e8d0,metalness:0,roughness:0.9}));
  eraser.position.set(bw*0.2,-(bh/2+ft+0.02),0.1); g.add(eraser);
  // spotlight on board
  var sp=new THREE.SpotLight(0xfff8e8,2.2,14,Math.PI/6,0.5);
  sp.position.set(RIGHT-4,RH-0.4,0); sp.target.position.set(RIGHT-0.1,RH/2,0);
  scene.add(sp); scene.add(sp.target);

  g.position.set(RIGHT-0.07, RH/2, 0); g.rotation.y=-Math.PI/2;
  scene.add(g); reg(g,CV.education);
}

// ═══════════════════════════════════════════════════════════════════
// VALENCIA SEA WINDOW  (back wall, centre)
// ═══════════════════════════════════════════════════════════════════
function makeValenciaWindow(){
  // ── canvas view ─────────────────────────────────────────────────
  var tex=canvasTex(2048,1280,function(ctx,W,H){
    // sky — deep Mediterranean blue fading to warm horizon
    var sky=ctx.createLinearGradient(0,0,0,H*0.52);
    sky.addColorStop(0,'#0a3a6e');
    sky.addColorStop(0.35,'#1a6fb5');
    sky.addColorStop(0.7,'#5eb8e8');
    sky.addColorStop(1,'#b0ddf5');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H*0.52);

    // sun (afternoon Valencia light)
    var sg=ctx.createRadialGradient(W*0.72,H*0.08,0,W*0.72,H*0.08,120);
    sg.addColorStop(0,'rgba(255,255,210,1)');
    sg.addColorStop(0.4,'rgba(255,230,100,0.6)');
    sg.addColorStop(1,'rgba(255,200,60,0)');
    ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(W*0.72,H*0.08,120,0,Math.PI*2); ctx.fill();

    // sun glare rays
    ctx.save(); ctx.translate(W*0.72,H*0.08); ctx.globalAlpha=0.07;
    for(var r=0;r<12;r++){
      ctx.rotate(Math.PI/6);
      ctx.fillStyle='rgba(255,255,200,1)';
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-18,W*0.7); ctx.lineTo(18,W*0.7); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // a few cirrus clouds
    function cloud(cx,cy,scale){
      ctx.save(); ctx.translate(cx,cy); ctx.scale(scale,scale*0.4);
      ctx.fillStyle='rgba(255,255,255,0.55)';
      [-60,-30,0,30,60].forEach(function(ox){
        ctx.beginPath(); ctx.arc(ox,0,38,0,Math.PI*2); ctx.fill();
      });
      ctx.restore();
    }
    cloud(W*0.15,H*0.07,1.1); cloud(W*0.45,H*0.04,0.8); cloud(W*0.6,H*0.13,0.65);

    // ── CITY OF ARTS AND SCIENCES — Valencia skyline ──
    var hy=H*0.50;
    var cityFill='rgba(15,40,65,0.75)';

    // background city (left portion) — generic blocks
    ctx.fillStyle='rgba(20,50,80,0.45)';
    [[0.02,38],[0.05,52],[0.09,35],[0.13,62],[0.17,44],[0.21,70],[0.25,50]].forEach(function(b){
      ctx.fillRect(W*b[0]-W*0.018, hy-b[1], W*0.036, b[1]);
    });

    // ── L'HEMISFÈRIC (eye/dome structure) ──
    // pond/reflecting pool
    ctx.fillStyle='rgba(0,80,150,0.5)';
    ctx.fillRect(W*0.28, hy-12, W*0.46, 22);

    // outer shell (large half-ellipse)
    ctx.fillStyle=cityFill;
    ctx.beginPath();
    ctx.ellipse(W*0.38, hy, W*0.085, H*0.115, 0, Math.PI, 0, true);
    ctx.fill();
    // inner eye opening (lighter)
    ctx.fillStyle='rgba(30,80,130,0.55)';
    ctx.beginPath();
    ctx.ellipse(W*0.38, hy, W*0.058, H*0.07, 0, Math.PI, 0, true);
    ctx.fill();
    // eyelid reflections
    ctx.strokeStyle='rgba(100,180,255,0.4)'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.ellipse(W*0.38, hy, W*0.082, H*0.112, 0, Math.PI, 0, true); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(W*0.38, hy, W*0.055, H*0.068, 0, Math.PI, 0, true); ctx.stroke();
    // label
    ctx.fillStyle='rgba(200,230,255,0.55)'; ctx.font='bold 22px sans-serif'; ctx.textAlign='center';
    ctx.fillText("L'HEMISFÈRIC", W*0.38, hy+40);

    // ── L'OCEANOGRÀFIC (mushroom domes, centre) ──
    ctx.fillStyle=cityFill;
    [W*0.50, W*0.545, W*0.49].forEach(function(cx,i){
      var rw=[W*0.055,W*0.04,W*0.032][i], rh=[H*0.07,H*0.055,H*0.045][i];
      ctx.beginPath(); ctx.ellipse(cx, hy, rw, rh, 0, Math.PI, 0, true); ctx.fill();
      // stem
      var sw=rw*0.18; ctx.fillRect(cx-sw/2, hy, sw, 30);
    });
    ctx.strokeStyle='rgba(80,160,220,0.35)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(W*0.50, hy, W*0.053, H*0.068, 0, Math.PI, 0, true); ctx.stroke();
    ctx.fillStyle='rgba(200,230,255,0.5)'; ctx.font='bold 20px sans-serif';
    ctx.fillText("L'OCEANOGRÀFIC", W*0.515, hy+45);

    // ── PALAU DE LES ARTS I LES CIÈNCIES (opera house, right) ──
    ctx.fillStyle=cityFill;
    // main hall body
    ctx.beginPath();
    ctx.moveTo(W*0.64, hy);
    ctx.lineTo(W*0.64, hy-H*0.09);
    ctx.bezierCurveTo(W*0.64,hy-H*0.16, W*0.68,hy-H*0.18, W*0.70,hy-H*0.175);
    ctx.bezierCurveTo(W*0.74,hy-H*0.185, W*0.78,hy-H*0.16, W*0.78,hy-H*0.09);
    ctx.lineTo(W*0.78, hy); ctx.closePath(); ctx.fill();
    // large side crests / shells
    [-1,1].forEach(function(s){
      var cx=W*0.71+s*W*0.025;
      ctx.beginPath();
      ctx.moveTo(cx,hy);
      ctx.bezierCurveTo(cx-s*W*0.08,hy-H*0.04, cx-s*W*0.06,hy-H*0.22, cx,hy-H*0.22);
      ctx.bezierCurveTo(cx+s*W*0.02,hy-H*0.22, cx+s*W*0.04,hy-H*0.14, cx,hy);
      ctx.fill();
    });
    // highlight lines on Palau
    ctx.strokeStyle='rgba(100,180,255,0.45)'; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(W*0.71, hy); ctx.bezierCurveTo(W*0.64,hy-H*0.05, W*0.65,hy-H*0.20, W*0.71,hy-H*0.22); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W*0.71, hy); ctx.bezierCurveTo(W*0.78,hy-H*0.05, W*0.77,hy-H*0.20, W*0.71,hy-H*0.22); ctx.stroke();
    ctx.fillStyle='rgba(200,230,255,0.5)'; ctx.font='bold 20px sans-serif';
    ctx.fillText('PALAU DE LES ARTS', W*0.71, hy+45);

    // ── MUSEU DE LES CIÈNCIES (right, arched structure) ──
    ctx.fillStyle=cityFill;
    ctx.beginPath();
    ctx.moveTo(W*0.80, hy);
    ctx.lineTo(W*0.80, hy-H*0.08);
    ctx.bezierCurveTo(W*0.80,hy-H*0.16, W*0.83,hy-H*0.165, W*0.86,hy-H*0.10);
    ctx.lineTo(W*0.92, hy-H*0.04);
    ctx.lineTo(W*0.92, hy); ctx.closePath(); ctx.fill();
    // arched rib lines
    ctx.strokeStyle='rgba(80,160,220,0.35)'; ctx.lineWidth=1.5;
    for(var ar2=0;ar2<5;ar2++){
      var t2=ar2/4;
      ctx.beginPath();
      ctx.moveTo(W*(0.80+t2*0.12),hy);
      ctx.lineTo(W*(0.80+t2*0.06),hy-H*(0.08+t2*0.04));
      ctx.stroke();
    }
    ctx.fillStyle='rgba(200,230,255,0.45)'; ctx.font='bold 18px sans-serif';
    ctx.fillText('MUSEU CIÈNCIES', W*0.86, hy+45);

    // ── reflection in pool ──
    ctx.save();
    ctx.translate(0, hy*2+24);
    ctx.scale(1,-0.28);
    ctx.globalAlpha=0.18;
    ctx.fillStyle=cityFill;
    // mirror Hemisfèric
    ctx.beginPath(); ctx.ellipse(W*0.38,hy,W*0.085,H*0.115,0,Math.PI,0,true); ctx.fill();
    // mirror Palau
    ctx.beginPath(); ctx.moveTo(W*0.64,hy); ctx.bezierCurveTo(W*0.64,hy-H*0.16,W*0.68,hy-H*0.18,W*0.70,hy-H*0.175); ctx.bezierCurveTo(W*0.74,hy-H*0.185,W*0.78,hy-H*0.16,W*0.78,hy-H*0.09); ctx.lineTo(W*0.78,hy); ctx.closePath(); ctx.fill();
    ctx.restore();

    // sea — layered Mediterranean gradients
    var sea=ctx.createLinearGradient(0,hy,0,H);
    sea.addColorStop(0,'#0d6ea8');
    sea.addColorStop(0.2,'#1589c8');
    sea.addColorStop(0.55,'#28aadc');
    sea.addColorStop(1,'#55c8ee');
    ctx.fillStyle=sea; ctx.fillRect(0,hy,W,H-hy);

    // sun path / glitter on water
    var glitter=ctx.createRadialGradient(W*0.72,H*0.85,0,W*0.72,H,W*0.45);
    glitter.addColorStop(0,'rgba(255,250,180,0.55)');
    glitter.addColorStop(0.5,'rgba(255,240,120,0.15)');
    glitter.addColorStop(1,'rgba(255,240,120,0)');
    ctx.fillStyle=glitter; ctx.fillRect(0,hy,W,H-hy);

    // wave lines
    ctx.save(); ctx.globalAlpha=0.45;
    for(var w=0;w<18;w++){
      var wy=hy+30+w*(H-hy-30)/18;
      var amp=3+w*0.8, freq=0.018-w*0.0004;
      ctx.strokeStyle=w%3===0?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.28)';
      ctx.lineWidth=w%3===0?2.5:1.2;
      ctx.beginPath();
      for(var px=0;px<W;px+=3){
        ctx.lineTo(px, wy+Math.sin(px*freq+w*0.7)*amp);
      }
      ctx.stroke();
    }
    ctx.restore();

    // foam / surf at bottom
    var foam=ctx.createLinearGradient(0,H-60,0,H);
    foam.addColorStop(0,'rgba(255,255,255,0)');
    foam.addColorStop(1,'rgba(200,240,255,0.35)');
    ctx.fillStyle=foam; ctx.fillRect(0,H-60,W,60);

    // a distant sail boat
    ctx.save(); ctx.translate(W*0.3,hy+55); ctx.fillStyle='rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-14,50); ctx.lineTo(14,50); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(10,48); ctx.lineTo(22,48); ctx.closePath(); ctx.fill();
    ctx.restore();

    // "VALENCIA · MAR MEDITERRÁNEO" subtle watermark
    ctx.fillStyle='rgba(255,255,255,0.08)';
    ctx.font='bold 48px serif'; ctx.textAlign='center';
    ctx.fillText('VALENCIA · MAR MEDITERRÁNEO', W/2, H-28);
  });

  // ── window plane ─────────────────────────────────────────────────
  var winW=8.0, winH=5.0;
  var winMesh=new THREE.Mesh(
    new THREE.PlaneGeometry(winW,winH),
    new THREE.MeshBasicMaterial({map:tex})
  );
  // sit just in front of the back wall
  winMesh.position.set(0, 4.8, BACK+0.08);
  scene.add(winMesh);

  // ── window frame (thick outer) ───────────────────────────────────
  var fMat=M.std(0xd4c8a8,0.3,0.7);  // warm white plaster/stone
  var fThick=0.18;
  // top / bottom rails
  [winH/2+fThick/2, -(winH/2+fThick/2)].forEach(function(fy){
    var rail=box(winW+fThick*2, fThick, 0.22, fMat);
    rail.position.set(0, 4.8+fy, BACK+0.07); scene.add(rail);
  });
  // left / right stiles
  [-(winW/2+fThick/2), winW/2+fThick/2].forEach(function(fx){
    var stile=box(fThick, winH+fThick*2, 0.22, fMat);
    stile.position.set(fx, 4.8, BACK+0.07); scene.add(stile);
  });
  // inner sill (bottom ledge sticking into room)
  var sill=box(winW+fThick*2+0.1, 0.12, 0.55, fMat);
  sill.position.set(0, 4.8-(winH/2+fThick)-0.04, BACK+0.34); scene.add(sill);

  // cross bar (horizontal muntin, classic Mediterranean style)
  var munH=box(winW, 0.10, 0.14, fMat);
  munH.position.set(0, 4.8+0.4, BACK+0.07); scene.add(munH);
  // vertical muntin
  var munV=box(0.10, winH, 0.14, fMat);
  munV.position.set(0, 4.8, BACK+0.07); scene.add(munV);

  // ── sunlight coming through ───────────────────────────────────────
  // warm directional fill simulating Mediterranean afternoon sun
  var winSun=new THREE.DirectionalLight(0xfff5c8, 2.2);
  winSun.position.set(0, 8, BACK+2); winSun.target.position.set(0, 2, 4);
  scene.add(winSun); scene.add(winSun.target);

  // rect area glow on the floor/bench (light patch)
  var winGlow=new THREE.RectAreaLight(0xfff0a0, 3.5, winW*0.8, winH*0.6);
  winGlow.position.set(0, 4.8, BACK+0.5);
  winGlow.lookAt(0, 0, 10);
  scene.add(winGlow);

  // subtle point light inside frame for warmth
  var winPt=new THREE.PointLight(0xffd88a, 1.8, 14);
  winPt.position.set(0, 5.5, BACK+1.5); scene.add(winPt);

  // ── light shaft / god-ray plane ───────────────────────────────────
  var shaftGeo=new THREE.PlaneGeometry(winW*0.85, 7);
  var shaftMat=new THREE.MeshBasicMaterial({
    color:0xfff5c0, transparent:true, opacity:0.045,
    blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide
  });
  var shaft=new THREE.Mesh(shaftGeo,shaftMat);
  shaft.position.set(0, 2.0, BACK+4);
  shaft.rotation.x=Math.PI/2.3;
  scene.add(shaft);

  // store for animation
  window._valWin={shaft:shaft, shaftMat:shaftMat, winPt:winPt};
}

// ═══════════════════════════════════════════════════════════════════
// PARTICLES
// ═══════════════════════════════════════════════════════════════════
var particleMat=new THREE.PointsMaterial({color:0x00d4ff,size:0.05,transparent:true,opacity:0.4,blending:THREE.AdditiveBlending,depthWrite:false});
function makeParticles(){
  var N=180, pos=new Float32Array(N*3);
  for(var i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*RW;pos[i*3+1]=Math.random()*RH;pos[i*3+2]=(Math.random()-.5)*RD;}
  var geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  scene.add(new THREE.Points(geo,particleMat));
}
