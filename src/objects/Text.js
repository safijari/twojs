import * as THREE from 'three';
import { BaseObject } from './BaseObject.js';

export class Text extends BaseObject {
    constructor(text = "Text", properties = {}) {
        super();
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '48px Arial';
        context.fillStyle = 'white';
        context.fillText(text, 0, 48);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        this.mesh = new THREE.Sprite(material);
        this.mesh.scale.set(text.length * 0.5, 0.5, 1);
        this.updateProperties(properties);
    }
}