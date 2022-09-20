terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"

  backend "local" { path = "../terraform.ec2.tfstate" }
}

provider "aws" {
  region = "us-west-2"
}

data "aws_ssm_parameter" "security_groups" {
  name = "dev-emailage-ecs-private-ec2-sg"
}
data "aws_ssm_parameter" "subnet" {
  name = "dev-vpc-private-web-subnet3"
}

resource "aws_instance" "sebastian-demo-instance" {
  ami           = "ami-0c2ab3b8efb09f272"
  instance_type = "t2.micro"

  vpc_security_group_ids = split(",", data.aws_ssm_parameter.security_groups.value)
  subnet_id              = data.aws_ssm_parameter.subnet.value

  tags = {
    Name = "sebastian-demo-instance"
  }

}
