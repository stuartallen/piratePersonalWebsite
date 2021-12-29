import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
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
        element: document.querySelector(".treasurePoint"),
        focus: new THREE.Vector3(0,0,0),
        cameraPostition: new THREE.Vector3(0,0,0),
        //  Yes I actually do want to use innerHTML here, the user cant enter anything
        setContent: () => {
            document.getElementById('content').innerHTML = '<h1>Treasure content</h1><p>Blah blah</p>'
        }
    },
    {
        position: new THREE.Vector3(0,0,0),
        element: document.querySelector(".skullPoint"),
        focus: new THREE.Vector3(0,0,0),
        cameraPostition: new THREE.Vector3(0,0,0),
        setContent: () => {
            document.getElementById('content').innerHTML = '<h1>Ahoy content</h1><p>Blah blah</p>'
        }
    },
    {
        position: new THREE.Vector3(0,0,0),
        element: document.querySelector(".wheelPoint"),
        focus: new THREE.Vector3(0,0,0),
        cameraPostition: new THREE.Vector3(0,0,0),
        setContent: () => {
            document.getElementById('content').innerHTML = '<h1>Heading content</h1><p>Blah blah</p>'
        }
    },
    {
        position: new THREE.Vector3(0,0,0),
        element: document.querySelector(".flagPoint"),
        focus: new THREE.Vector3(0,0,0),
        cameraPostition: new THREE.Vector3(0,0,0),
        setContent: () => {
            document.getElementById('content').innerHTML = '<h1>Voyages content</h1><p>Blah blah</p>'
        }
    }
]

const initialFocus = new THREE.Vector3(-5, 3 , 0)

const cameraAnimationObject = {
    startTime: -1,
    transitionTime: 2,
    lastPoint: new THREE.Vector3(0,0,0),
    currentPoint: new THREE.Vector3(0,0,0),
    transitioning: false,
    t: 0,
    focus: initialFocus,
    lastFocus: initialFocus,
    zoomed: false
}

document.getElementById("backButton").addEventListener("click", (e) => {
    cameraAnimationObject.lastPoint = cameraAnimationObject.currentPoint
    cameraAnimationObject.zoomed = false
    cameraAnimationObject.transitioning = true
    cameraAnimationObject.t = 0
    cameraAnimationObject.lastFocus = cameraAnimationObject.focus
    cameraAnimationObject.focus = initialFocus
    cameraAnimationObject.currentPoint = ogCameraPosition
    for(let point of points) {
        point.element.classList.add('visible')
    }
    document.getElementById("backButton").classList.remove("visible")
    document.getElementById("content").classList.remove("visible")
})

const setOnClickMethods = () => {
    for(let point of points) {
        point.element.addEventListener("click", (e) => {
            cameraAnimationObject.lastPoint = ogCameraPosition
            cameraAnimationObject.currentPoint = point.cameraPostition
            cameraAnimationObject.transitioning = true
            cameraAnimationObject.t = 0
            cameraAnimationObject.lastFocus = cameraAnimationObject.focus
            cameraAnimationObject.focus = point.focus
            cameraAnimationObject.zoomed = true
            point.setContent()
            for(let point of points) {
                point.element.classList.remove("visible")
            }
            document.getElementById("backButton").classList.add("visible")
            document.getElementById("content").classList.add("visible")
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

const focusPointNames = [
    "Chest_Band",
    "Skull_second_right",
    "wheel",
    "flag"
]

const cameraPointNames = [
    "treasureCameraEmpty",
    "skullCameraEmpty",
    "wheelCameraEmpty",
    "flagCameraEmpty"
]

const globalOffset = {
    'x': -15,
    'y': -15,
    'z': -15
}

let islandScene = []	//	Not defined outside of calls before this function
gltfLoader.load(
	'newMainScene.glb',
	(gltf) => {
        //  Changing this does not change each child's position
        gltf.scene.position.set(gltf.scene.position.x + globalOffset.x,
                                gltf.scene.position.y + globalOffset.y,
                                gltf.scene.position.z + globalOffset.z)
        console.log(gltf.scene.position)
		gltf.scene.traverse((child) => {
            if(leafMaterialNames.includes(child.name)) {
                child.material = leafMaterial
            } else if(child.name == "Lava") {
                child.material = lavaMaterial
            } else if(lightMaterialNames.includes(child.name)) {
                child.material = lightMaterial
            } else if(child.name == "Chest_Band") {
                child.material = chestBandMaterial
                points[0].focus = child.position.clone().add(globalOffset)
            } else if(skullMaterialNames.includes(child.name)) {
                child.material = skullMaterial
            } else if(child.name == "Flag") {
                child.material = flagMaterial
                points[3].focus = child.position.clone().add(globalOffset)
            } else {
			    child.material = bakedMaterial
            }

            if(child.name == 'Skull_second_right') {
                points[1].focus = child.position.clone().add(globalOffset)
            } else if(child.name == 'wheel') {
                points[2].focus = child.position.clone().add(globalOffset)
            }

            //  HTML Points
            if(labelPointNames.includes(child.name)) {
                points[labelPointNames.indexOf(child.name)].position = child.position.clone().add(globalOffset)
            }
            if(cameraPointNames.includes(child.name)) {
                points[cameraPointNames.indexOf(child.name)].cameraPostition = child.position.clone().add(globalOffset)
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
const ogCameraPosition = new THREE.Vector3(0, 6, 15)

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(ogCameraPosition.x, ogCameraPosition.y, ogCameraPosition.z)
console.log(cameraAnimationObject.focus)
camera.lookAt(cameraAnimationObject.focus)

scene.add(camera)

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
var elapsedTime = 0

const tick = () =>
{
    elapsedTime = clock.getElapsedTime()

    //  Update camera if necessary
    if(cameraAnimationObject.transitioning) {
        cameraAnimationObject.startTime = cameraAnimationObject.startTime == -1 ? elapsedTime : cameraAnimationObject.startTime
        cameraAnimationObject.t = (elapsedTime - cameraAnimationObject.startTime) / cameraAnimationObject.transitionTime
        let newPos = new THREE.Vector3();
        let lookAtPos = new THREE.Vector3();
        if(cameraAnimationObject.t < 1) {
            newPos.addVectors(cameraAnimationObject.currentPoint.clone().multiplyScalar(cameraAnimationObject.t), 
                        cameraAnimationObject.lastPoint.clone().multiplyScalar(1 - cameraAnimationObject.t))
            lookAtPos.addVectors(cameraAnimationObject.focus.clone().multiplyScalar(cameraAnimationObject.t), 
                        cameraAnimationObject.lastFocus.clone().multiplyScalar(1 - cameraAnimationObject.t))
        } else {
            cameraAnimationObject.transitioning = false
            cameraAnimationObject.startTime = -1
            newPos = cameraAnimationObject.currentPoint
            cameraAnimationObject.lastPoint = ogCameraPosition
            lookAtPos = cameraAnimationObject.focus
        }
        camera.position.set(newPos.x, newPos.y, newPos.z)
        camera.lookAt(lookAtPos)
    }

    //  Update HTML points
    for(const point of points) {
        const screenPosition = point.position.clone()
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