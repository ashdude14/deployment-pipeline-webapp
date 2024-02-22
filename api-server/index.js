const express=require('express')
const {generateSlug}=require('random-word-slugs')
const {ECSClient,RunTaskCommand} =require('@aws-sdk/client-ecs')
const app=express();
require('dotenv').config()
const PORT=9000;

app.use(express.json());

const ecsClient=new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }

})

const config ={
    Cluster: process.env.ARN_CLUSTER,
    Task :process.env.ARN_TASK

}

app.post('/project',async (req,res)=>{
    const {gitUrl}=req.body;
    const projectID=generateSlug()
    //spin  the container non ecs
    const command= new RunTaskCommand({
        cluster:config.Cluster,
        taskDefinition:config.Task,
        launchType:'FARGATE',
        count:1,
        networkConfiguration : {
            awsvpcConfiguration : {
              assignPublicIp: "ENABLED",
              subnets : ['subnet-0c9f50c7e063632d5','subnet-0a12696295a19aca5','subnet-04d711719a6cd6e86'],
              securityGroups : ['sg-0d349ab544b761770']
            }
        },
        overrides : {
            containerOverrides : [
                {
                    name: " builder-image",
                    environment : [
                              { name: "GIT_REPOSITORY__URL",value:gitUrl} ,
                              {name:"PROJECT_ID",value:projectID} 
        
                    ]
                }
            ]
         
}})
   await ecsClient.send(command);
   return res.json({status:'queued',data : {projectID,url:`https://${projectID}.localhost:8000`}})
})

app.listen(PORT,()=>{console.log(`API Server running on Port: ${PORT}`)})
console.log(process.env.AWS_REGION,process.env.AWS_ACCESS_KEY_ID,process.env.AWS_SECRET_ACCESS_KEY,process.env.ARN_CLUSTER,process.env.ARN_TASK)