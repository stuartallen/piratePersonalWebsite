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

let islandScene = []	//	Not defined outside of calls before this function
gltfLoader.load(
	'newMainScene.glb',
	(gltf) => {
		gltf.scene.traverse((child) => {
            if(leafMaterialNames.includes(child.name)) {
                child.material = leafMaterial
            } else if(child.name == "Lava") {
                child.material = lavaMaterial
            } else if(lightMaterialNames.includes(child.name)) {
                child.material = lightMaterial
            } else if(child.name == "Chest_Band") {
                child.material = chestBandMaterial
            } else if(skullMaterialNames.includes(child.name)) {
                child.material = skullMaterial
            } else if(child.name == "Flag") {
                child.material = flagMaterial
            } else {
			    child.material = bakedMaterial
            }
			child.position.set(child.position.x - 7.5, child.position.y - 7.5, child.position.z - 7.5)
		})
		scene.add(gltf.scene)
		islandScene = scene.children[3].children
        islandScene.forEach((child) => {
            console.log(child.name)
        })
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
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4

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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()