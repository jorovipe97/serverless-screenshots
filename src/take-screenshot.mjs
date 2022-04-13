import captureWebsite from 'capture-website';
import validUrl from 'valid-url';
import crypto from 'crypto';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { mockEvent } from '../events/take-screenshot.mjs'

const env = process.env.NODE_ENV
// TODO: Receive this from env variables.
const client = new S3Client({ region: 'us-east-1' })

export const takeScreenshot = async (event) => {
  console.log('Starting, takeScreenshot.')
  const targetUrl = event.query.url;
  const timeout = event.stageVariables.screenshotTimeout;

  // check if the given url is valid
  if (!validUrl.isUri(targetUrl)) {
    return {
      statusCode: 422,
      body: `please provide a valid url, not: ${targetUrl}`
    };
  }

  const targetBucket = event.stageVariables.bucketName;
  const targetHash = crypto.createHash('md5').update(targetUrl).digest('hex');
  const targetFilename = `${targetHash}/original.png`;
  console.log(`Snapshotting ${targetUrl} to s3://${targetBucket}/${targetFilename}`);

  const path = env === 'local' ? `tmp/${targetHash}.png` : `/tmp/${targetHash}.png`

  try {
    // if (await fileExists(path)) {
    //   console.log(`File already exists, deleting: ${path}`)
    //   // Deletes the file if already exists.
    //   fs.unlinkSync(path)
    // }

    const capturedImage = await captureWebsite.buffer(targetUrl, path, {
      timeout,
      width: 1920,
      height: 1080,
      disableAnimations: true
    })

    // Upload capturedImage into s3 butcket.
    const command = new PutObjectCommand({
      ACL: 'public-read',
      Key: targetFilename,
      Body: capturedImage,
      Bucket: targetBucket,
      ContentType: 'image/png',
    });
    await client.send(command)
  } catch (error) {
    console.error(error)
  }
  console.log('Screenshot taked succesfully.')

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

async function fileExists (filepath) {
  let flag = true;
  try{
    fs.accessSync(filepath, fs.constants.F_OK);
  } catch (e) {
    flag = false;
  }
  return flag;
}

// Invoke the function if executed locally.
if (env === 'local') {
  takeScreenshot(mockEvent)
}
