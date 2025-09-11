"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { InvoiceData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { v4 as uuidv4 } from "uuid"
import { generateInvoiceNumber, generateQuotationNumber, generateReferenceNumber } from "@/lib/invoice-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface InvoiceFormProps {
  onGenerateInvoice: (data: InvoiceData) => void
}

export const InvoiceForm = ({ onGenerateInvoice }: InvoiceFormProps) => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    clientName: "",
    clientDesignation: "",
    clientOrganization: "",
    clientAddress: "",
    customerEmail: "",
    invoiceDate: new Date(),
    quotationNo: "",
    invoiceNo: "",
    referenceNo: "",
    projectTitle: "",
    items: [
      {
        id: uuidv4(),
        description: "",
        units: 0,
        unitType: "Qty" as const,
        unitPrice: 0,
      },
    ],
    discount: 0,
    notes: "",
    includeBankDetails: false,
    includeSignature: false, // Add this line
  })

  useEffect(() => {
    setInvoiceData((prev) => ({
      ...prev,
      quotationNo: generateQuotationNumber(),
      invoiceNo: generateInvoiceNumber(),
      referenceNo: generateReferenceNumber(),
    }))
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setInvoiceData((prev) => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? { ...item, [name]: name === "units" || name === "unitPrice" ? Number.parseFloat(value) || 0 : value }
          : item,
      ),
    }))
  }

  const handleUnitTypeChange = (id: string, value: "Qty" | "Days" | "Units") => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, unitType: value } : item)),
    }))
  }

  const handleAddItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, { id: uuidv4(), description: "", units: 0, unitType: "Qty" as const, unitPrice: 0 }],
    }))
  }

  const handleRemoveItem = (id: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerateInvoice(invoiceData)
  }

  const regenerateNumbers = () => {
    setInvoiceData((prev) => ({
      ...prev,
      quotationNo: generateQuotationNumber(),
      invoiceNo: generateInvoiceNumber(),
      referenceNo: generateReferenceNumber(),
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md no-print">
      <h2 className="text-2xl font-bold text-invoice-dark-grey mb-4">Document Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">Client Name</Label>
          <Input
            id="clientName"
            name="clientName"
            value={invoiceData.clientName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="clientDesignation">Client Designation</Label>
          <Input
            id="clientDesignation"
            name="clientDesignation"
            value={invoiceData.clientDesignation}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="clientOrganization">Client Organization</Label>
          <Input
            id="clientOrganization"
            name="clientOrganization"
            value={invoiceData.clientOrganization}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="customerEmail">Customer Email *</Label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            value={invoiceData.customerEmail}
            onChange={handleInputChange}
            placeholder="customer@example.com"
            required
            className="border-2 border-blue-300 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="clientAddress">Client Address</Label>
          <Textarea
            id="clientAddress"
            name="clientAddress"
            value={invoiceData.clientAddress}
            onChange={handleInputChange}
            rows={3}
            required
          />
        </div>
      </div>

      {/* Document Meta Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invoiceDate">Document Date</Label>
          <Input
            id="invoiceDate"
            name="invoiceDate"
            type="date"
            value={invoiceData.invoiceDate.toISOString().split("T")[0]}
            onChange={(e) => setInvoiceData((prev) => ({ ...prev, invoiceDate: new Date(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="quotationNo">Quotation No</Label>
          <div className="flex gap-2">
            <Input
              id="quotationNo"
              name="quotationNo"
              value={invoiceData.quotationNo}
              onChange={handleInputChange}
              readOnly
            />
            <Button type="button" onClick={regenerateNumbers} variant="outline" size="sm">
              Regenerate
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="invoiceNo">Invoice No</Label>
          <Input id="invoiceNo" name="invoiceNo" value={invoiceData.invoiceNo} onChange={handleInputChange} readOnly />
        </div>
        <div>
          <Label htmlFor="referenceNo">Reference No</Label>
          <Input
            id="referenceNo"
            name="referenceNo"
            value={invoiceData.referenceNo}
            onChange={handleInputChange}
            readOnly
          />
        </div>
      </div>

      {/* Project Title */}
      <div>
        <Label htmlFor="projectTitle">Project Title</Label>
        <Input
          id="projectTitle"
          name="projectTitle"
          value={invoiceData.projectTitle}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Items List */}
      <h3 className="text-xl font-semibold text-invoice-dark-grey mt-6 mb-3">Items</h3>
      {invoiceData.items.map((item, index) => (
        <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 border p-4 rounded-md relative">
          <div className="md:col-span-2">
            <Label htmlFor={`description-${item.id}`}>Description</Label>
            <Textarea
              id={`description-${item.id}`}
              name="description"
              value={item.description}
              onChange={(e) => handleItemChange(item.id, e)}
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor={`unitType-${item.id}`}>Unit Type</Label>
            <Select
              value={item.unitType}
              onValueChange={(value: "Qty" | "Days" | "Units" | "sq. ft.") => handleUnitTypeChange(item.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Qty">Qty</SelectItem>
                <SelectItem value="Days">Days</SelectItem>
                <SelectItem value="Units">Units</SelectItem>
                <SelectItem value="sq. ft.">sq. ft.</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={`units-${item.id}`}>{item.unitType}</Label>
            <Input
              id={`units-${item.id}`}
              name="units"
              type="number"
              value={item.units}
              onChange={(e) => handleItemChange(item.id, e)}
              required
            />
          </div>
          <div>
            <Label htmlFor={`unitPrice-${item.id}`}>Unit Price</Label>
            <Input
              id={`unitPrice-${item.id}`}
              name="unitPrice"
              type="number"
              step="0.01"
              value={item.unitPrice}
              onChange={(e) => handleItemChange(item.id, e)}
              required
            />
          </div>
          <div className="flex items-end">
            <Label className="sr-only" htmlFor={`total-${item.id}`}>
              Total
            </Label>
            <Input
              id={`total-${item.id}`}
              name="total"
              type="number"
              value={(item.units * item.unitPrice).toFixed(2)}
              readOnly
              className="bg-gray-100"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => handleRemoveItem(item.id)}
            className="absolute top-2 right-2"
          >
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" onClick={handleAddItem} className="w-full">
        Add Item
      </Button>

      {/* Discounts and Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discount">Special Discount</Label>
          <Input
            id="discount"
            name="discount"
            type="number"
            step="0.01"
            value={invoiceData.discount}
            onChange={(e) => setInvoiceData((prev) => ({ ...prev, discount: Number.parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes (Additional Details)</Label>
          <Textarea id="notes" name="notes" value={invoiceData.notes} onChange={handleInputChange} rows={3} />
        </div>
      </div>

      {/* Bank Details Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="includeBankDetails"
          checked={invoiceData.includeBankDetails}
          onCheckedChange={(checked) => setInvoiceData((prev) => ({ ...prev, includeBankDetails: checked as boolean }))}
        />
        <Label
          htmlFor="includeBankDetails"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Include bank details in document
        </Label>
      </div>

      {/* Signature Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="includeSignature"
          checked={invoiceData.includeSignature}
          onCheckedChange={(checked) => setInvoiceData((prev) => ({ ...prev, includeSignature: checked as boolean }))}
        />
        <Label
          htmlFor="includeSignature"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Include signature in document
        </Label>
      </div>

      <Button type="submit" className="w-full bg-invoice-red hover:bg-invoice-red/90">
        Generate Document Preview
      </Button>
    </form>
  )
}
