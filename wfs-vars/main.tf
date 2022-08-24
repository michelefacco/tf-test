variable "region" {
  type = string
}
variable "ami" {
  type = string
}
variable "instance_size" {
  type = string
}
variable "security_groups" {
  type = list
}
variable "subnet" {
  type = string
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"

  backend "local" { path = "../terraform.tfstate" }
}

provider "aws" {
  region = var.region
}

resource "aws_instance" "sebastian-demo-instance" {
  ami           = var.ami
  instance_type = var.instance_size

  vpc_security_group_ids = var.security_groups
  subnet_id              = var.subnet

  tags = {
    Name = "sebastian-demo-instance"
  }

}