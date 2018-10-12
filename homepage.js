Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZDViMWY1ZS03MWY1LTQ0YjAtYWFiOC03MmUxNzdjZTIzN2YiLCJpZCI6MzY1OSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTUzODQ0NzYwM30.TyPQBHqnVWS_o-innaMJ-KVz4jfGlfx3V2gwAFQyupo';
var terrainProvider = Cesium.createWorldTerrain();

var viewer = new Cesium.Viewer('cesiumContainer', {
    infoBox: false,
    selectionIndicator: false,
    shadows: false,
    shouldAnimate: true,
    terrainProvider: terrainProvider
});
viewer.scene.globe.depthTestAgainstTerrain = true;
// viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
// var inspectorViewModel = viewer.cesium3DTilesInspector.viewModel;
// viewer.clock.currentTime = new Cesium.JulianDate(2457522.154792);
var scene = viewer.scene;
// var url = 'https://limitless-river-37913.herokuapp.com/tilesets/Keangnam/tileset_1.json';
var url = 'http://localhost:8080/tilesets/Keangnam/tileset_1.json';

var tileset;

var bottomMenu = document.getElementById("bottom-menu");
var hideMenu = document.getElementById("hide-menu");
var slideBottom = document.getElementById("items");
var toggleSlideBottom = document.getElementById("toggle-slide-bottom");
var btnFullScreen = document.getElementsByClassName("cesium-fullscreenButton");

var inputLatitude = document.getElementById("lat_input");
var inputLongtitude = document.getElementById("long_input");

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

toggleSlideBottom.onclick = function () {
    if (toggleSlideBottom.getAttribute('index') == 1) {
        toggleSlideBottom.setAttribute('index', 0);
        slideBottom.style.display = "none";
        bottomMenu.style.height = "auto";
        toggleSlideBottom.style.bottom = "0";
        toggleSlideBottom.style.right = "30px";
        toggleSlideBottom.innerHTML = '<span id="show-slide-bottom">Xem thêm ảnh<i class="fa fa-angle-double-up"></i></span>';
    } else {
        toggleSlideBottom.setAttribute('index', 1);
        slideBottom.style.display = "block";
        bottomMenu.style.height = "200px";
        toggleSlideBottom.style.bottom = "130px";
        toggleSlideBottom.style.right = "0";
        toggleSlideBottom.innerHTML = '<span id="show-slide-bottom">Ẩn<i class="fa fa-angle-double-down"></i></span>';
    }

};

// var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
//     url : 'http://localhost:8000//tilesets/Keangnam/tileset.json'
// }));
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    // document.getElementById("main").style.marginLeft = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    // document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = "white";
}

function loadTileset(url) {
    tileset = scene.primitives.add(new Cesium.Cesium3DTileset({
        url: url
    }));
    return tileset.readyPromise.then(function (tileset) {
        console.log(tileset);

        document.getElementById("transform_tile").addEventListener("click", function () {
            var currentLat = inputLatitude.value;
            var currentLong = inputLongtitude.value;

            if (currentLat != "" && currentLong != "") {
                // console.log('vao day a', "he" + currentLat + " " + currentLong);
                var lat = Math.PI * parseFloat(currentLat) / 180;
                var long = Math.PI * parseFloat(currentLong) / 180;

                var cartographic = Cesium.Cartographic.fromDegrees(long, lat);
                var positions = [cartographic];

                if (current.feature != null) {
                    if (current.feature.getProperty('id') == 0) {
                        var buildingsTransform = Cesium.Transforms.headingPitchRollToFixedFrame(Cesium.Cartesian3.fromRadians(long, lat, 0), new Cesium.HeadingPitchRoll());
                        tileset._root.children[0].transform = buildingsTransform;
                        // viewer.zoomTo(tileset);
                    } else if (current.feature.getProperty('id') == 10) {
                        var buildingsTransform = Cesium.Transforms.headingPitchRollToFixedFrame(Cesium.Cartesian3.fromRadians(long, lat, 0), new Cesium.HeadingPitchRoll());
                        tileset._root.children[1].transform = buildingsTransform;
                        // viewer.zoomTo(tileset);
                    } else if (current.feature.getProperty('id') == 20) {
                        var buildingsTransform = Cesium.Transforms.headingPitchRollToFixedFrame(Cesium.Cartesian3.fromRadians(long, lat, 0), new Cesium.HeadingPitchRoll());
                        tileset._root.children[2].transform = buildingsTransform;
                        // viewer.zoomTo(tileset);
                    } else {
                        console.log("Transforms failed! No tile was selected");
                    }
                } else {
                    console.log("Transforms failed! No tile was selected");
                }
            } else {
                console.log("Please fill all input field to transform tile");
            }
        });

        var boundingSphere = tileset.boundingSphere;
        viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0, -2.0, 0));
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    });
}

