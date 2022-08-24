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
  region = "us-west-2"
}

resource "aws_instance" "sebastian-demo-instance" {
  ami           = "ami-0c2ab3b8efb09f272"
  instance_type = "t2.micro"

  vpc_security_group_ids = [aws_security_group.imported-sg-demo.id]
  subnet_id              = aws_subnet.imported-subnet-demo.id

  tags = {
    Name = "sebastian-demo-instance"
  }

}

resource "aws_security_group" "imported-sg-demo" {

}

resource "aws_subnet" "imported-subnet-demo" {

}