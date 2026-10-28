(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Headline: split into letters for the load-in animation
  var h1 = document.getElementById('name');
  var text = h1.textContent;
  h1.textContent = '';
  text.split('').forEach(function (c, i) {
    var s = document.createElement('span');
    s.className = c === ' ' ? 'ch sp' : 'ch';
    s.style.setProperty('--i', i);
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = c === ' ' ? '&nbsp;' : c;
    h1.appendChild(s);
  });

  // Scroll reveals
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  document.getElementById('yr').textContent = new Date().getFullYear();

  // Three.js particle hero
  if (!window.THREE) return;
  var canvas = document.getElementById('bg');
  var hero = canvas.parentElement;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 14;

  var COUNT = window.innerWidth < 720 ? 1200 : 2600;
  var pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
  var palette = [0x7C5CFF, 0x22D3EE, 0xF472B6].map(function (h) { return new THREE.Color(h); });
  for (var i = 0; i < COUNT; i++) {
    var r = 4 + Math.random() * 10, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
    pos[i * 3 + 2] = r * Math.cos(ph);
    var c = palette[i % 3];
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  var mat = new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
  var pts = new THREE.Points(geo, mat);
  scene.add(pts);

  function resize() {
    var w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();

  var mx = 0, my = 0, tx = 0, ty = 0, visible = true;
  window.addEventListener('pointermove', function (e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);

  var clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    var t = clock.getElapsedTime();
    tx += (mx - tx) * 0.04; ty += (my - ty) * 0.04;
    if (!reduce) pts.rotation.y = t * 0.05 + tx * 0.5;
    pts.rotation.x = ty * 0.3;
    pts.position.y = Math.sin(t * 0.4) * 0.25;
    var s = 1 + Math.sin(t * 0.6) * 0.03;
    pts.scale.set(s, s, s);
    renderer.render(scene, camera);
  })();
})();
