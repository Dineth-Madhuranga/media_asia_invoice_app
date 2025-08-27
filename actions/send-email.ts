"use server"

const nodemailer = require("nodemailer")
import type { InvoiceData } from "@/types"
import { formatDate } from "@/lib/invoice-utils"

export async function sendInvoiceEmailAction(
  invoiceData: InvoiceData,
  documentType: "invoice" | "quotation",
  pdfBase64: string,
) {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_PORT || !process.env.EMAIL_SECURE) {
      return {
        success: false,
        error:
          "Email service not configured. Please add EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_PORT, and EMAIL_SECURE to your environment variables.",
      }
    }

    // Validate email
    if (!invoiceData.customerEmail) {
      return { success: false, error: "Customer email is required" }
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const { customerEmail, clientName, projectTitle, invoiceNo, quotationNo } = invoiceData

    const documentNumber = documentType === "invoice" ? invoiceNo : quotationNo
    const documentTitle = documentType === "invoice" ? "Invoice" : "Quotation"

    const emailSubject = `${documentTitle} ${documentNumber} - ${projectTitle}`
    const fileName = `${documentType}-${documentNumber}.pdf`

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #E03C31; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">New Media Asia Holdings Pvt Ltd</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Dear ${clientName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your business! Please find attached your ${documentTitle.toLowerCase()} for the project: <strong>${projectTitle}</strong>
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #E03C31; margin-top: 0;">${documentTitle} Details:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>${documentTitle} Number:</strong> ${documentNumber}</li>
              <li><strong>Date:</strong> ${formatDate(invoiceData.invoiceDate)}</li>
              <li><strong>Project:</strong> ${projectTitle}</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions regarding this ${documentTitle.toLowerCase()}, please don't hesitate to contact us.
          </p>
          
          <div style="background-color: #E03C31; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0;">Contact Information:</h4>
            <p style="margin: 5px 0;">📞 +9470 155 1777</p>
            <p style="margin: 5px 0;">✉️ talk@mediaasia.lk</p>
            <p style="margin: 5px 0;">🌐 www.mediaasia.lk</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            <strong>New Media Asia Holdings Pvt Ltd</strong><br>
            189, Level one, D.S. Senanayake Veediya Kandy
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">© 2024 New Media Asia Holdings Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    `

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, "base64")

    // Email options
    const mailOptions = {
      from: `"New Media Asia" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    }

    // Send email
    const result = await transporter.sendMail(mailOptions)

    return {
      success: true,
      message: `${documentTitle} sent successfully to ${customerEmail}`,
      data: result,
    }
  } catch (error) {
    console.error("Error sending email:", error)

    // Handle specific nodemailer errors
    if (error instanceof Error) {
      if (error.message.includes("authentication") || error.message.includes("auth")) {
        return {
          success: false,
          error: "Email authentication failed. Please check your email credentials.",
        }
      }
      if (error.message.includes("connection") || error.message.includes("ECONNREFUSED")) {
        return {
          success: false,
          error: "Could not connect to email server. Please check your email configuration.",
        }
      }
      if (error.message.includes("Invalid login")) {
        return {
          success: false,
          error: "Invalid email credentials. Please check your username and password.",
        }
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}
