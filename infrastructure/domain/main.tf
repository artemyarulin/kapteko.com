resource "aws_route53_zone" "kapteko" {
  name    = "kapteko.com"
  comment = ""
}

resource "aws_route53_record" "email" {
  zone_id = aws_route53_zone.kapteko.zone_id
  name    = "kapteko.com"
  type    = "MX"
  ttl     = 300
  records = [
    "1 ASPMX.L.GOOGLE.COM.",
    "5 ALT1.ASPMX.L.GOOGLE.COM.",
    "5 ALT2.ASPMX.L.GOOGLE.COM.",
    "10 ALT3.ASPMX.L.GOOGLE.COM.",
    "10 ALT4.ASPMX.L.GOOGLE.COM.",
  ]
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.kapteko.zone_id
  name    = "www.kapteko.com"
  type    = "A"
  alias {
    name                   = var.www-destination-name
    zone_id                = var.www-destination-hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "naked" {
  zone_id = aws_route53_zone.kapteko.zone_id
  name    = "kapteko.com"
  type    = "A"
  alias {
    name                   = aws_route53_record.www.name
    zone_id                = aws_route53_record.www.zone_id
    evaluate_target_health = false
  }
}

// Certificates has to be in us-east-1 region
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags {
    tags = {
      owner = "kapteko.com"
    }
  }
}

resource "aws_acm_certificate" "certificate" {
  provider                  = aws.us_east_1
  domain_name               = "*.kapteko.com"
  validation_method         = "EMAIL"
  subject_alternative_names = ["kapteko.com"]
}

output "certificate_arn" {
  value = aws_acm_certificate.certificate.arn
}
