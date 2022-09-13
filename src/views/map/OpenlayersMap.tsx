import React, {useEffect, useState} from "react"
import {Checkbox, Radio} from "antd";
import {OpenlayersWrapper} from "@/views/map/openlayers-map/openlayers-wrapper";


import {clearDraw, startMeasure} from "@/views/map/openlayers-map/openlayers-draw"


const OpenlayersMap = () => {
    const [map, setMap] = useState(new OpenlayersWrapper('ol-map'))
    const checkOptions = [
        // {label: '撒点', value: 'points'},
        {label: 'MVT', value: 'mvt'},
        {label: 'WMS', value: 'wms'},
    ]

    const onCheckChange = (list:any[]) => {
        // map.setLayerVisible('cluster_covid', list.includes("points"))
        map.setLayerVisible('geo_residential', list.includes("mvt"))
        map.setLayerVisible('geo_park', list.includes("wms"))
    }

    const onRadioChange = (e:Record<string, any>) => {
        clearDraw(map._map)
        if(e.target.value == 'measureLine'){
            startMeasure('distance',map._map)
        }
        if(e.target.value == 'measureArea'){
            startMeasure('area',map._map)
        }
    }
    const wms = () => {
        map.addWMSLayer(
            {
                layerId: 'geo_park',
                layerName: 'cite:geo_park',
                baseUrl: 'http://124.221.84.208:8078/geoserver/cite'
            }
        )
    }
    const mvt = () => {
        map.addMVTLayer(
            {
                layerId: 'geo_residential',
                layerName: 'cite:geo_residential',
                url: 'http://124.221.84.208:8078/geoserver/gwc/service/tms/1.0.0/cite%3Ageo_residential@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
                fillColor: 'rgb(255,238,90,.6)'
            }
        )
    }

    useEffect(
        () => {
            map.on('loaded',
                () => {
                    wms()
                    mvt()
                })
            map.createMap()

        }, []
    )

    return <>
        <div className="app-map-tool">
            <Checkbox.Group
                options={checkOptions}
                defaultValue={['points', 'mvt', 'wms']}
                onChange={onCheckChange}/>
            <Radio.Group defaultValue={'none'}
                         onChange={onRadioChange}
            >
                <Radio value="none">清除</Radio>
                <Radio value="measureLine">测距</Radio>
                <Radio value="measureArea">测面积</Radio>
            </Radio.Group>
        </div>
        <div id="ol-map" className="app-map-container"/>
    </>
}

export default OpenlayersMap