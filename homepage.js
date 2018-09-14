var viewer = new Cesium.Viewer('cesiumContainer');

var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url : 'https://limitless-river-37913.herokuapp.com/tilesets/Keangnam/tileset.json'
}));

viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -0.5, 0));
