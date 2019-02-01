require([
        "esri/Map",
        "esri/views/SceneView",
        "esri/views/3d/externalRenderers",
        "esri/geometry/SpatialReference",
        "esri/request",
        "dojo/domReady!"
    ],
    function (
        Map,
        SceneView,
        externalRenderers,
        SpatialReference,
        esriRequest
    ) {

        // Create a map
        //////////////////////////////////////////////////////////////////////////////////////
        var map = new Map({
            basemap: "hybrid",
            ground: "world-elevation"
        });

        // Create a SceneView
        //////////////////////////////////////////////////////////////////////////////////////
        var view = new SceneView({
            container: "viewDiv",
            map: map,
            viewingMode: "global",
            camera: {
                position: {
                    x:114.054479000, 
                    y:22.5456149800,
                    z: 10000,
                    spatialReference: {
                        wkid: 4326
                    }
                },
                heading: 0,
                tilt: 60
            },
        });

        // Disable lighting based on the current camera position.
        // We want to display the lighting according to the current time of day.
        view.environment.lighting.cameraTrackingEnabled = false;

        // Create our custom external renderer
        //////////////////////////////////////////////////////////////////////////////////////

        var simpleExternalRenderer = {
            renderer: null, // three.js renderer
            camera: null, // three.js camera
            scene: null, // three.js scene
            group: null,

            ambient: null, // three.js ambient light source
            sun: null, // three.js sun light source



            cameraPositionInitialized: false, // we focus the view on the particles once we receive our first data point

            load: function () {
                var group = new THREE.Group();
                var posEst = [114.054479000, 22.5456149800, 3500];
                var positon = [];
                externalRenderers.toRenderCoordinates(view, posEst, 0, SpatialReference.WGS84, positon, 0, 1);
                var geometry = new THREE.SphereGeometry(2000, 32, 32);
                var material = new THREE.MeshBasicMaterial({
                    color: 0xffff00
                });
                var sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(positon[0], positon[1], positon[2]);
                // this.scene.add(sphere);

                // load terrain
                var splinepts = [];
                splinepts.push( new THREE.Vector2( 13, -3 ) );
				splinepts.push( new THREE.Vector2( 20, 23.8 ) );

				splinepts.push( new THREE.Vector2( 0, 35 ) );
				splinepts.push( new THREE.Vector2( -20, 23.8 ) );
                splinepts.push( new THREE.Vector2( -13, -3 ) );

                 splinepts.push( new THREE.Vector2( -25, -25 ) );


                splinepts.push( new THREE.Vector2( -18, -70 ) );
                splinepts.push( new THREE.Vector2( 0, -86 ) );

                splinepts.push( new THREE.Vector2( 18, -70 ) );
                splinepts.push( new THREE.Vector2( 25, -25 ) );
                splinepts.push( new THREE.Vector2( 13, -3 ) );

				var splineShape = new THREE.Shape();
				splineShape.splineThru( splinepts );

				var extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

                // addShape( splineShape, extrudeSettings, 0x808080, positon[0], positon[1], positon[2], 0, 0, 0, 1 );

                   
					var geometry = new THREE.ExtrudeBufferGeometry( splineShape, extrudeSettings );

					var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: '#ffffff' } ) );
                    // mesh.position.set( positon[0], positon[1], positon[2] );
                    mesh.scale.set(20,20,2.5);
                    // mesh.rotation.set(Math.PI / 3,0,0);
                    mesh.position.set( positon[0], positon[1], positon[2] );
                    // mesh1.rotation.set(Math.PI / 3,0,0);

                    var extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

                    var geometry1 = new THREE.ExtrudeBufferGeometry( splineShape, extrudeSettings );

                    var mesh1 = new THREE.Mesh( geometry1, new THREE.MeshPhongMaterial( { color: '#FFCC33' } ) );
                   
                    mesh1.scale.set(20,20,2);
                    // mesh1.rotation.set(Math.PI / 3,0,0);
                    mesh1.position.set( positon[0], positon[1], positon[2]+250 );
                    // mesh2.rotation.set(Math.PI / 3,0,0);

                    var extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

                    var geometry2 = new THREE.ExtrudeBufferGeometry( splineShape, extrudeSettings );

                    var mesh2 = new THREE.Mesh( geometry2, new THREE.MeshPhongMaterial( { color: '#CC3300' } ) );
                  
                    mesh2.scale.set(20,20,1.5);
                    // mesh2.rotation.set(Math.PI / 3,0,0);
                    mesh2.position.set( positon[0], positon[1], positon[2]+450 );

                    var extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

                    var geometry3 = new THREE.ExtrudeBufferGeometry( splineShape, extrudeSettings );

                    var mesh3 = new THREE.Mesh( geometry3, new THREE.MeshPhongMaterial( { color: '#990000' } ) );
                    
                    mesh3.scale.set(20,20,1);
                    // mesh3.rotation.set(Math.PI / 3,0,0);
                    mesh3.position.set( positon[0], positon[1], positon[2]+600 );
                    var extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

                    var geometry4 = new THREE.ExtrudeBufferGeometry( splineShape, extrudeSettings );

                    var mesh4 = new THREE.Mesh( geometry4, new THREE.MeshPhongMaterial( { color: '#006633' } ) );
                    mesh4.scale.set(20,20,0.5);
                    // mesh4.rotation.set(Math.PI / 3,0,0);
                    mesh4.position.set( positon[0], positon[1], positon[2]+650 );
                  
                    group.add(mesh,mesh1,mesh2,mesh3,mesh4);

                    // this.scene.add( mesh );
                    // this.scene.add( mesh1 );
                    // this.scene.add( mesh2 );
                    // this.scene.add( mesh3 );
                    // this.scene.add( mesh4 );

                    this.scene.add(group);
                    console.log(this.scene);
                    
            },

            /**
             * Setup function, called once by the ArcGIS JS API.
             */
            setup: function (context) {

                // initialize the three.js renderer
                //////////////////////////////////////////////////////////////////////////////////////
                this.renderer = new THREE.WebGLRenderer({
                    context: context.gl,
                    premultipliedAlpha: false
                });
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.setViewport(0, 0, view.width, view.height);

                // prevent three.js from clearing the buffers provided by the ArcGIS JS API.
                this.renderer.autoClearDepth = false;
                this.renderer.autoClearStencil = false;
                this.renderer.autoClearColor = false;

                // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
                // We have to inject this bit of code into the three.js runtime in order for it to bind those
                // buffers instead of the default ones.
                var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
                this.renderer.setRenderTarget = function (target) {
                    originalSetRenderTarget(target);
                    if (target == null) {
                        context.bindRenderTarget();
                    }
                }

                // setup the three.js scene
                ///////////////////////////////////////////////////////////////////////////////////////
                this.scene = new THREE.Scene();

                // setup the camera
                this.camera = new THREE.PerspectiveCamera();

                // setup scene lighting
                this.ambient = new THREE.AmbientLight(0x000000, 1.0);
                this.scene.add(this.ambient);
                this.sun = new THREE.DirectionalLight(0x000000, 1.0);
                this.scene.add(this.sun);

                this.load();
                // cleanup after ourselfs
                context.resetWebGLState();
            },

            render: function (context) {

                // update camera parameters
                ///////////////////////////////////////////////////////////////////////////////////
                var cam = context.camera;

                this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
                this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
                this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));

                // Projection matrix can be copied directly
                this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

                // update lighting
                /////////////////////////////////////////////////////////////////////////////////////////////////////
                view.environment.lighting.date = Date.now();

                var l = context.sunLight;
                this.sun.position.set(
                    l.direction[0],
                    l.direction[1],
                    l.direction[2]
                );
                this.sun.intensity = l.diffuse.intensity;
                this.sun.color = new THREE.Color(l.diffuse.color[0], l.diffuse.color[1], l.diffuse.color[2]);

                this.ambient.intensity = l.ambient.intensity;
                this.ambient.color = new THREE.Color(l.ambient.color[0], l.ambient.color[1], l.ambient.color[2]);

                // draw the scene
                /////////////////////////////////////////////////////////////////////////////////////////////////////
                this.renderer.state.reset();
                this.renderer.render(this.scene, this.camera);

                // as we want to smoothly animate the particles movement, immediately request a re-render
                externalRenderers.requestRender(view);

                // cleanup
                context.resetWebGLState();
            }

        }

        // register the external renderer
        externalRenderers.add(view, simpleExternalRenderer);
    });