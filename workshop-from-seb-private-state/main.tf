terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-west-2"
}

resource "aws_instance" "sebastian-demo-instance" {
  ami           = "ami-0c2ab3b8efb09f272"
  instance_type = "t2.micro"

  vpc_security_group_ids = ["sg-090bf4911c5fba733"]
  subnet_id              = "subnet-6ed2eb35"

  tags = {
    Name = "sebastian-demo-instance"
  }

}