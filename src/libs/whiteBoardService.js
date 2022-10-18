import { fabric } from "fabric"
import './fabric.settinge'
import './fabric.history'
import _ from "lodash"


const
	DEFAULT_OPTION = {
		objectCaching: true,
		strokeUniform: true,
		selectable: false
	}

let
	writer = false,
	fabricCanvas = null,
	vueEventBus = null,
	studyPages = [],
	whiteMode = false,
	isDrawing = '',
	drawingObj = null,
	startPointer = {},
	isReceive = false,
	fillColor = "#000000",
	lineColor = "#000000",
	opacity = 1,
	oldData = {},
	isShiftPress = false;


function setEvents() {
	if (writer) {
		document.addEventListener('keydown', onkeyDown)
		document.addEventListener('keyup', onkeyUp)
		fabricCanvas
			.on('history:append', (data) => dataChange('append', data.type))
			.on('history:undo', () => dataChange('undo'))
			.on('history:redo', () => dataChange('redo'))
			.on('history:clear', () => dataChange('clear'))
			.on('mouse:down', onTouchDown)
			.on('mouse:move', onTouchMove)
			.on('mouse:up', onTouchEnd)
			.on("text:changed", adjustTextWidth)
			.on('path:created', (obj) => {
				obj.path.id = randomString(10)
			})
			
	}
}

function adjustTextWidth( evt ) {
	if (evt.target instanceof fabric.IText) {
		const text = evt.target.text || ""
		while (evt.target.textLines.length > text.split("\n").length) {
			evt.target.set({width: evt.target.getScaledWidth() + 1})
		}
	}
}
 
function onkeyDown ({ shiftKey }) {
	isShiftPress = shiftKey
}

function onkeyUp({ keyCode, ctrlKey, shiftKey }) {
	// del
	if (keyCode === 46) {
		removeActiveObject();
	}
	// Ctrl+Z.
	if (ctrlKey && keyCode === 90) {
		fabricCanvas.undo()
	}
	// Ctrl+Y.
	if (ctrlKey && keyCode === 89) {
		fabricCanvas.redo()
	}
	isShiftPress = shiftKey
}

function onTouchDown(o) {
	if (isDrawing != '') {
		const pointer = fabricCanvas.getPointer(o.e)
		startPointer = pointer

		if (isDrawing === 'Textbox') {
			const textBox = new fabric.Textbox('', {
				id: randomString(10),
				left: pointer.x,
				top: pointer.y - 15,
				width: 150,
				height: 100,
				fontSize: 30,
				lineHeight:1,
				fill: fillColor,
				opacity: opacity,
				selectable: false,
				fontFamily: 'nqr'
			})

			fabricCanvas.add(textBox)
			textBox.setCoords()
			vueEventBus.$emit('whiteboard:changetool', 1)
			fabricCanvas.setActiveObject(textBox);
			textBox.enterEditing();
			fabricCanvas.requestRenderAll();
		} else if (isDrawing === 'Line') {
			drawingObj = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
				id: randomString(10),
				strokeWidth: fabricCanvas.freeDrawingBrush.width,
				stroke: lineColor,
				opacity: opacity,
				selectable: false
			})
			fabricCanvas.offHistory()
			fabricCanvas.add(drawingObj)
		} else {
			drawingObj = new fabric[isDrawing]({
				id: randomString(10),
				left: pointer.x,
				top: pointer.y,
				stroke: lineColor,
				strokeWidth: fabricCanvas.freeDrawingBrush.width,
				fill: fillColor,
				opacity: opacity,
				...DEFAULT_OPTION
			})

			if (isDrawing === 'Rect' || isDrawing === 'Triangle') {
				drawingObj.width = 0
				drawingObj.height = 0
			} else if (isDrawing == 'Ellipse') {
				drawingObj.radius = 0
			}

			fabricCanvas.offHistory()
			fabricCanvas.add(drawingObj)
		}

	} else {
		// fabricCanvas.getActiveObjects().forEach(( obj ) => {
		// 	console.log(obj.type, obj.fontWeight)
		// })
		// console.log(fabricCanvas.getActiveObjects())
	}
}

