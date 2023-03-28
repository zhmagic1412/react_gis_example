import React, {useEffect, useState} from "react";
import {EsriWrapper} from "@/views/map/esri-map/esri-wrapper";


function EsriMap(){

    const [map, setMap] = useState(new EsriWrapper())

    useEffect(
        () => {
            map.createMap('esri-map','3d')
        }, []
    )




    return<>
        <div id="esri-map" className="app-map-container"/>
    </>
}


export default EsriMap
