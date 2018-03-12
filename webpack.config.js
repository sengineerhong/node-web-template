module.exports = function(env) {
    return require(`./webpack.${env}.js`)
    //return require(`./webpack.dev.js`)
}
