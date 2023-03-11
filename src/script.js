import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap } from 'gsap'

//  Shaders
import oceanVertexShader from './shaders/oceanShaders/vertexShader.glsl'
import oceanFragmentShader from './shaders/oceanShaders/fragmentShader.glsl'

import lavaVertexShader from './shaders/lavaShaders/vertexShader.glsl'
import lavaFragmentShader from './shaders/lavaShaders/fragmentShader.glsl'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
//  This must be defined up here so loading manager has access to it
var points = []

/**
 * Loaders
 */
//  Loading manager
const loadingBar = document.querySelector('.loading-bar')

const loadingManager = new THREE.LoadingManager(
    //  Loaded
    () => {
        for(let point of points){
            point.element.classList.add('visible')
        }
        loadingBar.classList.add('finished')
        gsap.to(overlayMaterial.uniforms.uAlpha, {duration: 3, value: 0})
    },
    //  Progress
    (itemsUrl, itemsLoaded, itemsTotal) => {
        loadingBar.style.transform = `scaleX(${itemsLoaded/itemsTotal})`
    }
)

// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager)

//  Textures
const nightSkyTexture = textureLoader.load("nightSky.jpg")

// Draco loader
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

//	Textures
const bakedTexture = textureLoader.load('baked2.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

//  Stars

function addStar() {
    const geometry = new THREE.SphereBufferGeometry(0.1)
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const star = new THREE.Mesh(geometry, material)

    //const [x, y, z] = Array(3).fill().map(() => - THREE.MathUtils.randFloat(0, 20))
    const x = THREE.MathUtils.randFloatSpread(100)
    const y = THREE.MathUtils.randFloat(5, 20)
    const z = -30

    star.position.set(x, y, z)
    scene.add(star)
}

for(let i = 0; i < 200; i++) {
    addStar()
}

/**
 * Materials
 */

//  Some materials use the fog
scene.fog = new THREE.Fog(0x000000, 30, 50)

//	Baked materials
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture})

//  Three materials

//  TODO: Find the correct colors
const lavaMaterial = new THREE.RawShaderMaterial({
    fog: true,
    uniforms: {
        fogColor:    { type: "c", value: scene.fog.color },
        fogNear:     { type: "f", value: scene.fog.near },
        fogFar:      { type: "f", value: scene.fog.far },
        time:        { type: "f", value: 0 }
    },
    vertexShader: lavaVertexShader,
    fragmentShader: lavaFragmentShader
})
const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00})
const chestBandMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
const flagMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
const skullMaterial = new THREE.MeshBasicMaterial({ color: 0xFBFA9A })
const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x45FB24 })

