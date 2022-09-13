
declare module L {
    export namespace tileLayer {
        export const chinaProvider: (str: string) => any
    }
    export const markerClusterGroup: (opt: any) => any

    export namespace vectorGrid {
        export const protobuf: (url: any, opts: any) => any
    }
    export namespace canvas {
        export const tile: any
    }
}

declare module "leaflet-types"{

    export interface IPoint {
        x: number,
        y: number,
        name?: string,
        id?: string,
        count?: number
    }
    export interface ILayerOptions {
        layerId: string
    }
    type layerParams = { layers: string, format: string, transparent: boolean }
    export interface ILeafletWMSLayerOptions extends ILayerOptions {
        base: string,
        layerParams?: layerParams
        layerName?:string
    }

    export interface ILeafletMakerLayerOptions extends ILayerOptions {
        idField?: string,
        pointList: IPoint[],
        geojson?: Record<string, any>,
        iconUrl:string
    }

    export interface ILeafletMVTLayerOptions extends ILayerOptions {
        vectorTileLayerStyles: Record<string, any>,
        url: string,
        layerName?: string
    }

    export interface ILeafletJsonVTLayerOptions extends ILayerOptions {
        json:Record<string, any>,
        fillColor:string,
        color: string,
        fillOpacity: number

    }
}

