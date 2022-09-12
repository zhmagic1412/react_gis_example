import React, {lazy, LazyExoticComponent, Suspense} from "react";
import {RouteObject} from "react-router-dom";
import {Recordable} from "types";

const AppLayout = lazy(() => import('../components/layout'))
const Home = lazy(() => import('@/views/home'))
const AppMap = lazy(()=>import('@/views/map'))
type URoute = RouteObject | Recordable;

const LazyImportComponent = (props: { lazyChildren: LazyExoticComponent<() => JSX.Element> }) => {
    return (
        <Suspense fallback={null}>
            <props.lazyChildren/>
        </Suspense>
    )
}


const routes: URoute[] = [
    {
        key: "0",
        path: "/",
        element: <LazyImportComponent lazyChildren={AppLayout}/>,
        children: [
            {
                key: "1",
                index: true,
                element: <LazyImportComponent lazyChildren={AppMap}/>
            }
        ],
    }
]

export {
    routes
};
