import React, {useEffect, useState} from "react"
import {Checkbox, Radio} from "antd";
import {LeafletWrapper} from "@/views/map/leaflet-map/leaflet-wrapper";
import {covid} from "@/api/api";
import {images} from "@/assets/images/images";
import {IPoint} from "leaflet-types";



const LeafletMapComponent = () => {
    const [map, setMap] = useState(new LeafletWrapper('leaflet-map'))
    const checkOptions = [
        {label: '撒点', value: 'points'},
        {label: 'MVT', value: 'mvt'},
        {label: 'WMS', value: 'wms'},
    ]
    const onCheckChange = (list: any[]) => {
    }

    const onRadioChange = (e: Record<string, any>) => {
    }

    const points =async ()=>{
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
                iconUrl:images.LOCATION
            }
        )
    }

    const mvt =()=>{
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
    }
    const wms = ()=>{
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
        ()=>{
            map.on(
                'load',()=>{
                    mvt()
                    wms()
                    points()
                }
            )
            map.createMap([31.205815, 121.455017],12)

        },[]
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
        <div id="leaflet-map" className="app-map-container"/>
    </>
}


export default LeafletMapComponent