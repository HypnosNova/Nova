class ComplexGeometry extends THREE.Geometry {
  constructor(geometryData) {
    super();
    this.dynamic = true;

    if (mesh) {
      this.update(geometryData)
    }
  }

  updatePositions(positions) {
    for (var i = 0; i < positions.length; i++) {
      var pos = positions[i];
      if (i > this.vertices.length - 1) {
        this.vertices.push(new THREE.Vector3()
          .fromArray(pos));
      } else {
        this.vertices[i].fromArray(pos);
      }
    }
    this.vertices.length = positions.length;
    this.verticesNeedUpdate = true;
  }

  updateCells(cells) {
    for (var i = 0; i < cells.length; i++) {
      var face = cells[i];
      if (i > this.faces.length - 1) {
        this.faces.push(new THREE.Face3(face[0], face[1], face[2]));
      } else {
        var tf = this.faces[i];
        tf.a = face[0];
        tf.b = face[1];
        tf.c = face[2];
      }
    }
    this.faces.length = cells.length;
    this.elementsNeedUpdate = true;
  }

  update(geometryData) {
    this.updatePositions(geometryData.positions)
    this.updateCells(geometryData.cells)
  }
}