function main() {

    var camera, scene, renderer;
    var geometry, material, mesh;
    var controls;
    var objects = [];
    var raycaster;


    var hit = false;
    var Harpy;
    var Succubus;
    var Bathos;
    var Zombie;
    var lpt = [];
    var ct = [];
    var boxes = [];
    var found = 0;
    var level = 1;
    var id;
    var delta;
    var frames = 0;
    var levelUp = false;

    var names = [];


    var xDirHarp = ((Math.random() * 10) - 5);
    var zDirHarp = ((Math.random() * 10) - 5);

    var xDirSuc = ((Math.random() * 6) - 3);
    var zDirSuc = ((Math.random() * 6) - 3);

    var xDirBathos = ((Math.random() * 8) - 4);
    var zDirBathos = ((Math.random() * 8) - 4);

    var xDirZombie = ((Math.random() * 10) - 5);
    var zDirZombie = ((Math.random() * 10) - 5);

    var controlsEnabled = false;
    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var canJump = false;
    var velocity = new THREE.Vector3();
    var startChaseSound = 1;

    var blocker = document.getElementById('blocker');
    var instructions = document.getElementById('instructions');
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;


    if (havePointerLock) {
        var element = document.body;

        //
        var pointerlockchange = function(event) {

            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                controlsEnabled = true;
                controls.enabled = true;
                blocker.style.display = 'none';
            } else {
                controls.enabled = false;
                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';
                instructions.style.display = '';
            }
        };

        //
        var pointerlockerror = function(event) {
            instructions.style.display = '';
        };

        // Hook pointer lock state change events
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        instructions.addEventListener('click', function(event) {
            instructions.style.display = 'none';

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            if (/Firefox/i.test(navigator.userAgent)) {

                var fullscreenchange = function(event) {

                    if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

                        document.removeEventListener('fullscreenchange', fullscreenchange);
                        document.removeEventListener('mozfullscreenchange', fullscreenchange);
                        element.requestPointerLock();
                    }
                };

                document.addEventListener('fullscreenchange', fullscreenchange, false);
                document.addEventListener('mozfullscreenchange', fullscreenchange, false);
                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
                element.requestFullscreen();

            } else {
                element.requestPointerLock();
            }
        }, false);

    } else {
        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
    }



    // call init and animate
    init();
    animate();


    function init() {

        // Create a scene
        scene = new THREE.Scene();

        // Add the camera
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);

        // Add a light
        var dirLight = new THREE.DirectionalLight(0xFAFAFA, 0.05);
        dirLight.position.set(15, 16, -50);
        scene.add(dirLight);

        var ambientLight = new THREE.AmbientLight(0x404040, 0.0005);
        scene.add(ambientLight);

        /*
        var light = new THREE.PointLight(0xaaaae5, 2);
        light.position.set(0, 0, 0);
        scene.add(light);
        */


        controls = new THREE.PointerLockControls(camera);
        scene.add(controls.getObject());

        //Controls
        var onKeyDown = function(event) {

            switch (event.keyCode) {

                case 87: // w
                    moveForward = true;
                    break;

                case 65: // a
                    moveLeft = true;
                    break;

                case 83: // s
                    moveBackward = true;
                    break;

                case 68: // d
                    moveRight = true;
                    break;

                case 32: // space
                    if (canJump === true) velocity.y += 350;
                    canJump = false;
                    break;
            }
        };

        var onKeyUp = function(event) {

            switch (event.keyCode) {

                case 87: // w
                    moveForward = false;
                    break;

                case 65: // a
                    moveLeft = false;
                    break;

                case 83: // s
                    moveBackward = false;
                    break;

                case 68: // d
                    moveRight = false;
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);

        raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 5);

        // Play music
        playMusic();

        // Create the sky box
        loadSkyBox();

        // Add scene elements
        addSceneElements(level);
        addGround();

        // Create the WebGL Renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0xffffff);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Append the renderer to the body
        document.body.appendChild(renderer.domElement);
        // Add a resize event listener
        window.addEventListener('resize', onWindowResize, false);

    }


    function loadSkyBox() {

        // Load the skybox images and create list of materials
        var materials = [
            createMaterial('skyX55x.png'), // right
            createMaterial('skyX55-x.png'), // left
            createMaterial('skyX55y.png'), // top
            createMaterial('skyX55-y.png'), // bottom
            createMaterial('skyX55z.png'), // back
            createMaterial('skyX55-z.png') // front
        ];

        // Create a large cube
        var mesh = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000, 1, 1, 1), new THREE.MeshFaceMaterial(materials));

        // Set the x scale to be -1, this will turn the cube inside out
        mesh.scale.set(-1, 1, 1);
        scene.add(mesh);
    }


    function createMaterial(path) {
        var texture = THREE.ImageUtils.loadTexture(path);
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            overdraw: 0.5
        });
        return material;
    }


    function addSceneElements(level) {

        // Load Poly trees
        var loader = new THREE.OBJMTLLoader();
        loader.load("Lowpoly_tree_obj.txt", "Lowpoly_tree_mtl.txt", function(loadedObject) {
            loadedObject.name = 'lowPoly';
            loadedObject.position.set((Math.random() * 800) - 400, 0, (Math.random() * 800) - 400);
            loadedObject.scale.set(((Math.random() * 4) / 2) + 2, ((Math.random() * 4) / 2) + 2, ((Math.random() * 4) / 2) + 2);
            lpt.push(loadedObject.position);
            names.push(loadedObject.name);
            scene.add(loadedObject);

            for (var i = 0; i < level * 7; i++) {
                var lowPoly = loadedObject.clone();
                lowPoly.name = "lowPoly"+i;
                lowPoly.position.set((Math.random() * 800) - 400, 0, (Math.random() * 800) - 400);
                var tempPolySize = ((Math.random() * 4) / 2) + 2;
                lowPoly.scale.set(tempPolySize, tempPolySize, tempPolySize);
                lpt.push(lowPoly.position);
                names.push(lowPoly.name);

                scene.add(lowPoly);
            }

        }, onProgress, onError);

        //Load Conifer trees
        var loader = new THREE.OBJMTLLoader();
        loader.load("ConiferTree/Tree_Conifer_obj.txt", "ConiferTree/Tree_Conifer_mtl.txt", function(loadedObject) {
            loadedObject.name = 'conTree';
            loadedObject.position.set((Math.random() * 800) - 400, 0, (Math.random() * 800) - 400);
            loadedObject.scale.set(0.2, 0.2, 0.2);
            ct.push(loadedObject.position);
            names.push(loadedObject.name);
            scene.add(loadedObject);

            for (var i = 0; i < level * 7; i++) {
                var conTree = loadedObject.clone();
                conTree.name = "conTree"+i;
                names.push(conTree.name)
                conTree.position.set((Math.random() * 800) - 400, 0, (Math.random() * 800) - 400);
                var tempConiferSize = ((Math.random() / 10) + 0.05) + 0.08
                conTree.scale.set(tempConiferSize, tempConiferSize, tempConiferSize);
                ct.push(conTree.position);
                scene.add(conTree);
            }
        }, onProgress, onError);

        //Load rocks
        var loader = new THREE.OBJMTLLoader();
        loader.load("Rock1/rock1_obj.txt", "Rock1/rock1_mtl.txt", function(loadedObject) {
            loadedObject.name = 'rock';
            names.push(loadedObject.name);
            loadedObject.position.set((Math.random() * 800) - 400, 1, (Math.random() * 800) - 400);
            loadedObject.scale.set(0.3, 0.2, 0.3);
            scene.add(loadedObject);

            for (var i = 0; i < level * 5; i++) {
                var rock = loadedObject.clone();
                rock.name = "rock"+i;
                names.push(rock.name);
                rock.position.set((Math.random() * 800) - 400, 0.5, (Math.random() * 800) - 400);
                rock.scale.set(Math.random() / 3, Math.random() / 3, Math.random() / 3);
                scene.add(rock);
            }
        }, onProgress, onError);

        //Load crate
        var loader = new THREE.OBJMTLLoader();
        loader.load("Crate/Crate1_obj.txt", "Crate/Crate1_mtl.txt", function(loadedObject) {
            loadedObject.name = 'Crate';
            names.push(loadedObject.name);

            loadedObject.position.set((Math.random() * 800) - 400, 3, (Math.random() * 800) - 400);
            loadedObject.scale.set(3, 3, 3);
            boxes.push(loadedObject);
            scene.add(loadedObject);

            //console.log("Boxes length" + boxes[0] );
            for (var i = 0; i < level - 1; i++) {
                var crte = loadedObject.clone();
                crte.name = "Crate"+i;
                names.push(crte.name);

                crte.position.set((Math.random() * 800) - 400, 3, (Math.random() * 800) - 400);
                crte.scale.set(3, 3, 3);
                boxes.push(crte);
                scene.add(crte);

            }
        }, onProgress, onError);

        //Load Harpy
        var loader = new THREE.OBJMTLLoader();
        loader.load("Harpy/harpy_obj.txt", "Harpy/harpy_mtl.txt", function(loadedObject) {
            loadedObject.name = 'Harpy';
            loadedObject.position.set((Math.random() * 200) + 50, 5, (Math.random() * 200) + 50);
            loadedObject.scale.set(2, 2, 2);
            names.push(loadedObject.name);

            scene.add(loadedObject);
        }, onProgress, onError);

        //Load succubus
        if (level >= 2) {
            var loader = new THREE.OBJMTLLoader();
            loader.load("Succubus/succubus_obj.txt", "Succubus/succubus_mtl.txt", function(loadedObject) {
                loadedObject.name = 'Succubus';
                //loadedObject.position.set((Math.random() * 975) - 500, 0, (Math.random() * 975) - 500);
                loadedObject.position.set((Math.random() * -200) - 50, 0, (Math.random() * -200) - 50);
                loadedObject.scale.set(0.25, 0.25, 0.25);
                names.push(loadedObject.name);

                scene.add(loadedObject);
            }, onProgress, onError);
        }

        if (level >= 3) {
            var loader = new THREE.OBJMTLLoader();
            loader.load("Bathos/bathos_obj.txt", "Bathos/bathos_mtl.txt", function(loadedObject) {
                loadedObject.name = 'Bathos';
                loadedObject.position.set((Math.random() * 200) + 50, 0, (Math.random() * -200) - 50);
                loadedObject.scale.set(3, 3, 3);
                names.push(loadedObject.name);

                scene.add(loadedObject);
            }, onProgress, onError);
        }

        // load zombie
        if (level >= 4)
        {
          var loader = new THREE.OBJMTLLoader();
          loader.load("Zombie/Lambent_Male_obj.txt", "Zombie/Lambent_Male_mtl.txt", function(loadedObject) {
              loadedObject.name = 'zombie';
              loadedObject.position.set((Math.random() * -200) - 50, 0,(Math.random() * 200) + 50);
              loadedObject.scale.set(4, 4, 4);
              names.push(loadedObject.name);
              scene.add(loadedObject);
          }, onProgress, onError);
        }
    }


    function addGround() {

        // Create the ground using a Plane
        // Load the texture for the ground
        var groundTexture = THREE.ImageUtils.loadTexture('Grass2.jpg');
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;

        // Load bump map for the ground
        var groundBump = THREE.ImageUtils.loadTexture('Grass2.jpg');
        groundBump.wrapS = THREE.RepeatWrapping;
        groundBump.wrapT = THREE.RepeatWrapping;

        // Create the material
        var groundMat = new THREE.MeshPhongMaterial({
            map: groundTexture,
            bumpMap: groundBump,
            color: 0x957D69
        });
        groundMat.map.repeat.set(100, 100);

        // Create the mesh
        var groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 2, 2), groundMat);
        groundMesh.rotation.set(-90 * (3.14 / 180), 0, 0, 'XYZ');

        scene.add(groundMesh);
    }


    function onProgress(progress) {
        // Use this to track loading progress
    }


    function onError(error) {
        // Called when errors occur during loading
    }


    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }


    function monsterMovement() {
        frames++;

        if(frames == 500)
        {
          xDirHarp = ((Math.random() * 10) - 5);
          zDirHarp = ((Math.random() * 10) - 5);

          xDirSuc = ((Math.random() * 6) - 3);
          zDirSuc = ((Math.random() * 6) - 3);

          xDirBathos = ((Math.random() * 8) - 4);
          zDirBathos = ((Math.random() * 8) - 4);

          xDirZombie = ((Math.random() * 10) - 5);
          zDirZombie = ((Math.random() * 10) - 5);

          frames = 0;
        }

        scene.traverse(function(object) {

            if (object.name == 'Harpy') {
                Harpy = object;

                // Make bob look at the player
                var cam = new THREE.Vector3(0, 0, 0);
                cam.set(controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z);
                object.lookAt(cam);

                // move toward the player only in certain radius
                if ((object.position.z > -475 && object.position.z < 475) && (object.position.x < 475 && object.position.x > -475) && (controls.getObject().position.distanceTo(object.position) > 110)) {
                  object.translateOnAxis((object.worldToLocal(new THREE.Vector3(object.position.x + xDirHarp, 5, object.position.z + zDirHarp)).normalize()), 0.15);
                  scene.add(object);
                  startChaseSound = 1;
                }

                if ((controls.getObject().position.distanceTo(object.position) <= 110)) {
                    object.translateOnAxis((object.worldToLocal(new THREE.Vector3(controls.getObject().position.x, 4, controls.getObject().position.z)).normalize()), 0.25);
                    scene.add(object);
                    startChaseSound++;
                    StartChaseMusic();
                }
            }

            if (object.name == 'Succubus') {
                Succubus = object;

                // Make bob look at the player
                var cam2 = new THREE.Vector3(0, 0, 0);
                cam2.set(controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z);
                object.lookAt(cam2);

                // move toward the player only in certain radius
                if ((object.position.z > -475 && object.position.z < 475) && (object.position.x < 475 && object.position.x > -475) && (controls.getObject().position.distanceTo(object.position) > 70)) {
                    object.translateOnAxis((object.worldToLocal(new THREE.Vector3(object.position.x + xDirSuc, 5, object.position.z + zDirSuc)).normalize()), 0.15);
                    scene.add(object);

                }

                if ((controls.getObject().position.distanceTo(object.position) <= 70)) {
                    object.translateOnAxis((object.worldToLocal(new THREE.Vector3(controls.getObject().position.x, 4, controls.getObject().position.z)).normalize()), 0.33);
                    console.log(controls.getObject().position.distanceTo(object.position));
                    scene.add(object);
                }
            }

            if (object.name == 'Bathos') {
                Bathos = object;

                // Make bob look at the player
                var cam3 = new THREE.Vector3(0, 0, 0);
                cam3.set(controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z);
                object.lookAt(cam3);

                // move toward the player only in certain radius
                if ((object.position.z > -475 && object.position.z < 475) && (object.position.x < 475 && object.position.x > -475) && (controls.getObject().position.distanceTo(object.position) > 85)) {
                    object.translateOnAxis((object.worldToLocal(new THREE.Vector3(object.position.x + xDirBathos, 5, object.position.z + zDirBathos)).normalize()), 0.1);
                    scene.add(object);
                }

                if ((controls.getObject().position.distanceTo(object.position) <= 85)) {
                    object.translateOnAxis((object.worldToLocal(new THREE.Vector3(controls.getObject().position.x, 4, controls.getObject().position.z)).normalize()), 0.3);
                    scene.add(object);
                }
            }

            if (object.name == 'zombie') {
                Zombie = object;

                // Make bob look at the player
                var cam4 = new THREE.Vector3(0, 0, 0);
                cam4.set(controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z);
                object.lookAt(cam4);

                // move toward the player only in certain radius
                if ((object.position.z > -475 && object.position.z < 475) && (object.position.x < 475 && object.position.x > -475) && (controls.getObject().position.distanceTo(object.position) > 85)) {
                    object.translateOnAxis((object.worldToLocal(new THREE.Vector3(object.position.x + xDirZombie, 0, object.position.z + zDirZombie)).normalize()), 0.1);
                    scene.add(object);

                }

                if ((controls.getObject().position.distanceTo(object.position) <= 85)) {
                    object.translateOnAxis((object.worldToLocal(new THREE.Vector3(controls.getObject().position.x, 0, controls.getObject().position.z)).normalize()), 0.3);
                    scene.add(object);
                }
            }
        });
    }


    // redrawd the models based on level
    function updateGeometry() {

        cancelAnimationFrame( id );
        console.log("Before", names.length);


        for(var i = 0; i < names.length; i++)
        {
          scene.remove(scene.getObjectByName(names[i]));
        }

        boxes = [];
        names = [];
        console.log("After", names.length);

        ct = [];
        lpt = [];
        level++;
        found = 0;
        addSceneElements(level);
        requestAnimationFrame(animate);
    }


    // movement controls
    function movement() {
        if (controlsEnabled) {
            raycaster.ray.origin.copy(controls.getObject().position);
            raycaster.ray.origin.y -= 10;

            var intersections = raycaster.intersectObjects(objects);
            var isOnObject = intersections.length > 0;

            delta = 0.020;
            velocity.x = 0;
            velocity.z = 0;
            velocity.y -= 9.8 * 300.0 * delta; // 300.0 = mass

            if (hit) {
                if (moveForward) velocity.z -= 0 * delta;
                if (moveBackward) velocity.z += 1150.0 * delta;

                if (moveLeft) velocity.x -= 1150.0 * delta;
                if (moveRight) velocity.x += 1150.0 * delta;

            } else {
                if (moveForward) velocity.z -= 1150 * delta;
                if (moveBackward) velocity.z += 1150.0 * delta;

                if (moveLeft) velocity.x -= 1150.0 * delta;
                if (moveRight) velocity.x += 1150.0 * delta;
            }

            controls.getObject().translateX(velocity.x * delta);
            controls.getObject().translateY(velocity.y * delta);
            controls.getObject().translateZ(velocity.z * delta);

            if (controls.getObject().position.y < 10) {

                velocity.y = 0;
                controls.getObject().position.y = 10;
                canJump = true;
            }
        }
    }


    function collision() {

      // Trees Collision
      for (var i = 0; i < lpt.length; i++) {

          if ((lpt[i].distanceTo(controls.getObject().position)) < 14 || (ct[i].distanceTo(controls.getObject().position)) < 14) {
              hit = true; //cannot move forward
              break;
          } else {
              hit = false;
          }
      }

      // If the player caught by Monster the game is over
      if ( (level >= 2 && (controls.getObject().position.distanceTo(Succubus.position) <= 25) ) || (controls.getObject().position.distanceTo(Harpy.position) <= 18) ||
          (level >= 3 && (controls.getObject().position.distanceTo(Bathos.position) <= 15)) || (level >= 4 && (controls.getObject().position.distanceTo(Zombie.position) <= 20))) {
          location.reload(); //reload the page and restart the game if caught by the monster at any level in the game
      }

      // If the plater find the box then box is disappear
      // If all the boxes found then Game level increses
      for (var i = 0; i < boxes.length; i++) {

          if ((boxes[i].position.distanceTo(controls.getObject().position) < 10)) {
              boxes[i].position.set(boxes[i].position.x, -50, boxes[i].position.z);
              found++;
          }
      }
    }


    // Play the theme music
    function playMusic() {
        var audio = document.createElement('audio');
        var source = document.createElement('source');
        source.src = 'Sounds/horror.mp3';
        audio.appendChild(source);
        audio.play();
    }

    function StartChaseMusic() {

      var audio = document.createElement('audio');
      var source = document.createElement('source');
      source.src = 'Sounds/startChase.mp3';
      audio.appendChild(source);

      if(startChaseSound==2 || startChaseSound%420==0){
        audio.play();
      startChaseSound++;

    }
  }


    //
    function animate() {
        // Repeat

        //See if zombie is chasing you or not
        monsterMovement();

        // assign ID to animate
        id = requestAnimationFrame(animate);

        // function that moves player
        movement();

        // detect collision
        collision();

        // if all boxes are found level up
        if (found == boxes.length) {

            controls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';


            if(level+1 == 2)
            {
              instructions.innerHTML = document.getElementById('level2').innerHTML;
            }

            else if(level+1 == 3)
            {
              instructions.innerHTML = document.getElementById('level3').innerHTML;

            }

            else if(level+1 == 4)
            {
              instructions.innerHTML = document.getElementById('level4').innerHTML;

            }

            else if(level+1 == 5)
            {
              location.reload();
            }
            instructions.style.display = '';
            controls.enabled = true;

            // Update the geometry when you level up or loose in the game
            updateGeometry();
          }

        // render the scene
        renderer.render( scene, camera );

    }
}
