let mkConfig=require('./webpack.config.js').mkConfig;
module.exports=[
    mkConfig({
        node:true,
        dev:true
    })
];
