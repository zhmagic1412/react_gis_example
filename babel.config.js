module.exports = {
    presets: [
        [
            '@babel/preset-env',//替换 @babel/preset-env预设
            {
                useBuiltIns: 'usage', // 按需引入 polyfill
                corejs: 3,
            },
        ],
        "@babel/preset-react",
        [
            "@babel/preset-typescript",
            {
                isTSX: true,
                allExtensions: true, //支持所有文件扩展名
            },
        ],
    ],
    plugins: [
        [
            '@babel/plugin-transform-runtime',
            {
                corejs: 3,
            }
        ],
        [
            "import",
            {
                "libraryName": "antd",
                "libraryDirectory": "es",
                "style": "css"
            }
        ]
    ]
};
