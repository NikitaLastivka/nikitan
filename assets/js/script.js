import * as THREE from '/node_modules/three/build/three.module.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from '/node_modules/three/examples/jsm/loaders/RGBELoader.js';

let camera, scene, renderer, mixer, model, object;
const clock = new THREE.Clock();
init();

function init() {
    const container = document.querySelector('.slot_machine');

    camera = new THREE.PerspectiveCamera( 45, container.offsetWidth / container.offsetHeight, 0.25, 300 );
    //camera.position.set( - 1.8, 0.6, 2.7 );
    camera.position.set(0, 27, 125 );
    scene = new THREE.Scene();

    new RGBELoader()
        .setPath( 'assets/js/textures/equirectangular/' )
        .load( 'lauter_waterfall_1k.hdr', function ( texture ) {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.background = new THREE.Color(0xfb3c8c);
            scene.environment = texture;

            render();

            const loader = new GLTFLoader().setPath( 'assets/js/models/gltf/' );
            loader.load( 'ballTake_sprite_reserve3.gltf', async function ( gltf ) {

                model = gltf.scene;
                object = gltf;
                await renderer.compileAsync( model, camera, scene );

                scene.add( model );

                render();

                if (gltf.animations && gltf.animations.length) {
                    mixer = new THREE.AnimationMixer(model);
                    const action = mixer.clipAction(gltf.animations[1]);
                    action.play();
                }

                let loader = document.querySelector('.loader'),
                    containerBlock = document.querySelector('.container');

                containerBlock.style.display = 'flex';
                onWindowResize();
                loader.classList.remove('active');

            } );

        }
     );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setAnimationLoop(animate);
    renderer.setSize( container.offsetWidth, container.offsetHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild( renderer.domElement );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set(0, 20, 0);
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.update();

    let do_action2 = document.querySelector('.do_action');
    
    do_action2.onclick = function(){
        do_action2.onclick = false;
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(object.animations[0]);
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        action.play();
        setTimeout(()=>{
            let controlX = 0;
            let controlY = 20;
            let controlInterval = setInterval(()=>{
                    if(controlX < 5 || controlY > 10){
                        controlX += 0.2;
                        controlY -= 0.5;
                        controls.target.set(controlX, controlY, 0);
                        controls.update();
                    }           
                    else{
                        clearInterval(controlInterval)
                    }
            }, 10);
        }, 7000);
        setTimeout(()=>{
            let camX = 0;
            let camY = 27;
            let camZ = 125;
            let prize_container = document.querySelector('.prize_container');
            let CamInterval = setInterval(()=>{
                if(camX > 17 || camY > 20 || camZ > 65){
                    camX > 17 ? camX -= 0.33 : 16.9;
                    camY > 20 ? camY -= 0.07 : 19.9;
                    camZ > 65 ? camZ -= 0.6 : 64.9; //44
                    camera.position.set(camX, camY, camZ);
                }   
                else{
                    clearInterval(CamInterval);
                    prize_container.classList.add('active');
                    setTimeout(()=>{
                        onWindowResize();
                    }, 1001)
                }
            }, 20);      
        }, 7900)
    }

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function render() {

    renderer.render( scene, camera );

}

function animate() {

    const delta = clock.getDelta();

    if ( mixer ) mixer.update( delta );

    renderer.render( scene, camera );

}