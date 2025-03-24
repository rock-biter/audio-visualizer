import './style.css'
import * as THREE from 'three'
// __controls_import__
// __gui_import__

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'

import fragmentShader from './shaders/audio/fragment.glsl'
import vertexShader from './shaders/audio/vertex.glsl'

/**
 * Debug
 */
// __gui__
const config = {
	example: 5,
}
const pane = new Pane()

pane
	.addBinding(config, 'example', {
		min: 0,
		max: 10,
		step: 0.1,
	})
	.on('change', (ev) => console.log(ev.value))

/**
 * Scene
 */
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0xdedede)

const precision = 256

// __floor__
/**
 * Plane
 */
const groundMaterial = new THREE.ShaderMaterial({
	wireframe: true,
	fragmentShader,
	vertexShader,
	uniforms: {
		uFrequencies: { value: new Array(256).fill(0) },
	},
})
const groundGeometry = new THREE.PlaneGeometry(500, 30, 2000, 1000)
groundGeometry.rotateX(-Math.PI * 0.5)
const ground = new THREE.Mesh(groundGeometry, groundMaterial)
scene.add(ground)

/**
 * render sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

/**
 * Camera
 */
const fov = 60
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)
camera.position.set(10, 35, 40)

/**
 * Show the axes of coordinates system
 */
// __helper_axes__
const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

scene.background = new THREE.Color(0x000022)

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
})
document.body.appendChild(renderer.domElement)
handleResize()

/**
 * OrbitControls
 */
// __controls__
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 10

const listener = new THREE.AudioListener()
camera.add(listener)

const sound = new THREE.Audio(listener)
const audioLoader = new THREE.AudioLoader()

audioLoader.load('/musica.mp4', (buffer) => {
	sound.setBuffer(buffer)
	sound.setLoop(true)
	sound.setVolume(0.5)
	window.addEventListener(
		'click',
		() => {
			sound.play()
		},
		{ once: true }
	)
})

const analyser = new THREE.AudioAnalyser(sound, precision)

/**
 * Three js Clock
 */
// __clock__
const clock = new THREE.Clock()

/**
 * frame loop
 */

function tic() {
	// positions.needsUpdate = true
	/**
	 * tempo trascorso dal frame precedente
	 */
	const dt = clock.getDelta()
	/**
	 * tempo totale trascorso dall'inizio
	 */
	// const time = clock.getElapsedTime()

	const avgFreq = analyser.getAverageFrequency()
	const scaleFactor = 1 + 2 * (avgFreq / precision)

	ground.scale.setScalar(scaleFactor)

	// console.log(avgFreq)
	const data = analyser.getFrequencyData()
	groundMaterial.uniforms.uFrequencies.value = data
	// console.log(data)

	// __controls_update__
	controls.update(dt)

	renderer.render(scene, camera)

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)

window.addEventListener('resize', handleResize)

function handleResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height

	// camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)
}
