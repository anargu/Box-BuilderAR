

var cubesGroup = []
var box, matBox, geomBox 
var raycaster
var light
var ArScene
var ArCamera
var camera

var markerRoot

window.ARThreeOnLoad = function() {
	ARController.getUserMediaThreeScene({maxARVideoSize: 320, cameraParam: 'Data/camera_para-iPhone 5 rear 640x480 1.0m.dat', 
	onSuccess: function(arScene, arController, arCamera) {
		
		ArScene = arScene
		ArCamera = arScene.videoCamera

		camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -1000, 2000 )

		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 0;
		arScene.camera = camera



		document.body.className = arController.orientation;
		
		var renderer = new THREE.WebGLRenderer({antialias: true});
		
		if (arController.orientation === 'portrait') {
			var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
			var h = window.innerWidth;
			renderer.setSize(w, h);
			renderer.domElement.style.paddingBottom = (w-h) + 'px';
		} else {
			if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
				renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);
			} else {
				renderer.setSize(arController.videoWidth, arController.videoHeight);
				document.body.className += ' desktop';
			}
		}
		document.body.insertBefore(renderer.domElement, document.body.firstChild);
		

		// WEBGL Section -----------
		// var sphere = new THREE.Mesh(
		// 	new THREE.SphereGeometry(0.5, 8, 8),
		// 	new THREE.MeshNormalMaterial()
		// );
		// sphere.material.shading = THREE.FlatShading;
		// sphere.position.z = 0.5;
		init()

		// AR Section -----------
		arController.loadMarker('Data/patt.hiro', function(markerId) {
			markerRoot = arController.createThreeMarker(markerId);
			markerRoot.add(box);
			markerRoot.add(light);
			arScene.scene.add(markerRoot);
		});
		// AR Section -----------

		var tick = function() {
			arScene.process();


			arScene.renderOn(renderer);
			requestAnimationFrame(tick);
		};
		tick();
	}});
	delete window.ARThreeOnLoad;
};
if (window.ARController && ARController.getUserMediaThreeScene) {
	ARThreeOnLoad();
}

function onDocumentClick(event) {

	event.preventDefault();

	mouse.x = (event.clientX / window.innerWidth) * 2 -1
	mouse.y = -(event.clientY / window.innerHeight) * 2 +1

	raycasterDetection()
}

function raycasterDetection() {

	raycaster.setFromCamera( mouse ,ArCamera)
	var intersects = raycaster.intersectObject( markerRoot )

	console.log("detecting objetcs")	
	if (intersects.length > 0) {

		var intersectedObject = intersects[0]

		console.log(intersectedObject.object.position.x, 
					intersectedObject.object.position.y, 
					intersectedObject.object.position.z )

		console.log(intersectedObject.object)

		createNewBox(intersectedObject)		 
	}
}

function createNewBox(intersect) {

	cube = new THREE.Mesh(geomBox, matBox)

	cube.position.copy(intersect.point).add( intersect.face.normal )
	cube.position.divideScalar(1).floor().multiplyScalar(1).addScalar(1)


	cubesGroup.push(cube)
}

function init () {

	mouse = new THREE.Vector2()
	raycaster = new THREE.Raycaster()

	geomBox = new THREE.BoxGeometry(1, 1, 1)
	matBox =  new THREE.MeshBasicMaterial( { color: 0xFFE100, shading: THREE.FlatShading } )

	box = new THREE.Mesh(geomBox, matBox)
	box.position.z = 0
	box.position.x = 0
	box.position.y = 0

	cubesGroup.push(box)

	light = new THREE.DirectionalLight( 0xffffff, 1 );
	light.position.set(80,80,80)

	document.addEventListener('click', onDocumentClick, false)
}