import React, {memo, useEffect, useState} from "react";
import {MapboxMapWrapper} from "@/views/map/mapbox-map/mapbox-wrapper";
import {covid} from "@/api/api";
import {Checkbox, Radio} from "antd";
import {clearDraw, measureDistance,measureArea} from './mapbox-map/mapbox-draw'

const MapboxMapComponent = () => {
    const [map, setMap] = useState(new MapboxMapWrapper('mapbox-map'))
    const checkOptions = [
        {label: '撒点', value: 'points'},
        {label: 'MVT', value: 'mvt'},
        {label: 'WMS', value: 'wms'},
    ]
    const featureCollection = {
        type: "FeatureCollection",
        features: []
    }
    useEffect(
        () => {
            map.createMap([121.5, 31.2],11,'dark',  true)
            map.on(
                'style.load', () => {
                    points()
                    mvt()
                    wms()
                }
            )
        }, []
    )
    const wms = () => {
        map.addWMSLayer(
            {
                layerId: 'geo_park',
                url: "http://124.221.84.208:8078/geoserver/cite/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=cite%3Ageo_park&exceptions=application%2Fvnd.ogc.se_inimage&SRS=EPSG%3A3857&STYLES=&WIDTH=668&HEIGHT=768&BBOX={bbox-epsg-3857}",
                name: 'geo_park'
            }
        )
    }

    const mvt = () => {
        map.addPolygonTMSLayer(
            {
                layerId: 'geo_residential',
                url: 'http://124.221.84.208:8078/geoserver/gwc/service/tms/1.0.0/cite%3Ageo_residential@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf',
                name: 'geo_residential',
                color: '#ffee5a'
            }
        )
    }

    const points = async () => {
        const res = await covid()
        const data = JSON.parse(JSON.stringify(featureCollection))
        Object.values(res.data.data.community["上海市"]["上海市"]).forEach(
            i => {
                (i as []).forEach(
                    j => {
                        data.features.push(
                            {
                                type: "Feature",
                                properties: {"count": 2},
                                geometry: {
                                    type: "Point",
                                    coordinates: [Number(j['lng']), Number(j['lat'])]
                                }
                            }
                        )
                    }
                )
            }
        )
        map.addPointClusterLayer(
            {
                layerId: 'cluster_covid',
                name: 'cluster_covid',
                data
            }
        )
    }


    const onCheckChange = (list: any[]) => {
        if (map._loaded) {
            map.setLayerVisible('cluster_covid', list.includes("points"))
            map.setLayerVisible('geo_residential', list.includes("mvt"))
            map.setLayerVisible('geo_park', list.includes("wms"))
        }
    }

    const onRadioChange = (e:Record<string, any>)=>{
        clearDraw()
        if(e.target.value == 'measureLine'){
            measureDistance(map._map)
        }
        if(e.target.value == 'measureArea'){
            measureArea(map._map)
        }

    }
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
        <div id="mapbox-map" className="app-map-container"/>
    </>
}

export default memo(MapboxMapComponent)