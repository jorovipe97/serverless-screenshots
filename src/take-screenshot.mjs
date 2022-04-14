import captureWebsite from 'capture-website';
import validUrl from 'valid-url';
import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { mockEvent } from '../events/take-screenshot.mjs'

const env = process.env.NODE_ENV
// TODO: Receive region from env variables.
const client = new S3Client({ region: 'us-east-1' })

export const takeScreenshot = async (event, context) => {
  console.log('Starting, takeScreenshot.')
  console.log('event', event)
  console.log('context', context)
  console.log('accessKeyId', process.env.AWS_ACCESS_KEY_ID)
  const targetUrl = event.queryStringParameters.url;
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
  const targetFilename = `${targetHash}/original.jpeg`;
  console.log(`Snapshotting ${targetUrl} to s3://${targetBucket}/${targetFilename}`);

  try {
    const capturedImage = await captureWebsite.buffer(targetUrl, {
      timeout,
      width: 1920,
      height: 1080,
      disableAnimations: true,
      type: 'jpeg',
      // Options passed to puppeteer.launch().
      // Required to solve this issue:
      // https://stackoverflow.com/a/62348133/4086981
      // And this:
      // https://stackoverflow.com/a/62396078/4086981
      launchOptions: {
        headless: true,
        args: [
          '--single-process',
          '--no-zygote',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      }
    })

    // Upload capturedImage into s3 butcket.
    const command = new PutObjectCommand({
      // An access denied error could happen if you're trying to set ACL to "public-read"
      // but the bucket is blocking public access. (Is not the case on this demo).
      // https://stackoverflow.com/a/65316663/4086981
      // ACL: 'public-read',
      Key: targetFilename,
      Body: capturedImage,
      Bucket: targetBucket,
      ContentType: 'image/jpeg',
    });
    const response = await client.send(command)
    console.log('response', response)
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: 'An error happened taking the screenshot :(',
          errorMessage: error.message,
        },
        null,
        2
      ),
    };
  }
  console.log('Screenshot taked succesfully.')

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Screenshot executed successfully!'
      },
      null,
      2
    ),
  };
};

// Invoke the function if executed locally.
if (env === 'local') {
  takeScreenshot(mockEvent)
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
}
