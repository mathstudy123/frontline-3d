import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9aa99a);
scene.fog = new THREE.Fog(0x9aa99a, 28, 125);

const camera = new THREE.PerspectiveCamera(76, innerWidth / innerHeight, 0.1, 220);
camera.position.set(0, 2, 8);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc9d9e3, 0x394334, 1.7));
const sun = new THREE.DirectionalLight(0xffe2b0, 2.4);
sun.position.set(-25, 40, 20); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048); scene.add(sun);

const mats = {
  ground: new THREE.MeshStandardMaterial({color:0x66745b, roughness:1}),
  dirt: new THREE.MeshStandardMaterial({color:0x625545, roughness:1}),
  concrete: new THREE.MeshStandardMaterial({color:0x777b75, roughness:.95}),
  dark: new THREE.MeshStandardMaterial({color:0x343b39, roughness:1}),
  wood: new THREE.MeshStandardMaterial({color:0x66513a, roughness:1}),
  sand: new THREE.MeshStandardMaterial({color:0xb6a078, roughness:1}),
  snow: new THREE.MeshStandardMaterial({color:0xd5ddd9, roughness:1}),
  green: new THREE.MeshStandardMaterial({color:0x435b42, roughness:1}),
  red: new THREE.MeshStandardMaterial({color:0x874d3d, roughness:1})
};
const boxGeo = new THREE.BoxGeometry(1,1,1);
const sphereGeo = new THREE.SphereGeometry(.5,12,10);
function box(x,y,z,sx,sy,sz,mat,shadow=true){
  const m=new THREE.Mesh(boxGeo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);
  m.castShadow=shadow;m.receiveShadow=true;scene.add(m);return m;
}
function clearWorld(){
  for(let i=scene.children.length-1;i>=0;i--){
    const o=scene.children[i];
    if(o.userData.world){scene.remove(o); if(o.geometry && o.geometry!==boxGeo && o.geometry!==sphereGeo)o.geometry.dispose();}
  }
}
function worldObj(obj){obj.userData.world=true;return obj;}
function addBox(...args){return worldObj(box(...args));}

