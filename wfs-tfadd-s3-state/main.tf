terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"

  backend "s3" {}
}

provider "aws" {
  region = "us-west-2"
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

resource "aws_ssm_parameter" "imported-sg-demo" {
  name  = aws_security_group.imported-sg-demo.tags.Name
  type  = "String"
  value = aws_security_group.imported-sg-demo.id
}

resource "aws_ssm_parameter" "imported-subnet-demo" {
  name  = aws_subnet.imported-subnet-demo.tags.Name
  type  = "String"
  value = aws_subnet.imported-subnet-demo.id
}