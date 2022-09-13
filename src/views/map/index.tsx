import React, {useEffect, useRef, useState} from "react"
import './index.scss'
import {Radio} from 'antd';
import MapboxMapComponent from "@/views/map/MapboxMap";
import LeafletMapComponent from "@/views/map/LeafletMap";
import OpenlayersMap from "@/views/map/OpenlayersMap";

const AppMap = () => {
    const [value, setValue] = useState('openlayers');
    return <>
        <div className="app-main">
            <div className="app-top">
                <Radio.Group value={value}
                             onChange={(e)=> setValue(e.target.value)}
                             buttonStyle="solid">
                    <Radio.Button value="mapbox">mapbox</Radio.Button>
                    <Radio.Button value="leaflet">leaflet</Radio.Button>
                    <Radio.Button value="openlayers">openlayers</Radio.Button>
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



            </div>
        </div>
    </>
}


export default AppMap