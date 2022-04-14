# Start with an AWS provided image that is ready to use with Lambda
FROM public.ecr.aws/lambda/nodejs:14

# Install Chrome to get all of the Puppeteer dependencies installed
ADD https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm chrome.rpm
RUN yum install -y ./chrome.rpm

# The AWS base images provide the following environment variables:
# LAMBDA_TASK_ROOT=/var/task
# LAMBDA_RUNTIME_DIR=/var/runtime
# Install any dependencies under the ${LAMBDA_TASK_ROOT} directory alongside
# the function handler to ensure that the Lambda runtime can locate them when
# the function is invoked.
# https://docs.aws.amazon.com/lambda/latest/dg/images-create.html

# Copy files into the container
COPY . ${LAMBDA_TASK_ROOT}/

# Install, build and test the Puppeteer app and Chrome
RUN npm install

# This is passed from serverless.yaml to allow Re-use the same container for multiple functions
# https://www.serverless.com/blog/container-support-for-lambda#re-using-the-same-container-for-multiple-functions
# Lambda handler path
# CMD [ "src/take-screenshot.takeScreenshot" ]