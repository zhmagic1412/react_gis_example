import React, {useEffect, useState} from "react"
import {Checkbox, Radio} from "antd";
import {LeafletWrapper} from "@/views/map/leaflet-map/leaflet-wrapper";
import {covid} from "@/api/api";
import {images} from "@/assets/images/images";
import {IPoint} from "leaflet-types";
import {clear, measureArea, measureDistance} from "./leaflet-map/leaflet-draw";
import {Spin} from "antd";


const LeafletMapComponent = () => {
    const [map, setMap] = useState(new LeafletWrapper('leaflet-map'))
    const [loading, setLoading] = useState(true);
    const checkOptions = [
        {label: '撒点', value: 'points'},
        // {label: 'MVT', value: 'mvt'},
        {label: 'geojson-vt', value: 'geojson-vt'},
        {label: 'WMS', value: 'wms'},
    ]
    const onCheckChange = (list: any[]) => {
        map.setLayerVisible('cluster_covid', list.includes("points"))
        map.setLayerVisible('geo_residential', list.includes("geojson-vt"))
        map.setLayerVisible('geo_park', list.includes("wms"))
    }

    const onRadioChange = (e: Record<string, any>) => {
        const params = {
            map: map._map,
            drawLayer: map._drawLayer
        }
        clear(params)
        if (e.target.value == 'measureLine') {
            measureDistance(params)
        }
        if (e.target.value == 'measureArea') {
            measureArea(params)
        }
    }

    const points = async () => {
        const res = await covid()
        const pointList: IPoint[] = []
        Object.values(res.data.data.community["上海市"]["上海市"]).forEach(
            i => {
                (i as []).forEach(
                    j => {
                        pointList.push(
                            {
                                x: Number(j['lng']),
                                y: Number(j['lat']),
                                count: 1
                            }
                        )
                    }
                )
            }
        )
        map.addMarkerListLayer(
            {
                layerId: 'cluster_covid',
                pointList,
                iconUrl: images.LOCATION
            }
        )
    }

    /*    const mvt =()=>{
            map.addMVTLayer(
                {
                    layerId: 'geo_residential',
                    layerName: 'cite:geo_residential',
                    url: "http://124.221.84.208:8078/geoserver/gwc/service/tms/1.0.0/cite%3Ageo_residential@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf",
                    vectorTileLayerStyles: {
                        geo_residential: {
                            weight: 1,
                            fillColor: '#ffee5a',
                            fill: true,
                            fillOpacity: 0.8,
                            color: '#ffee5a',
                            opacity: 0.4,
                        }
                    }
                }
            )
        }*/
    const geojsonVT = async () => {
        const res = await map.requestWFSData(
            {
                baseUrl: 'http://124.221.84.208:8078/geoserver/cite/',
                layerName: 'cite:geo_residential',
                crs: 'EPSG:4326'
            }
        )
        setLoading(false)
        map.addGeoJsonVTLayer({
            layerId: 'geo_residential',
            json: res.data,
            fillColor: "#ffee5a",
            color: "#000",
            fillOpacity: .7
        })

    }

    const wms = () => {
        map.addWMSLayer(
            {
                layerId: 'geo_park',
                layerName: 'cite:geo_park',
                base: 'http://124.221.84.208:8078/geoserver/cite',
                layerParams: {
                    layers: 'cite:geo_park',
                    format: 'image/png',
                    transparent: true
                }
            }
        )
    }

    useEffect(
        () => {
            map.on(
                'load', () => {
                    wms()
                    points()
                    geojsonVT()
                }
            )
            map.createMap([31.205815, 121.455017], 12)

        }, []
    )

    return <>
        <div className="app-map-tool">
            <Checkbox.Group
                options={checkOptions}
                defaultValue={['points', 'geojson-vt', 'wms']}
                onChange={onCheckChange}/>
            <Radio.Group defaultValue={'none'}
                         onChange={onRadioChange}
            >
                <Radio value="none">清除</Radio>
                <Radio value="measureLine">测距</Radio>
                <Radio value="measureArea">测面积</Radio>
            </Radio.Group>
        </div>
        <Spin tip="Loading..." spinning={loading}>
            <div id="leaflet-map" className="app-map-container"/>
        </Spin>
    </>
}


export default LeafletMapComponent