function onTouchMove(o) {
	if (drawingObj) {
		const pointer = fabricCanvas.getPointer(o.e)
		let distX, distY, originX, originY

		distY = pointer.y - startPointer.y;

		if (startPointer.x < pointer.x) {
			distX = pointer.x - startPointer.x
			originX = 'left'
		} else {
			distX = startPointer.x - pointer.x
			originX = 'right'
		}

		if (startPointer.y < pointer.y) {
			distY = pointer.y - startPointer.y
			originY = 'top'
		} else {
			distY = startPointer.y - pointer.y
			originY = 'bottom'
		}

		const dist = Math.max(distX, distY)
		if (isDrawing === 'Rect' || isDrawing === 'Triangle') {
			if(isShiftPress){
				drawingObj.set({ width: dist, height: dist, originX: originX, originY: originY })
			} else {
				drawingObj.set({ width: distX, height: distY, originX: originX, originY: originY })
			}
		} else if (isDrawing == 'Ellipse') {
			if(isShiftPress){
				drawingObj.set({ rx: dist / 2, ry: dist / 2, originX: originX, originY: originY })
			} else {
				drawingObj.set({ rx: distX / 2, ry: distY / 2, originX: originX, originY: originY })
			}
			console.log(distX, distY);
		} else if (isDrawing == 'Line') {
			drawingObj.set({ x2: pointer.x, y2: pointer.y })
		}
		fabricCanvas.requestRenderAll();
	}
}

function onTouchEnd(o) {
	if (drawingObj) {
		if (Math.abs(drawingObj.width) < 1 && Math.abs(drawingObj.height) < 1) {
			if (isDrawing === 'Rect' || isDrawing === 'Triangle') {
				drawingObj.set({ left: startPointer.x - 50, top: startPointer.y - 50, width: 100, height: 100 })
			} else if (isDrawing == 'Ellipse') {
				drawingObj.set({ left: startPointer.x - 50, top: startPointer.y - 50, radius: 50 })
			}
		}
		drawingObj.setCoords()
		fabricCanvas.requestRenderAll();
		fabricCanvas.onHistory('add')
		if (isDrawing !== 'Line') {
			vueEventBus.$emit('whiteboard:changetool', 1)
			fabricCanvas.setActiveObject(drawingObj);
		}
		drawingObj = false
		startPointer = {}
	}
}


function dataChange(type, appendType = null) {
	if (!isReceive) {
		setTimeout(() => {
			const fabricData = fabricCanvas.toDatalessJSON(['id'])
			const updateData = getUpdateData(appendType || type, fabricData.objects, oldData.objects)
			vueEventBus.$emit('whiteboard:change', {
				updateData: JSON.stringify(updateData),
				currentData: JSON.stringify(fabricData),
				undo: fabricCanvas.historyUndo,
				redo: fabricCanvas.historyRedo
			})
			oldData = fabricData
		}, 10)
	}
}

function getUpdateData(type, objects, oldObject) {
	var updateData = { type: type, objects: [] }
	if (type === 'undo' || type === 'redo') {
		delete updateData.objects
		return updateData
	}
	switch (type) {
		case 'add':
			updateData.objects.push(objects[objects.length - 1])
			break
		case 'remove':
			oldObject.forEach((obj) => {
				const findObj = _.find(objects, { id: obj.id })
				if (!findObj) {
					updateData.objects.push({ id: obj.id })
				}
			})
			break
		case 'modify':
			oldObject.forEach((obj) => {
				const findObj = _.find(objects, { id: obj.id })
				if (!_.isEqual(findObj, obj)) {
					updateData.objects.push({
						id: findObj.id,
						left: findObj.left,
						top: findObj.top,
						scaleX: findObj.scaleX,
						scaleY: findObj.scaleY,
						angle: findObj.angle,
						fill: findObj.fill,
						stroke: findObj.stroke,
						strokeWidth: findObj.strokeWidth,
						opacity: findObj.opacity,
						skewX: findObj.skewX,
						skewY: findObj.skewY,
						text: findObj.text,
						width: findObj.width
					})
				}
			})
			break
	}
	return updateData
}



