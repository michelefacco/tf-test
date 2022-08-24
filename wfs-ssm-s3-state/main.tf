variable "region" {
  type = string
}
variable "ami" {
  type = string
}
variable "instance_size" {
  type = string
}
variable "ssm_security_groups" {
  type = string
}
variable "ssm_subnet" {
  type = string
}

data "aws_ssm_parameter" "security_groups" {
  name = var.ssm_security_groups
}
data "aws_ssm_parameter" "subnet" {
  name = var.ssm_subnet
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"

  backend "s3" {} # Config file must be specified at command line level
}

provider "aws" {
  region = var.region
}

resource "aws_instance" "sebastian-demo-instance" {
  ami           = var.ami
  instance_type = var.instance_size

  vpc_security_group_ids = split(",", data.aws_ssm_parameter.security_groups.value)
  subnet_id              = data.aws_ssm_parameter.subnet.value

  tags = {
    Name = "sebastian-demo-instance"
  }

}