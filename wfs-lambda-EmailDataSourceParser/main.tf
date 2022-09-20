variable "region" {
  type = string
}
variable "name" {
  type = string
}
variable "runtime" {
  type = string
}
variable "code" {
  type = string
}
variable "trusted_entities" {
  type = list(string)
  default = []
}
variable "secret_name" {
  type = string
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
    redshift = {
      source = "brainly/redshift"
      version = "1.0.2"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.region
}

data "aws_secretsmanager_secret" "referenced" {
  name = var.secret_name
}

data "aws_secretsmanager_secret_version" "referenced" {
  secret_id = data.aws_secretsmanager_secret.referenced.id
}

module "lambda_function" {
  source = "git@github.com:michelefacco/tf-modules-test.git//ws-lambda-module"

  name    = var.name
  runtime = var.runtime
  code    = var.code

  trusted_entities = var.trusted_entities
}

resource "aws_kinesis_firehose_delivery_stream" "imported" {
  destination = "redshift"
  name        = "emaildatasource-dev"
  redshift_configuration {
    cluster_jdbcurl    = "jdbc:redshift://ea-dw-cluster.cuu1eubzuqq8.us-west-2.redshift.amazonaws.com:5439/eadw"
    copy_options       = "delimiter '|' emptyasnull blanksasnull fillrecord maxerror 1"
    data_table_columns = "correlationid, fk_queryhistoryid, querydate, hasBG, hasBV, hasFC, hasOC, hasSM, hasTD, bg_peoplename, bg_peoplebirthdate, bg_peoplegender, bg_peoplecontactcount, bg_peopleemailcount, bg_peoplewebsitecount, bg_peoplerelatedpeoplecount, bg_peoplerelatedcompaniescount , bv_status, bv_disposable, bv_roleaddress, bv_duration, fc_status, fc_likelihood, fc_photoscount, fc_contactinfofamilyname, fc_contactinfogivenname, fc_contactinfofullname, fc_contactinfowebsitecount, fc_contactinfochatcount, fc_organizationscount , fc_organizationname, fc_organizationstartdate, fc_organizationtitle, fc_demographicscity, fc_demographicsstate, fc_demographicscountrycode, fc_demographicslikelihood, fc_demographicsage, fc_demographicsismale, fc_socialprofilescount , fc_socialprofileshastwitter, fc_socialprofileshaslinkedin, fc_socialprofileshasgoogleplus, fc_socialprofileshasfacebook, oc_facebook, oc_twitter, oc_amazonwishlist, oc_pandora, oc_yahoo, oc_linkedin, oc_rapportive, oc_flickr, sm_response , td_demook, td_demostatuscode, td_demovelocity, td_demodatefirstseen, td_demolongevity, td_demopopularity, td_emailok, td_emailvalidationlevel, td_emailstatuscode, td_emailstatusdescription, td_emaildomaintype, td_emailrole, td_statuscode, td_statusdescription"
    data_table_name    = "si.emaildatasource"
    password           = jsondecode(data.aws_secretsmanager_secret_version.referenced.secret_string)["my-password"]
    role_arn           = "arn:aws:iam::156305373065:role/si_copier_dev"
    s3_backup_mode     = "Enabled"
    username           = "faccmitest"
    processing_configuration {
      enabled = true
      processors {
        type = "Lambda"
        parameters {
          parameter_name  = "LambdaArn"
          parameter_value = "${module.lambda_function.arn}:$LATEST"
        }
        parameters {
          parameter_name  = "BufferSizeInMBs"
          parameter_value = "1"
        }
      }
    }
    s3_backup_configuration {
      bucket_arn = "arn:aws:s3:::ea-datasources-dev"
      prefix     = "QH/"
      role_arn   = "arn:aws:iam::156305373065:role/si_copier_dev"
    }
  }
  s3_configuration {
    bucket_arn      = "arn:aws:s3:::ea-datasources-dev"
    buffer_interval = 60
    role_arn        = "arn:aws:iam::156305373065:role/si_copier_dev"
  }
  server_side_encryption {
  }
}

# custom role avoiding the default ones - inline rather reusable roles...
  # managed_policy_arns
  # inline_policy

provider "redshift" {
  host     = "ea-dw-cluster.cuu1eubzuqq8.us-west-2.redshift.amazonaws.com"
  database = "eadw"
  port     = 5439
  username = "masteruser"
  temporary_credentials {
    cluster_identifier = "ea-dw-cluster"
  }
}

resource "redshift_user" "user" {
  name      = "faccmitest"
  password  = jsondecode(data.aws_secretsmanager_secret_version.referenced.secret_string)["my-password"]
  superuser = true
}