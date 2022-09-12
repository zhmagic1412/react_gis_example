import React, {useEffect, useRef, useState} from "react"
import './index.scss'
import {Radio} from 'antd';
import MapboxMapComponent from "@/views/map/MapboxMap";
import LeafletMapComponent from "@/views/map/LeafletMap";

const AppMap = () => {
    const [value, setValue] = useState('leaflet');
    return <>
        <div className="app-main">
            <div className="app-top">
                <Radio.Group value={value}
                             onChange={(e)=> setValue(e.target.value)}
                             buttonStyle="solid">
                    <Radio.Button value="mapbox">mapbox</Radio.Button>
                    <Radio.Button value="leaflet">leaflet</Radio.Button>
                    <Radio.Button value="openlayer">openlayer</Radio.Button>
                </Radio.Group>
            </div>
            <div className="app-bottom">
                {
                    value == 'mapbox' && <MapboxMapComponent/>
                }
                {
                    value == 'leaflet' && <LeafletMapComponent/>
                }



            </div>
        </div>
    </>
}


export default AppMap