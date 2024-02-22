const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const PROJECT_ID = process.env.PROJECT_ID;

async function init() {
    console.log('Executing script.js');
    const outDirPath = path.join(__dirname, 'output');

    // fs.mkdir(outDirPath, { recursive: true }, (err) => {
    //     if (err) {
    //         console.error('Error creating directory:', err);
    //     } else {
    //         console.log('Directory created successfully:', outDirPath);
    //     }
    // });

    const p = exec(`cd ${outDirPath} && npm install && npm run build`);

    p.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    p.stderr.on('data', function (data) {
        console.error('Error:', data.toString());
    });

    p.on('close', async function () {
        console.log('Build Complete');
        //
        const distFolderPath = path.join(__dirname, 'output', 'dist');;
        // fs.mkdir(distFolderPath, { recursive: true }, (err) => {
        //     if (err) {
        //         console.error('Error creating directory:', err);
        //     } else {
        //         console.log('Directory created successfully:', distFolderPath);
        //     }
        // });
        const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true });

        for (const file of distFolderContents) {
            const filePath = path.join(distFolderPath, file);
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log('uploading', filePath);

            const command = new PutObjectCommand({
                Bucket: 'vercel-clone-ash',
                Key: `__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            });

            try {
                await s3Client.send(command);
                console.log('uploaded', filePath);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
        console.log('Done...');
    });
}

init();
