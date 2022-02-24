let eventSource = "";
let view;
let map;
let chart;
let polygonArea = 0.0;
let language;

const layers = [];
let localizationLanguages = {
    'en' : {
        'No polygon' : 'Polygon is not selected.',
        'Polygon too small' : `The selected polygon is less than the minimum standard of 25 km² now : ${polygonArea}km²`,
        'Retry alert' : 'Please try again.',
        'success' : 'The product has been saved in the chart.',
        'Product condition error' : 'The period or size of the product is too small.',
        'no map data' : 'Map data data is insufficient. Please extend the time or size',
        'Draw Polygon' : 'Draw Polygons',
        'Stop Draw Polygon' : 'Stop Draw Polygons',
        'Change Map Style' : 'Change Map Style',
        'Add To Cart' : 'Add the Product to the chart'
    },
    'ko' : {
        'No polygon' : '폴리곤이 선택되지 않았습니다.',
        'Polygon too small' : `선택된 폴리곤이 최소 규격인 25km²보다 작습니다. 현재 : ${polygonArea}km²`,
        'Retry alert' : '다시 시도해주세요.',
        'success' : '상품이 차트에 저장되었습니다.',
        'Product condition error' : '상품의 기간 혹은 크기가 너무 작습니다.',
        'no map data' : '맵 데이터 자료가 부족합니다. 기간 혹은 크기를 늘려주세요.',
        'Draw Polygon' : '폴리곤 그리기',
        'Stop Draw Polygon' : '폴리곤 그리기 해제',
        'Change Map Style' : '맵 스타일 변경',
        'Add To Cart' : '상품을 차트에 추가'
    },
    'vi' : {
        'No polygon' : 'Đa giác không được chọn.',
        'Polygon too small' : `Đa giác được chọn nhỏ hơn tiêu chuẩn tối thiểu là 25 km² giờ : ${polygonArea}km²`,
        'Retry alert' : 'Xin vui lòng thử lại',
        'success' : 'Sản phẩm đã được lưu trong biểu đồ.',
        'Product condition error' : 'Khoảng thời gian hoặc kích thước của sản phẩm quá nhỏ.',
        'no map data' : 'Dữ liệu dữ liệu bản đồ không đủ. Vui lòng kéo dài thời gian hoặc kích thước',
        'Draw Polygon' : 'Vẽ đa giác',
        'Stop Draw Polygon' : 'Dừng vẽ đa giác',
        'Change Map Style' : 'Thay đổi kiểu bản đồ',
        'Add To Cart' : 'Thêm Sản phẩm vào biểu đồ'
    }
}

const openStreetMapLayerGenerator = () => {
    return new ol.layer.Tile({
        title: 'open_street',
        layerId: 'base-Map',
        preload: Infinity,
        visible: true,
        type: 'base',
        zIndex: 1,
        source: new ol.source.OSM()
    })
}

const bingMapLayerGenerator = () => {
    return new ol.layer.Tile({
        title: 'bing_map',
        layerId: 'bingMapLayer',
        visible: true,
        preload: Infinity,
        type: 'base',
        zIndex: 1,
        source: new ol.source.BingMaps({
            //TODO: change api key
            key: 'AkIVvZUu_AovjO1Fg_LnRvfVIGIlTbwc3-LwWeDEBZqGFzfasCT1TvVfWyWTTjXM',
            imagerySet: 'AerialWithLabelsOnDemand',
            maxZoom: 18,
            minZoom: 3
        })
    });
}


