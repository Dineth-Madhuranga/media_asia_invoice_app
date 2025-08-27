"use client"

import { useRef, useState, useEffect } from "react"
import type { InvoiceData } from "@/types"
import { InvoiceForm } from "@/components/invoice-form"
import { InvoicePreview } from "@/components/invoice-preview"
import { QuotationPreview } from "@/components/quotation-preview"
import { EmailSetupGuide } from "@/components/email-setup-guide"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Poppins } from "next/font/google"
import { sendInvoiceEmailAction } from "@/actions/send-email"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export default function Home() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [documentType, setDocumentType] = useState<"invoice" | "quotation">("invoice")
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [isEmailSending, setIsEmailSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [showEmailSetup, setShowEmailSetup] = useState(false)

  // Load html2pdf.js dynamically
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
    script.onload = () => setScriptLoaded(true)
    script.onerror = (error) => console.error("Failed to load html2pdf.js:", error)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleGenerateInvoice = (data: InvoiceData) => {
    setInvoiceData(data)
    setShowEmailSetup(false) // Hide setup guide when invoice is generated
  }

  const printDocument = async () => {
    if (!invoiceRef.current) {
      console.warn("Document not ready for printing")
      return
    }

    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=800,height=600")

    if (!printWindow) {
      console.warn("Could not open print window")
      return
    }

    // Function to convert image to base64
    const getImageAsBase64 = (imgElement: HTMLImageElement): Promise<string> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject("Could not get canvas context")
          return
        }

        canvas.width = imgElement.naturalWidth || imgElement.width
        canvas.height = imgElement.naturalHeight || imgElement.height

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          try {
            const dataURL = canvas.toDataURL("image/png", 1.0)
            resolve(dataURL)
          } catch (error) {
            reject(error)
          }
        }
        img.onerror = () => reject("Failed to load image")
        img.src = imgElement.src
      })
    }

    try {
      // Clone the document content
      const clonedContent = invoiceRef.current.cloneNode(true) as HTMLElement

      // Find all images in the cloned content and convert them to base64
      const images = clonedContent.querySelectorAll("img")
      const imagePromises = Array.from(images).map(async (img) => {
        try {
          const originalImg = invoiceRef.current?.querySelector(`img[src="${img.src}"]`) as HTMLImageElement
          if (originalImg) {
            const base64 = await getImageAsBase64(originalImg)
            img.src = base64
          }
        } catch (error) {
          console.warn("Failed to convert image to base64:", error)
          // Keep original src as fallback
        }
      })

      // Wait for all images to be processed
      await Promise.all(imagePromises)

      // Get the processed HTML
      const documentContent = clonedContent.innerHTML

      // Create the print HTML with proper styling
      const printHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print ${documentType === "invoice" ? "Invoice" : "Quotation"}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Arial', sans-serif;
                background: white;
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              @page {
                size: A4;
                margin: 0;
              }
              
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                
                .invoice-container {
                  width: 210mm;
                  height: 297mm;
                  margin: 0;
                  padding: 0;
                  box-shadow: none;
                  border: none;
                  transform: none !important;
                  scale: 1 !important;
                }
                
                img {
                  max-width: 100% !important;
                  height: auto !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              
              .invoice-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                font-family: Arial, sans-serif;
                font-size: 11px;
                line-height: 1.3;
                position: relative;
                padding: 20mm 15mm 15mm 15mm;
                box-sizing: border-box;
              }
              
              /* Image optimization for print */
              img {
                max-width: 100%;
                height: auto;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
              }
              
              /* Header styles */
              .bg-invoice-red {
                background-color: #E03C31 !important;
                color: white !important;
              }
              
              .bg-black {
                background-color: #000000 !important;
                color: white !important;
              }
              
              .text-invoice-red {
                color: #E03C31 !important;
              }
              
              .text-invoice-dark-grey {
                color: #4A4A4A !important;
              }
              
              .border-invoice-border-grey {
                border-color: #E0E0E0 !important;
              }
              
              .bg-invoice-dark-grey {
                background-color: #4A4A4A !important;
                color: white !important;
              }
              
              /* Table styles */
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                background-color: white !important;
              }
              
              th, td {
                padding: 8px 12px;
                text-align: left;
                border-bottom: 1px solid #E0E0E0;
                background-color: white !important;
              }
              
              th {
                background-color: #4A4A4A !important;
                color: white !important;
                font-weight: bold;
              }
              
              thead th {
                background-color: #4A4A4A !important;
                color: white !important;
              }
              
              tbody {
                background-color: white !important;
              }
              
              tbody tr {
                background-color: white !important;
                background: white !important;
              }
              
              tbody tr:nth-child(odd) {
                background-color: white !important;
                background: white !important;
              }
              
              tbody tr:nth-child(even) {
                background-color: white !important;
                background: white !important;
              }
              
              tbody td {
                background-color: white !important;
                background: white !important;
              }
              
              tfoot tr {
                background-color: #4A4A4A !important;
                color: white !important;
                font-weight: bold;
              }
              
              tfoot td {
                background-color: #4A4A4A !important;
                color: white !important;
              }
              
              /* Utility classes */
              .text-left { text-align: left; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
              .font-semibold { font-weight: 600; }
              .font-medium { font-weight: 500; }
              .mb-1 { margin-bottom: 4px; }
              .mb-2 { margin-bottom: 8px; }
              .mb-3 { margin-bottom: 12px; }
              .mb-4 { margin-bottom: 16px; }
              .mb-8 { margin-bottom: 32px; }
              .mt-4 { margin-top: 16px; }
              .mt-12 { margin-top: 48px; }
              .px-3 { padding-left: 12px; padding-right: 12px; }
              .px-4 { padding-left: 16px; padding-right: 16px; }
              .py-1 { padding-top: 4px; padding-bottom: 4px; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .inline-block { display: inline-block; }
              .flex { display: flex; }
              .items-center { align-items: center; }
              .items-end { align-items: flex-end; }
              .justify-between { justify-content: space-between; }
              .justify-end { justify-content: flex-end; }
              .flex-col { flex-direction: column; }
              .space-y-1 > * + * { margin-top: 4px; }
              .gap-x-2 { column-gap: 8px; }
              .grid { display: grid; }
              .grid-cols-\\[auto_1fr\\] { grid-template-columns: auto 1fr; }
              .w-\\[45\\%\\] { width: 45%; }
              .w-\\[15\\%\\] { width: 15%; }
              .w-\\[20\\%\\] { width: 20%; }
              .align-top { vertical-align: top; }
              .border-t { border-top: 1px solid #4A4A4A; }
              .pt-1 { padding-top: 4px; }
              .absolute { position: absolute; }
              .bottom-8 { bottom: 32px; }
              .left-0 { left: 0; }
              .right-0 { right: 0; }
              .italic { font-style: italic; }
              
              /* Text sizes */
              .text-lg { font-size: 18px; }
              .text-2xl { font-size: 24px; }
              .text-sm { font-size: 14px; }
              .text-xs { font-size: 12px; }
            </style>
          </head>
          <body>
            ${documentContent}
          </body>
        </html>
      `

      // Write the HTML to the new window
      printWindow.document.write(printHTML)
      printWindow.document.close()

      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 1000) // Increased timeout to ensure images load
      }
    } catch (error) {
      console.error("Error preparing document for print:", error)

      // Fallback to simple print if image processing fails
      const documentContent = invoiceRef.current.innerHTML
      const printHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print ${documentType === "invoice" ? "Invoice" : "Quotation"}</title>
            <style>
              @page { size: A4; margin: 0; }
              body { font-family: Arial, sans-serif; margin: 0; padding: 20mm 15mm; }
              img { max-width: 150px; height: auto; }
              .bg-invoice-red { background-color: #E03C31 !important; color: white !important; }
              .bg-black { background-color: #000000 !important; color: white !important; }
              .text-invoice-red { color: #E03C31 !important; }
              .text-invoice-dark-grey { color: #4A4A4A !important; }
              .bg-invoice-dark-grey { background-color: #4A4A4A !important; color: white !important; }
              .italic { font-style: italic; }
            </style>
          </head>
          <body>${documentContent}</body>
        </html>
      `

      printWindow.document.write(printHTML)
      printWindow.document.close()
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 1000)
      }
    }
  }

  const sendEmail = async () => {
    if (!invoiceData || !invoiceData.customerEmail) {
      setEmailStatus({ type: "error", message: "Customer email is required" })
      return
    }

    if (!invoiceRef.current || !scriptLoaded || !(window as any).html2pdf) {
      setEmailStatus({ type: "error", message: "PDF generator not ready. Please wait and try again." })
      return
    }

    setIsEmailSending(true)
    setEmailStatus(null)

    try {
      const element = invoiceRef.current
      
      // Store original transform and temporarily remove it
      const originalTransform = element.style.transform
      const originalTransformOrigin = element.style.transformOrigin
      
      // Temporarily remove scaling for PDF generation
      element.style.transform = 'none'
      element.style.transformOrigin = 'initial'

      // Generate PDF and get as base64
      const opt = {
        margin: [5, 5, 5, 5],
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 1,
          logging: false,
          dpi: 96,
          letterRendering: true,
          useCORS: true,
          allowTaint: true,
          width: 794,
          height: 1123,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: '#ffffff',
        },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: "portrait",
          compress: true
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      }

      // Generate PDF and get as base64 string
      const pdf = await (window as any).html2pdf().set(opt).from(element).outputPdf("datauristring")

      // Restore original transform
      element.style.transform = originalTransform
      element.style.transformOrigin = originalTransformOrigin

      // Extract base64 part from data URI
      const base64Data = pdf.split(",")[1]

      // Send email with PDF
      const result = await sendInvoiceEmailAction(invoiceData, documentType, base64Data)

      if (result.success) {
        setEmailStatus({ type: "success", message: result.message || "Email sent successfully!" })
      } else {
        setEmailStatus({ type: "error", message: result.error || "Failed to send email" })

        // Show setup guide if it's a configuration issue
        if (
          result.error?.includes("not configured") ||
          result.error?.includes("credentials") ||
          result.error?.includes("authentication")
        ) {
          setShowEmailSetup(true)
        }
      }
    } catch (error) {
      console.error("Error sending email:", error)
      setEmailStatus({ type: "error", message: "An unexpected error occurred while sending email" })
      
      // Restore original transform in case of error
      if (invoiceRef.current) {
        const element = invoiceRef.current
        element.style.transform = 'scale(0.7)'
        element.style.transformOrigin = 'top center'
      }
    } finally {
      setIsEmailSending(false)
    }
  }

  return (
    <main className={`flex flex-col lg:flex-row min-h-screen bg-gray-100 ${poppins.variable} font-sans`}>
      <div className="w-full lg:w-1/2 p-4 overflow-y-auto no-print">
        <InvoiceForm onGenerateInvoice={handleGenerateInvoice} />
        {showEmailSetup && <EmailSetupGuide />}
      </div>
      <div className="w-full lg:w-1/2 p-4 flex flex-col bg-gray-200 print:p-0 print:bg-white">
        {invoiceData ? (
          <>
            {/* Document Type Toggle - Always Visible */}
            <Card className="mb-4 no-print shadow-lg">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Document Type</h3>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => setDocumentType("invoice")}
                      variant={documentType === "invoice" ? "default" : "outline"}
                      className={
                        documentType === "invoice"
                          ? "bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold"
                          : "border-2 border-red-600 text-red-600 hover:bg-red-50 px-8 py-3 text-lg font-semibold"
                      }
                      size="lg"
                    >
                      📄 INVOICE
                    </Button>
                    <Button
                      onClick={() => setDocumentType("quotation")}
                      variant={documentType === "quotation" ? "default" : "outline"}
                      className={
                        documentType === "quotation"
                          ? "bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg font-semibold"
                          : "border-2 border-black text-black hover:bg-gray-50 px-8 py-3 text-lg font-semibold"
                      }
                      size="lg"
                    >
                      📋 QUOTATION
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={printDocument} variant="outline" className="border-gray-400 bg-transparent">
                    🖨️ Print {documentType === "invoice" ? "Invoice" : "Quotation"}
                  </Button>
                  <Button
                    onClick={sendEmail}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={!scriptLoaded || isEmailSending || !invoiceData?.customerEmail}
                  >
                    {isEmailSending
                      ? "📤 Sending..."
                      : `📧 Email ${documentType === "invoice" ? "Invoice" : "Quotation"}`}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Document Preview */}
            <div className="flex-1 flex justify-center items-start">
              <div
                ref={invoiceRef}
                className="flex-shrink-0"
                style={{ transform: "scale(0.7)", transformOrigin: "top center" }}
              >
                {documentType === "invoice" ? (
                  <InvoicePreview invoiceData={invoiceData} />
                ) : (
                  <QuotationPreview invoiceData={invoiceData} />
                )}
              </div>
            </div>

            {/* Email Status */}
            {emailStatus && (
              <div
                className={`mt-4 p-3 rounded-md text-sm text-center no-print ${
                  emailStatus.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {emailStatus.message}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-invoice-dark-grey text-lg">Fill out the form to generate your document preview.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
