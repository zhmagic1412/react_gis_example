module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended'
    ],                              
    plugins: ['@typescript-eslint'],
    env:{                         
        browser: true,
        node: true,
    },
    settings: {             //自动发现React的版本，从而进行规范react代码
        "react": {
            "pragma": "React",
            "version": "detect"
        }
    }, 
    parserOptions: {        //指定ESLint可以解析JSX语法
        "ecmaVersion": 2019,
        "sourceType": 'module',
        "ecmaFeatures":{
            jsx:true
        }
    },
    rules: {
        'no-unused-vars': 'off', // 禁止未使用过的变量
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', //生产环境禁用 debugger
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off', //生产环境禁用 console
        "@typescript-eslint/no-var-requires":0
    }
}