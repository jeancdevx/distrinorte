import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

import type { OrderConfirmedEvent } from '@distrinorte/events'

export async function renderInvoicePdf(
  invoiceNumber: string,
  order: OrderConfirmedEvent
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595, 842])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  let y = 800
  const draw = (text: string, size = 12, useBold = false) => {
    page.drawText(text, {
      x: 50,
      y,
      size,
      font: useBold ? bold : font,
      color: rgb(0.1, 0.1, 0.1)
    })
    y -= size + 8
  }

  draw('DistriNorte — Factura comercial interna', 18, true)
  draw(`Factura N° ${invoiceNumber}`)
  draw(`Pedido: ${order.orderId}`)
  draw(`Cliente: ${order.customerId} (RUC ${order.taxId})`)
  draw(`Entrega estimada: ${order.estimatedDeliveryDate}`)
  y -= 8

  for (const line of order.lines) {
    draw(
      `${line.sku} x${line.quantity} ${line.saleUnit} — S/ ${line.lineGross.toFixed(2)}`
    )
  }

  y -= 8
  draw(`Neto: S/ ${order.totalNet.toFixed(2)}`, 12, true)
  draw(`IGV: S/ ${order.totalTax.toFixed(2)}`, 12, true)
  draw(`Total: S/ ${order.totalGross.toFixed(2)}`, 14, true)

  return pdf.save()
}
