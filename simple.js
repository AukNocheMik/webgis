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
    esriRequest,
    jsonFile
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
    view.environment.lighting.cameraTrackingEnabled = true;

    // Create our custom external renderer
    //////////////////////////////////////////////////////////////////////////////////////

    var simpleExternalRenderer = {
        renderer: null, // three.js renderer
        camera: null, // three.js camera
        scene: null, // three.js scene

        ambient: null, // three.js ambient light source
        sun: null, // three.js sun light source

        mouse:null, // raycast mouse position
        selectedObject : null, // raycast selected object
        raycaster:null,     // raycast
        mouseVector:null,
        defaultColor:null,
        isMouseDown:null,

        cameraPositionInitialized: false, // we focus the view on the particles once we receive our first data point

        load: function () {
             var group = new THREE.Object3D();

            var posEst = [114.054479000, 22.5456149800, 9000];
            var position = [];
            var positionData = [];
            externalRenderers.toRenderCoordinates(view, posEst, 0, SpatialReference.WGS84, position, 0, 1);

            var californiaPts = [];
            var _this = this;


            // load json file   "SZ.json"
            $.getJSON("SZ.json", function(data) {


                for(var i =0; i<data.features.length;i++){
                    positionData[i] = wgs84Toxyz(data.features[i].geometry.x,data.features[i].geometry.y,1000);
                    californiaPts.push( new THREE.Vector2( positionData[i][0], positionData[i][1] ) );
                }
                for ( var i = 0; i < californiaPts.length; i ++ ) californiaPts[ i ].multiplyScalar( 0.25 );

                var californiaShape = new THREE.Shape( californiaPts );

                function wgs84Toxyz(lon, lat, height) {
                    var dest = [];
                    var p = [lon, lat, height];
                    //toRenderCoordinates是专门用来将坐标转为three.js的坐标的
                    externalRenderers.toRenderCoordinates(view, p, 0, SpatialReference.WGS84, dest, 0, 1);
                    return dest;
                }

                var extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

                var geometry = new THREE.ExtrudeBufferGeometry( californiaShape, extrudeSettings );

                geometry.computeBoundingBox();
                geometry.center()

                var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: '#ffffff',side:THREE.DoubleSide } ) );
                mesh.name = 'land5';
                mesh.position.set( 0, 0, 300 );


                var mesh1 = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: '#FFCC33',side:THREE.DoubleSide } ) );
                mesh1.name = 'land4';
                mesh1.position.set( 0, 0, 400 );




                var mesh2 = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: '#CC3300' ,side:THREE.DoubleSide} ) );
                mesh2.name = 'land3';
                mesh2.position.set( 0, 0, 500 );



                var mesh3 = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: '#990000',side:THREE.DoubleSide } ) );
                mesh3.name = 'land2';
                mesh3.position.set( 0, 0, 600 );



                var mesh4 = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: '#006633' ,side:THREE.DoubleSide} ) );
                mesh4.position.set( 0, 0, 700 );
                mesh4.name = 'land1';
                group.add(mesh,mesh1,mesh2,mesh3,mesh4);
                group.position.set(position[0],position[1],position[2]);
                group.rotation.set( - Math.PI / 3, -Math.PI / 9,0);
                group.scale.set(2,2,2);

                _this.scene.add(group);
            });

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
            this.mouse = new THREE.Vector2();
            this.isMouseDown = false;

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

            this.raycaster = new THREE.Raycaster();
            this.mouseVector = new THREE.Vector3();
            window.addEventListener( "mousemove", this.onDocumentMouseMove, false );
            window.addEventListener("mousedown",this.onDocumentMouseDown,false);
            window.addEventListener("mouseup",this.onDocumentMouseUp,false);
            this.load();
            // cleanup after ourselfs
            context.resetWebGLState();
        },
        onDocumentMouseMove:function(event) {
            var _this = simpleExternalRenderer;
            event.preventDefault();
            if ( _this.selectedObject ) {
                switch (_this.selectedObject.name) {
                    case 'land5':
                        _this.selectedObject.material.color.set( '#ffffff');
                        break;
                    case 'land4':
                        _this.selectedObject.material.color.set( '#FFCC33');
                        break;
                    case 'land3':
                        _this.selectedObject.material.color.set( '#CC3300');
                        break;
                    case 'land2':
                        _this.selectedObject.material.color.set( '#990000');
                        break;
                    case 'land1':
                        _this.selectedObject.material.color.set( '#006633');
                        break;
                    default:
                }
                _this.selectedObject = null;
            }
            _this.mouseVector.set( ( event.layerX / window.innerWidth ) * 2 - 1, - ( event.layerY / window.innerHeight ) * 2 + 1, 0.5 );
            _this.raycaster.setFromCamera( _this.mouseVector, _this.camera );
            var intersects = _this.raycaster.intersectObject( _this.scene, true );
            if ( intersects.length > 0 ) {
                var res = intersects.filter( function ( res ) {
                    return res && res.object;
                } )[ 0 ];
                if ( res && res.object ) {
                    _this.selectedObject = res.object;
                    var land = document.getElementById('landDes');
                    land.style.display = 'block';
                     _this.selectedObject.material.color.set( '#f00' );
                }
            }
        },
        onDocumentMouseDown:function (event) {          // 具有控制
            var _this = simpleExternalRenderer;
            _this.isMouseDown = true;
        },
        onDocumentMouseUp:function (event) {
            var _this = simpleExternalRenderer;
            _this.isMouseDown = false;
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
            // view.environment.lighting.date = Date.now();

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
