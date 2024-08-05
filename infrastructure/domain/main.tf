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