/**
 * Labels/Points of interests
 */
 points = [
    {
        position: new THREE.Vector3(0,0,0),
        element: document.querySelector(".treasurePoint"),
        focus: new THREE.Vector3(0,0,0),
        cameraPostition: new THREE.Vector3(0,0,0),
        //  Yes I actually do want to use innerHTML here, the user cant enter anything
        setContent: () => {
            document.getElementById('content').innerHTML = "<h1>Treasure</h1><p>" +
            "Some of Stuart's projects include:</p>" +
            "<ul><li>This website made with threejs</li>" + 
            "<li>Completion of Bruno Simon's course Threejs Journey</li>" + 
            "<li><a href='https://stootools.com/' target='_blank'>A drum machine website made in vanilla javascript</a></li>" + 
            "<li><a href='https://github.com/stuartallen/qbert_remake' target='_blank'>A recreation of Qbert in C++ using SDL2</a></li>" + 
            "<li><a href='https://github.com/stuartallen/MASM-Portfolio-Project' target='_blank'>Procedures and Macros to convert a string to an integer and back in MASM</a></li>" +
            "</ul>" +
            "<p>Stuart has picked up many skills on his journeys! " + 
            "His languages known include Javascript, HTML, CSS, SASS, Python, C/C++, and mySQL. Some of his other known technologies are Nodejs, Reactjs, " +
            "MongoDB, Mongoosejs, and Threejs. His relevant coursework includes Oregon State's Introduction to Artificial Intelligence and " + 
            " Machine Learning and Data Mining courses that delve into game theory as well as supervised and unsupervised probabilistic models. " + 
            "This is in addition to Web Development, Data Structures and Algorithms, Linear Algebra, Vector Calculus, and Statistics classes. </p>" + 
            "<p style='overflow:hidden;'>Stuart does not neglect his soft skills and has volunteered at and lead workshops for ChickTech, as well as performed the role of " + 
            "Oregon State Taekwondo Club Event Coordinator.</p>"
        }
    },
    {
        position: new THREE.Vector3(0,0,0),
        element: document.querySelector(".skullPoint"),
        focus: new THREE.Vector3(0,0,0),
        cameraPostition: new THREE.Vector3(0,0,0),
        setContent: () => {
            document.getElementById('content').innerHTML = "<h1>Ahoy</h1><p>Feel free to reach out, follow, or view Stuart on the following platforms!</p>" + 
            "<ul><li><a href='https://www.linkedin.com/in/stuartallen020/' target='_blank'>LinkedIn</a></li>"+
            "<li><a href='https://github.com/stuartallen?tab=repositories' target='_blank'>GitHub</li>" +
            "<li><a href='https://honors.oregonstate.edu/user/28121/contact' target='_blank'>Email</li>" + 
            "<li><a href='https://docs.google.com/document/d/1OS4kPltfQfwnjBIWfxr8Ouh-z1Mi6Qq1EVojoAHzePY/edit?usp=sharing' target='_blank'>Resume</li></ul>"
        }
    },
    {
        position: new THREE.Vector3(0,0,0),
        element: document.querySelector(".wheelPoint"),
        focus: new THREE.Vector3(0,0,0),
        cameraPostition: new THREE.Vector3(0,0,0),
        setContent: () => {
            document.getElementById('content').innerHTML = "<h1>Heading</h1><p>Stuart is actively looking for a software engineering or machine learning " + 
            " position after graduating June 2023</p>"
        }
    },
    {
        position: new THREE.Vector3(0,0,0),
        element: document.querySelector(".flagPoint"),
        focus: new THREE.Vector3(0,0,0),
        cameraPostition: new THREE.Vector3(0,0,0),
        setContent: () => {
            document.getElementById('content').innerHTML = "<h1>Voyages</h1><p>Stuart has worked in the following roles</p>" + 
            "<ul><li>Software Engineering Intern at Cvent (June 2022 - August 2022)</li>" + 
            "<li>OSU Honors College Web Editor (September 2021 - Present)</li> " +
            "<li>OSU Web Development Teaching Assistant (June 2021 - August 2021)</li>" + 
            "<li>URSA Research Assistant Intern (February 2021 - June 2021)</li>" + 
            "<li>Math Tutor at ScreenTime Tutoring (September 2020 - February 2021)</li>" + 
            "<li>OSU Computer Science Tutor (March 2020 - December 2020)</li></ul>"
        }
    }
]

const initialFocus = new THREE.Vector3(-5, 3 , 0)

const cameraAnimationObject = {
    startTime: -1,
    transitionTime: 1,
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
    cameraAnimationObject.zoomed = false
    document.getElementById("backButton").classList.remove("visible")
    document.getElementById("content").classList.remove("visible")
    document.getElementById("title").classList.remove("hide")
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
        })
    }
}

/**
 * Scene
 */

//  Loading Overlay
const overlayGeometry = new THREE.PlaneBufferGeometry(2,2,1,1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        uAlpha: { value: 1 }
    },
    vertexShader:`
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader:`
        uniform float uAlpha;

        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

const sea = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(200, 200, 200, 200),
    new THREE.RawShaderMaterial({
        fog: true,
        uniforms: {
            fogColor:    { type: "c", value: scene.fog.color },
            fogNear:     { type: "f", value: scene.fog.near },
            fogFar:      { type: "f", value: scene.fog.far },
            time:        { type: "f", value: 0 }
        },
        vertexShader: oceanVertexShader,
        fragmentShader: oceanFragmentShader
    })
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
const ogCameraPosition = new THREE.Vector3(-7.5, 9, 15)
if(window.innerWidth < window.innerHeight) {
    ogCameraPosition.set(0, 9, 15)
    ogCameraPosition.multiplyScalar(2.2)
    scene.fog.near = 70
    scene.fog.far = 100
}

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
    const delta = clock.getElapsedTime() - elapsedTime
    elapsedTime = clock.getElapsedTime()

    //  Update water shader
    sea.material.uniforms.time.value += delta
    lavaMaterial.uniforms.time.value += delta

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
            if(cameraAnimationObject.zoomed) {
                document.getElementById("title").classList.add("hide")
                document.getElementById("backButton").classList.add("visible")
                document.getElementById("content").classList.add("visible")
            } else {
                for(let point of points) {
                    point.element.classList.add('visible')
                }
            }
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