class customControl extends ol.control.Control {
    /**
     * @param {Object} [opt_options] Control options.
     */
    constructor(opt_options) {
        const options = opt_options || {};
        const element = document.createElement('div');
        element.className = 'custom-map-control ol-unselectable ol-control';
        element.id = 'customMapControl';

        const mapDrawButton = document.createElement('button');
        mapDrawButton.className = 'custom-map-button'
        mapDrawButton.id = 'drawPolygon'
        const mapDrawITag = document.createElement('i');
        mapDrawITag.className = 'fas fa-draw-polygon'
        const mapDrawTooltip = document.createElement('span');
        mapDrawTooltip.className = 'tool-tip-text';
        mapDrawTooltip.textContent = localizationLanguages[language]['Draw Polygon'];
        mapDrawButton.appendChild(mapDrawITag);
        mapDrawButton.appendChild(mapDrawTooltip);

        const stopDrawButton = document.createElement('button');
        stopDrawButton.className = 'custom-map-button'
        stopDrawButton.id = 'stopDrawPolygon'
        const stopDrawITag = document.createElement('i');
        stopDrawITag.className = 'far fa-hand-paper'
        const stopDrawTooltip = document.createElement('span');
        stopDrawTooltip.className = 'tool-tip-text';
        stopDrawTooltip.textContent = localizationLanguages[language]['Stop Draw Polygon'];
        stopDrawButton.appendChild(stopDrawITag);
        stopDrawButton.appendChild(stopDrawTooltip);

        const changeMapButton = document.createElement('button');
        changeMapButton.id = 'changeMapButton'
        changeMapButton.value = 'open_street'
        changeMapButton.className = 'custom-map-button'
        const changeMapITag = document.createElement('i');
        changeMapITag.className = 'fas fa-layer-group'
        const changeMapTooltip = document.createElement('span');
        changeMapTooltip.className = 'tool-tip-text';
        changeMapTooltip.textContent = localizationLanguages[language]['Change Map Style'];
        changeMapButton.appendChild(changeMapITag);
        changeMapButton.appendChild(changeMapTooltip);

        const dateInput = document.createElement('input');
        dateInput.id = 'dateRange';
        dateInput.name = 'dateRange';
        dateInput.type = 'text';
        dateInput.className =  'dateRangeStyle';

        const addCartButton = document.createElement('button');
        addCartButton.id = 'calculatePolygon'
        addCartButton.className = 'custom-map-button'
        const addCartITag = document.createElement('i');
        addCartITag.className = 'fas fa-search'
        const addCartButtonTooltip = document.createElement('span');
        addCartButtonTooltip.className = 'tool-tip-text';
        addCartButtonTooltip.textContent = localizationLanguages[language]['Add To Cart'];
        addCartButton.appendChild(addCartITag);
        addCartButton.appendChild(addCartButtonTooltip);

        element.appendChild(mapDrawButton);
        element.appendChild(stopDrawButton);
        element.appendChild(changeMapButton);
        element.appendChild(dateInput);
        element.appendChild(addCartButton);

        super({
            element: element,
            target: options.target,
        });

        mapDrawButton.addEventListener('click', this.handleMapPolygon.bind(this), false);
        stopDrawButton.addEventListener('click', this.handleMouseControl.bind(this), false);
        changeMapButton.addEventListener('click', this.handleChangeMapStyle.bind(this), false);
        addCartButton.addEventListener('click', this.handleCalculatePolygon.bind(this), false);
    }

    handleMapPolygon() {
        const vectorLayer = findOneLayerFromLayers('vectorLayer');
        createInteraction( vectorLayer );
    }

    handleMouseControl() {
        removeDuplicateInteractionById('drawPolygon')
    }

