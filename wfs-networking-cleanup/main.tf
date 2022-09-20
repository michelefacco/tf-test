terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"

  backend "local" { path = "../terraform.net.tfstate" }
}

provider "aws" {
  region = "us-west-2"
}

resource "aws_ssm_parameter" "imported-aws_security_group" {
  name  = "dev-emailage-ecs-private-ec2-sg"
  type  = "String"
  value = ""
}

resource "aws_ssm_parameter" "imported-aws_subnet" {
  name  = "dev-vpc-private-web-subnet3"
  type  = "String"
  value = ""
}

resource "aws_ssm_parameter" "imported-aws_vpc" {
  name  = "dev-vpc"
  type  = "String"
  value = ""
}
