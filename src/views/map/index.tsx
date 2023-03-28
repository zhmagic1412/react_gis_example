import React, {useEffect, useRef, useState} from "react"
import './index.scss'
import {Radio} from 'antd';
import MapboxMapComponent from "@/views/map/MapboxMap";
import LeafletMapComponent from "@/views/map/LeafletMap";
import OpenlayersMap from "@/views/map/OpenlayersMap";
import EsriMap from "@/views/map/EsriMap";

const AppMap = () => {
    const [value, setValue] = useState('esri');
    return <>
        <div className="app-main">
            <div className="app-top">
                <Radio.Group value={value}
                             onChange={(e)=> setValue(e.target.value)}
                             buttonStyle="solid">
                    <Radio.Button value="mapbox">mapbox</Radio.Button>
                    <Radio.Button value="leaflet">leaflet</Radio.Button>
                    <Radio.Button value="openlayers">openlayers</Radio.Button>
                    <Radio.Button value="esri">arcgis</Radio.Button>
                </Radio.Group>
            </div>
            <div className="app-bottom">
                {
                    value == 'mapbox' && <MapboxMapComponent/>
                }
                {
                    value == 'leaflet' && <LeafletMapComponent/>
                }
                {
                    value == 'openlayers' && <OpenlayersMap/>
                }
                {
                    value == 'esri' && <EsriMap/>
                }




            </div>
        </div>
    </>
}


export default AppMap
