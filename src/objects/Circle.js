export class Circle extends BaseObject {
    constructor(radius = 1, properties = {}) {
        super();
        const geometry = new THREE.CircleGeometry(radius, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.updateProperties(properties);
    }
}