const express=require('express')
const {generateSlug}=require('random-word-slugs')
const {ECSClient,RunTaskCommand} =require('@aws-sdk/client-ecs')
const app=express();

const PORT=9000;

app.use(express.json());

const ecsClient=new ECSClient({
    credentials: {
        accessKeyId: 'AKIAXXJWDYFACXZK3JFD',
        secretAccessKey: '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'
    }

})


app.post('/project',(req,res)=>{
    const {gitUrl}=req.body;
    const projectID=generateSlug()
    //spin  the container non ecs
    const command= new RunTaskCommand({
         
    })
})

app.listen(PORT,()=>{console.log(`API Server running on Port: ${PORT}`)})