const maps = {
  ukraine:{name:'EASTERN EUROPE',ground:0x66745b,fog:0x9aa99a,base:mats.ground,structures:'village'},
  east:{name:'WWII — EASTERN FRONT',ground:0x8b897c,fog:0xaeb1ac,base:mats.snow,structures:'ruins'},
  dday:{name:'WWII — NORMANDY',ground:0xb6a078,fog:0xc6b99b,base:mats.sand,structures:'coast'},
  ww1:{name:'WWI — FRANCE',ground:0x625545,fog:0x92918a,base:mats.dirt,structures:'trenches'}
};
function buildMap(key){
  clearWorld();
  const cfg=maps[key]; scene.background.setHex(cfg.fog);scene.fog.color.setHex(cfg.fog);
  const floor=addBox(0,-.35,0,180,.7,180,cfg.base,false);
  // Subtle terrain patches
  for(let i=0;i<90;i++){
    const x=(Math.random()-.5)*145,z=(Math.random()-.5)*145;
    const patch=addBox(x,.015,z,2+Math.random()*7,.03,2+Math.random()*7,
      key==='dday'?mats.dirt:(key==='east'?mats.snow:mats.green),false);
  }
  // A perimeter of low hills keeps the playable zone readable.
  for(let i=0;i<24;i++){
    const a=i/24*Math.PI*2, r=68;
    const hill=addBox(Math.cos(a)*r,1.4,Math.sin(a)*r,13,3,12,key==='dday'?mats.sand:mats.green);
  }
  if(cfg.structures==='village'){
    for(let i=0;i<12;i++){
      const x=(Math.random()-.5)*48,z=(Math.random()-.5)*48;
      addBox(x,1.5,z,7,3,6,mats.concrete);
      const roof=addBox(x,3.4,z,7.8,.8,6.8,mats.dark);
      addBox(x-1,1,z+3.05,1.1,1.8,.15,mats.dark,false);
    }
    for(let i=0;i<8;i++) addBox((Math.random()-.5)*60,.6,(Math.random()-.5)*60,1.2,1.2,1.2,mats.wood);
  } else if(cfg.structures==='ruins'){
    for(let i=0;i<13;i++){
      const x=(Math.random()-.5)*54,z=(Math.random()-.5)*54;
      addBox(x,1.4,z,8,2.8,5,mats.concrete);
      addBox(x+2,3,z,3,.5,5,mats.dark);
      addBox(x-5,.7,z+4,3,1.4,2,mats.wood);
    }
    for(let i=0;i<8;i++) addBox((Math.random()-.5)*55,.8,(Math.random()-.5)*55,2,1.6,2,mats.snow);
  } else if(cfg.structures==='coast'){
    // Distant sea band and beach obstacles
    addBox(0,-.1,-57,180,.2,24,new THREE.MeshStandardMaterial({color:0x476b78,roughness:.35}),false);
    for(let i=0;i<12;i++){
      const x=(Math.random()-.5)*65,z=(Math.random()-.5)*35;
      addBox(x,.8,z,2,1.6,2,mats.dark);
    }
    for(let i=0;i<8;i++) addBox((Math.random()-.5)*50,1,(Math.random()-.5)*45,7,2,5,mats.concrete);
  } else {
    // Trenches are stylized shallow channels, not a real-world construction guide.
    for(let i=0;i<5;i++){
      const z=-25+i*12;
      addBox(0,.02,z,74,.18,3,mats.dark);
      for(let j=0;j<9;j++) addBox(-34+j*8,.5,z+(Math.random()-.5)*2,2,1,1.5,mats.wood);
    }
    for(let i=0;i<12;i++) addBox((Math.random()-.5)*55,.5,(Math.random()-.5)*55,2,1,2,mats.concrete);
  }
  // Trees / poles as simple silhouettes
  for(let i=0;i<26;i++){
    const x=(Math.random()-.5)*120,z=(Math.random()-.5)*120;
    if(Math.abs(x)<12&&Math.abs(z)<12) continue;
    addBox(x,2,z,.45,4,.45,mats.wood);
    const crown=worldObj(new THREE.Mesh(new THREE.ConeGeometry(2.2,5,7),mats.green));
    crown.position.set(x,5.2,z);crown.castShadow=true;scene.add(crown);
  }
}

