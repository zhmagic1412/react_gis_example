import EventEmitter from "events";
import {TileWMS, XYZ} from "ol/source";
import {Map, View} from "ol";
import TileLayer from "ol/layer/Tile";
import "ol/ol.css"
import {IOlLayerOptions} from "ol-types";
import VectorTileLayer from "ol/layer/VectorTile";
import {MVT} from "ol/format";
import {Fill, Stroke, Style} from "ol/style";
import VectorTileSource from 'ol/source/VectorTile'
export class OpenlayersWrapper extends EventEmitter {

    private readonly _divId:string;
    private readonly _baseSource:Record<string, any>
    public _map:Map|null = null
    private readonly _layerMap:Record<string, any>
    constructor(divId:string) {
        super();
        this._divId = divId
        this._baseSource = {}
        this._layerMap ={}
    }

    createMap = () => {
        this._baseSource['baseSatelayer'] =  new XYZ({
            url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&style=6&x={x}&y={y}&z={z}'
        })
        this._baseSource['baseNormallayer'] =  new XYZ({
            url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        })
        this._baseSource['basePurplishBluelayer'] =  new XYZ({
            url: 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
        })
        const baseLayer =  new TileLayer()
        baseLayer.setSource(this._baseSource['basePurplishBluelayer'])
        this._map = new Map({
            layers: [baseLayer],
            target: this._divId,
            view: new View({
                //center: [121.5, 31.24],
                center: [13519605.955009, 3659701.43642],
                projection: 'EPSG:3857',
                zoom: 12
            })
        })
        this.emit('loaded')
    }

    setLayerVisible = (layerId:string,show:boolean)=>{
        this._layerMap[layerId].setVisible(show)
    }

    addWMSLayer = (opts:IOlLayerOptions) => {
        this._layerMap[opts.layerId] = new TileLayer({
            source: new TileWMS({
                url: opts.baseUrl + '/wms',
                params: {'LAYERS': opts.layerName, 'TILED': true},
                serverType: 'geoserver',
                transition: 0,
            }),
        })
        this._map?.addLayer(this._layerMap[opts.layerId])
    }

    addMVTLayer = (opts:IOlLayerOptions) => {

        this._layerMap[opts.layerId] = new VectorTileLayer({
            declutter: true,
            source: new VectorTileSource({
                format: new MVT(),
                url: opts.url
            }),
            style: new Style({
                stroke: new Stroke({
                    color: 'rgba(0,0,0,0.5)',
                    width: 1
                }),
                fill: new Fill({
                    color: opts.fillColor
                })
            })
        })
        this._map?.addLayer(this._layerMap[opts.layerId])
    }
}