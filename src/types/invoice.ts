export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

export interface Invoice {
  id?: string;
  uid: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  date: any;
  dueDate: any;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientPhone?: string;
  senderName?: string;
  senderEmail?: string;
  senderAddress?: string;
  senderPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  companyName?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  currency?: string;
  createdAt: any;
}
