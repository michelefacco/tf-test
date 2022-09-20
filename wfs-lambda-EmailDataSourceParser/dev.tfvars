# General
region = "us-west-2"

# Lambda specific
name = "EmailDataSourceParserDuplicate"
runtime = "nodejs16.x"
code = "lambda-code/index.js"

# Lambda Extras
trusted_entities = ["firehose.amazonaws.com"]

# Secret Manager reference example
secret_name = "/test/faccmi01-tf-ws"