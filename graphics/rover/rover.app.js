(function(){
"use strict";
var T = window.THREE;
var DATA = JSON.parse(document.getElementById('rover-data').textContent);

/* ---- palette, REWRITTEN 2026-08-12 for the armoured-crawler rebuild.
   The old table was seventeen buckets across violet, magenta, mint, red, green
   and white, and the user's verdict on it was "this looks like a toy". This one
   carries ZERO hues on the vehicle body: eight neutral materials separated by
   ROUGHNESS and METALNESS, never by colour, plus ONE accent on four recovery
   items, plus the camo net — the only coloured thing on the machine.

   Two rules that are doing most of the work, and both are numeric:
     * NOTHING sits in the metalness band 0.10 < m < 0.80. Half-metals are the
       shading signature of moulded plastic. Paint is a dielectric (m = 0.00);
       metal is a true metal (m >= 0.85). There is no in between.
     * NOTHING has roughness below 0.26 except glass. Gloss reads as toy.
   Neutrality gate: max(R,G,B) - min(R,G,B) <= 10 on every body colour. */
var COL = {
  armour:         0x43474c,  // CARC-black monocoque shell, deck, applique
  armour_lower:   0x2f3237,  // belly pan, skid, track guards, bumpers
  gunmetal:       0x4c5056,  // pod frames, sensor housings, mast, slat
  machined:       0xa8adb2,  // bare metal: fasteners, hub caps, shock bodies
  hardware_black: 0x3d3d3d,  // Dacrokote handles, rings, PALS, clamps
  rubber:         0x26292d,  // belt, tread blocks, corner bumpers
  optic:          0x14181e,  // every lens and window
  emitter:        0xfff3d6,  // lamp slot floors — light, not paint
  accent:         0xc8461e,  // THE one accent, recovery hardware only
  netolive:       0x6b7150,  // camo net, base tone
  netkhaki:       0x726f52,  // camo net, flank panel
  netshadow:      0x454a34,  // camo net, disruptor patch
  dirt:           0x5f5644,  // field dirt packed into the tread
  trail:          0x807870   // tread prints it left on the way in
};
var ROUGH = {
  armour:0.92, armour_lower:0.80, gunmetal:0.38, machined:0.26,
  hardware_black:0.72, rubber:0.96, optic:0.07, emitter:0.30, accent:0.42,
  netolive:0.90, netkhaki:0.90, netshadow:0.90,
  dirt:0.99, trail:0.99
};
var METAL = {
  armour:0.00, armour_lower:0.10, gunmetal:0.95, machined:1.00,
  hardware_black:0.85, rubber:0.00, optic:0.00, emitter:0.00, accent:0.05,
  netolive:0.00, netkhaki:0.00, netshadow:0.00,
  dirt:0.00, trail:0.00
};

/* `gear:true` marks what comes off. On this vehicle that is the camo net —
   the printed payload decks it used to mean no longer exist. */
var SYSTEMS = [
  {id:'hull',    name:'Hull',         buckets:['armour','armour_lower'],          gear:false},
  {id:'tracks',  name:'Track units',  buckets:['rubber'],                         gear:false},
  {id:'drive',   name:'Running gear', buckets:['machined'],                       gear:false},
  {id:'fitted',  name:'Sensors',      buckets:['gunmetal','optic'],               gear:false},
  {id:'lights',  name:'Lighting',     buckets:['emitter'],                        gear:false},
  {id:'crew',    name:'Crew hardware',buckets:['hardware_black','accent'],        gear:false},
  {id:'camo',    name:'Camo net',     buckets:['netolive','netkhaki','netshadow'],gear:true },
  {id:'grime',   name:'Dirt & trail', buckets:['dirt','trail'],                   gear:true }
];

/* ------------------------------------------------------------ scene */
var stage = document.getElementById('stage');
var renderer = new T.WebGLRenderer({antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
stage.appendChild(renderer.domElement);

var scene = new T.Scene();
var camera = new T.PerspectiveCamera(34, innerWidth/innerHeight, 0.02, 60);

/* Frame on `core` — the vehicle without the ground trail. `bounds` still
   covers everything, so the shadow frustum and floor stay correct. Framing on
   full bounds put 780 mm of tread prints in the fit and shrank the rover by a
   third. */
var B = DATA.core || DATA.bounds, C = B.center, S = B.size;
var TARGET = new T.Vector3(C[0], S[1]*0.42, C[2]);
var RADIUS = Math.max(S[0], S[2]) * 1.32;

/* studio void: a radial-gradient canvas, not a CSS background, so it sits
   behind the model in the same colour space and picks up tone mapping. */
function backdrop(){
  var c = document.createElement('canvas'); c.width = c.height = 512;
  var x = c.getContext('2d');
  var cs = getComputedStyle(document.documentElement);
  var g = x.createRadialGradient(256,236,20,256,256,300);
  g.addColorStop(0, cs.getPropertyValue('--void-1').trim() || '#fff');
  g.addColorStop(1, cs.getPropertyValue('--void-2').trim() || '#e9edf1');
  x.fillStyle = g; x.fillRect(0,0,512,512);
  var t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  return t;
}
scene.background = backdrop();

/* ------------------------------------------------------------ lighting */
var key = new T.DirectionalLight(0xffffff, 2.55);
key.position.set(0.62, 0.95, 0.52);
key.castShadow = true;
key.shadow.mapSize.set(innerWidth < 780 ? 1024 : 2048, innerWidth < 780 ? 1024 : 2048);
key.shadow.radius = 5;
key.shadow.bias = -0.0016;
var sc = key.shadow.camera;
sc.left = -0.5; sc.right = 0.5; sc.top = 0.5; sc.bottom = -0.5; sc.near = 0.1; sc.far = 3.2;
sc.updateProjectionMatrix();   // ortho shadow frustum ignores the edits without this
scene.add(key);
scene.add(new T.DirectionalLight(0xdfe8f2, 1.15).translateX(-0.7).translateY(0.45).translateZ(-0.6));
var bounce = new T.DirectionalLight(0xffffff, 0.62); bounce.position.set(0,-1,0.25); scene.add(bounce);
/* a low rim from behind so the dark flanks get an edge against the void */
var rim = new T.DirectionalLight(0xeef3f8, 0.75); rim.position.set(-0.85,0.30,-0.5); scene.add(rim);
scene.add(new T.HemisphereLight(0xffffff, 0xd6dce2, 1.05));

/* contact shadow + one hairline ring for scale */
var floor = new T.Mesh(
  new T.PlaneGeometry(4,4),
  new T.ShadowMaterial({opacity:0.17}));
floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
var ring = new T.Mesh(
  new T.RingGeometry(RADIUS*0.98, RADIUS*0.98+0.0016, 128),
  new T.MeshBasicMaterial({color:0x99a1aa, transparent:true, opacity:0.5, side:T.DoubleSide}));
ring.rotation.x = -Math.PI/2; ring.position.y = 0.0004; scene.add(ring);

/* ------------------------------------------------------------ geometry */
function b64(s){
  var bin = atob(s), n = bin.length, u = new Uint8Array(n);
  for (var i=0;i<n;i++) u[i] = bin.charCodeAt(i);
  return u.buffer;
}
var rover = new T.Group(); scene.add(rover);
var meshes = {}, totalTris = 0;

SYSTEMS.forEach(function(sys){
  sys.meshes = [];
  sys.buckets.forEach(function(bk){
    var d = DATA.buckets[bk]; if (!d) return;
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(b64(d.pos)), 3));
    var ib = b64(d.idx);
    g.setIndex(new T.BufferAttribute(
      d.itype === 'u16' ? new Uint16Array(ib) : new Uint32Array(ib), 1));
    g.computeBoundingSphere();
    var m = new T.MeshStandardMaterial({
      color: COL[bk] != null ? COL[bk] : 0x808080,
      roughness: ROUGH[bk] != null ? ROUGH[bk] : 0.6,
      metalness: METAL[bk] != null ? METAL[bk] : 0.06,
      flatShading: true
    });
    if (bk === 'emitter'){ m.emissive = new T.Color(0xfff3d6); m.emissiveIntensity = 0.8; }
    if (bk === 'trail'){ m.transparent = true; m.opacity = 0.62; m.depthWrite = false; }
    var mesh = new T.Mesh(g, m);
    mesh.castShadow = (bk !== 'trail'); mesh.receiveShadow = true;
    mesh.userData.bucket = bk; mesh.userData.sys = sys.id;
    rover.add(mesh); sys.meshes.push(mesh); meshes[bk] = mesh;
    totalTris += d.nf;
  });
});
document.getElementById('tris').textContent = totalTris.toLocaleString();

/* ------------------------------------------------------------ orbit
   Hand-rolled: OrbitControls is an addon module and bundling it without a
   build step is more trouble than 40 lines. */
var az = -0.72, el = 0.30, dist = RADIUS*2.35, spin = true;
var AZ0 = az, EL0 = el, D0 = dist;
var drag = false, px = 0, py = 0, pointers = {}, pinch = 0;

function place(){
  var cy = Math.cos(el);
  camera.position.set(
    TARGET.x + dist*cy*Math.sin(az),
    TARGET.y + dist*Math.sin(el),
    TARGET.z + dist*cy*Math.cos(az));
  camera.lookAt(TARGET);
}
var el2 = renderer.domElement;
el2.style.touchAction = 'none';
el2.addEventListener('pointerdown', function(e){
  pointers[e.pointerId] = [e.clientX, e.clientY];
  drag = true; px = e.clientX; py = e.clientY;
  el2.setPointerCapture(e.pointerId);
  spin = false; syncSpin();
});
el2.addEventListener('pointermove', function(e){
  if (pointers[e.pointerId]) pointers[e.pointerId] = [e.clientX, e.clientY];
  var ids = Object.keys(pointers);
  if (ids.length >= 2){
    var a = pointers[ids[0]], b = pointers[ids[1]];
    var d = Math.hypot(a[0]-b[0], a[1]-b[1]);
    if (pinch) dist = clamp(dist * (pinch/d), RADIUS*0.85, RADIUS*6);
    pinch = d; place(); return;
  }
  if (!drag) return;
  az -= (e.clientX - px) * 0.0072;
  el = clamp(el + (e.clientY - py) * 0.0056, -0.12, 1.32);
  px = e.clientX; py = e.clientY; place();
});
function up(e){ delete pointers[e.pointerId]; pinch = 0; if (!Object.keys(pointers).length) drag = false; }
el2.addEventListener('pointerup', up);
el2.addEventListener('pointercancel', up);
el2.addEventListener('wheel', function(e){
  e.preventDefault();
  dist = clamp(dist * (1 + Math.sign(e.deltaY)*0.085), RADIUS*0.85, RADIUS*6);
  place();
}, {passive:false});
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }

/* ------------------------------------------------------------ systems UI */
var isolated = null, stripped = false;
var rows = document.getElementById('rows');
SYSTEMS.forEach(function(sys){
  var tris = sys.buckets.reduce(function(a,b){ return a + (DATA.buckets[b] ? DATA.buckets[b].nf : 0); }, 0);
  var b = document.createElement('button');
  b.className = 'sys'; b.type = 'button';
  b.setAttribute('aria-pressed','false');
  b.innerHTML = '<span class="sw"></span><span class="nm"></span><span class="ct"></span>';
  b.querySelector('.sw').style.background = '#' + (COL[sys.buckets[0]]||0x808080).toString(16).padStart(6,'0');
  b.querySelector('.nm').textContent = sys.name;
  b.querySelector('.ct').textContent = tris.toLocaleString();
  b.addEventListener('click', function(){
    isolated = (isolated === sys.id) ? null : sys.id;
    apply();
  });
  sys.btn = b; rows.appendChild(b);
});

function apply(){
  SYSTEMS.forEach(function(sys){
    var hiddenByStrip = stripped && sys.gear;
    var ghost = isolated && isolated !== sys.id;
    sys.meshes.forEach(function(m){
      m.visible = !hiddenByStrip;
      m.material.transparent = !!ghost;
      m.material.opacity = ghost ? 0.055 : 1;
      m.material.depthWrite = !ghost;
      m.castShadow = !ghost && !hiddenByStrip;
      m.material.needsUpdate = true;
    });
    sys.btn.setAttribute('aria-pressed', isolated === sys.id ? 'true' : 'false');
    sys.btn.classList.toggle('off', hiddenByStrip);
    sys.btn.disabled = hiddenByStrip;
  });
  document.getElementById('isohint').textContent =
    isolated ? 'click again to show all' : 'click to isolate';
}

/* ------------------------------------------------------------ buttons */
var bGear = document.getElementById('b-gear');
var bSpin = document.getElementById('b-spin');
function syncSpin(){ bSpin.setAttribute('aria-pressed', spin ? 'true':'false'); }
bGear.addEventListener('click', function(){
  stripped = !stripped;
  bGear.setAttribute('aria-pressed', stripped ? 'true':'false');
  bGear.textContent = stripped ? 'Refit gear' : 'Strip gear';
  if (stripped && isolated){
    var s = SYSTEMS.filter(function(x){ return x.id === isolated; })[0];
    if (s && s.gear) isolated = null;
  }
  apply();
});
bSpin.addEventListener('click', function(){ spin = !spin; syncSpin(); });
document.getElementById('b-reset').addEventListener('click', function(){
  az = AZ0; el = EL0; dist = D0; isolated = null; place(); apply();
});

/* reduced motion: never auto-rotate, and say so on the control */
var rm = matchMedia('(prefers-reduced-motion: reduce)');
if (rm.matches){ spin = false; }
syncSpin();

addEventListener('resize', function(){
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){
  scene.background = backdrop();
});

var last = performance.now();
function tick(now){
  var dt = Math.min((now - last)/1000, 0.1); last = now;
  if (spin && !drag){ az -= dt*0.16; place(); }
  renderer.render(scene, camera);
}
place(); apply();
renderer.setAnimationLoop(tick);
document.addEventListener('visibilitychange', function(){
  renderer.setAnimationLoop(document.hidden ? null : tick);
});
requestAnimationFrame(function(){
  document.getElementById('loading').classList.add('done');
});
})();