    handleChangeMapStyle() {
        const style = document.getElementById('changeMapButton').value;
        for (const layerIndex in layers) {

            if (layers[layerIndex].A.type === 'base') {
                const flag = style === layers[layerIndex].A.title;
                map.removeLayer(layers[layerIndex]);
                layers[layerIndex].setVisible(flag);
                map.addLayer(layers[layerIndex]);

            }
        }
        if (style !== 'bing_map' ) {
            document.getElementById('changeMapButton').value = 'bing_map';
        } else {
            document.getElementById('changeMapButton').value = 'open_street';
        }
    }
    handleCalculatePolygon() {
        const isLogin = document.getElementById("isLogin").innerText;
        if (isLogin === 'false') {
            return document.location.href = '/login';
        }
        const vectorLayer = findOneLayerFromLayers('vectorLayer');
        const isPolygonResult = isPolygonAvailable(vectorLayer);
        if ( isPolygonResult !== 'available') {
            alertify.set('notifier','position', 'top-center');

            alertify.alert('', localizationLanguages[language][isPolygonResult], function() {
                alertify.error(localizationLanguages[language]['Retry alert']);
            });

            return;
        }

        const lastFeature = getLastFeature(vectorLayer);
        const coordinates = lastFeature.getGeometry().getCoordinates()[0];
        let strCoordinates = ''

        for ( const index in coordinates ) {
            const transformedData = ol.proj.transform(coordinates[index], 'EPSG:3857', 'EPSG:4326')
            strCoordinates = strCoordinates.concat(`${transformedData[0]}comma${transformedData[1]}and`)
        }

        const dates = $('#dateRange').data('daterangepicker');
        const startDate = dates.startDate.format('YYYY-MM-DD');
        const endDate = dates.endDate.format('YYYY-MM-DD');

        $.ajax({
            beforeSend: function(xhr){
                xhr.setRequestHeader("ajax", "true");
                xhr.setRequestHeader(csrfHeaderAjax, csrfTokenAjax);
                $(".mapSpinner").show();
            },
            url: '/registerDataToCookie',
            type: 'POST',
            data: {'startDate': startDate, 'endDate': endDate, 'strCoordinates': strCoordinates },
            success: function (data) {
                if (data === 'success') {
                    alertify.set('notifier','position', 'top-center');
                    alertify.success(localizationLanguages[language][data]);
                } else {
                    alertify.set('notifier','position', 'top-center');
                    alertify.alert('', localizationLanguages[language][data], function() {
                        alertify.error(localizationLanguages[language]['Product condition error']);
                    });
                }
                $(".mapSpinner").hide();
            },
            error: function () {
                $(".mapSpinner").hide();
                alertify.error(localizationLanguages[language]['Retry alert']);
            }
        });
    }
}

const findOneLayerFromLayers = (layerId) => {
    let resultLayer;
    map.getLayers().forEach( layer => {
        if ( layer.get('layerId') === layerId) {
            resultLayer = layer;
            return false;
        }
    });

    if (resultLayer === undefined) {
        resultLayer = vectorLayerGenerator();
        map.addLayer(resultLayer);
    }

    return resultLayer;
}

const vectorLayerGenerator = () => {
    const vectorSource = new ol.source.Vector({wrapX: false});
    vectorSource.set('id', 'polygon');

    return new ol.layer.Vector({
        layerId: 'vectorLayer',
        source: vectorSource,
        zIndex: 5,
    });
};

const vworldBaseLayersGenerator = () => {
    const baseLayerNames = ['Base', 'gray', 'Satellite', 'midnight'];
    let baseLayers = [];

    for (const baseLayerIdx in baseLayerNames) {
        const baseLayerName = baseLayerNames[baseLayerIdx];
        let fileExtension = '.png';

        if (baseLayerName === 'Satellite') {
            fileExtension = '.jpeg'
        }

        baseLayers.push(new ol.layer.Tile({
                title: 'vworld_'.concat(baseLayerName),
                layerId: 'vworld-'.concat(baseLayerName, '-Map'),
                visible: true,
                type: 'base',
                zIndex: 1,
                source: new ol.source.XYZ({
                    url: 'http://api.vworld.kr/req/wmts/1.0.0/'.concat('948B76E8-20D3-37A7-B720-50F1C17D73E0', "/", baseLayerName, "/{z}/{y}/{x}", fileExtension),
                    crossOrigin: 'anonymous'
                })
            })
        );
        baseLayers[baseLayerIdx].set("name", baseLayers[baseLayerIdx].A.title);
    }

    return baseLayers;
}

const mapGenerator = (layers) => {
    const map = new ol.Map({
        controls: ol.control.defaults()
            .extend([new customControl()]),
        target: 'map',
        layers: layers,
        view: new ol.View({
            center: ol.proj.transform([106.62966, 10.8231], 'EPSG:4326', 'EPSG:3857'),
            zoom: 5,
            extent: ol.proj.transformExtent([50.0, -15, 134.0, 45.0], 'EPSG:4326', 'EPSG:3857'),
            maxZoom: 18,
            minZoom: 1
        })
    });
    view = map.getView();
    return map;
}

