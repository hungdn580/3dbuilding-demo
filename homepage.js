var viewer = new Cesium.Viewer('cesiumContainer', {
  infoBox : false,
  selectionIndicator : false,
  shadows : true,
  shouldAnimate : true
});
viewer.scene.globe.depthTestAgainstTerrain = true;
// viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
// var inspectorViewModel = viewer.cesium3DTilesInspector.viewModel;
// viewer.clock.currentTime = new Cesium.JulianDate(2457522.154792);
var scene = viewer.scene;
var url = 'https://limitless-river-37913.herokuapp.com/tilesets/Keangnam/tileset_1.json';
var tileset;

var bottomMenu = document.getElementById("bottom-menu");
var hideMenu = document.getElementById("hide-menu");

hideMenu.onclick = function(){
    bottomMenu.style.display = "none";
};

// var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
//     url : 'http://localhost:8000//tilesets/Keangnam/tileset.json'
// }));

function loadTileset(url) {
    tileset = scene.primitives.add(new Cesium.Cesium3DTileset({
        url : url
    }));
    return tileset.readyPromise.then(function(tileset) {
        var boundingSphere = tileset.boundingSphere;
        viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0, -2.0, 0));
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    });
}

loadTileset(url);

var canvas = viewer.canvas;
var handler = new Cesium.ScreenSpaceEventHandler(canvas);

var current = {
    feature : undefined,
    originalColor : new Cesium.Color()
};

var HIGHLIGHT_COLOR = new Cesium.Color(1.5, 1.0, 0.0, 0.4);

// Highlight feature on mouse over
handler.setInputAction(function(movement) {
    var pickedFeature = scene.pick(movement.endPosition);
    if (Cesium.defined(current.feature) && (current.feature !== pickedFeature)) {
        // Restore original color to feature that is no longer selected
        // This assignment is necessary to work with the set property
        current.feature.color = Cesium.Color.clone(current.originalColor, current.feature.color);
        current.feature = undefined;
    } else {
      // console.log("Feature is not defined");
    }
    if (Cesium.defined(pickedFeature) && (pickedFeature !== current.feature)) {
        current.feature = pickedFeature;
        Cesium.Color.clone(pickedFeature.color, current.originalColor);
        // Highlight newly selected feature
        pickedFeature.color = Cesium.Color.clone(HIGHLIGHT_COLOR, pickedFeature.color);
        bottomMenu.style.display = "block";

        printProperties(movement, current.feature);
    } else {
      // console.log("Feature is not defined");
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// change style of tile
// tileset.style = new Cesium.Cesium3DTileStyle({
//    color : {
//        conditions : [
//            ['${Height} >= 200', 'color("purple", 0.5)'],
//            ['${Height} >= 10', 'color("red")'],
//            ['true', 'color("blue")']
//        ]
//    },
//    show : '${Height} > 0',
//    meta : {
//        description : '"Building id ${id} has height ${Height}."'
//    }
// });

function printProperties(movement, feature) {
    console.log('Properties:');
    var propertyNames = feature.getPropertyNames();
    var length = propertyNames.length;
    for (var i = 0; i < length; ++i) {
        var propertyName = propertyNames[i];
        console.log('  ' + propertyName + ': ' + feature.getProperty(propertyName));
    }
    // Evaluate feature description
    console.log('Description : ' + tileset.style.meta.description.evaluate(feature));
}

// tile failed to load
tileset.tileFailed.addEventListener(function(error) {
    console.log('An error occurred loading tile: ' + error.url);
    console.log('Error: ' + error.message);
});

// tile has loaded successful
tileset.tileLoad.addEventListener(function(tile) {
    console.log('A tile was loaded.');
});

tileset.allTilesLoaded.addEventListener(function() {
    console.log('All tiles are loaded');
});

// tile has unloaded
tileset.tileUnload.addEventListener(function(tile) {
    console.log('A tile was unloaded from the cache.');
});

// Apply a red style and then manually set random colors for every other feature when the tile becomes visible.
// tileset.style = new Cesium.Cesium3DTileStyle({
//     color : 'color("red")'
// });
// tileset.tileVisible.addEventListener(function(tile) {
//     var content = tile.content;
//     var featuresLength = content.featuresLength;
//     for (var i = 0; i < featuresLength; i+=2) {
//         content.getFeature(i).color = Cesium.Color.fromRandom();
//     }
// });

// The event fired to indicate progress of loading new tiles
tileset.loadProgress.addEventListener(function(numberOfPendingRequests, numberOfTilesProcessing) {
    if ((numberOfPendingRequests === 0) && (numberOfTilesProcessing === 0)) {
        console.log('Stopped loading');
        return;
    }

    console.log('Loading: requests: ' + numberOfPendingRequests + ', processing: ' + numberOfTilesProcessing);
});

viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -0.5, 0));
