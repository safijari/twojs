export class Group extends BaseObject {
    constructor(objects = [], properties = {}) {
        super();
        this.mesh = new THREE.Group();
        objects.forEach(obj => this.mesh.add(obj.mesh.clone()));
        this.updateProperties(properties);
    }
}