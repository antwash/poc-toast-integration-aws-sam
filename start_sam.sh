aws dynamodb create-table --cli-input-json file://resources/create-token-table.json --endpoint-url http://localhost:8000
aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket partner-location-orders --region us-west-1
sam local start-lambda