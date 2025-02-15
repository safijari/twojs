import * as THREE from 'three';

export class BaseObject {
    constructor() {
        this.properties = {};
        this.isSelected = false;
    }

    setSelected(selected) {
        this.isSelected = selected;
        if (selected) {
            this.mesh.material.color.setHex(0xffff00);
        } else {
            this.updateProperties(this.properties);
        }
    }

    updateProperties(properties) {
        Object.assign(this.properties, properties);
        if (properties.color) {
            this.mesh.material.color.setHex(properties.color);
        }
        if (properties.position) {
            this.mesh.position.set(
                properties.position.x ?? this.mesh.position.x,
                properties.position.y ?? this.mesh.position.y,
                0
            );
        }
        if (properties.scale) {
            this.mesh.scale.set(
                properties.scale.x ?? this.mesh.scale.x,
                properties.scale.y ?? this.mesh.scale.y,
                1
            );
        }
    }
}