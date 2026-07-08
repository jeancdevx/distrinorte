import {
  IGV_RATE,
  MIN_ORDER_GROSS_PEN,
  type LineAmounts,
  type LinePricingInput,
  type OrderTotals,
  type TaxAffectation
} from './types.js'

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function calculateLineAmounts(input: LinePricingInput): LineAmounts {
  const quantityBase = input.quantity * input.unitsPerBaseUnit
  const lineNet = roundMoney(input.quantity * input.unitPriceNet)
  const lineTax =
    input.taxAffectation === 'GRAVADO' ? roundMoney(lineNet * IGV_RATE) : 0
  const lineGross = roundMoney(lineNet + lineTax)

  return { quantityBase, lineNet, lineTax, lineGross }
}

export function calculateOrderTotals(lines: LineAmounts[]): OrderTotals {
  const totalNet = roundMoney(
    lines.reduce((sum, line) => sum + line.lineNet, 0)
  )
  const totalTax = roundMoney(
    lines.reduce((sum, line) => sum + line.lineTax, 0)
  )
  const totalGross = roundMoney(
    lines.reduce((sum, line) => sum + line.lineGross, 0)
  )

  return { totalNet, totalTax, totalGross }
}

export function isMinimumOrderMet(totalGross: number): boolean {
  return totalGross >= MIN_ORDER_GROSS_PEN
}

export function parseTaxAffectation(value: string): TaxAffectation {
  if (value === 'GRAVADO' || value === 'EXONERADO' || value === 'INAFECTO') {
    return value
  }

  return 'GRAVADO'
}