const staticLayerGenerator = (geoServerLayerId) => {
    const static_source_layer = new ol.source.ImageWMS({
        url: geoserverUrl + 'geoserver/landslidencam/wms',
        params: {
            'FORMAT': 'image/png',
            'VERSION': '1.1.0',
            crossOrigin: 'anonymous',
            'LAYERS': 'landslidencam:'.concat(geoServerLayerId),
            'propertyName': 'id'
        },
        serverType: 'geoserver',
        projection: 'EPSG:3857'
    });

    let static_layer = new ol.layer.Image({
        source: static_source_layer,
        layerId: 'static_layer',
        title: geoServerLayerId,
        visible: true,
        zIndex: 2
    });

    eventSource = static_source_layer;
    static_layer.set('changeStaticLayer', geoServerLayerId);

    return static_layer;
}

const getLandSubsidenceLayer = (geoWorkspaceId, geoLayerId) => {
    const land_subsidence_source_layer = new ol.source.ImageWMS({
        url: geoserverUrl + 'geoserver/'.concat(geoWorkspaceId).concat('/wms'),
        params: {
            'FORMAT': 'image/png',
            'VERSION': '1.1.0',
            crossOrigin: 'anonymous',
            'LAYERS': geoWorkspaceId.concat(':').concat(geoLayerId),
            'propertyName': 'id'
        },
        serverType: 'geoserver',
        projection: 'EPSG:3857'
    });

    let land_subsidence_layer = new ol.layer.Image({
        source: land_subsidence_source_layer,
        layerId: 'subsidence_layer',
        title: geoLayerId,
        visible: true,
        zIndex: 2
    });

    eventSource = land_subsidence_source_layer;
    land_subsidence_layer.set('subsidence_layer', geoLayerId);

    return land_subsidence_layer;
}

const getLandSubsidenceVectorLayer = (geoWorkspaceId, geoLayerId) => {
    const land_subsidence_source_layer = new ol.source.TileJSON({
        // params: {
        //     'FORMAT': 'geojson',
        //     'VERSION': '1.1.0',
        //     crossOrigin: 'anonymous',
        //     'LAYERS': geoWorkspaceId.concat(':').concat(geoLayerId),
        // },
        url: 'http://192.168.100.7:8083/geoserver/gwc/service/tms/1.0.0/rest-api-test%3Asubsidence_test2@EPSG%3A4326@png'
    });

    let land_subsidence_layer = new ol.layer.Vector({
        source: land_subsidence_source_layer,
        layerId: 'subsidence_layer',
        title: geoLayerId,
        visible: true,
        zIndex: 2
    });

    eventSource = land_subsidence_source_layer;
    land_subsidence_layer.set('subsidence_layer', geoLayerId);

    return land_subsidence_layer;
}

const updateLayerByZoomLevel = (movedZoom) => {
    const layers = map.getLayers();
    const staticLayerStr = 'static_layer';
    const layerNameExchanger = {'korea_sigungu': 'korea_dong', 'korea_dong': 'korea_sigungu'}
    layers.forEach(layer => {
        const geoServerLayerId = layerNameExchanger[layer.get('changeStaticLayer')];
        const isNotNeedToUpdate = geoServerLayerId === "korea_dong" && movedZoom < 10 || geoServerLayerId === "korea_sigungu" && movedZoom > 9;
        const isNotStaticLayer = typeof layer === "undefined" || layer.get('name') !== staticLayerStr;

        if (isNotNeedToUpdate || isNotStaticLayer) {
            return;
        }

        if (layer.get("layerId") === staticLayerStr) {
            map.removeLayer(layer);
        }

        const static_layer = staticLayerGenerator(geoServerLayerId);
        static_layer.set('changeStaticLayer', geoServerLayerId);
        // resetMapEvent(eventName, static_layer, map);
        // addLayerToMap(static_layer, staticLayerStr, map);
    })
}

const addLayerToMap = (layer, layerId) => {
    layer.set('name', layerId);
    map.addLayer(layer);
}

const resetMapEvent = (eventName) => {
    map.un(eventName, singleClickCallBackFun);
    map.on(eventName, singleClickCallBackFun);
}
function setMapClickEvent(inputSource) {
    eventSource = inputSource;
    map.on('singleclick', singleClickCallBackFun);
}

