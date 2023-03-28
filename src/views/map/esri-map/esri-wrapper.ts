import EventEmitter from "events";
import {arcgis_css, arcgis_js} from "@/views/map/esri-map/conf";
import { loadCss, loadScript } from "esri-loader";
import getModule from "@/views/map/esri-map/module";

export class EsriWrapper extends EventEmitter {
    map!: any;
    view!: any;
    constructor() {
        super();
    }
    useTdLayer = async () =>{
        const {
            TileInfo,
            Color,
            esriRequest,
            BaseTileLayer,
        } = await getModule(
            "TileInfo",
            "Color",
            "esriRequest",
            "BaseTileLayer",
        );
        const TdtLayer = BaseTileLayer.createSubclass({
            properties: {
                urlTemplate: null,
                tint: {
                    value: null,
                    type: Color,
                },
                subDomains: null,
            },

            getTileUrl: function (level, row, col) {
                return this.urlTemplate
                    .replace('{level}', level)
                    .replace('{col}', col)
                    .replace('{row}', row)
                    .replace(
                        '{subDomain}',
                        this.subDomains[Math.round(Math.random() * (this.subDomains.length - 1))],
                    );
            },

            fetchTile: function (level, row, col, options) {
                const url = this.getTileUrl(level + 1, row, col);

                return esriRequest(url, {
                    responseType: 'image',
                    //新增下面两句,解决乱片问题
                    allowImageDataAccess: true,
                    signal: options.signal,
                }).then(
                    function (response) {
                        const image = response.data;
                        const width = this.tileInfo.size[0];
                        const height = this.tileInfo.size[0];

                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.width = width;
                        canvas.height = height;

                        if (this.tint) {
                            context.fillStyle = this.tint.toCss();
                            context.fillRect(0, 0, width, height);

                            context.globalCompositeOperation = 'difference';
                        }

                        context.drawImage(image, 0, 0, width, height);

                        return canvas;
                    }.bind(this),
                );
            },
        });
        //定义瓦片结构
        const tileInfo = new TileInfo({
            //"dpi": 90.71428571428571,
            dpi: 96,
            rows: 256,
            cols: 256,
            compressionQuality: 0,
            origin: {
                x: -180,
                y: 90,
            },
            spatialReference: {
                wkid: 4490,
            },
            lods: [
                { level: 0, resolution: 0.703125, scale: 295829355.454566 },
                { level: 1, resolution: 0.3515625, scale: 147914677.727283 },
                { level: 2, resolution: 0.17578125, scale: 73957338.863641 },
                { level: 3, resolution: 0.087890625, scale: 36978669.431821 },
                { level: 4, resolution: 0.0439453125, scale: 18489334.71591 },
                { level: 5, resolution: 0.02197265625, scale: 9244667.357955 },
                { level: 6, resolution: 0.010986328125, scale: 4622333.678978 },
                { level: 7, resolution: 0.0054931640625, scale: 2311166.839489 },
                { level: 8, resolution: 0.00274658203125, scale: 1155583.419744 },
                { level: 9, resolution: 0.001373291015625, scale: 577791.709872 },
                { level: 10, resolution: 0.0006866455078125, scale: 288895.854936 },
                { level: 11, resolution: 0.00034332275390625, scale: 144447.927468 },
                { level: 12, resolution: 0.000171661376953125, scale: 72223.963734 },
                { level: 13, resolution: 8.58306884765625e-5, scale: 36111.981867 },
                { level: 14, resolution: 4.291534423828125e-5, scale: 18055.990934 },
                { level: 15, resolution: 2.1457672119140625e-5, scale: 9027.995467 },
                { level: 16, resolution: 1.0728836059570313e-5, scale: 4513.997733 },
                { level: 17, resolution: 5.3644180297851563e-6, scale: 2256.998867 },
                { level: 18, resolution: 0.000002682209014892578, scale: 1128.499433 },
            ],
        });
        const tiledLayer = new TdtLayer({
            urlTemplate:
                'http://{subDomain}.tianditu.com/vec_c/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=vec&STYLE=default&FORMAT=tiles&TILEMATRIXSET=c&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=ac0daf56728bbb77d9514ba3df69bcd3',
            subDomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
            tileInfo: tileInfo,
        });
        const tdtzjLayer = new TdtLayer({
            urlTemplate:
                'http://{subDomain}.tianditu.com/cva_c/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=cva&STYLE=default&FORMAT=tiles&TILEMATRIXSET=c&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=ac0daf56728bbb77d9514ba3df69bcd3',
            subDomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
            tileInfo: tileInfo,
        });
        return {
            baseLayers: [tiledLayer],
            referenceLayers: [tdtzjLayer],
        }
    }
    createMap = async ( container: string, type?: string,)=>{
        loadCss(arcgis_css);
        await loadScript(arcgis_js);
        const {
            Map,
            SpatialReference,
            SceneView,
            MapView,
            Basemap,
            TileLayer
        } = await getModule(
            "Map",
            "SpatialReference",
            "SceneView",
            "MapView",
            "Basemap",
            "TileLayer"
        );

        const tdBasemap = await this.useTdLayer()
        const blueBasemap = new Basemap({
            baseLayers: [
                new TileLayer({
                    url: "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer"
                })
            ],
        });

        const basemapMapper:Record<string, any> = {blueBasemap,tdBasemap}

        const baseMapName = 'tdBasemap'

        const wkid = (baseMapName == "tdBasemap" ? 4490 : 3857)

        this.map = new Map({
            basemap: basemapMapper[baseMapName],
            logo: false,
            spatialReference: {wkid}
            //ground: 'world-elevation',
            //spatialReference: SpatialReference.WebMercator,
        });

        if (type && type === "3d") {
            this.view = new SceneView({
                container,
                map: this.map,
                center:  {
                    x: 121.448809,
                    y: 31.208673,
                    spatialReference: {wkid},
                },
                zoom: 10,
                spatialReference: {wkid}
            });
            this.view.ui.remove(["attribution", "navigation-toggle", "compass"]);
        } else {
            this.view = new MapView({
                container,
                map: this.map,
                center:{
                    x: 121.448809,
                    y: 31.208673,
                    spatialReference: {wkid},
                },
                zoom: 10,
                spatialReference: {wkid}
            });
            this.view.ui.remove(["attribution", "navigation-toggle", "compass"]);
        }
    }
}
