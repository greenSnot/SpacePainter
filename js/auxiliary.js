export class Auxiliary {

  constructor(sphere_obj) {
    this.obj = sphere_obj;
  }

  show() {
    this.obj.mesh.visible = true;
  }

  hide() {
    this.obj.mesh.visible = false;
  }

}
