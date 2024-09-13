import * as THREE from '/node_modules/three/build/three.module.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer, object, loader, mixer, model;
const clock = new THREE.Clock();

const params = { asset: 'ballTake_sprite_reserve3' }; // Загружаемая модель по умолчанию
const assets = ["Armature.001|Armature.001Action"]; // Массив анимаций

window.onerror = function (message, source, lineno, colno, error) {
    const errorMsg = `Error: ${message} at ${source}:${lineno}:${colno}`;
    document.body.innerHTML += `<p style="color: red;">${errorMsg}</p>`;
};

init();

function init() {
    const container = document.querySelector('.slot_machine');

    // Камера
    camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 1, 2000);
    camera.position.set(50, 50, 180);

    // Сцена
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfb3c8c);

    // Свет
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(0, 74, 1000);
    scene.add(dirLight);

    // Загрузка модели
    loader = new GLTFLoader(); 
    loadAsset(params.asset);

    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setAnimationLoop(animate);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Управление
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 30, 0);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.update();

    window.addEventListener('resize', onWindowResize);

    document.querySelector('.do_action').addEventListener('click', () => {        
        mixer = new THREE.AnimationMixer(object);
        const action = mixer.clipAction(model.animations[0]);
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        action.play();
        console.log(action)
        setTimeout(()=>{
            let controlX = 0;
            let controlY = 50;
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
            let camX = 50;
            let camY = 50;
            let camZ = 180;
            let prize_container = document.querySelector('.prize_container');
            let CamInterval = setInterval(()=>{
                if(camX > 17 || camY > 20 || camZ > 65){
                    camX > 17 ? camX -= 0.33 : 16.9;
                    camY > 20 ? camY -= 0.3 : 19.9;
                    camZ > 65 ? camZ -= 1.15 : 64.9; //44
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
    });
    
}

function loadAsset(asset) {
    loader.load(`https://smart-bike.nl/nikitan/assets/js/${asset}.glb`, (gltf) => {
        if (object) scene.remove(object); // Удаляем предыдущий объект, если он существует

        object = gltf.scene; // Получаем сцену из загруженной модели
        model = gltf;
        object.traverse((child) => {
            console.log(child)
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(object); // Добавляем объект в сцену

        // Проверяем наличие анимаций и воспроизводим первую из них
        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(object); // Создаем анимационный микшер
            const action = mixer.clipAction(gltf.animations[1]); // Получаем первую анимацию
            action.play(); // Запускаем анимацию
        }

        let loader = document.querySelector('.loader'),
            containerBlock = document.querySelector('.container');

        containerBlock.style.display = 'flex';
        onWindowResize();
        loader.classList.remove('active');
    }, 
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% загружено'); // Отображаем прогресс загрузки
        let load_status = document.querySelector('.load_status');
        load_status.textContent = (xhr.loaded / xhr.total * 100) + '% загружено';
    },
    (error) => {
        console.error('Ошибка при загрузке GLTF файла:', error);
    });
}

function onWindowResize() {
    const container = document.querySelector('.slot_machine');
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function animate() {

    const delta = clock.getDelta();

    if ( mixer ) mixer.update( delta );

    renderer.render( scene, camera );

}