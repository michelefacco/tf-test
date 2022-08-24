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
  description = "Security Group for ECS instances"
  
  tags = {
    Cluster      = "emailage-ecs"
    Name         = "dev-emailage-ecs-private-ec2-sg"
    VPC          = "vpc-6b4b7c0d"
    revokedRules = "Rule|tcp|22|22|172.16.0.0/16"
  }
}

resource "aws_subnet" "imported-subnet-demo" {
  cidr_block = "172.10.7.0/24"

  tags = {
    Name                                                                      = "dev-vpc-private-web-subnet3"
    "kubernetes.io/cluster/eksdevD7A5C43A-b2cd296579e6455facc1f41b81ceaa8e\t" = "shared"
    "kubernetes.io/cluster/emailage-eks"                                      = "shared"
    "kubernetes.io/role/internal-elb\t"                                       = "1"
  }

  vpc_id = "vpc-6b4b7c0d"
}