# Invoke a lambda and show logs
serverless invoke -f takeScreenshot --log

npm run takeScreenshot

# Deploy dev
serverless deploy --stage dev --region us-east-1

# Run lambda and api gateway locally
sls offline

# Run lambda runtime emulator locally
# the tr "\r" "\n" at the end is to solve an issue causing logs not showing correctly.
# https://github.com/aws/aws-lambda-runtime-interface-emulator/issues/15#issuecomment-792448261
docker run -p 9000:8080 serverless-adb-serverless-screenshots-dev:appimage | tr "\r" "\n"
