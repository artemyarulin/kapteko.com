terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.51.1"
    }
  }
  backend "s3" {
    bucket  = "kapteko.com.terraform"
    key     = "terraform.tfstate"
    region  = "eu-north-1"
    encrypt = true
  }
}
