

declare module "ol-types"{

    export interface ILayerOptions {
        layerId: string
    }
    export interface IOlLayerOptions extends ILayerOptions{
        baseUrl?:string,
        layerName?:string,
        url?:string,
        fillColor?:string

    }
}