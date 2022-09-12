const express = require('express')
const Mock = require('mockjs')
const Mocks = require('./api/index')

const app = express()

const responseMock = (url, type, respond) => {
    return {
        url,
        type,
        response(req, res) {
            if (url.indexOf("/css") > 0) {
                res.set("content-type", "text/css")
                res.send(Mock.mock(respond instanceof Function ? respond(req, res) : respond))
            } else {
                res.json(Mock.mock(respond instanceof Function ? respond(req, res) : respond))
            }
        }
    }
}

const MockServers = Mocks.map((route) => {
    return responseMock(`/api/${route.url}`, route.type, route.response)
})

const initServer = () => {
    app.use("*", (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*")
        res.header("Access-Control-Allow-Credentials", true)
        res.header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild")
        res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS")
        next()
    })
    for (const mock of MockServers) {
        app[mock.type](mock.url, mock.response)
    }
}

initServer()

app.listen(8090, () => {
    console.log(`mock server port is 8090`)
})