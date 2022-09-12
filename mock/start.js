const nodemon = require("nodemon")

nodemon({
    script: "mock/server.js",
    watch: ["mock/"]
})

nodemon
    .on("start", function () {
        console.log("mockServer has started")
    })
    .on("quit", function () {
        console.log("mockServer has quit")
        process.exit()
    })
    .on("restart", function (files) {
        console.log("mockServer restarted due to: ", files)
    })
