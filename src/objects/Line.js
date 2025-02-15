import * as THREE from 'three';
import { BaseObject } from './BaseObject.js';

export class Line extends BaseObject {
    constructor(points = [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)], properties = {}) {
        super();
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Line(geometry, material);
        this.updateProperties(properties);
    }
}