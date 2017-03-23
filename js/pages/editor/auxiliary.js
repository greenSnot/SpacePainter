var auxiliaries = {};

function init(tri, sph) {
  auxiliaries.sphere = sph;
  auxiliaries.triangle = tri;
}

function show(type) {
  type = type || 'sphere';
  auxiliaries[type].mesh.visible = true;
}

function hide(type) {
  type = type || 'sphere';
  auxiliaries[type].mesh.visible = false;
}

module.exports = {
  init: init,
  show: show,
  hide: hide,
};