const singleClickCallBackFun = (event) => {
    const viewResolution = view.getResolution();
    const url = eventSource.getSource().getFeatureInfoUrl(
        event.coordinate,
        viewResolution,
        'EPSG:3857',
        {
            'FORMAT':'application/json',
            'info_format':'application/json',
            'propertyName':'vel,date,lon,lat,value',
            'feature_count':'100',
        }
    );

    document.getElementById("chartStyleStorage").classList.remove("white-background");

    if (url) {
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                const format = new ol.format.GeoJSON({ featureProjection: 'EPSG:3857' });
                const properties = format.readFeatures(responseJson);
                if (Array.isArray(properties) && properties.length) {
                    let chartTotalDate = [];
                    let chartTotalData = [];
                    const selectedPointsVelocity = properties[0].get('vel');
                    for (const index in properties) {
                        if (selectedPointsVelocity === properties[index].get('vel')) {
                            chartTotalDate.push(properties[index].get('date'));
                            chartTotalData.push(properties[index].get('value'));
                        }
                    }
                    removeData(chart);
                    addDataAndLabelsToChart(chart, chartTotalDate, chartTotalData);
                    document.getElementById("chartStyleStorage").classList.add("white-background");
                }
            });
    }
}

const addDataAndLabelsToChart = (chart, chartTotalDate, chartTotalData) => {
    chart.data.labels = chartTotalDate;
    for (const dataIndex in chartTotalData) {
        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(chartTotalData[dataIndex]);
        });
    }
    chart.update();
}

const removeData = (chart) => {
    chart.data.labels = '';
    chart.data.datasets.forEach((dataset) => {
        dataset.data = '';
    });
    chart.update();
}

const generateChart = (ctx) => {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: 'Land Subsidence',
            datasets: [{
                label: 'Land Subsidence',
                borderColor:
                    'rgba(133, 211, 244, 1)',
                borderWidth: 1,
                fill: 'end'
            }]
        },
        options: {
            responsive: true,
            responsiveAnimationDuration: 1000,
            animation: {
                easeInOutBack: function (x, t, b, c, d, s) {
                    if (s === undefined) s = 1.70158;
                    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
                    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
                }
            },
            scales: {
                xAxes: [{
                    ticks: {
                        userCallback: function (value) {
                            if( value === undefined || value === null ) { return 'empty'; }
                            return `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`;
                        }
                    }
                }],
                yAxes: [{
                    ticks: {
                        userCallback: function (value) {
                            return value+" mm";
                        }
                    }
                }]
            }
        }
    });
}

const moveZoomLevel = () => {
    let zoom = map.getView().getZoom();
    let center = map.getView().getCenter();

    map.on('moveend', () => {
        const movedZoom = map.getView().getZoom();
        const movedCenter = map.getView().getCenter();
        if (zoom !== movedZoom) {
            // updateLayerByZoomLevel(movedZoom)
            zoom = movedZoom;
        }
        if (center !== movedCenter) {
            center = movedCenter;
        }
    });
}

const removePreviousDraw =  ()  => {
    const vectorLayer = findOneLayerFromLayers('vectorLayer');
    const lastFeature = getLastFeature(vectorLayer);
    let vectorSource = vectorLayer.getSource();
    vectorSource.removeFeature(lastFeature);
}

const createInteraction = (vectorLayer) => {
    const value = 'Circle';
    const draw = new ol.interaction.Draw({
        source: vectorLayer.getSource(),
        type: value,
        geometryFunction: ol.interaction.Draw.createBox(),
    });
    draw.on('drawstart', removePreviousDraw);
    draw.set('id', 'drawPolygon');

    removeDuplicateInteractionById('drawPolygon');
    map.addInteraction(draw);
}

const removeDuplicateInteractionById = (value) => {
    map.getInteractions().forEach(function (interaction) {
        if(interaction.get('id') === value) {
            removeInteraction(interaction);
        }
    });
}

const removeInteraction = (interaction) => {
    map.removeInteraction(interaction);
}

