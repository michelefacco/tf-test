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

resource "aws_security_group" "imported" {
  description = "Security Group for ECS instances"
  tags = {
    Cluster      = "emailage-ecs"
    Name         = "dev-emailage-ecs-private-ec2-sg"
    VPC          = aws_vpc.imported.id
    revokedRules = "Rule|tcp|22|22|172.16.0.0/16"
  }
}

resource "aws_subnet" "imported" {
  cidr_block = "172.10.7.0/24"
  tags = {
    Name                                                                      = "dev-vpc-private-web-subnet3"
    "kubernetes.io/cluster/eksdevD7A5C43A-b2cd296579e6455facc1f41b81ceaa8e\t" = "shared"
    "kubernetes.io/cluster/emailage-eks"                                      = "shared"
    "kubernetes.io/role/internal-elb\t"                                       = "1"
    Test                                                                      = "temp-test"
  }
  vpc_id = aws_vpc.imported.id
}

resource "aws_vpc" "imported" {
  tags = {
    Name = "dev-vpc"
  }
}

resource "aws_ssm_parameter" "imported-aws_security_group" {
  name  = aws_security_group.imported.tags.Name
  type  = "String"
  value = aws_security_group.imported.id
}

resource "aws_ssm_parameter" "imported-aws_subnet" {
  name  = aws_subnet.imported.tags.Name
  type  = "String"
  value = aws_subnet.imported.id
}

resource "aws_ssm_parameter" "imported-aws_vpc" {
  name  = aws_vpc.imported.tags.Name
  type  = "String"
  value = aws_vpc.imported.id
}