const player={health:100,score:0,velocity:new THREE.Vector3(),yaw:0,pitch:0};
const keys={};
let started=false, locked=false, lastShot=0, currentClass='assault', enemies=[], projectiles=[];
const classStats={
  assault:{health:100,delay:260,speed:43,damage:25,name:'ARC RIFLE'},
  gunner:{health:110,delay:420,speed:38,damage:34,name:'PULSE CANNON'},
  recon:{health:85,delay:520,speed:65,damage:48,name:'SCOUT BOLT'},
  support:{health:135,delay:350,speed:40,damage:28,name:'BURST EMITTER'}
};
function makeEnemy(x,z){
  const group=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.8,4,8),new THREE.MeshStandardMaterial({color:0x5b4b43,roughness:.9}));
  body.position.y=1.05;body.castShadow=true;group.add(body);
  const head=new THREE.Mesh(sphereGeo,new THREE.MeshStandardMaterial({color:0xb28c70}));head.position.y=1.85;head.scale.set(.55,.55,.55);group.add(head);
  const pack=new THREE.Mesh(boxGeo,new THREE.MeshStandardMaterial({color:0x39463b}));pack.position.set(0,1.15,-.35);pack.scale.set(.6,.75,.25);group.add(pack);
  group.position.set(x,0,z);scene.add(group);
  enemies.push({group,hp:100,phase:Math.random()*6});
}
function spawnEnemies(){
  enemies.forEach(e=>scene.remove(e.group));enemies=[];
  for(let i=0;i<10;i++){
    let x=(Math.random()-.5)*55,z=(Math.random()-.5)*55;
    if(Math.hypot(x,z)<15) x+=24;
    makeEnemy(x,z);
  }
}
function shoot(){
  const now=performance.now(),stats=classStats[currentClass];
  if(now-lastShot<stats.delay)return;lastShot=now;
  const dir=new THREE.Vector3();camera.getWorldDirection(dir);
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),new THREE.MeshBasicMaterial({color:0xffd48a}));
  mesh.position.copy(camera.position).addScaledVector(dir,.8);scene.add(mesh);
  projectiles.push({mesh,dir:dir.clone(),life:1.5,damage:stats.damage});
}
function damagePlayer(){
  player.health-=8;document.querySelector('#health').textContent=Math.max(0,player.health);
  if(player.health<=0){player.health=100;player.score=Math.max(0,player.score-20);document.querySelector('#message').textContent='Training reset — click to continue';}
}
function update(dt){
  if(!started)return;
  const forward=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
  const right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));
  const move=new THREE.Vector3();
  if(keys.KeyW)move.add(forward);if(keys.KeyS)move.sub(forward);
  if(keys.KeyD)move.add(right);if(keys.KeyA)move.sub(right);
  if(move.lengthSq()>0)move.normalize().multiplyScalar((keys.ShiftLeft?13:8)*dt);
  camera.position.add(move);camera.position.x=THREE.MathUtils.clamp(camera.position.x,-63,63);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-63,63);
  camera.position.y=1.75;
  // Lightweight arcade opponents move around the arena and apply non-graphic score pressure.
  for(const e of enemies){
    e.phase+=dt;
    const toPlayer=new THREE.Vector3(camera.position.x-e.group.position.x,0,camera.position.z-e.group.position.z);
    const dist=toPlayer.length();
    if(dist>8){toPlayer.normalize();e.group.position.addScaledVector(toPlayer,dt*1.1);}
    e.group.position.x+=Math.sin(e.phase)*dt*.5;
    e.group.position.z+=Math.cos(e.phase*.8)*dt*.4;
    e.group.lookAt(camera.position.x,0,camera.position.z);
    if(dist<5 && Math.random()<dt*.22)damagePlayer();
  }
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i];p.mesh.position.addScaledVector(p.dir, p.life>0?dt*48:0);p.life-=dt;
    let hit=-1;
    for(let j=0;j<enemies.length;j++){
      if(p.mesh.position.distanceTo(enemies[j].group.position.clone().add(new THREE.Vector3(0,1.2,0)))<1.05){hit=j;break;}
    }
    if(hit>=0){
      enemies[hit].hp-=p.damage;scene.remove(p.mesh);projectiles.splice(i,1);
      if(enemies[hit].hp<=0){scene.remove(enemies[hit].group);enemies.splice(hit,1);player.score+=100;document.querySelector('#score').textContent=player.score;}
      if(enemies.length<5)makeEnemy((Math.random()-.5)*55,(Math.random()-.5)*55);
    }else if(p.life<=0){scene.remove(p.mesh);projectiles.splice(i,1);}
  }
}
function startGame(){
  const map=document.querySelector('#mapChoice').value;
  currentClass=document.querySelector('#classChoice').value;
  const stats=classStats[currentClass];player.health=stats.health;player.score=0;
  document.querySelector('#health').textContent=player.health;document.querySelector('#score').textContent='0';
  document.querySelector('#mapName').textContent=maps[map].name;
  document.querySelector('#className').textContent=currentClass.toUpperCase();
  document.querySelector('#weaponName').textContent=stats.name;
  document.querySelector('#menu').classList.add('hidden');document.querySelector('#hud').classList.remove('hidden');
  camera.position.set(0,1.75,12);player.yaw=0;player.pitch=0;
  buildMap(map);spawnEnemies();started=true;document.body.requestPointerLock();
}
document.querySelector('#startBtn').addEventListener('click',startGame);
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===document.body;document.querySelector('#message').textContent=locked?'':'Click to lock mouse';});
document.addEventListener('mousemove',e=>{if(!locked)return;player.yaw-=e.movementX*.0022;player.pitch-=e.movementY*.0022;player.pitch=THREE.MathUtils.clamp(player.pitch,-1.35,1.35);camera.rotation.order='YXZ';camera.rotation.set(player.pitch,player.yaw,0);});
document.addEventListener('mousedown',e=>{if(started&&!locked){document.body.requestPointerLock();return;}if(started&&e.button===0)shoot();});
document.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Escape'&&started)document.querySelector('#message').textContent='Click to lock mouse';});
document.addEventListener('keyup',e=>keys[e.code]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
let previous=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-previous)/1000,.04);previous=now;update(dt);renderer.render(scene,camera);}
requestAnimationFrame(loop);
