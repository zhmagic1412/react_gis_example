import Draw from 'ol/interaction/Draw'
import VectorSource from "ol/source/Vector"
import VectorLayer from "ol/layer/Vector"
import Overlay from 'ol/Overlay'
import {LineString, Polygon} from 'ol/geom'
import {getArea, getLength} from 'ol/sphere'
import {unByKey} from 'ol/Observable'
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style'

let draw,drawSource,measureTooltipElement,measureTooltip,helpTooltipElement,helpTooltip,sketch,pointerMoveEvent
let fontColor = '#fff'
/*
* 画点
* */
export function DrawPoint(map){
    initDraw(map,'Point')
}


/*
* 画线
* */

export function DrawLine(map){
    initDraw(map,'LineString')
}


/*
* 画面
* */
export function DrawPolygon(map){
    initDraw(map,'Polygon')
}


/*
* 画结束
* */

export function OnDrawEnd(func){
    if(draw){
        draw.on('drawend',(evt)=>{
                func(evt)
            }
        )
    }
}


/*
* 测量
* */
export function startMeasure(mode,map){
    let type
    switch(mode){
        case 'distance':
            type = 'LineString'
            break
        case 'area':
            type = 'Polygon'
            break
        default:
            return
    }
    initDraw(map,type)
    createMeasureTooltip(map)
    createHelpTooltip(map)
    addInteractionToMap(type,map)
    // this.map.getViewport().addEventListener('mouseout', ()=> {
    //     this.helpTooltipElement.classList.add('hidden');
    // });
    pointerMoveEvent = map.on('pointermove', (evt)=>{
        if (evt.dragging) {
            return
        }
        let helpMsg = '点击画图形'

        if (sketch) {
            let geom = sketch.getGeometry()
            if (geom instanceof Polygon) {
                //helpMsg = continuePolygonMsg;
            } else if (geom instanceof LineString) {
                //helpMsg = continueLineMsg;
            }
        }
        helpTooltipElement.innerHTML = helpMsg
        helpTooltip.setPosition(evt.coordinate)
        helpTooltipElement.classList.remove('hidden')
    });

}

/**
 * 创建help tooltip
 */
function createHelpTooltip(map) {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement)
    }
    helpTooltipElement = document.createElement('div')
    helpTooltipElement.className = 'ol-tooltip hidden'
    helpTooltipElement.style= `color:${fontColor};font-weight:bold`
    helpTooltip = new Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(helpTooltip)
}


/**
 * 创建measure tooltip
 */
function createMeasureTooltip(map) {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement)
    }
    measureTooltipElement = document.createElement('div')
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure'
    measureTooltipElement.style= `color:${fontColor};font-weight:bold`
    measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip)
}

function addInteractionToMap(type,map) {
    // draw = new Draw({
    //     source: drawSource,
    //     type: type,
    //     style: new Style({
    //         fill: new Fill({
    //             color: 'rgba(255, 255, 255, 0.2)'
    //         }),
    //         stroke: new Stroke({
    //             color: 'rgba(0, 0, 0, 0.5)',
    //             lineDash: [10, 10],
    //             width: 2
    //         }),
    //         image: new CircleStyle({
    //             radius: 5,
    //             stroke: new Stroke({
    //                 color: 'rgba(0, 0, 0, 0.7)'
    //             }),
    //             fill: new Fill({
    //                 color: 'rgba(255, 255, 255, 0.2)'
    //             })
    //         })
    //     })
    // });
    // map.addInteraction(draw)



    let listener
    draw.on('drawstart',
        (evt)=> {
            // set sketch
            sketch = evt.feature

            let tooltipCoord = evt.coordinate

            listener = sketch.getGeometry().on('change', (evt) =>{
                let geom = evt.target
                let output;
                if (geom instanceof Polygon) {
                    output = formatArea(geom)
                    tooltipCoord = geom.getInteriorPoint().getCoordinates()
                } else if (geom instanceof LineString) {
                    output = formatLength(geom)
                    tooltipCoord = geom.getLastCoordinate()
                }
                measureTooltipElement.innerHTML = output
                measureTooltip.setPosition(tooltipCoord)
            })
        })

    draw.on('drawend',
        () =>{
            measureTooltipElement.className = 'ol-tooltip ol-tooltip-static'
            measureTooltip.setOffset([0, -7])
            // unset sketch
            sketch = null
            // unset tooltip so that a new one can be created
            measureTooltipElement = null
            unByKey(listener)
            unByKey(pointerMoveEvent)
            map.removeInteraction(draw)
            helpTooltipElement = null
            map.removeOverlay(helpTooltip)
        })
}



/*
* 实例化draw
* */
function initDraw(map,type){
    if(!drawSource){
        drawSource = new VectorSource({wrapX: false});
        let drawLayer = new VectorLayer({source:drawSource})
        map.addLayer(drawLayer)
    }
    drawSource.clear()
    map.removeInteraction(draw)
    draw = new Draw({source:drawSource, type})
    map.addInteraction(draw)
}


/*
* 测距
* */
function formatLength(line) {
    let length = getLength(line);
    let output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) +
            ' ' + 'km';
    } else {
        output = (Math.round(length * 100) / 100) +
            ' ' + 'm';
    }
    return output;
}


/*
* 测面
* */
function formatArea(polygon) {
    let area = getArea(polygon);
    let output;
    if (area > 10000) {
        output = (Math.round(area / 1000000 * 100) / 100) +
            ' ' + 'km<sup>2</sup>';
    } else {
        output = (Math.round(area * 100) / 100) +
            ' ' + 'm<sup>2</sup>';
    }
    return output;
}


/*
* 清除draw
* */
export function clearDraw(map){
    if(drawSource) drawSource.clear()
    if(draw) map.removeInteraction(draw)
    if(measureTooltip) map.removeOverlay(measureTooltip)
}
