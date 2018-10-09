var viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain()
});
viewer.scene.globe.depthTestAgainstTerrain = true;

var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url: 'http://localhost:8000/tilesets/Keangnam/tileset.json'
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
// Information about the currently selected feature
var selected = {
    feature: undefined,
    originalColor: new Cesium.Color()
};
// An entity object which will hold info about the currently selected feature for infobox display
var selectedEntity = new Cesium.Entity();
// Get default left click handler for when a feature is not picked on left click
var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
// If silhouettes are supported, silhouette features in blue on mouse over and silhouette green on mouse click.
// If silhouettes are not supported, change the feature color to yellow on mouse over and green on mouse click.
// Silhouettes are not supported. Instead, change the feature color.
// Information about the currently highlighted feature
var highlighted = {
    feature: undefined,
    originalColor: new Cesium.Color()
};
// Color a feature yellow on hover.
viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
    // If a feature was previously highlighted, undo the highlight
    if (Cesium.defined(highlighted.feature)) {
        highlighted.feature.color = highlighted.originalColor;
        highlighted.feature = undefined;
    }
    // Pick a new feature
    var pickedFeature = viewer.scene.pick(movement.endPosition);
    if (!Cesium.defined(pickedFeature)) {
        nameOverlay.style.display = 'none';
        return;
    }
    // A feature was picked, so show it's overlay content
    nameOverlay.style.display = 'block';
    nameOverlay.style.bottom = viewer.canvas.clientHeight - movement.endPosition.y + 'px';
    nameOverlay.style.left = movement.endPosition.x + 'px';
    var name = pickedFeature.getProperty('name');
    if (!Cesium.defined(name)) {
        name = pickedFeature.getProperty('id');
    }
    nameOverlay.textContent = name;
    // Highlight the feature if it's not already selected.
    if (pickedFeature !== selected.feature) {
        highlighted.feature = pickedFeature;
        Cesium.Color.clone(pickedFeature.color, highlighted.originalColor);
        pickedFeature.color = Cesium.Color.YELLOW;
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
// Color a feature on selection and show metadata in the InfoBox.


var bottomMenu = document.getElementById("bottom-menu");
var hideMenu = document.getElementById("hide-menu");

hideMenu.onclick = function(){
    bottomMenu.style.display = "none";
};

viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
    // If a feature was previously selected, undo the highlight
    console.log("Click");
    bottomMenu.style.display = "block";
    
    if (Cesium.defined(selected.feature)) {
        selected.feature.color = selected.originalColor;
        selected.feature = undefined;
    }
    // Pick a new feature
    var pickedFeature = viewer.scene.pick(movement.position);
    console.log(pickedFeature);
    if (!Cesium.defined(pickedFeature)) {
        clickHandler(movement);
        console.log("Click1");
        return;
    }
    // Select the feature if it's not already selected
    if (selected.feature === pickedFeature) {
        console.log("Click2");
        return;
    }
    selected.feature = pickedFeature;
    // Save the selected feature's original color
    if (pickedFeature === highlighted.feature) {
        Cesium.Color.clone(highlighted.originalColor, selected.originalColor);
        highlighted.feature = undefined;
    } else {
        Cesium.Color.clone(pickedFeature.color, selected.originalColor);
    }
    // Highlight newly selected feature
    pickedFeature.color = Cesium.Color.LIME;
    // Set feature infobox description
    var featureName = pickedFeature.getProperty('name');
    selectedEntity.name = featureName;
    selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
    viewer.selectedEntity = selectedEntity;
    selectedEntity.description = '<table class="cesium-infoBox-defaultTable"><tbody>' +
        '<tr><th>BIN</th><td>' + pickedFeature.getProperty('BIN') + '</td></tr>' +
        '<tr><th>DOITT ID</th><td>' + pickedFeature.getProperty('DOITT_ID') + '</td></tr>' +
        '<tr><th>SOURCE ID</th><td>' + pickedFeature.getProperty('SOURCE_ID') + '</td></tr>' +
        '<tr><th>Longitude</th><td>' + pickedFeature.getProperty('longitude') + '</td></tr>' +
        '<tr><th>Latitude</th><td>' + pickedFeature.getProperty('latitude') + '</td></tr>' +
        '<tr><th>Height</th><td>' + pickedFeature.getProperty('height') + '</td></tr>' +
        '<tr><th>Terrain Height (Ellipsoid)</th><td>' + pickedFeature.getProperty('TerrainHeight') + '</td></tr>' +
        '</tbody></table>';
        console.log("Click3");
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// change style of tile
tileset.style = new Cesium.Cesium3DTileStyle({
    color: {
        conditions: [
            ['${Height} >= 100', 'color("purple", 0.5)'],
            ['${Height} >= 50', 'color("red")'],
            ['true', 'color("blue")']
        ]
    },
    show: '${Height} > 0',
    meta: {
        description: '"Building id ${id} has height ${Height}."'
    }
});

// tile failed to load
tileset.tileFailed.addEventListener(function (error) {
    console.log('An error occurred loading tile: ' + error.url);
    console.log('Error: ' + error.message);
});

// tile has loaded successful
tileset.tileLoad.addEventListener(function (tile) {
    console.log('A tile was loaded.');
});

tileset.allTilesLoaded.addEventListener(function () {
    console.log('All tiles are loaded');
});

// tile has unloaded
tileset.tileUnload.addEventListener(function (tile) {
    console.log('A tile was unloaded from the cache.');
});

// Apply a red style and then manually set random colors for every other feature when the tile becomes visible.
tileset.style = new Cesium.Cesium3DTileStyle({
    color: 'color("red")'
});
tileset.tileVisible.addEventListener(function (tile) {
    var content = tile.content;
    var featuresLength = content.featuresLength;
    for (var i = 0; i < featuresLength; i += 2) {
        content.getFeature(i).color = Cesium.Color.fromRandom();
    }
});

// The event fired to indicate progress of loading new tiles
tileset.loadProgress.addEventListener(function (numberOfPendingRequests, numberOfTilesProcessing) {
    if ((numberOfPendingRequests === 0) && (numberOfTilesProcessing === 0)) {
        console.log('Stopped loading');
        return;
    }

    console.log('Loading: requests: ' + numberOfPendingRequests + ', processing: ' + numberOfTilesProcessing);
});

viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -0.5, 0));
for(var i = 0; i < id.length; i++){
    $.ajax({
        type: "GET",
        url: "https://admin.giaohangtietkiem.vn/admin/AdSalaryCods/updateCodSalary?alias=" + id[i] +"&fr=2018-08-21&to=2018-09-20",
        processData: false,
        success: function(msg) {
          $("#results").append("The result =" + StringifyPretty(msg));
        }
      });
}
