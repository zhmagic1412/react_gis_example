import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'
let _map, tooltip,ele,option
let jsonPoint = {'type': 'FeatureCollection', 'features': []}
let jsonLine = {'type': 'FeatureCollection', 'features': []}
let jsonPolygon = {'type': 'FeatureCollection', 'features': []}
let points = []
let markers = []
let isDrawing = false
let fontColor = '#fff'
/*
* 画点
* */
export function drawPoint(map) {
    initDraw(map)
    map.on('click', onDrawPointClick)
}

/*
* 画单点
* */
export function drawSinglePoint(map,cb) {
    initDraw(map)
    map.on('click',
        function onDrawPointClick(e) {
            if (!isDrawing) return
            jsonPoint.features = [{
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [e.lngLat.lng, e.lngLat.lat]
                }
            }]
            _map.getSource('points').setData(jsonPoint)
            cb(e.lngLat.lng, e.lngLat.lat)
        })
}


/*
* 画线
* */
export function drawLine(map) {
    initDraw(map)
    map.on('click', onDrawLineClick)
    map.on('mousemove', onDrawLineMove)
    map.on('dblclick', onDrawLineDbClick)
}


/*
* 画面
* */
export function drawPolygon(map) {
    initDraw(map)
    map.on('click', onDrawLineClick)
    map.on('mousemove', onDrawPolygonMove)
    map.on('dblclick', onDrawPolygonDbClick)
}



/*
* 测距离
* */
export function measureDistance(map){
    initDraw(map)
    map.on('click', onMeasureDistanceClick)
    map.on('mousemove', onDrawLineMove)
    map.on('dblclick', onDrawLineDbClick)
}


/*
* 测面积
* */
export function measureArea(map){
    initDraw(map)
    map.on('click', onDrawLineClick)
    map.on('mousemove', onDrawPolygonMove)
    map.on('dblclick', onMeasureAreaDbClick)
}


function onDrawPointClick(e) {
    if (!isDrawing) return
    points.push([e.lngLat.lng, e.lngLat.lat])
    addPoint([e.lngLat.lng, e.lngLat.lat])
}

function onDrawLineClick(e) {
    if (!isDrawing) return
    points.push([e.lngLat.lng, e.lngLat.lat])
    addPointToLine([e.lngLat.lng, e.lngLat.lat])
}

function onDrawLineMove(e) {
    if (!isDrawing) return
    let coords = [e.lngLat.lng, e.lngLat.lat];
    if (jsonPoint.features.length > 0) {
        let prev = jsonPoint.features[jsonPoint.features.length - 1];
        let json = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [prev.geometry.coordinates, coords]
            }
        };
        _map.getSource('line-move').setData(json)
    }
}

function onDrawLineDbClick(e) {
    if (!isDrawing) return
    isDrawing = false
    _map.doubleClickZoom.enable()
}

function onDrawPolygonDbClick(e) {
    if (!isDrawing) return
    isDrawing = false
    _map.doubleClickZoom.enable()
    addPointToLine(points[0])
    const dom = document.querySelector('.measure-result')
    dom && dom.parentNode.removeChild(dom)
}

function onDrawPolygonMove(e) {
    if (!isDrawing) return
    let coords = [e.lngLat.lng, e.lngLat.lat]
    let len = jsonPoint.features.length
    ele.style = `color:${fontColor};font-weight:bold`
    if (len === 0) {
        ele.innerHTML = '点击地图开始测量'
    } else if (len === 1) {
        ele.innerHTML = '点击地图继续绘制'
    } else {
        let pts = points.concat([coords])
        pts = pts.concat([points[0]])
        let json = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [pts]
            }
        };
        _map.getSource('polygon').setData(json)
    }
    tooltip.setLngLat(coords)
}

function onMeasureDistanceClick(e){
    if(!isDrawing) return
    onDrawLineClick(e)
    ele = document.createElement('div')
    ele.setAttribute('class', 'measure-result')
    ele.style = `color:${fontColor};font-weight:bold`
    const option = {
        element: ele,
        anchor: 'left',
        offset: [8, 0]
    }
    ele.innerHTML = points.length === 0 ? '起点' : getLength([e.lngLat.lng, e.lngLat.lat]);
    let marker = new mapboxgl.Marker(option)
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .addTo(_map)
    markers.push(marker)
}

function onMeasureAreaDbClick(e){
    if(!isDrawing) return
    onDrawPolygonDbClick(e)
    ele = document.createElement('div')
    ele.setAttribute('class', 'measure-result')
    ele.style = `color:${fontColor};font-weight:bold`
    const option = {
        element: ele,
        anchor: 'left',
        offset: [8, 0]
    }
    ele.innerHTML = getArea([e.lngLat.lng, e.lngLat.lat])
    let center = getCenter([e.lngLat.lng, e.lngLat.lat]).geometry.coordinates
    new mapboxgl.Marker(option)
        .setLngLat([center[0], center[1]])
        .addTo(_map)
}

