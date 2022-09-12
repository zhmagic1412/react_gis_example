import { Cookie } from "./storage"


export const setToken = (token:string)=>{
    Cookie.setCookie('g-token',token)
}

export const getToken = ()=>{
    return Cookie.getCookie('g-token')
}

export const clearToken = ()=>{
    Cookie.deleteCookie('g-token')
}