const isPolygonAvailable = (vectorLayer) => {
    const lastFeature = getLastFeature(vectorLayer);

    if (lastFeature === undefined) {
        return 'No polygon';
    }

    const getAreaByMeter = lastFeature.getGeometry().getArea();
    const getAreaByKM = getAreaByMeter / 1000 / 1000;
    polygonArea = roundPoint(getAreaByKM);

    if ( getAreaByKM < 25 ) {
        const originAlert = localizationLanguages[language]['Polygon too small'].split(":")[0];
        localizationLanguages[language]['Polygon too small'] = originAlert.concat(`: ${polygonArea}km2`);
        return 'Polygon too small';
    }

    return 'available';
}

const getLastFeature = (vectorLayer) => {
    const vectorSource =  vectorLayer.getSource();
    const features = vectorSource.getFeatures();
    return features[features.length - 1];
}

const generatePolygonCookie = (name, value) => { document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value); }

const deletePolygonCookie = (name) => {
    let date = new Date();
    date.setDate(date.getDate() - 100);
    document.cookie = `${name}=;Expires=${date.toUTCString()}`;
}

const selected = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#00c9f2',
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2,
    }),
});

function selectStyle(feature) {
    const color = feature.get('COLOR') || '#00c9f2';
    selected.getFill().setColor(color);
    return selected;
}

// select interaction working on "singleclick"
const selectSingleClick = new ol.interaction.Select({
    condition: ol.events.condition.click,
    style: selectStyle});

// select interaction working on "pointermove"
const selectPointerMove = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove,
    style: selectStyle,
});

const roundPoint = (area) => {
    const m = Number((Math.abs(area) * 100).toPrecision(15));
    return Math.round(m) / 100 * Math.sign(area);
}

function vwmap(){
    const controlDensity = 'EMPTY';
    const interactionDensity = 'EMPTY';
    var mapOptions = new vw.MapOptions(
        vw.BasemapType.GRAPHIC,
        "",
        vw.DensityType.EMPTY,
        vw.DensityType.EMPTY,
        false,
        new vw.CameraPosition(
            new vw.CoordZ(127.425, 38.196, 13487000),
            new vw.Direction(-90, 0, 0)
        ),
        new vw.CameraPosition(
            new vw.CoordZ(127.425, 38.196, 1548700),
            new vw.Direction(0, -90, 0)
        )
    );
    var map3d = new vw.Map( "vmap" , mapOptions );
}