function removeActiveObject() {
	const activeObjects = fabricCanvas.getActiveObjects();
	if (activeObjects.length > 0) {
		fabricCanvas.offHistory();
		activeObjects.forEach((obj) => {
			if (!obj.isEditing) {
				fabricCanvas.remove(obj);
			}
		})
		fabricCanvas.onHistory('remove');
		fabricCanvas.requestRenderAll();
		fabricCanvas.discardActiveObject();
	}
}

function setActiveObject(history = false) {
	const activeObjects = fabricCanvas.getActiveObjects();
	if (activeObjects.length > 0) {
		activeObjects.forEach((obj) => {
			obj.set({
				fill: obj.fill ? fillColor : null,
				stroke: obj.stroke ? lineColor : null,
				strokeWidth: obj.strokeWidth ? fabricCanvas.freeDrawingBrush.width : null,
				opacity: opacity
			})
		})
		fabricCanvas.requestRenderAll()
		if (history) {
			fabricCanvas.onHistory('modify')
		}
	}
}

function setSelectable(flag) {
	fabricCanvas.getObjects().forEach((obj) => {
		obj.set('selectable', flag)
		fabricCanvas.requestRenderAll()
	})
	if (!flag) {
		fabricCanvas.set('defaultCursor', "crosshair").set('hoverCursor', "crosshair")
	} else {
		fabricCanvas.set('defaultCursor', "default").set('hoverCursor', "move")
	}
}

