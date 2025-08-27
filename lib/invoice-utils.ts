import type { InvoiceItem } from "@/types"

export const generateInvoiceNumber = (prefix = "INV"): string => {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}-${year}${month}${day}-${random}`
}

export const generateQuotationNumber = (prefix = "QT"): string => {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}-${year}${month}${day}-${random}`
}

export const generateReferenceNumber = (prefix = "REF"): string => {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}-${year}${month}${day}-${random}`
}

export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }
  return date.toLocaleDateString("en-US", options).replace(/,/, "")
}

export const calculateItemTotal = (item: InvoiceItem): number => {
  return item.units * item.unitPrice
}

export const calculateGrandTotal = (items: InvoiceItem[], discount: number): number => {
  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  const total = subtotal - discount
  return total
}
