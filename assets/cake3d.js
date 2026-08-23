(function () {
  var stage = document.getElementById('cake3dStage');
  if (!stage) return;

  function showFallback() {
    stage.innerHTML = '<div class="cake3d-fallback">A little cake is baking here — your browser just can\'t see the 3D oven. Peek at our <a href="menu.html" style="color:var(--berry); text-decoration:underline;">full menu</a> instead.</div>';
  }

  if (!window.WebGLRenderingContext) { showFallback(); return; }

  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = initCake;
  script.onerror = showFallback;
  document.head.appendChild(script);

  function initCake() {
    try {
      var THREE = window.THREE;
      var width = stage.clientWidth, height = stage.clientHeight;

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(0, 0.55, 6.6);
      camera.lookAt(0, -0.05, 0);

      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      stage.innerHTML = '';
      stage.appendChild(renderer.domElement);

      // ---- lighting: warm bakery-window glow ----
      var hemi = new THREE.HemisphereLight(0xfff2d8, 0x3b2418, 0.65);
      scene.add(hemi);
      var key = new THREE.DirectionalLight(0xfff0d0, 1.15);
      key.position.set(3, 5, 4);
      scene.add(key);
      var gold = new THREE.PointLight(0xd4a24c, 0.9, 12);
      gold.position.set(-3, 1.5, 2.5);
      scene.add(gold);
      var rim = new THREE.PointLight(0xa63f53, 0.4, 12);
      rim.position.set(2, -1, -3);
      scene.add(rim);

      var cake = new THREE.Group();
      scene.add(cake);

      // ---- plate ----
      var plateMat = new THREE.MeshStandardMaterial({ color: 0xfffaf1, roughness: 0.35, metalness: 0.05 });
      var plate = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.25, 0.14, 48), plateMat);
      plate.position.y = -1.55;
      cake.add(plate);

      // ---- three tapering tiers ----
      var tierColors = [0x6d351f, 0x8a4526, 0xa5602f];
      var frostColors = [0xfff2d8, 0xffe9c2, 0xffdfa8];
      var radii = [[1.55, 1.5], [1.2, 1.15], [0.85, 0.8]];
      var heights = [0.62, 0.56, 0.5];
      var y = -1.35;
      for (var i = 0; i < 3; i++) {
        var h = heights[i];
        var body = new THREE.Mesh(
          new THREE.CylinderGeometry(radii[i][1], radii[i][0], h, 40),
          new THREE.MeshStandardMaterial({ color: tierColors[i], roughness: 0.55 })
        );
        body.position.y = y + h / 2;
        cake.add(body);

        var frost = new THREE.Mesh(
          new THREE.TorusGeometry(radii[i][1] * 0.98, h * 0.22, 12, 40),
          new THREE.MeshStandardMaterial({ color: frostColors[i], roughness: 0.4 })
        );
        frost.rotation.x = Math.PI / 2;
        frost.position.y = y + h - h * 0.1;
        cake.add(frost);

        y += h;
      }

      // ---- drips on top tier ----
      var dripMat = new THREE.MeshStandardMaterial({ color: 0xd4a24c, roughness: 0.3, metalness: 0.15 });
      var dripCount = 10;
      for (var d = 0; d < dripCount; d++) {
        var angle = (d / dripCount) * Math.PI * 2;
        var drip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), dripMat);
        drip.position.set(Math.cos(angle) * 0.82, y - 0.08, Math.sin(angle) * 0.82);
        cake.add(drip);
      }

      // ---- cherry on top ----
      var cherry = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0xa63f53, roughness: 0.25, metalness: 0.1 })
      );
      cherry.position.y = y + 0.14;
      cake.add(cherry);
      var stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.18, 6),
        new THREE.MeshStandardMaterial({ color: 0x3b2418 })
      );
      stem.position.y = y + 0.3;
      stem.rotation.z = 0.3;
      cake.add(stem);

      cake.position.y = -0.35;

      // ---- interaction: drag to rotate, gentle auto-spin otherwise ----
      var targetRotY = 0.4, targetRotX = 0;
      var dragging = false, lastX = 0, lastY = 0, autoSpin = true;

      function pointerDown(e) {
        dragging = true; autoSpin = false;
        var p = e.touches ? e.touches[0] : e;
        lastX = p.clientX; lastY = p.clientY;
        stage.style.cursor = 'grabbing';
      }
      function pointerMove(e) {
        if (!dragging) return;
        var p = e.touches ? e.touches[0] : e;
        var dx = p.clientX - lastX, dy = p.clientY - lastY;
        lastX = p.clientX; lastY = p.clientY;
        targetRotY += dx * 0.008;
        targetRotX = Math.max(-0.35, Math.min(0.35, targetRotX + dy * 0.006));
        e.preventDefault && e.preventDefault();
      }
      function pointerUp() {
        dragging = false;
        stage.style.cursor = 'grab';
        setTimeout(function () { if (!dragging) autoSpin = true; }, 2500);
      }
      stage.addEventListener('mousedown', pointerDown);
      window.addEventListener('mousemove', pointerMove);
      window.addEventListener('mouseup', pointerUp);
      stage.addEventListener('touchstart', pointerDown, { passive: true });
      window.addEventListener('touchmove', pointerMove, { passive: false });
      window.addEventListener('touchend', pointerUp);

      function onResize() {
        var w = stage.clientWidth, h = stage.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener('resize', onResize);

      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function animate() {
        requestAnimationFrame(animate);
        if (autoSpin && !reduceMotion) targetRotY += 0.0028;
        cake.rotation.y += (targetRotY - cake.rotation.y) * 0.08;
        cake.rotation.x += (targetRotX - cake.rotation.x) * 0.08;
        renderer.render(scene, camera);
      }
      animate();
    } catch (err) {
      showFallback();
    }
  }
})();
