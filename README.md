# Serverless Screenshots

Running puppeter directly on lambda is not straighforward due to its ~500mb, and lack of chromium in Lambda. [Check this](https://oxylabs.io/blog/puppeteer-on-aws-lambda)

On this example serverless app, we are packaging Puppeteer required dependencies on a Docker image, and executing it on Lambda.

* [Puppeteer on AWS Lambda with container Image](https://aws.amazon.com/blogs/architecture/field-notes-scaling-browser-automation-with-puppeteer-on-aws-lambda-with-container-image-support/#:~:text=Puppeteer%20is%20a%20Node%20library,put%20them%20in%20Lambda%20layers)
* [Serverless Framework - AWS Lambda Puppeteer](https://www.serverless.com/examples/aws-node-puppeteer)
* [Serverless browser automation](https://acloudguru.com/blog/engineering/serverless-browser-automation-with-aws-lambda-and-puppeteer)

## Not Docker

To be clear, what’s been announced is not actually Lambda running Docker per se — it’s specifically using container images as the packaging mechanism. A little like zipping up your OS image, which then gets unzipped in Lambda’s environment when your function executes. But it’s very similar — the image is actually the main feature I (and many others) have wanted — because it allows you to bundle all your dependencies, including native binaries and libraries, using any (Linux) OS you want, into a portable package that can easily be tested locally and deployed remotely.

[See reference](https://hichaelmart.medium.com/using-container-images-with-aws-lambda-7ffbd23697f1)

## Generally Longer Cold Starts

Packaging a lambda as a container image rather than a zip will lead to longer cold starts.

There are 2 reasons for this:

Container images tend to be larger, thus taking more time to load.
Containers need to initialize the underlying operating system.
In general, use a container over a plain lambda when you benefit from having the underlying OS functionality. Otherwise, stick to zip files.

![Lambda internal lifecycle](https://i.stack.imgur.com/ikxx5.png)

[Will the cold starts of my AWS Lambda function take longer if I use an ECR image/containers?](https://stackoverflow.com/questions/69512271/will-the-cold-starts-of-my-aws-lambda-function-take-longer-if-i-use-an-ecr-image)