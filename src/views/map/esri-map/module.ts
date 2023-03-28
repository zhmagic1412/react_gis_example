import { loadModules } from 'esri-loader'

//注册arcgis依赖的模块和url
const modules_map: IIndex<string> = {
    QueryTask: 'esri/tasks/QueryTask',
    Query: 'esri/tasks/support/Query',
    SpatialReference: 'esri/geometry/SpatialReference',
    Map: 'esri/Map',
    MapView: 'esri/views/MapView',
    TileLayer: 'esri/layers/TileLayer',
    VectorTileLayer: 'esri/layers/VectorTileLayer',
    On: 'dojo/on',
    Lang:"dojo/_base/lang",
    FeatureLayer: 'esri/layers/FeatureLayer',
    ArcGISDynamicMapServiceLayer: 'esri/layers/ArcGISDynamicMapServiceLayer',
    SimpleMarkerSymbol: 'esri/symbols/SimpleMarkerSymbol',
    SimpleLineSymbol: 'esri/symbols/SimpleLineSymbol',
    SimpleFillSymbol: 'esri/symbols/SimpleFillSymbol',
    Graphic: 'esri/Graphic',
    Polygon: 'esri/geometry/Polygon',
    Color: 'esri/Color',
    Point: 'esri/geometry/Point',
    Polyline:'esri/geometry/Polyline',
    GraphicsLayer: 'esri/layers/GraphicsLayer',
    PictureMarkerSymbol: 'esri/symbols/PictureMarkerSymbol',
    MapImageLayer: 'esri/layers/MapImageLayer',
    GeoJSONLayer: 'esri/layers/GeoJSONLayer',
    TextSymbol: 'esri/symbols/TextSymbol',
    Font: 'esri/symbols/Font',
    Config: 'esri/config',
    SHCTiledMapServiceLayer: 'esri/layers/SHCTiledMapServiceLayer',
    SHCMapServiceLayer: 'esri/layers/SHCMapServiceLayer',
    SceneView: "esri/views/SceneView",
    IntegratedMeshLayer: "esri/layers/IntegratedMeshLayer",
    IdentityManager: "esri/identity/IdentityManager",
    Geometry: "esri/geometry/Geometry",
    geometryEngine: 'esri/geometry/geometryEngine',
    Extent: 'esri/geometry/Extent',
    externalRenderers: "esri/views/3d/externalRenderers",
    webMercatorUtils: 'esri/geometry/support/webMercatorUtils',
    Intensity: 'Intensity',
    FlareClusterLayer: 'FlareClusterLayer_v4',
    ClassBreaksRenderer: 'esri/renderers/ClassBreaksRenderer',
    PopupTemplate: 'esri/PopupTemplate',
    Circle: 'esri/geometry/Circle',
    WebTileLayer:"esri/layers/WebTileLayer",
    TileInfo:"esri/layers/support/TileInfo",
    Basemap:"esri/Basemap",
    //3d
    PolygonSymbol3D: "esri/symbols/PolygonSymbol3D",
    Camera: "esri/Camera",
    heatmap3dRenderer: 'heatmap3dRenderer',
    SceneLayer: "esri/layers/SceneLayer",
    Draw:"esri/views/draw/Draw",
    LabelClass:"esri/layers/support/LabelClass",


    Color:'esri/Color',
    esriRequest:'esri/request',
    BaseTileLayer:'esri/layers/BaseTileLayer',


}
interface ModuleStore {
    QueryTask?: any;
    Query?: any;
    SpatialReference?: any;
    Map?: any;
    MapView?: any;
    TileLayer?: any;
    VectorTileLayer?: any;
    On?: string;
    Lang?: string;
    FeatureLayer?: any;
    ArcGISDynamicMapServiceLayer?: any,
    SimpleMarkerSymbol?: any;
    SimpleLineSymbol?: any;
    SimpleFillSymbol?: any;
    Graphic?: any;
    Polygon?: any;
    Color?: any;
    Point?: any;
    Polyline?: any;
    GraphicsLayer?: any;
    PictureMarkerSymbol?: any;
    MapImageLayer?: any;
    GeoJSONLayer?: any;
    TextSymbol?: any;
    Font?: any;
    Config?: any;
    SHCTiledMapServiceLayer?: any
    SHCMapServiceLayer?: any
    SceneView?: any
    IntegratedMeshLayer?: any
    IdentityManager?: any
    Geometry?: any
    geometryEngine?: any
    Extent?: any
    externalRenderers?: any
    webMercatorUtils?: any
    Intensity?: any,
    FlareClusterLayer?: any,
    ClassBreaksRenderer?: any,
    PopupTemplate?:any,
    Basemap?:any,
    //3D
    PolygonSymbol3D?: any,
    Camera?: any,
    heatmap3dRenderer?: any,
    SceneLayer?: any,
    Circle?: any,
    WebTileLayer?: any,
    TileInfo?:any,
    Draw?:any,
    LabelClass?:any,

    Color?:any,

    esriRequest?:any,

    BaseTileLayer?:any

}
type module = keyof ModuleStore

const modulesStore: ModuleStore = {}

// getModule根据名称返回模块
const getModule = async (...modulesArr: module[]) => {
    // 没有的模块才加载
    const modulesArrFiliter = modulesArr.filter(item => !modulesStore[item])
    if (modulesArrFiliter.length > 0) {
        const modulesArrNew = modulesArrFiliter.map(item => modules_map[item])
        const moduleRsArr = await loadModules(modulesArrNew)
        modulesArrFiliter.map((item, index) => (modulesStore[item] = moduleRsArr[index]))
    }

    // 最后返回模块
    return modulesStore
}

export default getModule
