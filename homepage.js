var viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain()
});
viewer.scene.globe.depthTestAgainstTerrain = true;

var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url : 'http://localhost:8000/tilesets/Keangnam/tileset.json'
}));

// HTML overlay for showing feature name on mouseover
var nameOverlay = document.createElement('div');
viewer.container.appendChild(nameOverlay);
nameOverlay.className = 'backdrop';
nameOverlay.style.display = 'none';
nameOverlay.style.position = 'absolute';
nameOverlay.style.bottom = '0';
nameOverlay.style.left = '0';
nameOverlay.style['pointer-events'] = 'none';
nameOverlay.style.padding = '4px';
nameOverlay.style.backgroundColor = 'black';


var selected = {
    feature: undefined,
    originalColor: new Cesium.Color()
};


var highlighted = {
    feature: undefined,
    originalColor: new Cesium.Color()
};


var selectedEntity = new Cesium.Entity();


viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {


    if (Cesium.defined(highlighted.feature)) {
        highlighted.feature.color = highlighted.originalColor;
        highlighted.feature = undefined;
    }


    var pickedFeature = viewer.scene.pick(movement.endPosition);
    if (!Cesium.defined(pickedFeature)) {
        nameOverlay.style.display = 'none';
        return;
    }




    if (pickedFeature !== selected.feature) {
        highlighted.feature = pickedFeature;
        Cesium.Color.clone(pickedFeature.color, highlighted.originalColor);
        pickedFeature.color = Cesium.Color.BLUE;
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {

    if (Cesium.defined(selected.feature)) {
        selected.feature.color = selected.originalColor;
        selected.feature = undefined;
    }


    var pickedFeature = viewer.scene.pick(movement.position);
    if (!Cesium.defined(pickedFeature)) {
        clickHandler(movement);
        return;
    }


    if (selected.feature === pickedFeature) {
        return;
    }
    selected.feature = pickedFeature;


    if (pickedFeature === highlighted.feature) {
        Cesium.Color.clone(highlighted.originalColor, selected.originalColor);
        highlighted.feature = undefined;
    } else {
        Cesium.Color.clone(pickedFeature.color, selected.originalColor);
    }


    pickedFeature.color = Cesium.Color.RED;


    var featureName = pickedFeature.getProperty('name');
    selectedEntity.name = featureName;
    selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
    viewer.selectedEntity = selectedEntity;
    selectedEntity.description = '<table class="cesium-infoBox-defaultTable"><tbody>' +
                                 '<tr><th>AD</th><td>' + pickedFeature.getProperty('AD') + '</td></tr>' +
                                 '<tr><th>test</th><td>' + pickedFeature.getProperty('DOITT_ID') + '</td></tr>' +
                                 '<tr><th>test</th><td>' + pickedFeature.getProperty('SOURCE_ID') + '</td></tr>' +
                                 '</tbody></table>';
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// change style of tile
tileset.style = new Cesium.Cesium3DTileStyle({
   color : {
       conditions : [
           ['${Height} >= 100', 'color("purple", 0.5)'],
           ['${Height} >= 50', 'color("red")'],
           ['true', 'color("blue")']
       ]
   },
   show : '${Height} > 0',
   meta : {
       description : '"Building id ${id} has height ${Height}."'
   }
});

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
tileset.style = new Cesium.Cesium3DTileStyle({
    color : 'color("red")'
});
tileset.tileVisible.addEventListener(function(tile) {
    var content = tile.content;
    var featuresLength = content.featuresLength;
    for (var i = 0; i < featuresLength; i+=2) {
        content.getFeature(i).color = Cesium.Color.fromRandom();
    }
});

// The event fired to indicate progress of loading new tiles
tileset.loadProgress.addEventListener(function(numberOfPendingRequests, numberOfTilesProcessing) {
    if ((numberOfPendingRequests === 0) && (numberOfTilesProcessing === 0)) {
        console.log('Stopped loading');
        return;
    }

    console.log('Loading: requests: ' + numberOfPendingRequests + ', processing: ' + numberOfTilesProcessing);
});

viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -0.5, 0));
