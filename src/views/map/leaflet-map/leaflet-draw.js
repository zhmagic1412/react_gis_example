import {Polyline,Polygon,Circle} from "leaflet"
import * as turf from '@turf/turf'

/*
* 画点
* */
export function drawPoint({map,drawLayer}){
    map.on('click', (e) => {
        L.circle(e.latlng, {radius: 10, color: 'red', fillColor: 'red', fillOpacity: 1}).addTo(drawLayer)
    })
}
/*
* 画线
* */
export function drawLine({map,drawLayer}) {
    var points = []
    var lines = new Polyline(points)
    var tempLines = new Polyline([])
    map.on('click', onClick)    //点击地图
    map.on('dblclick', onDoubleClick)
    map.doubleClickZoom.disable()

    function onClick(e) {
        points.push([e.latlng.lat, e.latlng.lng])
        lines.addLatLng(e.latlng)
        drawLayer.addLayer(lines)
        drawLayer.addLayer(L.circle(e.latlng, {color: '#ff0000', fillColor: 'ff0000', fillOpacity: 1}))
        map.on('mousemove', onMove)//双击地图
    }

    function onMove(e) {
        if (points.length > 0) {
            var ls = [points[points.length - 1], [e.latlng.lat, e.latlng.lng]]
            tempLines.setLatLngs(ls)
            drawLayer.addLayer(tempLines)
        }
    }

    function onDoubleClick(e) {
        L.polyline(points).addTo(drawLayer)
        points = []
        lines = new Polyline(points)
        map.off('mousemove')
    }
}

/*
* 画多边形
* */
export function drawPolygon({map,drawLayer}) {
    var points = []
    var lines = new Polyline([])
    var tempLines = new Polygon([])
    map.on('click', onClick);    //点击地图
    map.on('dblclick', onDoubleClick);
    map.on('mousemove', onMove)//双击地图
    map.doubleClickZoom.disable()
    function onClick(e) {
        points.push([e.latlng.lat, e.latlng.lng])
        lines.addLatLng(e.latlng)
        drawLayer.addLayer(lines)
        drawLayer.addLayer(L.circle(e.latlng, { color: '#ff0000', fillColor: 'ff0000', fillOpacity: 1 }))
    }
    function onMove(e) {
        if (points.length > 0) {
            var ls = [points[points.length - 1], [e.latlng.lat, e.latlng.lng]]
            tempLines.setLatLngs(ls)
            drawLayer.addLayer(tempLines)
        }
    }
    function onDoubleClick(e) {
        L.polygon([points]).addTo(drawLayer)
        points = []
        lines = new Polyline([])
    }
}

/*
* 画圆
* */
export function drawCircle({map,drawLayer}) {
    var r = 0
    var i = null
    var tempCircle = new Circle(null)
    map.dragging.disable();//将mousemove事件移动地图禁用
    map.on('mousedown', onmouseDown);
    map.on('mouseup', onmouseUp);
    map.on('mousemove', onMove)

    function onmouseDown(e) {
        i = e.latlng
        //确定圆心
    }

    function onMove(e) {
        if (i) {
            r = L.latLng(e.latlng).distanceTo(i)
            tempCircle.setLatLng(i)
            tempCircle.setRadius(r)
            tempCircle.setStyle({color: '#ff0000', fillColor: '#ff0000', fillOpacity: 1})
            drawLayer.addLayer(tempCircle)

        }
    }

    function onmouseUp(e) {
        r = L.latLng(e.latlng).distanceTo(i)//计算半径
        L.circle(i, {radius: r, color: '#ff0000', fillColor: '#ff0000', fillOpacity: 1}).addTo(map)
        i = null
        r = 0
        drawLayer.dragging.enable();
    }
}


/*
* 测距
* */
export function measureDistance({map,drawLayer}){
    var points = []
    var lines = new Polyline(points)
    var tempLines = new Polyline([])
    var totalDist = 0
    console.log(map,drawLayer)
    map.on('click', onClick)    //点击地图
    map.on('dblclick', onDoubleClick)
    map.doubleClickZoom.disable()

    function onClick(e) {
        console.log(e)
        if(points.length === 0) totalDist = 0
        points.push([e.latlng.lat, e.latlng.lng])
        lines.addLatLng(e.latlng)
        var len = turf.length(lines.toGeoJSON(), { units: "kilometers" })
        totalDist += len
        var content = "距上点：" + Number(len).toFixed(2) + "千米" + "<br>总距:" + Number(totalDist).toFixed(2) + "千米"
        var texticon = L.divIcon({
            html: content,
            iconSize: [110, 40],
            iconAnchor: [55, -5]
        });
        L.marker([e.latlng.lat, e.latlng.lng], {
            icon: texticon
        }).addTo(drawLayer)
        drawLayer.addLayer(lines)
        drawLayer.addLayer(L.circle(e.latlng, {color: '#ff0000', fillColor: 'ff0000', fillOpacity: 1}))
        map.on('mousemove', onMove)//双击地图
    }

    function onMove(e) {
        if (points.length > 0) {
            var ls = [points[points.length - 1], [e.latlng.lat, e.latlng.lng]]
            tempLines.setLatLngs(ls)
            drawLayer.addLayer(tempLines)
        }
    }

    function onDoubleClick(e) {
        L.polyline(points).addTo(drawLayer)
        points = []
        lines = new Polyline(points)
        map.off('mousemove')
    }

}


/*
* 测面
* */
export function measureArea({map,drawLayer}){
    var points = []
    var lines = new Polyline([])
    var tempLines = new Polygon([])
    map.on('click', onClick)    //点击地图
    map.on('dblclick', onDoubleClick);
    map.on('mousemove', onMove)//双击地图
    map.doubleClickZoom.disable()
    function onClick(e) {
        points.push([e.latlng.lat, e.latlng.lng])
        lines.addLatLng(e.latlng)
        drawLayer.addLayer(lines)
        drawLayer.addLayer(L.circle(e.latlng, { color: '#ff0000', fillColor: 'ff0000', fillOpacity: 1 }))
    }
    function onMove(e) {
        if (points.length > 0) {
            var ls = [points[points.length - 1], [e.latlng.lat, e.latlng.lng]]
            tempLines.setLatLngs(ls)
            drawLayer.addLayer(tempLines)
        }
    }

    function onDoubleClick(e) {
        var polygon = L.polygon([points]).addTo(drawLayer)
        var area = turf.area(polygon.toGeoJSON());
        polygon.bindPopup("面积:" + Number(area).toFixed(2) + "平方米").openPopup(polygon.getCenter());
        points = []
        lines = new Polyline([])
    }
}


export function clear({map,drawLayer}){
    drawLayer.clearLayers()
    map.off('click')
    map.off('dblclick')
}
