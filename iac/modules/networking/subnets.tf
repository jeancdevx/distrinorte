resource "aws_subnet" "public" {
  for_each = local.az_subnet_map

  vpc_id                  = aws_vpc.main.id
  availability_zone       = each.key
  cidr_block              = each.value.public_cidr
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-public-${each.key}"
    Tier = "public"
  })
}

resource "aws_subnet" "private" {
  for_each = local.az_subnet_map

  vpc_id            = aws_vpc.main.id
  availability_zone = each.key
  cidr_block        = each.value.private_cidr

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-private-${each.key}"
    Tier = "private"
  })
}

resource "aws_subnet" "data" {
  for_each = local.az_subnet_map

  vpc_id            = aws_vpc.main.id
  availability_zone = each.key
  cidr_block        = each.value.data_cidr

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-data-${each.key}"
    Tier = "data"
  })
}
