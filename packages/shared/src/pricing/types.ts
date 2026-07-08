export const IGV_RATE = 0.18
export const MIN_ORDER_GROSS_PEN = 200

export type TaxAffectation = 'GRAVADO' | 'EXONERADO' | 'INAFECTO'

export type LinePricingInput = {
  quantity: number
  unitPriceNet: number
  unitsPerBaseUnit: number
  taxAffectation: TaxAffectation
}

export type LineAmounts = {
  quantityBase: number
  lineNet: number
  lineTax: number
  lineGross: number
}

export type OrderTotals = {
  totalNet: number
  totalTax: number
  totalGross: number
}
