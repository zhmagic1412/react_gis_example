import axios from "axios";
import {Recordable} from "types";
import { message} from 'antd';
import { clearToken, getToken } from "./token";


const axiosServiceSpace:Recordable = {}

const createAxiosObj = (baseUrl:string, config:Recordable, method?:string) => {

    if (axiosServiceSpace[baseUrl]) {
        return axiosServiceSpace[baseUrl](
            method?{
                method,
                ...config,
            }:config
        )
    }

    const service = axios.create({
        baseURL: baseUrl,
        //withCredentials: true, // send cookies when cross-domain requests
        timeout: 60 * 1000
    })
    service.interceptors.request.use(
        config => {
            if(getToken()){
                (config as Record<string,any>).headers['g-token'] = getToken()
            }
            return config
        },
        error => {
            console.log(error) // for debug
            return Promise.reject(error)
        }
    )

    service.interceptors.response.use(
        response => {
            const res = response
            if(res.data.code !== 20000 ){
                if(res.data.code >=50000){
                    message.error(res.data.message)
                }else{
                    message.info(res.data.message)
                }
                return Promise.reject(new Error(res.data.message || '错误'))
            }else{
               return res   
            }
        },
        error => {
            const res = error.response
            console.log('error', res) // for debug
            if(res.status == 403||res.status == 401){
                clearToken()
                location.reload()
            }else{
                message.error('请求失败')
            }
            return Promise.reject(error)
        }
    )

    axiosServiceSpace[baseUrl] = service

    return service(
        method?{
            method,
            ...config,
        }:config
    )
}


const ProjectHttp = {
    get: (baseUrl:string, config:Recordable) => {
        return createAxiosObj(baseUrl, config,'get')
    },
    post: (baseUrl:string, config:Recordable) => {
        return createAxiosObj(baseUrl, config, 'post')
    },
    put: (baseUrl:string, config:Recordable) => {
        return createAxiosObj(baseUrl, config, 'put')
    },
    delete: (baseUrl:string, config:Recordable) => {
        return createAxiosObj(baseUrl, config, 'delete')
    },
    service: (baseUrl:string, config:Recordable) => {
        return createAxiosObj(baseUrl, config)
    }
}



export {
    ProjectHttp
}

