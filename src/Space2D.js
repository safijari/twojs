import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Space2D {
    constructor(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.objects = new Map();
        this.selectedObjects = new Set();
        
        this.setupRenderer(container);
        this.setupCamera();
        this.setupControls();
        this.setupGrid();
        
        this.animate();
    }

    setupRenderer(container) {
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);
        
        this.renderer.domElement.addEventListener('click', this.handleClick.bind(this));
    }

    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        const size = 10;
        this.camera.left = -size * aspect;
        this.camera.right = size * aspect;
        this.camera.top = size;
        this.camera.bottom = -size;
        this.camera.near = -1000;
        this.camera.far = 1000;
        this.camera.position.z = 5;
        this.camera.updateProjectionMatrix();
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableRotate = false;
        this.controls.screenSpacePanning = true;
    }

    setupGrid() {
        const size = 20;
        const divisions = 20;
        const gridHelper = new THREE.GridHelper(size, divisions);
        gridHelper.rotation.x = Math.PI / 2;
        this.scene.add(gridHelper);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    add(object) {
        const id = crypto.randomUUID();
        this.objects.set(id, object);
        this.scene.add(object.mesh);
        return id;
    }

    remove(id) {
        const object = this.objects.get(id);
        if (object) {
            this.scene.remove(object.mesh);
            this.objects.delete(id);
            this.selectedObjects.delete(id);
        }
    }

    select(id) {
        this.selectedObjects.add(id);
        const object = this.objects.get(id);
        if (object) {
            object.setSelected(true);
        }
    }

    deselect(id) {
        this.selectedObjects.delete(id);
        const object = this.objects.get(id);
        if (object) {
            object.setSelected(false);
        }
    }

    clearSelection() {
        this.selectedObjects.forEach(id => this.deselect(id));
    }

    updateProperties(properties) {
        this.selectedObjects.forEach(id => {
            const object = this.objects.get(id);
            if (object) {
                object.updateProperties(properties);
            }
        });
    }

    handleClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x, y }, this.camera);

        const meshes = Array.from(this.objects.values()).map(obj => obj.mesh);
        const intersects = raycaster.intersectObjects(meshes);

        if (!event.ctrlKey) {
            this.clearSelection();
        }

        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            const clickedObject = Array.from(this.objects.entries())
                .find(([_, obj]) => obj.mesh === clickedMesh);
            
            if (clickedObject) {
                this.select(clickedObject[0]);
            }
        }
    }
}