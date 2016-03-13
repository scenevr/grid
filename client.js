/* globals DOMParser, THREE, fetch */

'use strict';

const GRID_SIZE = 32;

class Grid {
  constructor () {
  }

  getRoot () {
    return document.querySelector('a-scene #grid');
  }

  loadScenes () {
    this.prune();

    this.getAdjacent().forEach((coord) => {
      if (this.isCoordLoaded(coord)) {
        return;
      }

      var url = `/scenes/${coord.x}/${coord.y}`;
      //  the above would normally redirect you to the scene.

      url = '/scenes/box.html?';

      fetch(url).then((response) => {
        return response.text();
      }).then((text) => {
        this.addScene(coord, text);
      });
    });
  }

  importNode (node) {
    return document.importNode(node, true);
  }

  isCoordLoaded (coord) {
    return !!this.getRoot().querySelector(`a-entity[grid='${this.coordValue(coord)}']`);
  }

  coordValue (coord) {
    return coord.toArray().join('x');
  }

  addScene (coord, text) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(text, 'text/html');
    var scene = doc.querySelector('a-scene');

    var pos = new THREE.Vector3(coord.x * GRID_SIZE, 0, coord.y * GRID_SIZE);
    var entity = document.createElement('a-entity');
    entity.setAttribute('position', pos);
    entity.setAttribute('grid', this.coordValue(coord));

    Array.prototype.forEach.call(scene.childNodes, (child) => {
      var clone = this.importNode(child);
      entity.appendChild(clone);
    });

    this.getRoot().appendChild(entity);
  }

  getCamera () {
    return document.querySelector('a-camera');
  }

  getPlayerCoord () {
    var v = new THREE.Vector3();
    v.copy(this.getCamera().getAttribute('position'));
    v.multiplyScalar(1 / GRID_SIZE).round();
    return new THREE.Vector2(v.x, v.z);
  }

  prune () {
    var adjacent = this.getAdjacent().map(this.coordValue);

    var redundant = Array.prototype.filter.call(this.getRoot().querySelectorAll('a-entity[grid]'), (child) => {
      return adjacent.indexOf(child.getAttribute('grid')) === -1;
    });

    redundant.forEach((node) => {
      this.getRoot().removeChild(node);
    });
  }

  getAdjacent () {
    var coord = this.getPlayerCoord();

    var results = [coord];

    results.push(coord.clone().add(new THREE.Vector2(-1, -1)));
    results.push(coord.clone().add(new THREE.Vector2(0, -1)));
    results.push(coord.clone().add(new THREE.Vector2(1, -1)));
    results.push(coord.clone().add(new THREE.Vector2(-1, 0)));
    results.push(coord.clone().add(new THREE.Vector2(1, 0)));
    results.push(coord.clone().add(new THREE.Vector2(-1, 1)));
    results.push(coord.clone().add(new THREE.Vector2(0, 1)));
    results.push(coord.clone().add(new THREE.Vector2(1, 1)));

    return results;
  }
}

var g = new Grid;
setInterval(() => {
  g.loadScenes();
}, 500);