loadTileset(url);

var canvas = viewer.canvas;
var handler = new Cesium.ScreenSpaceEventHandler(canvas);
// An entity object which will hold info about the currently selected feature for infobox display
var selectedEntity = new Cesium.Entity();
var current = {
    feature: undefined,
    originalColor: new Cesium.Color()
};

var HIGHLIGHT_COLOR = new Cesium.Color(1.5, 1.0, 0.0, 0.4);

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
// tileset.style = new Cesium.Cesium3DTileStyle({
//     color: {
//         conditions: [
//             ['${Height} >= 100', 'color("purple", 0.5)'],
//             ['${Height} >= 50', 'color("red")'],
//             ['true', 'color("blue")']
//         ]
//     },
//     show: '${Height} > 0',
//     meta: {
//         description: '"Building id ${id} has height ${Height}."'
//     }
// });

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
// tileset.style = new Cesium.Cesium3DTileStyle({
//     color: {
//         conditions: [
//             ['${Height} >= 100', 'color("purple", 0.5)'],
//             ['${Height} >= 50', 'color("red")'],
//             ['true', 'color("blue")']
//         ]
//     },
//     show: '${Height} > 0',
//     meta: {
//         description: '"Building id ${id} has height ${Height}."'
//     }
// });

// Highlight feature on mouse over
viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
    // Pick a new feature
    var pickedFeature = viewer.scene.pick(movement.position);
    if (!Cesium.defined(pickedFeature)) {
        bottomMenu.style.display = "none";
        // A feature was picked, so show it's overlay content
        nameOverlay.style.display = 'none';
        if (current.feature != null) {
            current.feature.color = Cesium.Color.clone(current.originalColor, current.feature.color);
            current.feature = undefined;
        }

        // Click hiển thị sidebar
        $('.view-point').show();
        $('.view-default').hide();

        console.log("?????");
        clickHandler(movement);
        return;
    }

    if (current.feature != pickedFeature) {
        // if (current.feature != null) {
        //   current.feature.color = Cesium.Color.clone(current.originalColor, current.feature.color);
        //   current.feature = undefined;
        // }

        current.feature = pickedFeature;
        Cesium.Color.clone(pickedFeature.color, current.originalColor);
        // Highlight newly selected feature
        pickedFeature.color = Cesium.Color.clone(HIGHLIGHT_COLOR, pickedFeature.color);
        bottomMenu.style.display = "block";
        // A feature was picked, so show it's overlay content
        nameOverlay.style.display = 'block';
        nameOverlay.style.bottom = viewer.canvas.clientHeight - movement.position.y + 'px';
        nameOverlay.style.left = movement.position.x + 'px';

        var featureName = pickedFeature.getProperty('name');
        selectedEntity.name = featureName;
        selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
        viewer.selectedEntity = selectedEntity;

        printProperties(movement, current.feature);
        // Hiển thị slide slick
        const slider = $(".custom-slider-slick");
        slider
            .slick({
                slidesToShow: 3,
                slidesToScroll: 3,
                autoplay: false,
                variableWidth: true
                // autoplaySpeed: 2000,
            });

        //Implementing navigation of slides using mouse scroll
        slider.on('wheel', (function (e) {
            e.preventDefault();

            if (e.originalEvent.deltaY < 0) {
                $(this).slick('slickNext');
            } else {
                $(this).slick('slickPrev');
            }
        }));
        // END Hiển thị slide slick

    }
    // current.feature.color = Cesium.Color.clone(current.originalColor, current.feature.color);
    // current.feature = undefined;
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

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
    var divContent = '<table width="320" border="1"><tbody>';

    for (var i = 0; i < length; ++i) {
        var propertyName = propertyNames[i];
        // if (feature.getProperty('id') == 0) {
        //   nameOverlay.textContent = 'Keangnam Hanoi Landmark Tower là một khu phức hợp khách sạn-văn phòng-căn hộ-trung tâm thương mại tại đường Phạm Hùng, quận Nam Từ Liêm, Hà Nội được đầu tư xây dựng bởi tập đoàn Keangnam có trụ sở chính tại Dongdaemun-gu, Seoul của Hàn Quốc. Keangnam Landmark Tower được bàn giao từ 20 tháng 3 năm 2011 đến cuối tháng 12 năm 2011 đã có 780 hộ chuyển vào sinh sống [1]. Đây là toà nhà cao nhất Việt Nam từ năm 2010 đến tháng 2-2018.';
        // } else if (feature.getProperty('id') == 10){
        //   nameOverlay.textContent = 'Handico Tower là tòa nhà văn phòng hạng A nằm trên ngã tư đường Mễ Trì – Phạm Hùng (thuộc khu đô thị mới Mễ Trì, Quận Nam Từ Liêm, Hà Nội) – tuyến đường có kết nối giao thông quan trọng và đẹp nhất của Thủ đô. Nơi đây được quy hoạch là trung tâm tài chính, hành chính của Hà Nội do Tổng công ty Đầu tư và Phát triển nhà Hà Nội (HANDICO) làm chủ đầu tư. Tòa nhà Handico đã hoàn thành và đưa vào sử dụng năm 2015 được kỳ vọng sẽ tạo được một cú hích trong lĩnh vực cho thuê văn phòng trên địa bàn Thành phố Hà Nội.';
        // } else if (feature.getProperty('id') == 20) {
        //   nameOverlay.textContent = 'Tòa nhà CEO Tower nằm trên đường Phạm Hùng, cách trung tâm hội nghị Quốc Gia 200m, nằm giữa khu vực kinh tế sôi động và phát triển nhất khu vực thủ đô Hà Nội. Xung quanh tòa nhà CEO Tower là các dự án quy mô và phát triển: KĐTM Mỹ Đình, KĐTM Nam Trung Yên, KĐTM The Manor, Keangnam Landmark, Vinaconex 9… Có thể nói, tòa nhà là điểm nhấn kiến trúc ở cửa ngõ phía Tây Hà Nội, góp phần làm đẹp cảnh quan khu đô thị mới năng động và chiến lược quy hoạch tổng thể của Thủ đô.';
        // }
        divContent += '<tr><th>' + propertyName + '</th><td>' + feature.getProperty(propertyName) + '</td></tr>';

        console.log('  ' + propertyName + ': ' + feature.getProperty(propertyName));
    }

    divContent += '</tbody></table>';
    nameOverlay.innerHTML = divContent;
    // Evaluate feature description
    // console.log('Description : ' + tileset.style.meta.description.evaluate(feature));

    // Đẩy nút button xem full màn hình lên phía trên slide
}

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
tileset.loadProgress.addEventListener(function (numberOfPendingRequests, numberOfTilesProcessing) {
    if ((numberOfPendingRequests === 0) && (numberOfTilesProcessing === 0)) {
        console.log('Stopped loading');
        return;
    }

    console.log('Loading: requests: ' + numberOfPendingRequests + ', processing: ' + numberOfTilesProcessing);
});

viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -0.5, 0));

function viewDetailImg(value) {
    $('#value-iframe').attr('src', value);
    $('#info-img-detail').css('z-index', '9999');
    $('#info-img-detail').modal('show');
}
 
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    $('.widget-settings-shim').show();
}

function closeNav(id) {
    document.getElementById(id).style.width = "0";
    $('.widget-settings-shim').hide();
}

function toggleSidebar() {
    if ($(this).attr('index') == 0) {
        showSidebarLeft();
    } else {
        hideSidebarLeft();
    }
}

function showSidebarLeft() { 
    $('.block-slidebar-left').show();
    $(this).attr('index', 1);
    $('#parent-menuleft').css('width', '370px');
    $('#btn-caret-sidebar').html('<i class="fa fa-caret-left"></i>');
}

function hideSidebarLeft() { 
    $('.block-slidebar-left').hide();
    $(this).attr('index', 0);
    $('#parent-menuleft').css('width', 0);
    $('#btn-caret-sidebar').html('<i class="fa fa-caret-right"></i>');
}
// Click vào màn hình -> ẩn menu thứ 2 bên trái
$('.widget-settings-shim').click(function () {
    closeNav("mySidenav");
});

// Kéo xem nhanh menu bottom trong mobile
$("#toggle-menu-bottom-mobile").click(function(){
    $("#content-toggle-menu-bottom").slideToggle();
});

// Hiển thị lại khung search mặc định bên bên trái khi click vào xóa text ở khung menu ảnh
function removeTextSearch() {
    $('.view-point').hide();
    $('.view-default').show();
}