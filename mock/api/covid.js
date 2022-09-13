const data = require('./covid.json')
module.exports = {
    url: "covid",
    type: "get",
    response: (req) => {
        return {
            code: 20000,
            message: 'ok',
            data:data
        }
    }
}