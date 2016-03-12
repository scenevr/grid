/* globals DOMParser, THREE, fetch */

const GRID_SIZE = 16;

class Grid {
  constructor () {
  }

  getRoot () {
    return document.querySelector('a-scene #grid');
  }

  loadScenes () {
    this.getAdjacent().forEach((coord) => {
      if (this.isCoordLoaded(coord)) {
        return;
      }

      var url = `/scenes/${coord.x}/${coord.y}`;
      //  the above would normally redirect you to the scene.

      url = '/scenes/box.html';

      console.log(url);

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

  getAdjacent () {
    var coord = new THREE.Vector2(0, 0);
    
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
