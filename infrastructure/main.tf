provider "aws" {
  region = "eu-north-1"
  default_tags {
    tags = {
      owner = "kapteko.com"
    }
  }
}

module "www" {
  source          = "./www"
  certificate-arn = module.domain.certificate_arn
}

module "domain" {
  source                         = "./domain"
  www-destination-name           = module.www.cloudfront_domain
  www-destination-hosted_zone_id = module.www.cloudfron_zone_id
}
