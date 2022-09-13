declare module "mapbox-types"{
    export interface ILayerOptions {
        layerId: string
    }




    export interface IMapboxLayerOptions extends ILayerOptions{
        name:string,
        url?:string,
        color?:string,
        heightAttr?:string,
        data?:Record<string, any>,
        forbidClickEvent?:boolean,
        forbidHoverEvent?:boolean,
        lineMode?:boolean,
        before?:string
    }

    export interface IMapboxHeatLayerOptions extends ILayerOptions{
        name:string,
        data:{
            x:number,
            y:number,
            value:number,
        }[],
        paint:Record<string, any>,
        before?:string
    }

}