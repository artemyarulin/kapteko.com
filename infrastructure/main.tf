provider "aws" {
  region = "eu-north-1"
  default_tags {
    tags = {
      owner = "kapteko.com"
    }
  }
}

module "domain" {
  source                         = "./domain"
}
