export type InvoiceItem = {
  id: string
  description: string
  units: number
  unitType: "Qty" | "Days" | "Units"
  unitPrice: number
}

export type InvoiceData = {
  clientName: string
  clientDesignation: string
  clientOrganization: string
  clientAddress: string
  customerEmail: string // Added this new field
  invoiceDate: Date
  quotationNo: string
  invoiceNo: string
  referenceNo: string
  poNumber?: string
  projectTitle: string
  items: InvoiceItem[]
  discount: number
  notes: string
  includeBankDetails: boolean
  includeSignature: boolean // Add this new field
}
