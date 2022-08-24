variable "region" {
  type = string
}
variable "quantity" {
  type = number
}
variable "prefix_name" {
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

  backend "s3" {} # Config file must be specified at command line level
}

provider "aws" {
  region = var.region
}

module "s3_buckets" {
  source = "git@github.com:michelefacco/tf-modules-test.git//ws-s3-module-test"

  count = var.quantity

  bucket_name = "${var.prefix_name}-${var.region}-s3-tf-module-bucket-${count.index}"

  tags = {
    Terraform = "true"
    OtherTag  = "whatever"
  }
}


