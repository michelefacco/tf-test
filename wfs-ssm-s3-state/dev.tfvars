# General
region = "us-west-2"

# Instance specific
ami = "ami-0c2ab3b8efb09f272"
instance_size = "t2.micro"

# Name of SSM parameters used to import the actual values
ssm_security_groups = "dev-emailage-ecs-private-ec2-sg"
ssm_subnet = "dev-vpc-private-web-subnet3"