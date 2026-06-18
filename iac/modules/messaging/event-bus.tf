resource "aws_cloudwatch_event_bus" "main" {
  name = local.bus_name

  tags = merge(var.tags, {
    Name = local.bus_name
  })
}