function hexToRgba() {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(lineColor);
	return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`
}

function randomString(len) {
	const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let randomStr = ''
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length)
		randomStr += charSet.substring(randomPoz, randomPoz + 1)
	}
	return randomStr;
}



export default {

	async init(isWriter, canvas, eventBus, initData, pages) {
		this.destroy()
		writer = isWriter
		canvas.width = canvas.parentNode.offsetWidth
		canvas.height = canvas.parentNode.offsetHeight
		vueEventBus = eventBus
		studyPages = pages
		whiteMode = initData.whiteMode

		if (fabricCanvas == null) {
			const id = canvas.attributes['id'].nodeValue
			fabricCanvas = new fabric.Canvas(id)
		}

		fillColor = initData.fillColor
		lineColor = initData.lineColor
		opacity = initData.opacity
		
		fabricCanvas.freeDrawingBrush.color = hexToRgba()
		fabricCanvas.freeDrawingBrush.width = initData.lineWidth
		fabricCanvas.clearHistory()
		
		
		let targetData
		if(whiteMode) {
			targetData = initData.data['white']
		} else {
			targetData = initData.data[studyPages[0]+'_'+studyPages[1]]
		}
		
		if (targetData) {
			await this.dataInit(targetData)
			setEvents()
		} else {
			setEvents()
		}

		if (initData.historyUndo) {
			fabricCanvas.historyUndo = initData.historyUndo
		}

		if (initData.historyUndo) {
			fabricCanvas.historyRedo = initData.historyRedo
		}
	},

	toolBarEvent(tool) {
		// console.log('toolclick : ', tool)
		isDrawing = ''
		fabricCanvas.set('isDrawingMode', false)

		if (tool === 'select') {
			fabricCanvas.set('selection', true)
			setSelectable(true)
		} else if (tool === 'pen') {
			fabricCanvas.set('isDrawingMode', true)
			setSelectable(false)
		} else if (tool === 'trash') {
			removeActiveObject()
		} else {
			fabricCanvas.set('selection', false)
			setSelectable(false)
			switch (tool) {
				case 'line':
					isDrawing = 'Line'
				break
				case 'text':
					isDrawing = 'Textbox'
				break
				case 'rect':
					isDrawing = 'Rect'
				break
				case 'triangle':
					isDrawing = 'Triangle'
				break
				case 'ellipse':
					isDrawing = 'Ellipse'
				break
			}
		}
		fabricCanvas.discardActiveObject();
		fabricCanvas.requestRenderAll()
	},

	dataInit(data) {
		return new Promise((resolve, reject) => {
			isReceive = true
			fabricCanvas.loadFromJSON(data, () => {
				fabricCanvas.renderAll();
				fabricCanvas.getObjects().forEach((obj) => {
					obj.setCoords()
					obj.set('selectable', true)
				})
				fabricCanvas.requestRenderAll()
				setTimeout(() => {
					isReceive = false
					resolve()
				}, 100)
			});
			oldData = JSON.parse(data)
		})
	},

	updateData(data, resive = false) {
		return new Promise((resolve, reject) => {
			if (resive) isReceive = true

			if (data.type === 'undo' || data.type === 'redo') {
				this[data.type]()
				comp()
			} else {
				fabricCanvas.offHistory()
				switch (data.type) {
					case 'add':
						fabric.util.enlivenObjects(data.objects, (objs) => {
							var origRenderOnAddRemove = fabricCanvas.renderOnAddRemove;
							fabricCanvas.renderOnAddRemove = false;
							objs.forEach(function (o) {
								fabricCanvas.add(o);
							});
							fabricCanvas.renderOnAddRemove = origRenderOnAddRemove;
							fabricCanvas.renderAll();
							comp(() => fabricCanvas.onHistory(data.type))
						})
						break
					case 'remove':
						data.objects.forEach(obj => {
							const removeObj = _.find(fabricCanvas.getObjects(), { id: obj.id })
							fabricCanvas.remove(removeObj)
						})
						comp(() => fabricCanvas.onHistory(data.type))
						break
					case 'modify':
						data.objects.forEach(obj => {
							const findObj = _.find(fabricCanvas.getObjects(), { id: obj.id })
							findObj.set(obj)
						})
						comp(() => fabricCanvas.onHistory(data.type))
						break
				}
			}

			function comp(hook = null) {
				fabricCanvas.requestRenderAll()
				if (hook) hook()
				if (resive) {
					setTimeout(() => {
						isReceive = false
						const fabricData = fabricCanvas.toDatalessJSON(['id'])
						resolve({
							data: JSON.stringify(fabricData),
							historyUndo: fabricCanvas.historyUndo,
							historyRedo: fabricCanvas.historyRedo,
						})
						oldData = fabricData
					}, 100)
				}
			}
		})
	},

	changeColor(colors) {
		fillColor = colors.fill
		lineColor = colors.line
		fabricCanvas.freeDrawingBrush.color = hexToRgba()
		setActiveObject(true)
	},

	changeLineWidth(width, history) {
		fabricCanvas.freeDrawingBrush.width = parseInt(width)
		setActiveObject(history)
	},

	changeOpacity(op, history) {
		opacity = op * 0.01
		fabricCanvas.freeDrawingBrush.color = hexToRgba()
		setActiveObject(history)
	},

	undo() {
		if (fabricCanvas) {
			fabricCanvas.undo()
		}
	},

	redo() {
		if (fabricCanvas) {
			fabricCanvas.redo()
		}
	},

	unActiveObject() {
		fabricCanvas.discardActiveObject();
		fabricCanvas.requestRenderAll();
	},

	destroy() {
		if (fabricCanvas) {
			fabricCanvas
				.off('history:append')
				.off('history:undo')
				.off('history:redo')
				.off('history:clear')
				.off('path:created')
				.off('mouse:down')
				.off('mouse:move')
				.off('mouse:up')
				.on("text:changed")
				.clear()
				.dispose()
			fabricCanvas = null
		}
		writer = false
		studyPages = []
		isDrawing = ''
		drawingObj = null
		startPointer = {}
		oldData = {}
		isReceive = false
		whiteMode = false
		document.removeEventListener('keyup', onkeyUp)
	}
}