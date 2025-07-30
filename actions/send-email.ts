"use server";
import { Resend } from "resend";

interface EmailOptions {
  to: string | string[];
  subject: string;
  react: any;
  from?: string;
}

interface EmailResponse {
  success: boolean;
  data?: any;
  error?: any;
}

export async function sendEmail({ 
  to, 
  subject, 
  react, 
  from = "Penyy <onboarding@resend.dev>" 
}: EmailOptions): Promise<EmailResponse> {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      react,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}