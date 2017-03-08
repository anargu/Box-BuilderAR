
const CUBE_SCALE = 0.25 // 0.5 0.25 def 1
// const COLOR_CUBE = 0x29dbbd
var COLOR_CUBE = '#ffdbbd'

var raycasterDetection = function (ev, camera, objects) {

	// console.log(ev, camera, objects)

	var style = getComputedStyle(ev.target)
	var elementTransform = style.getPropertyValue('transform')
	var elementTransformOrigin = style.getPropertyValue('transform-origin')

	var xyz = elementTransformOrigin.replace(/px/g, '').split(" ")
	xyz[0] = parseFloat(xyz[0])
	xyz[1] = parseFloat(xyz[1])
	xyz[2] = parseFloat(xyz[2] || 0)

	var mat = new THREE.Matrix4()
	mat.identity()
	if(/^matrix\(/.test(elementTransform)) {
		var elems = elementTransform.replace(/^matrix\(|\)$/g, '').split(' ')
		mat.elements[0] = parseFloat(elems[0])
		mat.elements[1] = parseFloat(elems[1])
		mat.elements[4] = parseFloat(elems[2])
		mat.elements[5] = parseFloat(elems[3])
		mat.elements[12] = parseFloat(elems[4])
		mat.elements[13] = parseFloat(elems[5])
	} else if( /^matrix3d\(/i.test(elementTransform)) {
		var elems = elementTransform.replace(/^matrix3d\(|\)$/ig, '').
						split(' ')
		for (var i = 0; i < 16; i++) {
			mat.elements[i] = parseFloat(elems[i])
		}
	}

	var mat2 = new THREE.Matrix4()
	mat2.makeTranslation(xyz[0], xyz[1], xyz[2])
	mat2.multiply(mat)
	mat.makeTranslation(-xyz[0], -xyz[1], -xyz[2])
	mat2.multiply(mat)

	var vec = new THREE.Vector3(ev.layerX, ev.layerY, 0)
	vec.applyMatrix4(mat2)

	var width = parseFloat(style.getPropertyValue('width'))
	var height = parseFloat(style.getPropertyValue('height'))

	var mouse3D = new THREE.Vector3(
		(vec.x / width ) * 2 - 1,
		- (vec.y / height) * 2 + 1,
		0.5
	)
	mouse3D.unproject( camera )
	mouse3D.sub( camera.position )
	mouse3D.normalize()
	var raycaster = new THREE.Raycaster( camera.position, mouse3D)
	var intersects = raycaster.intersectObjects( objects )
	if( intersects.length > 0) {
		// console.log(intersects[0])
		var obj = intersects[0].object
		// return obj
		return intersects[0]
	}
}

var createGroupBox = function () {

	var groupBox = new THREE.Object3D()

	groupBox.tick = function() {
		// loop
	}

	return groupBox
}

var createBox = function ( groupBox ) {
	// box will be put on makerRoot

	// var groupBox = new THREE.Object3D()
	var cube = new THREE.Mesh(
			new THREE.BoxGeometry(CUBE_SCALE, CUBE_SCALE, CUBE_SCALE, 1, 1, 1),
			new THREE.MeshLambertMaterial( {color: 0xffffff} )
	)
	cube.position.z = 0
	cube.position.x = 0
	cube.position.y = 0
	groupBox.add(cube)


	var cubes = groupBox.children.slice()


	cube.tick = function() {

		// pivot.rotation.z += ((box.open ? -Math.PI/1.5 : 0) - pivot.rotation.z) * 0.1

	}

	return { cube: cube, cubes: cubes, boxGroup: groupBox}
}

var createRandomBox = function(groupBox) {

	var cube = new THREE.Mesh(
		new THREE.BoxGeometry(CUBE_SCALE,CUBE_SCALE,CUBE_SCALE),
		new THREE.MeshLambertMaterial( {color: 0xffffff} )
		)
	cube.position.z = 0
	cube.position.x = Math.random() * 3
	cube.position.y = Math.random() * 3

	var cubes = groupBox.children.slice()
	groupBox.add(cube) // update boxGroup


	return { cube: cube, cubes: cubes ,boxGroup: groupBox }
}

var createAsideBox = function (groupBox, intersect) {

	var cube = new THREE.Mesh(
		new THREE.BoxGeometry(CUBE_SCALE, CUBE_SCALE, CUBE_SCALE),
		new THREE.MeshLambertMaterial( {color: COLOR_CUBE} )
		)

	intersectedCubePosition = intersect.object.position

	cube.position.x = intersectedCubePosition.x + intersect.face.normal.x * CUBE_SCALE
	cube.position.y = intersectedCubePosition.y + intersect.face.normal.y * CUBE_SCALE
	cube.position.z = intersectedCubePosition.z + intersect.face.normal.z * CUBE_SCALE

	groupBox.add(cube)
	var cubes = groupBox.children.slice()
	return { cube: cube, cubes: cubes ,boxGroup: groupBox }
}

var randomColor = function () {

	var r = THREE.Math.randInt(0,255)
	var g = THREE.Math.randInt(0,255)
	var b = THREE.Math.randInt(0,255)

	var r_ = r.toString(16).length === 1 ? "0" + r.toString(16) : r.toString(16)   
	var g_ = g.toString(16).length === 1 ? "0" + g.toString(16) : g.toString(16)
	var b_ = b.toString(16).length === 1 ? "0" + b.toString(16) : b.toString(16)


	console.log(r_, g_, b_, " << color")
	console.log( "#"+r_+g_+b_ )
	return "#"+r_+g_+b_
}

window.ARThreeOnLoad = function (sourceId) {
	ARController.getUserMediaThreeScene( {
											//facingMode: {
											//	      exact: 'environment'
											//	      },
											sourceId: sourceId,
											maxARVideoSize: 320,
											cameraParam: 'Data/camera_para-iPhone 5 rear 640x480 1.0m.dat',
	onSuccess: function(arScene, arController, arCamera) {

		console.log("arScene")
		arController.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION)
		document.body.className = arController.orientation
		console.log(arController.orientation)

		var renderer = new THREE.WebGLRenderer( {antialias: true} )
		if(arController.orientation === 'portrait') {
			// w
			// h
			/*	ORIGINAL VERSION
				var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth
				var h = (window.innerWidth)
			*/
			/*	ANARGU CUSTOM VERSION
				var h = (window.innerWidth / arController.videoWidth) * arController.videoHeight
				var w = (window.innerWidth)
			*/

				//ANARGU CUSTOM VERSION 2
			var h = (window.innerHeight) + 400 //+ ((window.innerHeight)/4)
			var w = (window.innerWidth)

			/*
			//extracted from http://stackoverflow.com/questions/17359915/get-screen-resolution-on-a-mobile-website
			var ratio = window.devicePixelRatio || 1;
			var w = screen.width * ratio;
			var h = screen.height * ratio;
			*/

			/*//EDITED BY ANARGU
			//extracted from http://stackoverflow.com/questions/17359915/get-screen-resolution-on-a-mobile-website

			var w = window.screen.width;
			var h = window.screen.height;
			*/

			renderer.setSize(w, h) //setSize(height, width) or setSize(width, height) ??
			renderer.domElement.style.paddingBottom = (w-h) + 'px'
			console.log(w, "w")
			console.log(h, "h")
		} else {
			if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
				renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight)
			} else {
				//desktop
				// renderer.setSize(arController.videoWidth, arController.videoHeight)
				renderer.setSize(1024, 768)
				document.body.className = ' desktop'
				console.log(arController.videoWidth, "w")
				console.log(arController.videoHeight, "h")
			}
		}

		document.body.insertBefore(renderer.domElement, document.body.firstChild)

		var light = new THREE.PointLight(0xffffff)
		light.position.set(40,40,40)
		arScene.scene.add(light)

		var light = new THREE.PointLight(COLOR_CUBE);
		light.position.set(-40, -20, -30);
		arScene.scene.add(light);


		var baseGeometry = new THREE.PlaneGeometry( 5, 5, 32)
		var baseMaterial = new THREE.MeshBasicMaterial( {color: 0x1377B5, opacity: 0.6, transparent: true , side: THREE.DoubleSide } )
		var base = new THREE.Mesh(baseGeometry, baseMaterial)
		base.position.y = 0
		base.position.x = 0
		base.position.z = -0.5


		var groupBox = createGroupBox()
		var box = createBox(groupBox)

		renderer.domElement.addEventListener('click', function (ev) {

			var intersect = raycasterDetection(ev, arScene.camera, groupBox.children.slice())

			if (intersect !== undefined) {
				//if found an object

				//create random cube aside of the clicked cube
				// var cube = createRandomBox(groupBox)

				// create a side box
				var cube = createAsideBox(groupBox, intersect)
				COLOR_CUBE = randomColor()
			}
		}, false)

		var markerRoot = arController.createThreeBarcodeMarker(20)
		markerRoot.add(box.boxGroup)
		markerRoot.add(base)
		arScene.scene.add(markerRoot)

		// loop
		var tick = function() {
			arScene.process()

			box.cube.tick()

			arScene.renderOn(renderer)
			requestAnimationFrame(tick)
		}
		tick()
	}})

	delete window.ARThreeOnLoad

}


navigator.mediaDevices.enumerateDevices()
  .then(
    function(devices) {
      let sourceId = null;
      // Enumerate all devices
      for (var device of devices) {
        // If there is still no video input, or if this is the rear camera
        if (device.kind == 'videoinput' && (!sourceId || device.label.indexOf('back') !== -1)) {
          sourceId = device.deviceId;
        }
      }
      // We didn't find any video input
      if (!sourceId) {
        throw 'No video input';
      }

      window.ARThreeOnLoad(sourceId);

    }
  );
