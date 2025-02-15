import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Circle } from './objects/Circle.js';
import { Rectangle } from './objects/Rectangle.js';
import { Line } from './objects/Line.js';
import { Text } from './objects/Text.js';
import { Group } from './objects/Group.js';

// Ensure Circle is correctly exported
export { Circle, Rectangle, Line, Text, Group };

export class Space2D {
    constructor(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.objects = new Map();
        this.selectedObjects = new Set();
        
        this.dragging = false;
        this.draggedObject = null;
        this.dragOffset = new THREE.Vector3();
        
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
        this.renderer.domElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.renderer.domElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.renderer.domElement.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.renderer.domElement.addEventListener('contextmenu', this.handleContextMenu.bind(this));
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

    handleMouseDown(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x, y }, this.camera);

        const meshes = Array.from(this.objects.values()).map(obj => obj.mesh);
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            const clickedObject = Array.from(this.objects.entries())
                .find(([_, obj]) => obj.mesh === clickedMesh);

            if (clickedObject) {
                this.dragging = true;
                this.draggedObject = clickedObject[1];
                this.dragOffset.copy(intersects[0].point).sub(clickedMesh.position);
            }
        }

        if (event.button === 0) { // Left mouse button
            this.dragging = true;
            this.dragStart = { x: event.clientX, y: event.clientY };
        }
    }

    handleMouseMove(event) {
        if (!this.dragging || !this.draggedObject) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x, y }, this.camera);

        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersection);

        this.draggedObject.mesh.position.copy(intersection.sub(this.dragOffset));

        if (this.dragging && this.dragStart) {
            this.drawSelectionBox(this.dragStart, { x: event.clientX, y: event.clientY });
        }
    }

    handleMouseUp(event) {
        this.dragging = false;
        this.draggedObject = null;

        if (this.dragging && this.dragStart) {
            this.selectObjectsInBox(this.dragStart, { x: event.clientX, y: event.clientY });
            this.dragging = false;
            this.dragStart = null;
        }
    }

    handleContextMenu(event) {
        event.preventDefault();
        this.clearSelection();
    }

    drawSelectionBox(start, end) {
        // Implement drawing of selection box on the screen
    }

    selectObjectsInBox(start, end) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x1 = ((start.x - rect.left) / rect.width) * 2 - 1;
        const y1 = -((start.y - rect.top) / rect.height) * 2 + 1;
        const x2 = ((end.x - rect.left) / rect.width) * 2 - 1;
        const y2 = -((end.y - rect.top) / rect.height) * 2 + 1;

        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        const meshes = Array.from(this.objects.values()).map(obj => obj.mesh);
        const raycaster = new THREE.Raycaster();

        meshes.forEach(mesh => {
            const position = new THREE.Vector3();
            mesh.getWorldPosition(position);
            const screenPosition = position.project(this.camera);

            if (screenPosition.x >= minX && screenPosition.x <= maxX &&
                screenPosition.y >= minY && screenPosition.y <= maxY) {
                const object = Array.from(this.objects.entries())
                    .find(([_, obj]) => obj.mesh === mesh);
                if (object) {
                    this.select(object[0]);
                }
            }
        });
    }
}