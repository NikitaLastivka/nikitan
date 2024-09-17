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
    let totalProgress = 0;
    new RGBELoader()
        .setPath( 'https://smart-bike.nl/nikitan/assets/js/' )
        .load( 'zwartkops_start_sunset_1k.hdr', function ( texture ) {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.background = new THREE.Color(0xfb3c8c);
            scene.environment = texture;

            render();

            const loader = new GLTFLoader().setPath( 'https://smart-bike.nl/nikitan/assets/js/' );
            loader.load( 'Finall.gltf', async function ( gltf ) { //3 default

                model = gltf.scene;
                object = gltf;
                await renderer.compileAsync( model, camera, scene );

                scene.add( model );

                render();

                if (gltf.animations && gltf.animations.length) {
                    mixer = new THREE.AnimationMixer(model);
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                }

                let loader_container = document.querySelector('.loader_container'),
                    containerBlock = document.querySelector('.container');

                containerBlock.style.display = 'flex';
                onWindowResize();
                loader_container.classList.remove('active');

            }, 
            (xhr) => {
                let load_status = document.querySelector('.loader_percents');
                const gltfProgress = (xhr.loaded / xhr.total) * 50;
                totalProgress = 50 + gltfProgress;
                load_status.textContent = totalProgress.toFixed(2) + '%';
            },
            (error) => {
                console.error('Ошибка при загрузке GLTF файла:', error);
            });

        }, 
        (xhr) => {
            // Прогресс HDR загрузки
            let load_status = document.querySelector('.loader_percents');
            const hdrProgress = (xhr.loaded / xhr.total) * 50;
            totalProgress = hdrProgress;
            load_status.textContent = totalProgress.toFixed(2) + '%';
        },
        (error) => {
            console.error('Ошибка при загрузке HDR файла:', error);
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
    /*controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;*/
    controls.update();

    let do_action2 = document.querySelector('.do_action');
    
    do_action2.onclick = automatAnimate;

    function automatAnimate(){
        console.log(camera)
        do_action2.onclick = false;
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(object.animations[1]);
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
            let CamInterval = setInterval(()=>{
                if(camX > 17 || camY > 20 || camZ > 65){
                    camX > 17 ? camX -= 0.33 : 16.9;
                    camY > 20 ? camY -= 0.07 : 19.9;
                    camZ > 65 ? camZ -= 0.6 : 64.9; //44
                    camera.position.set(camX, camY, camZ);
                }   
                else{
                    console.log(camera.position)
                    clearInterval(CamInterval);
                    showPrize();
                    setTimeout(()=>{
                        onWindowResize();
                    }, 1001)
                }
            }, 20);      
        }, 7900)
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            const firstObject = intersects[0].object;
            if(firstObject?.parent?.name == 'Button'){
                automatAnimate();
            }
        }
    }

    window.addEventListener('click', onMouseClick);
    window.addEventListener( 'resize', onWindowResize );

}

function showPrize(){
    let prize_container = document.querySelector('.prize_container'),
        prize_element = prize_container.querySelector('.prize_element'),
        prize_code = prize_container.querySelector('.prize_code');
    prize_container.classList.add('active');
    setTimeout(()=>{
        prize_element.classList.add('active');
    }, 1000);
    setTimeout(()=>{
        prize_code.classList.add('active');
    }, 2000);
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