/*
* 添加点
* */
function addPoint(coords) {
    jsonPoint.features.push({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: coords
        }
    })
    _map.getSource('points').setData(jsonPoint)
}


/*
* 线添加点
* */
function addPointToLine(coords) {
    if (jsonPoint.features.length > 0) {
        let prev = jsonPoint.features[jsonPoint.features.length - 1];
        jsonLine.features.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [prev.geometry.coordinates, coords]
            }
        })
        _map.getSource('line').setData(jsonLine)
    }
    addPoint(coords)
}


/*
* 清除
* */
export function clearDraw() {
    if (!_map) return
    if (isDrawing) isDrawing = false
    const dom = document.querySelector('.measure-result')
    dom && dom.parentNode.removeChild(dom)
    points = []
    _map.off('click', onDrawLineClick)
    _map.off('click', onDrawPointClick)
    _map.off('mousemove', onDrawPolygonMove)
    _map.off('mousemove', onDrawLineMove)
    _map.off('dblclick', onDrawLineDbClick)
    _map.off('dblclick', onDrawPolygonDbClick)
    _map.off('dblclick', onMeasureAreaDbClick)
    _map.off('click', onMeasureDistanceClick)
    let source = _map.getSource('points')
    jsonPoint = {
        'type': 'FeatureCollection',
        'features': []
    }
    jsonLine = {
        'type': 'FeatureCollection',
        'features': []
    }
    jsonPolygon = {
        'type': 'FeatureCollection',
        'features': []
    }
    if (source) {
        _map.getSource('points').setData(jsonPoint)
        _map.getSource('line-move').setData(jsonLine)
        _map.getSource('line').setData(jsonLine)
        _map.getSource('polygon').setData(jsonPolygon)
    }
    if(markers.length){
        markers.forEach(i=>i.remove())
        markers = []
    }
}


/*
* 初始化source
* */
function initDraw(map) {
    isDrawing = true
    _map = map
    ele = document.createElement('div')
    ele.setAttribute('class', 'measure-result')
    option = {
        element: ele,
        anchor: 'left',
        offset: [8, 0]
    }
    tooltip = new mapboxgl.Marker(option)
        .setLngLat([0, 0])
        .addTo(map)
    let source = map.getSource('points')
    if (source) {
        map.getSource('points').setData(jsonPoint)
        map.getSource('line-move').setData(jsonLine)
        map.getSource('line').setData(jsonLine)
        map.getSource('polygon').setData(jsonPolygon)
    } else {
        map.addSource('points', {
            type: 'geojson',
            data: jsonPoint
        })
        map.addSource('line', {
            type: 'geojson',
            data: jsonLine
        })
        map.addSource('line-move', {
            type: 'geojson',
            data: jsonLine
        })
        map.addSource('polygon', {
            type: 'geojson',
            data: jsonPolygon
        })
        map.addLayer({
            id: 'line-move',
            type: 'line',
            source: 'line-move',
            paint: {
                'line-color': '#ff0000',
                'line-width': 2,
                'line-opacity': 0.65
            }
        })
        map.addLayer({
            id: 'line',
            type: 'line',
            source: 'line',
            paint: {
                'line-color': '#ff0000',
                'line-width': 2,
                'line-opacity': 0.65
            }
        })
        map.addLayer({
            id: 'points',
            type: 'circle',
            source: 'points',
            paint: {
                'circle-color': '#ffffff',
                'circle-radius': 3,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ff0000'
            }
        })
        map.addLayer({
            id: 'polygon',
            type: 'fill',
            source: 'polygon',
            paint: {
                'fill-color': '#ff0000',
                'fill-opacity': 0.1
            }
        });
    }
}



/*
* 测距计算
* */
function getLength(coords) {
    let _points = points.concat([coords])
    let line = turf.lineString(_points)
    let len = turf.length(line)
    if(len < 1) {
        len = Math.round(len * 1000) + 'm';
    } else {
        len = len.toFixed(2) + 'km';
    }
    return len
}

/*
* 测面计算
* */
function getArea(coords) {
    let pts = points.concat([coords])
    pts = pts.concat([points[0]]);
    let polygon = turf.polygon([pts])
    let area = turf.area(polygon)
    if(area < 1000) {
        area = Math.round(area) + 'm²'
    } else {
        area = (area / 1000000).toFixed(2) + 'km²'
    }
    return area
}

/*
* 计算中心点
* */
function getCenter(coords){
    let pts = points.concat([coords])
    pts = pts.concat([points[0]]);
    return turf.centerOfMass(turf.polygon([pts]))
}
