"use client"

import Image from "next/image"
import type { InvoiceData } from "@/types"
import { calculateGrandTotal, formatDate } from "@/lib/invoice-utils"
import { Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

interface QuotationPreviewProps {
  invoiceData: InvoiceData
}

export const QuotationPreview = ({ invoiceData }: QuotationPreviewProps) => {
  const {
    clientName,
    clientDesignation,
    clientOrganization,
    clientAddress,
    invoiceDate,
    quotationNo,
    invoiceNo,
    referenceNo,
    projectTitle,
    items,
    discount,
    notes,
    includeBankDetails,
    includeSignature, // Add this line
  } = invoiceData

  const grandTotal = calculateGrandTotal(items, discount)

  return (
    <div
      className={`invoice-container bg-white px-8 py-8 shadow-lg print:shadow-none print:border-none ${poppins.variable} font-sans`}
      style={{ width: "210mm", minHeight: "297mm", margin: "0 auto" }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col">
          <div className="bg-black text-white text-lg font-semibold px-4 py-1 mb-4 inline-block">QUOTATION</div>
          <h1 className="text-2xl font-bold text-invoice-red mb-2">New Media Asia Holdings Pvt Ltd</h1>
          <div className="text-sm text-invoice-dark-grey space-y-1">
            <p className="flex items-center">
              <span className="mr-2">📍</span>
              {"189, Level one, D.S. Senanayake Veediya Kandy"}
            </p>
            <p className="flex items-center">
              <span className="mr-2">📞</span>
              {"+9470 155 1777"}
            </p>
            <p className="flex items-center">
              <span className="mr-2">✉️</span>
              {"talk@mediaasia.lk"}
            </p>
            <p className="flex items-center">
              <span className="mr-2">🌐</span>
              <a href="https://www.mediaasia.lk">{"www.mediaasia.lk"}</a>
            </p>
          </div>
        </div>
        {/* Logo and Quotation Meta Details */}
        <div className="flex flex-col items-end">
          <Image src="/images/medialogo.png" alt="Media Asia Logo" width={150} height={50} className="mb-4" />
          <div className="text-sm text-invoice-dark-grey">
            <div className="grid grid-cols-[auto_1fr] gap-x-2">
              <p className="text-left">{"DATE:"}</p>
              <p className="font-medium text-left">{formatDate(invoiceDate)}</p>
              <p className="text-left">{"QT No:"}</p>
              <p className="font-medium text-left">{quotationNo}</p>
              <p className="text-left">{"INV NO:"}</p>
              <p className="font-medium text-left">{invoiceNo}</p>
              <p className="text-left">{"Ref No:"}</p>
              <p className="font-medium text-left">{referenceNo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Details */}
      <div className="mb-4 text-invoice-dark-grey text-sm">
        <p className="font-medium">{clientName}</p>
        <p>{clientDesignation}</p>
        <p>{clientOrganization}</p>
        <p>{clientAddress}</p>
      </div>

      {/* Project Title - Aligned right */}
      <div className="mb-4 text-invoice-dark-grey text-sm font-semibold text-right">{projectTitle}</div>

      {/* Items Table */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-invoice-dark-grey text-white text-sm">
            <th className="py-2 px-4 text-left w-[45%]">DESCRIPTION</th>
            <th className="py-2 px-4 text-center w-[15%]">UNITS</th>
            <th className="py-2 px-4 text-right w-[20%]">AMOUNT</th>
            <th className="py-2 px-4 text-right w-[20%]">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-invoice-border-grey text-invoice-dark-grey text-sm">
              <td className="py-2 px-4 align-top">{item.description}</td>
              <td className="py-2 px-4 text-center align-top">
                {item.units} {item.unitType}
              </td>
              <td className="py-2 px-4 text-right align-top">{item.unitPrice.toFixed(2)}</td>
              <td className="py-2 px-4 text-right align-top">{(item.units * item.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
          {discount > 0 && (
            <tr className="border-b border-invoice-border-grey text-invoice-dark-grey text-sm">
              <td className="py-2 px-4 align-top font-semibold" colSpan={3}>
                Special Discount
              </td>
              <td className="py-2 px-4 text-right align-top">({discount.toFixed(2)})</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-invoice-dark-grey text-white text-sm font-bold">
            <td className="py-2 px-4 text-right" colSpan={3}>
              TOTAL
            </td>
            <td className="py-2 px-4 text-right">{grandTotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Notes / Bank Details */}
      <div className="mb-8 text-invoice-dark-grey text-sm">
        {includeBankDetails && (
          <>
            <p className="font-medium">{"Wire Transfer details 111000228032 NDB Bank - Kandy City"}</p>
            <p className="font-medium">
              {"Cheques in-favour of Acc Name : "}
              <span className="font-bold">New Media Asia Holdings Pvt Ltd.</span>
            </p>
          </>
        )}
        {notes && <p className={includeBankDetails ? "mt-4" : ""}>{notes}</p>}
      </div>

      {/* Signature Section */}
      <div className="flex justify-end mt-12">
        {includeSignature ? (
          <div className="flex flex-col items-center text-invoice-dark-grey text-sm">
            <Image src="/images/signature.png" alt="Signature" width={200} height={100} className="mb-2" />
            <p className="border-t border-invoice-dark-grey pt-1">{"New Media Asia Holdings (Pvt) Ltd. Signature"}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-invoice-dark-grey text-sm">
            <p className="italic text-xs">{"This is a computer generated quotation. No signature required."}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-invoice-dark-grey">
        <p>{"www.mediaasia.lk"}</p>
      </div>
    </div>
  )
}
