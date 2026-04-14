import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Invoice } from '../types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button, buttonVariants } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

import { Search, MoreVertical, Download, Edit, Trash2, CheckCircle, Clock, Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { generateInvoicePDF } from '../lib/pdfGenerator';
import { cn } from '../lib/utils';

interface InvoiceListProps {
  onEdit: (invoice: Invoice) => void;
  onCreateNew: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ onEdit, onCreateNew }) => {
  const { user, profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'invoices'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
    });

    return unsubscribe;
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await deleteDoc(doc(db, 'invoices', id));
      toast.success('Invoice deleted successfully');
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'invoices', id), { status });
      toast.success(`Invoice marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none">Paid</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-none">Pending</Badge>;
      case 'overdue': return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none">Overdue</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Manage and track all your invoices in one place.</p>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by client or invoice #..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  {filterStatus === 'all' ? 'All Status' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('paid')}>Paid</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('pending')}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('overdue')}>Overdue</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('draft')}>Draft</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{invoice.clientName}</span>
                        <span className="text-xs text-muted-foreground">{invoice.clientEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {invoice.date?.seconds ? format(new Date(invoice.date.seconds * 1000), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {invoice.currency} {invoice.total.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => generateInvoicePDF(invoice, profile)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(invoice)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const { id, createdAt, updatedAt, ...rest } = invoice;
                              onEdit({ ...rest, invoiceNumber: `${invoice.invoiceNumber}-COPY` } as any);
                            }}>
                              <Plus className="mr-2 h-4 w-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice.id!, 'paid')}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice.id!, 'pending')}>
                              <Clock className="mr-2 h-4 w-4" /> Mark as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(invoice.id!)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
