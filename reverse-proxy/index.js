const express = require('express')
const httpProxy=require('http-proxy')


const app=express();
const port=8000;
const BASE_PATH=`https://vercel-clone-ash.s3.ap-south-1.amazonaws.com/__outputs`

const proxy=httpProxy.createProxy();

// will catch all request here
app.use((req,res)=>{
    const hostname=req.hostname;
    const subdomain=hostname.split('.')[0];

    const resolvesTo=`${BASE_PATH}/${subdomain}`
    return proxy.web(req,res,{target : resolvesTo,changeOrigin:true})
})


// if index.html not specified

proxy.on('proxyReq',(proxyReq,req,res)=>{
    const url=req.url;
    if(url==='/'){
        proxyReq.path+='index.html'
        //return proxyReq
    }
})


app.listen(port,()=>{console.log(`Server running on port: ${port}`)});