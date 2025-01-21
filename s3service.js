const {S3} = require('aws-sdk');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');


AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.AWS_REGION, 
});

exports.s3Uploadv3= async (file)=>{
    const s3 = new  S3();
    const uid = uuidv4();
    const param = {
        Bucket: process.env.BUCKET_NAME,
       
        ContentType: file.mimetype,
        Key: `uploads/${uid}`,
        Body: file.buffer,
    };
    return await s3.upload(param).promise();
}