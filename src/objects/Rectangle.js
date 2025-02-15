export class Rectangle extends BaseObject {
    constructor(width = 1, height = 1, properties = {}) {
        super();
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        this.mesh = new THREE.Mesh(geometry, material);
        this.updateProperties(properties);
    }
}