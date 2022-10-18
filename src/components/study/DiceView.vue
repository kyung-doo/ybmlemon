<template>
	<div id="dice-view" v-show="isShow">
		<div id="three-view" ref="threeView"></div>
		<transition name="zoom">
			<div v-show="showResult" class="result">
				{{ result }}
			</div>
		</transition>
		<ui-sequence
			v-show="showResult"
			class="effect-ani"
			ref="effectAni" 
			source="dice_effect"
			name="dice_effect_"
			:total-frames="33"
			:fps="30"
			:loop="false">
		</ui-sequence>
	</div>
</template>

<script>

import * as CANNON from 'cannon'
import * as THREE from 'three'
import AudioControl from '@/libs/audioControl'

let debugRenderer = null

import {
	DiceManager,
	DiceD6,
	DiceD4
} from '@/libs/three.dice'

export default {
	name: 'diceView',
	
	data () {
		return {
			isShow: false,
			scene: null,
			container: null,
			camera: null,
			renderer: null,
			dice1: null,
			dice2_1: null,
			dice2_2: null,
			world: null,
			frontBarrier: null,
			backBarrier: null,
			leftBarrier: null,
			rightBarrier: null,
			animId: null,
			timer: null,
			collideAudio: null,
			dropAudio: null,
			closeDelay: 2000,
			result: 0,
			showResult: false,
			debugRenderer: null,
			isDebugRenderer: false,
			lastTimeStamp: performance.now(),
			fps: 0
		}
	},

	watch: {
		showResult ( newVal ) {
			if(newVal > 0 ) {
				clearTimeout(this.timer)
				this.timer = setTimeout(() => {
					this.stop()
				}, this.closeDelay)
			}
		}
	},


	methods: {

		create ( mode ) {
			this.scene = new THREE.Scene();
			this.container = this.$refs.threeView

			const SCREEN_WIDTH = 1562
			const SCREEN_HEIGHT = 962
			const VIEW_ANGLE = 45
			const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT
			const NEAR = 0.01
			const FAR = 20000

			this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR)
			this.scene.add(this.camera)
			this.camera.position.set(0, 30, 0)
			this.camera.lookAt(new THREE.Vector3(0, 0, 0))

			// RENDERER
			this.renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true })
			this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
			this.renderer.shadowMap.enabled = true
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
			this.container.appendChild( this.renderer.domElement )

			let ambient = new THREE.AmbientLight('#ccc', 0.7);
			this.scene.add(ambient)

			let directionalLight = new THREE.DirectionalLight('#ccc', 0.5)
			directionalLight.position.x = -1000
			directionalLight.position.y = 1000
			directionalLight.position.z = 1000
			this.scene.add(directionalLight)

			let light = new THREE.SpotLight(0xefdfd5, 0.3)
			light.position.y = 100
			light.position.x = -30
			light.target.position.set(0, 0, 0)
			light.castShadow = true
			light.shadow.camera.near = 50
			light.shadow.camera.far = 110
			light.shadow.mapSize.width = 1024
			light.shadow.mapSize.height = 1024
			this.scene.add(light)

			const floorMaterial = new THREE.ShadowMaterial( {side: THREE.DoubleSide, opacity : 0.4 } )
			const floorGeometry = new THREE.PlaneGeometry(40, 30, 1, 1)
			const floor = new THREE.Mesh(floorGeometry, floorMaterial)
			floor.position.y = -0.5
			floor.receiveShadow  = true
			floor.rotation.x = Math.PI / 2
			this.scene.add(floor)

			this.world = new CANNON.World()
			this.world.gravity.set(0, -9.82 * 20, 0)
			this.world.broadphase = new CANNON.NaiveBroadphase()
			this.world.solver.iterations = 16
			DiceManager.setWorld(this.world)

			let floorBody = new CANNON.Body({ 
				mass: 0, 
				shape: new CANNON.Plane(30, 30), 
				material: DiceManager.floorBodyMaterial
			})
			floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
			this.world.add(floorBody)

			this.frontBarrier = new CANNON.Body({ 
				mass: 0, 
				shape: new CANNON.Box(new CANNON.Vec3(20, 50, 1)), 
				material: DiceManager.barrierBodyMaterial,
				position: new CANNON.Vec3(0, 0, -11)
			})
			this.world.add(this.frontBarrier)

			this.leftBarrier = new CANNON.Body({ 
				mass: 0, 
				shape: new CANNON.Box(new CANNON.Vec3(1, 50, 20)), 
				material: DiceManager.barrierBodyMaterial,
				position: new CANNON.Vec3(-18, 0, 0)
			})
			this.world.add(this.leftBarrier)

			this.rightBarrier = new CANNON.Body({ 
				mass: 0, 
				shape: new CANNON.Box(new CANNON.Vec3(1, 50, 20)), 
				material: DiceManager.barrierBodyMaterial,
				position: new CANNON.Vec3(18, 0, 0)
			})
			this.world.add(this.rightBarrier)

			this.backBarrier = new CANNON.Body({ 
				mass: 0, 
				shape: new CANNON.Box(new CANNON.Vec3(20, 50, 1)), 
				material: DiceManager.barrierBodyMaterial,
				position: new CANNON.Vec3(0, -50, 11)
			})
			this.world.add(this.backBarrier)

			if(mode === 'single') {
				this.dice1 = new DiceD6({size: 2.5, backColor: '#ffffff'})
				this.scene.add(this.dice1.getObject())
			} else {
				this.dice2_1 = new DiceD4({size: 2.5, backColor: '#ff0000'})
				this.scene.add(this.dice2_1.getObject())
				this.dice2_2 = new DiceD4({size: 2.5, backColor: '#0000ff'})
				this.scene.add(this.dice2_2.getObject())
			}
			
			
			if(this.isDebugRenderer) { 
				if(!debugRenderer) {
					debugRenderer = import('@/libs/cannonDebugRenderer').then(()=> {
						this.debugRenderer = new THREE.CannonDebugRenderer(this.scene, this.world)
					})	
				} else {
					this.debugRenderer = new THREE.CannonDebugRenderer(this.scene, this.world)
				}
			}
			this.animId = requestAnimationFrame( this.animate )
		},

		start ( mode, datas = null ) {

			if(this.scene) this.stop()

			this.isShow = true

			this.create( mode )
			
			this.backBarrier.position.y = -100
			if(mode === 'single') { 
				this.dropDice(mode, [this.dice1], datas)
			} else {
				this.dropDice(mode, [this.dice2_1, this.dice2_2], datas) 
			}
			// this.timer = setTimeout(() => {
			// 	this.backBarrier.position.y = 0
			// }, 1000)
			
			this.$emit('start')
		},

		stop () {
			clearTimeout(this.timer)
			this.isShow = false
			this.showResult = false
			this.result = 0
			this.destory()
			this.$emit('finish')
		},

		dropDice ( mode, dices, datas ) {
			const dropValue = []
			
			dices.forEach(( dice, i ) => {
				const obj = dice.getObject()
				const body = dice.getObject().body
				if(datas) {
					obj.position.x = datas[i].position.x
					obj.position.y = datas[i].position.y
					obj.position.z = datas[i].position.z
					obj.quaternion.x = datas[i].quaternion.x
					obj.quaternion.y = datas[i].quaternion.y
					obj.quaternion.z = datas[i].quaternion.z
					dice.updateBodyFromMesh()
					body.velocity.set(datas[i].velocity.x, datas[i].velocity.y, datas[i].velocity.z)
					body.angularVelocity.set(datas[i].angularVelocity.x, datas[i].angularVelocity.y, datas[i].angularVelocity.z)
				} else {
					const randX = 20 * Math.random() - 10
					obj.position.x = randX
					obj.position.y = 10 + (3 * i)
					obj.position.z = 20 + (3 * i)
					obj.quaternion.x = 0
					obj.quaternion.y = (Math.random()*90-45) * Math.PI / 180
					obj.quaternion.z = (Math.random()*90-45) * Math.PI / 180
					dice.updateBodyFromMesh()
					body.velocity.set(-randX, 60, 3 * Math.random() - 40)
					body.angularVelocity.set(20 * Math.random() -10, 20 * Math.random() - 10, 20 * Math.random() - 10)
					dropValue.push({
						position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
						quaternion: { x: obj.quaternion.x, y: obj.quaternion.y, z: obj.quaternion.z },
						velocity: { x: body.velocity.x, y: body.velocity.y, z: body.velocity.z },
						angularVelocity: { x: body.angularVelocity.x, y: body.angularVelocity.y, z: body.angularVelocity.z }
					})
				}
				obj.visible = true
				this.collideAudio = new AudioControl('dice_collide.mp3')
				this.dropAudio = new AudioControl('dice_drop.mp3')
				this.dropAudio.play()
				body.addEventListener('collide', ( e ) => {
					if(this.fps >= 30) {
						const relativeVelocity = e.contact.getImpactVelocityAlongNormal()
						this.collideAudio.volume = Math.max(Math.min(relativeVelocity * 0.01, 1), 0.1)
						this.collideAudio.stop().play()
					}
				})
			})
			if(!datas) {
				this.$emit('dropdice', {mode: mode, dropValue: dropValue})
			}
		},

		animate ( timestamp ) {
			const deltaTime = timestamp - this.lastTimeStamp
			
			if(this.isShow) {
				this.fps = Number(1 / (deltaTime * 0.001)).toFixed(1);
				this.world.step(1.0 / 60.0, deltaTime/1000, 5)
			}
			if(this.dice1) {
				this.dice1.updateMeshFromBody() 
				if(this.dice1.object.position.z < 0) {
					if(this.backBarrier.position.y !== 0) {
						this.backBarrier.position.y = 0
					}
				}
				if(this.dice1.isFinished()) {
					if(this.result === 0) {
						this.result = parseInt(this.dice1.faceTexts[this.dice1.getUpsideValue()+1])
						setTimeout(()=>{
							this.showResult = true
							setTimeout(()=>{
								this.$refs.effectAni.gotoAndPlay(1)
							}, 500)
						}, 500)
					}
				}
			}
			if(this.dice2_1) {
				this.dice2_1.updateMeshFromBody()
				this.dice2_2.updateMeshFromBody() 
				if(this.dice2_1.object.position.z < 0 || this.dice2_2.object.position.z < 0) {
					if(this.backBarrier.position.y !== 0) {
						this.backBarrier.position.y = 0
					}
				}
				if(this.dice2_1.isFinished() && this.dice2_2.isFinished()) {
					if(this.result === 0) {
						let value1 = parseInt(this.dice2_1.faceTexts[this.dice2_1.getUpsideValue()+1])
						let value2 = parseInt(this.dice2_2.faceTexts[this.dice2_2.getUpsideValue()+1])
						this.result =  value1 + value2
						setTimeout(()=>{
							// this.showResult = true
							setTimeout(()=>{
								this.$refs.effectAni.gotoAndPlay(1)
								clearTimeout(this.timer)
								this.timer = setTimeout(() => {
									this.stop()
								}, 1000)
							}, 500)
						}, 500)
					}
				}
			}
			
			this.renderer.render( this.scene, this.camera )
			this.lastTimeStamp = timestamp

			if(this.debugRenderer) {
				this.debugRenderer.update()
			}
			this.animId = requestAnimationFrame( this.animate )
		},

		destory () {
			cancelAnimationFrame( this.animId )
			this.fps = 0;
			if(this.world) {
				this.world.bodies.forEach(( body ) => {
					this.world.remove( body )
					body.removeEventListener('collide')
					body = null
				})
				this.world = null
				DiceManager.throwRunning = false
				DiceManager.world.removeEventListener('postStep', DiceManager.check)
				DiceManager.world = null
			}
			if(this.scene) {
				this.scene.children.forEach(( obj ) => {
					this.scene.remove( obj )
					if(obj.type === 'Mesh') {
						if(obj.geometry) obj.geometry.dispose()
						if(obj.material){
							if (obj.material.length) {
								for (let i = 0; i < obj.material.length; ++i) {
									obj.material[i].dispose()
								}
							}
							else {
								obj.material.dispose()                         
							}
						}
					} 
					obj = null
				})
			}
			
			this.camera = null
			this.renderer = null
			this.dice1 = null
			this.dice2_1 = null
			this.dice2_2 = null
			this.debugRenderer = null
			this.scene = null
			this.container.removeChild(this.container.firstChild)
			this.container = null
			if(this.collideAudio)   this.collideAudio.destroy()
			this.collideAudio = null
			if(this.dropAudio)  this.dropAudio.destroy()
			this.dropAudio = null
		}
	}
}
</script>

<style lang="scss">
#dice-view{
	position: absolute;
   left: 0;
   top: 0;
   @include fullSize;
	
	#three-view {
		position: absolute;
		left: 330px;
		top: 103px;
		width: 1562px;
		height: 962px;
	}
	.result {
		position: absolute;
		left: 995px;
    	top: 483px;
		width: 233px;
		height: 172px;
		font-weight: 600;
		font-size: 100px;
		text-align: center;
		line-height: 170px;
		background: url('~@/assets/images/study/dice_result.png') no-repeat;
	}
	.effect-ani {
		position: absolute;
		left: 865px;
    	top: 403px;
		width: 500px;
		height: 300px;
	}
}
</style>