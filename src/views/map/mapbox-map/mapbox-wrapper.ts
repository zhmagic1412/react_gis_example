import mapboxgl, {LngLatLike} from 'mapbox-gl'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import {IMapboxHeatLayerOptions, IMapboxLayerOptions} from "mapbox-types";
import centroid from '@turf/centroid'
// @ts-ignore
import MapboxLanguage from '@mapbox/mapbox-gl-language';
const EventEmitter = require('events').EventEmitter

export class MapboxMapWrapper extends EventEmitter {
    private readonly _divId: string
    public _map: mapboxgl.Map | Record<string, any>
    public _loaded:boolean
    private _singleMarker: mapboxgl.Marker | null
    private _markerList:  Record<string, any>[]
    private _zoom: number | undefined
    private readonly _lang:string| undefined


    constructor(divId: string,lang?:string) {
        super()
        this._divId = divId
        this._map = {}
        this._singleMarker = null
        this._markerList = []
        this._lang = lang || 'zh'
        this._loaded = false
    }

    /**
     * 创建地图对象
     */
    createMap = ( center:LngLatLike, zoom: number,type: string, hasGeocoder?: boolean): void => {
        mapboxgl.accessToken = 'pk.eyJ1IjoibWFnaWMxNDEyIiwiYSI6ImNrZW52Nm1razE3NGgyc3B3aWtyNnIydXEifQ.ISvPKsiV5OoE2UUH8iEtjA'
        this._zoom = zoom
        let style:string
        let defaultLanguage:string
        if (this._lang === 'zh'){
            style = type === 'dark' ? 'mapbox://styles/mapbox/dark-zh-v1'//'mapbox://styles/mapbox/dark-zh-v1'
                : 'mapbox://styles/mapbox/streets-zh-v1'//dark-zh-v1 //streets-zh-v1 //light-zh-v1
            defaultLanguage = 'zh-Hans'
        }else{
            style = type === 'dark' ? 'mapbox://styles/mapbox/dark-v10'
                : 'mapbox://styles/mapbox/streets-v11'
            defaultLanguage = 'en'//this._lang??''
        }
        this._map = new mapboxgl.Map({
            container: this._divId,
            // style:{
            //     "version": 8,
            //     "sources": {},
            //     "layers": []
            // },
            style: style,
            center: center,//
            zoom: zoom,
            preserveDrawingBuffer: true
            // pitch: 40,
            // bearing: 20
        })
        // @ts-ignore
        // mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js');
        // if(this._lang !== 'zh'){
        //     const language = new MapboxLanguage({defaultLanguage});
        //     this._map.addControl(language);
        // }
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl as any,
            language: defaultLanguage
        })
        hasGeocoder && this._map.addControl(geocoder)

        geocoder.on('results', (res) => {
            console.log(res)
        })
        this._map.on('load', () => {
            this.emit('load')
        })
        this._map.on('style.load', () => {
            this.emit('style.load')
            this._loaded = true
            console.log(this._map.getStyle().layers)

        })
    }

    /**
     * 重置地图视角
     */
    resetView() {
        // this._map.setCenter([121.5, 31.2])
        // this._map.setZoom(this._zoom)
        this._map.flyTo({
            center: [121.5, 31.2],
            zoom: this._zoom
        })
    }


    setLayerVisible(layerId: string, check: boolean) {
        const show = check ? 'visible' : 'none'
        this._map.setLayoutProperty(layerId, 'visibility', show)
        if (layerId.split('_')[0] === 'cluster') {
            this._map.setLayoutProperty(layerId + '_unclustered_point', 'visibility', show)
            this._map.setLayoutProperty(layerId + '_count', 'visibility', show)
        }
    }


    /**
     * 添加多边形矢量切片geoserver tms
     * @param opt
     */
    addPolygonTMSLayer = (opt: IMapboxLayerOptions): void => {
        this._map.addSource(opt.name, {
            'type': 'vector',
            'scheme': 'tms',
            'tiles': [opt.url]
        })
        this._map.addLayer({
            'id': opt.layerId,
            'type': 'fill',
            'source': opt.name,
            'source-layer': opt.name,
            'paint': {
                'fill-color': opt.color,
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0.5
                ]
            },
            'minzoom': 11,
            'maxzoom': 16
        })
        opt.forbidClickEvent || this.addClickEvent(opt.name, opt.name + 'Select', 'name')
        opt.forbidHoverEvent || this.addHoverEvent(opt.name, opt.name, opt.name, false)
    }
    /**
     * 添加多边形矢量切片mvt(自定义接口 非标准tms)
     * @param opt
     */
    addPolygonMVTLayer = (opt: IMapboxLayerOptions): void => {
        this._map.addSource(opt.name, {
            'type': 'vector',
            'tiles': [opt.url]
        })
        opt.lineMode && this._map.addLayer({
            'id': opt.layerId,
            'type': 'line',
            'source': opt.name,
            'source-layer': opt.name,
            'layout': {},
            'paint': {
                'line-color': opt.color,
                'line-width': 1
            }
        },opt.before||'');
        opt.lineMode || this._map.addLayer({
            'id': opt.layerId,
            'type': 'fill',
            'source': opt.name,
            'source-layer': opt.name,
            'paint': {
                'fill-color': opt.color,
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0.5
                ]
            },
            'minzoom': 9,
            'maxzoom': 16
        },opt.before||'')
        opt.lineMode || opt.forbidClickEvent || this.addClickEvent(opt.name, opt.name + 'Select', 'name')
        opt.lineMode || opt.forbidHoverEvent || this.addHoverEvent(opt.name, opt.name, opt.name, false)
    }
    /**
     * 添加三维矢量切片tms
     * @param opt
     */
    add3DPolygonTMSLayer = (opt: IMapboxLayerOptions): void => {
        this._map.addSource(opt.name, {
            'type': 'vector',
            'scheme': 'tms',
            'tiles': [opt.url]
        })
        this._map.addLayer({
            'id': opt.layerId,
            'type': 'fill-extrusion',
            'source': opt.name,
            'source-layer': opt.name,
            'paint': {
                'fill-extrusion-color': opt.color,
                'fill-extrusion-height': ['get', opt.heightAttr],
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': .6
            },
            'minzoom': 11,
            'maxzoom': 16
        })
    }

    /*
    * 添加wms服务
    * */
    addWMSLayer = (opt: IMapboxLayerOptions)=>{
        this._map.addSource(opt.name, {
            'type': 'raster',
            'tiles': [
                opt.url
            ],
            'tileSize': 512
        });
        this._map.addLayer(
            {
                'id': opt.layerId,
                'type': 'raster',
                'source': opt.name,
                'paint': {}
            },
        );
    }



    /*
    * 添加热力图
    * */
    addHeatMap = (opt: IMapboxHeatLayerOptions) => {
        const features = opt.data.map(
            i => (
                {
                    type: "Feature",
                    properties: {
                        value: i.value
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [i.x, i.y]
                    }
                }
            )
        )
        const data = {
            type: 'FeatureCollection',
            features
        }
        this._map.addSource(opt.name, {
            'type': 'geojson',
            'data': data
        });
        this._map.addLayer(
            {
                'id': opt.layerId,
                'type': 'heatmap',
                'source': opt.name,
                'maxzoom': 16,
                'paint': opt.paint
            },opt.before||''
        )
    }


    /**
     * 添加点唯一marker
     * @param pt
     * @param color
     */
    addOnlyMarker = (pt: number[], color?: string) => {
        if (this._singleMarker) (this._singleMarker as mapboxgl.Marker).remove()
        this._singleMarker = new mapboxgl.Marker({color: color || 'blue'})
            .setLngLat(pt as LngLatLike)
            .addTo(this._map as mapboxgl.Map)
        this._map.flyTo({
            center: pt,
            zoom: 15
        })
    }
    /**
     * 添加marker
     * @param pt
     * @param color
     */
    addMarker = (pt: number[], color?: string) => {
        const mk = new mapboxgl.Marker({color: color || 'blue'})
        this._markerList.push(mk)
        mk.setLngLat(pt as LngLatLike)
            .addTo(this._map as mapboxgl.Map)
    }

    /**
     * 清理所有marker
     */
    clearAllMarker = () => {
        this._markerList.forEach(
            i => i.remove()
        )
        this._singleMarker?.remove()
        this._markerList = []
    }

    /**
     * 添加聚合点图层
     * @param opt
     */
    addPointClusterLayer = (opt: IMapboxLayerOptions): void => {
        this._map.addSource(opt.name, {
            type: 'geojson',
            data: opt.data,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
        })
        this._map.addLayer({
            id: opt.layerId,
            type: 'circle',
            source: opt.name,
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#51bbd6',
                    5,
                    '#f1f075',
                    10,
                    '#f28cb1'
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20,
                    5,
                    30,
                    10,
                    40
                ]
            }
        })
        this._map.addLayer({
            id: opt.layerId + '_count',
            type: 'symbol',
            source: opt.name,
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 15
            }
        })
        this._map.addLayer({
            id: opt.layerId + '_unclustered_point',
            type: 'circle',
            source: opt.name,
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 10,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
            }
        })
    }

    /**
     * 添加点击矢量图层点击事件
     * @param layerName
     * @param selectedLayerName
     * @param attr
     */
    addClickEvent = (layerName: string, selectedLayerName: string, attr: string): void => {
        this._map.on('click', (e: any) => {
            var features = this._map.queryRenderedFeatures(e.point, {layers: [layerName]})
            if (typeof this._map.getLayer(selectedLayerName) !== 'undefined') {
                this._map.removeLayer(selectedLayerName)
                this._map.removeSource(selectedLayerName)
            }
            if (features.length !== 0) {
                var feature = features[0]
                this._map.addLayer({
                    'id': selectedLayerName,
                    'type': 'fill',
                    'source': {
                        'type': 'geojson',
                        'data': feature.toJSON()
                    },
                    'paint': {
                        'fill-color': '#55f8ea',
                        'fill-opacity': 1
                    }
                })
                var popup = new mapboxgl.Popup({
                    closeButton: false
                })
                popup.setLngLat(e.lngLat)
                    .setText(feature.properties[attr])
                    .addTo(this._map as mapboxgl.Map)
            }
        })
    }
    /**
     * 添加矢量切片图层hover事件
     * @param layerName
     * @param sourceName
     * @param sourceLayerName
     * @param showPop
     */
    addHoverEvent = (layerName: string, sourceName: string, sourceLayerName: string, showPop: boolean): void => {
        let hoveredStateId: any = null
        let townPopup = new mapboxgl.Popup({
            closeButton: false
        })
        this._map.on('mousemove', layerName, (e: any) => {
            if (e.features.length > 0) {
                if (hoveredStateId) {
                    this._map.setFeatureState(
                        {source: sourceName, sourceLayer: sourceLayerName, id: hoveredStateId},
                        {hover: false}
                    )
                }
                hoveredStateId = e.features[0].id
                this._map.setFeatureState(
                    {source: sourceName, sourceLayer: sourceLayerName, id: hoveredStateId},
                    {hover: true}
                )
                if (showPop) {
                    townPopup.setLngLat(centroid(e.features[0].toJSON()).geometry.coordinates as [number, number])
                        .setText(e.features[0].properties['name'])
                        .addTo(this._map as mapboxgl.Map)
                }
            }
        })


        this._map.on('mouseleave', layerName, () => {
            if (showPop) {
                townPopup.remove()
            }
            if (hoveredStateId) {
                this._map.setFeatureState(
                    {source: sourceName, sourceLayer: sourceLayerName, id: hoveredStateId},
                    {hover: false}
                )
            }
            hoveredStateId = null
        })
    }
}
