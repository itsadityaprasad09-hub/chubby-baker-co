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
      camera.position.set(0, 0.3, 7.2);
      camera.lookAt(0, -0.4, 0);

      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      stage.innerHTML = '';
      stage.appendChild(renderer.domElement);

      // ---- lighting: warm bakery-window glow ----
      var hemi = new THREE.HemisphereLight(0xfff2d8, 0x3b2418, 0.75);
      scene.add(hemi);
      var key = new THREE.DirectionalLight(0xfff0d0, 1.3);
      key.position.set(3, 5, 4);
      scene.add(key);
      var gold = new THREE.PointLight(0xffe4a3, 1.1, 12);
      gold.position.set(-3, 1.5, 2.5);
      scene.add(gold);
      var rim = new THREE.PointLight(0xffd98a, 0.6, 12);
      rim.position.set(2, -1, -3);
      scene.add(rim);
      var fill = new THREE.PointLight(0xfff8ea, 0.5, 14);
      fill.position.set(0, 1, 5);
      scene.add(fill);

      var cake = new THREE.Group();
      scene.add(cake);

      // ---- gold cake board ----
      var boardMat = new THREE.MeshStandardMaterial({ color: 0xe0b23c, roughness: 0.3, metalness: 0.55, emissive: 0x2a1c04, emissiveIntensity: 0.25 });
      var board = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 0.1, 56), boardMat);
      board.position.y = -1.55;
      cake.add(board);

      // ---- two white buttercream tiers ----
      var icingMat = new THREE.MeshStandardMaterial({ color: 0xfaf7f1, roughness: 0.88, metalness: 0.02 });
      var radii = [[1.55, 1.55], [1.05, 1.05]];
      var heights = [1.05, 0.95];
      var y = -1.5;
      var tierTopY = [];
      for (var i = 0; i < 2; i++) {
        var h = heights[i];
        var body = new THREE.Mesh(new THREE.CylinderGeometry(radii[i][1], radii[i][0], h, 48), icingMat);
        body.position.y = y + h / 2;
        cake.add(body);
        // soft top cap so the tier reads as frosted, not a flat cylinder cap
        var cap = new THREE.Mesh(new THREE.CylinderGeometry(radii[i][1] * 0.99, radii[i][1] * 0.99, 0.04, 48), icingMat);
        cap.position.y = y + h + 0.02;
        cake.add(cap);
        tierTopY.push(y + h);
        y += h + 0.05;
      }

      // ---- gold leaf appliques, scattered in asymmetric clusters like real sugar-leaf decor ----
      var goldMat = new THREE.MeshStandardMaterial({ color: 0xe8c458, roughness: 0.42, metalness: 0.4, side: THREE.DoubleSide, emissive: 0x3a2705, emissiveIntensity: 0.35 });
      var stemMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.45, metalness: 0.45 });

      function leafShape(len, wid) {
        var s = new THREE.Shape();
        s.moveTo(0, 0);
        s.quadraticCurveTo(wid, len * 0.35, 0, len);
        s.quadraticCurveTo(-wid, len * 0.35, 0, 0);
        return s;
      }
      function makeLeaf(len, wid) {
        var geo = new THREE.ExtrudeGeometry(leafShape(len, wid), { depth: 0.012, bevelEnabled: false });
        return new THREE.Mesh(geo, goldMat);
      }

      // place a cluster of leaves + thin stems on the curved surface of a tier
      function placeCluster(radius, tierY, tierH, angleCenter, leafCount, scale) {
        var group = new THREE.Group();
        var branch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.008, 0.7 * scale, 5),
          stemMat
        );
        branch.rotation.z = Math.PI / 2.3;
        group.add(branch);

        for (var k = 0; k < leafCount; k++) {
          var len = (0.42 + Math.random() * 0.2) * scale;
          var wid = len * 0.46;
          var leaf = makeLeaf(len, wid);
          var t = k / (leafCount - 1 || 1);
          leaf.position.set((t - 0.5) * 0.75 * scale, (Math.random() - 0.5) * 0.22 * scale, 0.015);
          leaf.rotation.z = (t - 0.5) * 1.7 + (Math.random() - 0.5) * 0.4;
          leaf.rotation.y = (Math.random() - 0.5) * 0.5;
          group.add(leaf);
        }

        var yPos = tierY - tierH * (0.25 + Math.random() * 0.5);
        group.position.set(Math.cos(angleCenter) * (radius + 0.02), yPos, Math.sin(angleCenter) * (radius + 0.02));
        group.rotation.y = -angleCenter + Math.PI / 2;
        group.rotation.z = (Math.random() - 0.5) * 0.3;
        cake.add(group);
      }

      // top tier clusters (angles in radians around the cylinder)
      placeCluster(radii[0][1], tierTopY[0], heights[0], 0.35, 6, 1.15);
      placeCluster(radii[0][1], tierTopY[0], heights[0], 2.5, 4, 0.85);
      placeCluster(radii[0][1], tierTopY[0], heights[0], -2.2, 5, 0.95);

      // bottom tier clusters
      placeCluster(radii[1][1], tierTopY[1], heights[1], 1.15, 6, 1.2);
      placeCluster(radii[1][1], tierTopY[1], heights[1], -1.4, 5, 1.0);
      placeCluster(radii[1][1], tierTopY[1], heights[1], 3.0, 4, 0.8);
      placeCluster(radii[1][1], tierTopY[1], heights[1], -0.15, 3, 0.7);

      cake.position.y = -0.15;

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