//
//
// var worldTerrain = Cesium.createWorldTerrain({
//     requestWaterMask: true,
//     requestVertexNormals: true,
// });
//
// var viewer = new Cesium.Viewer("cesiumContainer", {
//     terrainProvider: worldTerrain,
// });
//
// // set lighting to true
// viewer.scene.globe.enableLighting = true;
//
// // setup alternative terrain providers
// var ellipsoidProvider = new Cesium.EllipsoidTerrainProvider();
//
// var vrTheWorldProvider = new Cesium.VRTheWorldTerrainProvider({
//     url: "http://www.vr-theworld.com/vr-theworld/tiles1.0.0/73/",
//     credit: "Terrain data courtesy VT MÄK",
// });
//
// var arcGisProvider = new Cesium.ArcGISTiledElevationTerrainProvider({
//     url:
//         "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
// });
//
// // Sine wave
// var customHeightmapWidth = 32;
// var customHeightmapHeight = 32;
// var customHeightmapProvider = new Cesium.CustomHeightmapTerrainProvider(
//     {
//         width: customHeightmapWidth,
//         height: customHeightmapHeight,
//         callback: function (x, y, level) {
//             var width = customHeightmapWidth;
//             var height = customHeightmapHeight;
//             var buffer = new Float32Array(width * height);
//
//             for (var yy = 0; yy < height; yy++) {
//                 for (var xx = 0; xx < width; xx++) {
//                     var u = (x + xx / (width - 1)) / Math.pow(2, level);
//                     var v = (y + yy / (height - 1)) / Math.pow(2, level);
//
//                     var heightValue = 4000 * (Math.sin(8000 * v) * 0.5 + 0.5);
//
//                     var index = yy * width + xx;
//                     buffer[index] = heightValue;
//                 }
//             }
//
//             return buffer;
//         },
//     }
// );
//
// Sandcastle.addToolbarMenu(
//     [
//         {
//             text: "CesiumTerrainProvider - Cesium World Terrain",
//             onselect: function () {
//                 viewer.terrainProvider = worldTerrain;
//                 viewer.scene.globe.enableLighting = true;
//             },
//         },
//         {
//             text: "CesiumTerrainProvider - Cesium World Terrain - no effects",
//             onselect: function () {
//                 viewer.terrainProvider = Cesium.createWorldTerrain();
//             },
//         },
//         {
//             text: "CesiumTerrainProvider - Cesium World Terrain w/ Lighting",
//             onselect: function () {
//                 viewer.terrainProvider = Cesium.createWorldTerrain({
//                     requestVertexNormals: true,
//                 });
//                 viewer.scene.globe.enableLighting = true;
//             },
//         },
//         {
//             text: "CesiumTerrainProvider - Cesium World Terrain w/ Water",
//             onselect: function () {
//                 viewer.terrainProvider = Cesium.createWorldTerrain({
//                     requestWaterMask: true,
//                 });
//             },
//         },
//         {
//             text: "EllipsoidTerrainProvider",
//             onselect: function () {
//                 viewer.terrainProvider = ellipsoidProvider;
//             },
//         },
//         {
//             text: "CustomHeightmapTerrainProvider",
//             onselect: function () {
//                 viewer.terrainProvider = customHeightmapProvider;
//             },
//         },
//         {
//             text: "VRTheWorldTerrainProvider",
//             onselect: function () {
//                 viewer.terrainProvider = vrTheWorldProvider;
//             },
//         },
//         {
//             text: "ArcGISTerrainProvider",
//             onselect: function () {
//                 viewer.terrainProvider = arcGisProvider;
//             },
//         },
//     ],
//     "terrainMenu"
// );
//
// Sandcastle.addDefaultToolbarMenu(
//     [
//         {
//             text: "Mount Everest",
//             onselect: function () {
//                 lookAtMtEverest();
//             },
//         },
//         {
//             text: "Half Dome",
//             onselect: function () {
//                 var target = new Cesium.Cartesian3(
//                     -2489625.0836225147,
//                     -4393941.44443024,
//                     3882535.9454173897
//                 );
//                 var offset = new Cesium.Cartesian3(
//                     -6857.40902037546,
//                     412.3284835694358,
//                     2147.5545426812023
//                 );
//                 viewer.camera.lookAt(target, offset);
//                 viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
//             },
//         },
//         {
//             text: "San Francisco Bay",
//             onselect: function () {
//                 var target = new Cesium.Cartesian3(
//                     -2708814.85583248,
//                     -4254159.450845907,
//                     3891403.9457429945
//                 );
//                 var offset = new Cesium.Cartesian3(
//                     70642.66030209465,
//                     -31661.517948317807,
//                     35505.179997143336
//                 );
//                 viewer.camera.lookAt(target, offset);
//                 viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
//             },
//         },
//     ],
//     "zoomButtons"
// );
//
// var terrainSamplePositions;
//
// function lookAtMtEverest() {
//     var target = new Cesium.Cartesian3(
//         300770.50872389384,
//         5634912.131394585,
//         2978152.2865545116
//     );
//     var offset = new Cesium.Cartesian3(
//         6344.974098678562,
//         -793.3419798081741,
//         2499.9508860763162
//     );
//     viewer.camera.lookAt(target, offset);
//     viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
// }
//
// function sampleTerrainSuccess(terrainSamplePositions) {
//     var ellipsoid = Cesium.Ellipsoid.WGS84;
//
//     //By default, Cesium does not obsure geometry
//     //behind terrain. Setting this flag enables that.
//     viewer.scene.globe.depthTestAgainstTerrain = true;
//
//     viewer.entities.suspendEvents();
//     viewer.entities.removeAll();
//
//     for (var i = 0; i < terrainSamplePositions.length; ++i) {
//         var position = terrainSamplePositions[i];
//
//         viewer.entities.add({
//             name: position.height.toFixed(1),
//             position: ellipsoid.cartographicToCartesian(position),
//             billboard: {
//                 verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
//                 scale: 0.7,
//                 image: "../images/facility.gif",
//             },
//             label: {
//                 text: position.height.toFixed(1),
//                 font: "10pt monospace",
//                 horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
//                 pixelOffset: new Cesium.Cartesian2(0, -14),
//                 fillColor: Cesium.Color.BLACK,
//                 outlineColor: Cesium.Color.BLACK,
//                 showBackground: true,
//                 backgroundColor: new Cesium.Color(0.9, 0.9, 0.9, 0.7),
//                 backgroundPadding: new Cesium.Cartesian2(4, 3),
//             },
//         });
//     }
//     viewer.entities.resumeEvents();
// }
//
// function createGrid(rectangleHalfSize) {
//     var gridWidth = 41;
//     var gridHeight = 41;
//     var everestLatitude = Cesium.Math.toRadians(27.988257);
//     var everestLongitude = Cesium.Math.toRadians(86.925145);
//     var e = new Cesium.Rectangle(
//         everestLongitude - rectangleHalfSize,
//         everestLatitude - rectangleHalfSize,
//         everestLongitude + rectangleHalfSize,
//         everestLatitude + rectangleHalfSize
//     );
//     var terrainSamplePositions = [];
//     for (var y = 0; y < gridHeight; ++y) {
//         for (var x = 0; x < gridWidth; ++x) {
//             var longitude = Cesium.Math.lerp(
//                 e.west,
//                 e.east,
//                 x / (gridWidth - 1)
//             );
//             var latitude = Cesium.Math.lerp(
//                 e.south,
//                 e.north,
//                 y / (gridHeight - 1)
//             );
//             var position = new Cesium.Cartographic(longitude, latitude);
//             terrainSamplePositions.push(position);
//         }
//     }
//     return terrainSamplePositions;
// }
//
// Sandcastle.addToggleButton(
//     "Enable Lighting",
//     viewer.scene.globe.enableLighting,
//     function (checked) {
//         viewer.scene.globe.enableLighting = checked;
//     }
// );
//
// Sandcastle.addToggleButton(
//     "Enable fog",
//     viewer.scene.fog.enabled,
//     function (checked) {
//         viewer.scene.fog.enabled = checked;
//     }
// );
//
// Sandcastle.addToolbarButton(
//     "Sample Everest Terrain at Level 9",
//     function () {
//         var terrainSamplePositions = createGrid(0.005);
//         Cesium.when(
//             Cesium.sampleTerrain(
//                 viewer.terrainProvider,
//                 9,
//                 terrainSamplePositions
//             ),
//             sampleTerrainSuccess
//         );
//         lookAtMtEverest();
//     },
//     "sampleButtons"
// );
//
// Sandcastle.addToolbarButton(
//     "Sample Most Detailed Everest Terrain",
//     function () {
//         if (!Cesium.defined(viewer.terrainProvider.availability)) {
//             window.alert(
//                 "sampleTerrainMostDetailed is not supported for the selected terrain provider"
//             );
//             return;
//         }
//         var terrainSamplePositions = createGrid(0.0005);
//         Cesium.when(
//             Cesium.sampleTerrainMostDetailed(
//                 viewer.terrainProvider,
//                 terrainSamplePositions
//             ),
//             sampleTerrainSuccess
//         );
//         lookAtMtEverest();
//     },
//     "sampleButtons"
// );
//


$(function () {
    language = "ko";

    // layers.push(bingMapLayerGenerator());
    // layers.push(vectorLayerGenerator())
    //
    // map = mapGenerator(layers);
    // let subsidence_layer = getLandSubsidenceLayer('rest-api-test', 'subsidence_test2');
    // addLayerToMap(subsidence_layer, 'subsidence_layer');
    // // let vector_Subsidness_layer = getLandSubsidenceVectorLayer('rest-api-test', 'subsidence_test2');
    // // addLayerToMap(vector_Subsidness_layer, 'vecoter_Test');
    // setMapClickEvent(subsidence_layer)
    //
    // moveZoomLevel();

    // map.addInteraction(selectSingleClick);
    //
    // $("#dateRange").daterangepicker();
    // const ctx = document.getElementById('myChart').getContext('2d');
    // chart = generateChart(ctx);
    // map = vwmap();

});