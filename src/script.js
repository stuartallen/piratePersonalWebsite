import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

//  Textures
const nightSkyTexture = textureLoader.load("nightSky.jpg")

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

//	Textures
const bakedTexture = textureLoader.load('baked2.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

/**
 * Object
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)

scene.add(cube)


/**
 * Materials
 */
//	Baked materials
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture})

//  Three materials

//  TODO: Find the correct colors
const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const lavaMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00})
const chestBandMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
const flagMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
const skullMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

/**
 * Labels/Points of interests
 */
 const points = [
    {
        position: new THREE.Vector3(0,0,0),
        element: document.querySelector(".treasurePoint")
    },
    {
        position: new THREE.Vector3(0,0,0),
        element: document.querySelector(".skullPoint")
    },
    {
        position: new THREE.Vector3(0,0,0),
        element: document.querySelector(".wheelPoint")
    },
    {
        position: new THREE.Vector3(0,0,0),
        element: document.querySelector(".flagPoint")
    }
]

const cameraAnimationObject = {
    startTime: -1,
    transitionTime: 2,
    lastPoint: new THREE.Vector3(0,0,0),
    currentPoint: new THREE.Vector3(0,0,0),
    transitioning: false,
    t: 0
}

const setOnClickMethods = () => {
    for(let point of points) {
        point.element.addEventListener("click", (e) => {
            console.log("clicked")
            cameraAnimationObject.lastPoint = ogCameraPosition
            cameraAnimationObject.currentPoint = point.position
            cameraAnimationObject.transitioning = true
            cameraAnimationObject.t = 0
            console.log("finished click function")
        })
    }
}



/**
 * Scene
 */

scene.background = nightSkyTexture

const sea = new THREE.Mesh(
    new THREE.CircleBufferGeometry(50, 50),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
)

sea.rotation.set(-Math.PI / 2, 0, 0)
scene.add(sea)

//  Scene constants
const leafMaterialNames = [
    "Leaves_right",
    "Leaves_left",
    "Leaves_second_left",
    "Leaves_second_right",
    "Leaves_middle"
]
const lightMaterialNames = [
    "Light_left",
    "Light_right"
]
//  Yes I know I was dumb in blender and cannot type
const skullMaterialNames = [
    "Skull_left",
    "Skulll_second_left",
    "Skull_second_right",
    "skull_right"
]

const labelPointNames = [
    "treasureIconEmpty",
    "skullIconEmpty",
    "wheelIconEmpty",
    "flagIconEmpty"
]

const globalOffset = {
    'x': -7.5,
    'y': -7.5,
    'z': -7.5
}

let islandScene = []	//	Not defined outside of calls before this function
gltfLoader.load(
	'newMainScene.glb',
	(gltf) => {
		gltf.scene.traverse((child) => {
			child.position.set(child.position.x + globalOffset.x, 
                child.position.y + globalOffset.y, 
                child.position.z + globalOffset.z)

            if(leafMaterialNames.includes(child.name)) {
                child.material = leafMaterial
            } else if(child.name == "Lava") {
                child.material = lavaMaterial
            } else if(lightMaterialNames.includes(child.name)) {
                child.material = lightMaterial
            } else if(child.name == "Chest_Band") {
                child.material = chestBandMaterial
                console.log("band")
                console.log(child.position)
            } else if(skullMaterialNames.includes(child.name)) {
                child.material = skullMaterial
            } else if(child.name == "Flag") {
                child.material = flagMaterial
            } else {
			    child.material = bakedMaterial
            }
            
            //  HTML Points
            if(labelPointNames.includes(child.name)) {
                points[labelPointNames.indexOf(child.name)].position = child.position
                console.log("point")
                console.log(child.position)
            }
		})
		scene.add(gltf.scene)
		islandScene = scene.children[3].children
        setOnClickMethods()
        // islandScene.forEach((child) => {
        //     console.log(child.name)
        // })
	}
)

scene.fog = new THREE.Fog(0x000000, 40, 50)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //  TODO: Update zoom
})

/**
 * Camera
 */
// Base camera
const ogCameraPosition = new THREE.Vector3(4, 2, 4)

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(ogCameraPosition.x, ogCameraPosition.y, ogCameraPosition.z)

window.innerHeight > window.innerWidth ? 
    camera.position.multiplyScalar(7) : 
    camera.position.multiplyScalar(3)

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = false
controls.enablePan = false

//  Horizontal Scroll
controls.minAzimuthAngle = 0
controls.maxAzimuthAngle = Math.PI / 2

//  Vertical Scroll
controls.minPolarAngle = Math.PI / 4
controls.maxPolarAngle = Math.PI / 2 - 0.1

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //  Update camera if necessary
    if(cameraAnimationObject.transitioning) {
        cameraAnimationObject.startTime = cameraAnimationObject.startTime == -1 ? elapsedTime : cameraAnimationObject.startTime
        cameraAnimationObject.t = (elapsedTime - cameraAnimationObject.startTime) / cameraAnimationObject.transitionTime
        let newPos = new THREE.Vector3();
        if(cameraAnimationObject.t < 1) {
            newPos.addVectors(cameraAnimationObject.currentPoint.clone().multiplyScalar(1 - cameraAnimationObject.t), 
                        ogCameraPosition.clone().multiplyScalar(cameraAnimationObject.t))
        } else {
            cameraAnimationObject.transitioning = false
            cameraAnimationObject.startTime = -1
            newPos = ogCameraPosition
            cameraAnimationObject.lastPoint = ogCameraPosition
        }
        camera.position.set(newPos.x, newPos.y, newPos.z)
    }

    // Update controls
    controls.update()

    //  Update HTML points
    for(const point of points) {
        const screenPosition = point.position.clone()
        //  Idk why this needs to be offset but it works
        //  TODO: Find out why this works
        screenPosition.set(screenPosition.x  + globalOffset.x, 
            screenPosition.y + globalOffset.y, 
            screenPosition.z + globalOffset.z)
        screenPosition.project(camera)

        const translateX = screenPosition.x * sizes.width * 0.5
        const translateY = - screenPosition.y * sizes.height * 0.5
        point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()