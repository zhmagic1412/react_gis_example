import EventEmitter from "events";
import {Map, map, marker, icon, LatLng, Util, tileLayer, CRS, featureGroup, LatLngExpression} from "leaflet"
import './leaflet.ChineseTmsProviders.js'
import 'leaflet.vectorgrid'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import "leaflet/dist/leaflet.css"
import './leaflet-geojson-vt.js'
import {
    ILeafletWMSLayerOptions,
    ILeafletMakerLayerOptions,
    ILeafletMVTLayerOptions, ILeafletJsonVTLayerOptions
} from "leaflet-types";
import axios from "axios";

export class LeafletWrapper extends EventEmitter {
    public _map: Map | null
    private readonly _divId: string
    public _drawLayer: Record<string, any>
    private readonly _layerMap: Record<string, any>

    constructor(divId: string) {
        super();
        this._map = null
        this._divId = divId
        this._drawLayer = {}
        this._layerMap = {}


    }

    /**
     * 地图初始化
     */
    createMap = (center: LatLngExpression, zoom: number) => {
        this._map = map(this._divId, {
            center: center,//[31.205815, 121.455017],
            zoom: zoom,
            minZoom: 3,
            maxZoom: 18,
            //crs: L.CRS.EPSG3857, //默认3857
        })
        L.tileLayer.chinaProvider('Geoq.Normal.PurplishBlue').addTo(this._map)
        this._drawLayer = featureGroup().addTo(this._map);
        // this._map.on('click', res => {
        //
        // })
        this.emit('load')

    }
    /**
     * 按layerId获取图层
     * @param layerId
     */
    getLayerById = (layerId: string) => {
        return this._layerMap[layerId] ?? null
    }


    setLayerVisible = (layerId: string, visible: boolean) => {
        if (visible) {
            this.getLayerById(layerId)?.addTo(this._map)
        } else {
            this.getLayerById(layerId)?.remove()
        }
    }


    /*
    * 添加wms服务
    * */
    addWMSLayer = (opt: ILeafletWMSLayerOptions) => {
        this._layerMap[opt.layerId] = tileLayer.wms(opt.base + '/wms', opt.layerParams).addTo(this._map as Map)
    }

    /*
    * 添加geojson-vt
    * */
    addGeoJsonVTLayer = ({fillColor, color, json, layerId, fillOpacity}: ILeafletJsonVTLayerOptions) => {
        const geojsonStyle = {
            fillColor,
            color,
            weight: 1,
            opacity: 1,
            fillOpacity
        };

        const options = {
            maxZoom: 20,
            tolerance: 3,
            debug: 0,
            style: geojsonStyle
        };
        this._layerMap[layerId] = L.geoJson.vt(json, options)
        this._map?.addLayer(this._layerMap[layerId])
    }

    /*
    * 添加mvt服务（L.vectorGrid作者很久没维护，现有bug，弃用）
    * */
    addMVTLayer = ({vectorTileLayerStyles, layerId, layerName, url}: ILeafletMVTLayerOptions) => {
        this._layerMap[layerId] = L.vectorGrid.protobuf(url, {
            rendererFactory: L.canvas.tile,
            tms: true,
            interactive: true,
            vectorTileLayerStyles: vectorTileLayerStyles
        }).addTo(this._map)
    }

    /**
     * 添加点数组要素聚合图层
     * @param layerId 图层id
     * @param pointList 点数组
     */
    addMarkerListLayer = ({layerId, pointList, iconUrl}: ILeafletMakerLayerOptions) => {
        this._layerMap[layerId] = L.markerClusterGroup({
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        }).addTo(this._map)
        if (!pointList.length) return this._layerMap[layerId]
        pointList.forEach(
            (pt) => {
                const makerIcon = icon({
                    iconUrl: iconUrl,
                    iconSize: [34, 34]
                })
                const mapMarker = marker([pt.y, pt.x], {
                    icon: makerIcon
                })
                mapMarker.bindPopup('<a id="popup_' + pt.id + '">' + pt.count + '</a>',
                    {closeButton: false, closeOnClick: true})
                mapMarker.on('click', (evt: Record<string, any>) => {
                    (this._map as Map).flyTo(evt.latlng, 16)
                    this.emit('markerClick', {pt, mapMarker})
                })
                this._layerMap[layerId].addLayer(mapMarker)
            }
        )
        return this._layerMap[layerId]
    }


    /**
     * CQL_FILTER请求wfs数据
     */
    requestWFSData = async ({baseUrl, layerName, crs, cql_filter}: Record<string, any>) => {
        const urlString = baseUrl + '/ows'
        const param: Record<string, any> = {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: layerName,
            outputFormat: 'application/json',
            maxFeatures: 1000000,
            srsName: crs,
        }
        if (cql_filter) param['CQL_FILTER'] = cql_filter
        return await axios.get(urlString + Util.getParamString(param, urlString))
    }
}