import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Invoice, InvoiceItem } from '../types/invoice';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button, buttonVariants } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CalendarIcon, Plus, Trash2, Save, X, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const itemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Min 1'),
  price: z.number().min(0, 'Min 0'),
  tax: z.number().min(0).max(100),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientAddress: z.string().optional(),
  clientPhone: z.string().optional(),
  senderName: z.string().min(1, 'Sender name is required'),
  senderEmail: z.string().email().optional().or(z.literal('')),
  senderAddress: z.string().optional(),
  senderPhone: z.string().optional(),
  date: z.date(),
  dueDate: z.date(),
  currency: z.string().min(1),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  discount: z.number().min(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: Invoice | null;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onCancel, onSuccess, initialData }) => {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData ? {
      invoiceNumber: initialData.invoiceNumber,
      clientName: initialData.clientName,
      clientEmail: initialData.clientEmail || '',
      clientAddress: initialData.clientAddress || '',
      clientPhone: initialData.clientPhone || '',
      senderName: initialData.senderName || '',
      senderEmail: initialData.senderEmail || '',
      senderAddress: initialData.senderAddress || '',
      senderPhone: initialData.senderPhone || '',
      date: initialData.date?.seconds ? new Date(initialData.date.seconds * 1000) : new Date(),
      dueDate: initialData.dueDate?.seconds ? new Date(initialData.dueDate.seconds * 1000) : new Date(),
      currency: initialData.currency || 'USD',
      items: initialData.items.map(item => ({ ...item })),
      discount: initialData.discount || 0,
      notes: initialData.notes || '',
      terms: initialData.terms || '',
    } : {
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      clientPhone: '',
      senderName: '',
      senderEmail: '',
      senderAddress: '',
      senderPhone: '',
      date: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      currency: 'USD',
      items: [{ description: '', quantity: 1, price: 0, tax: 0 }],
      discount: 0,
      notes: '',
      terms: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedDiscount = watch('discount');

  // Auto-fill sender details from profile if it's a new invoice
  useEffect(() => {
    if (!initialData && profile) {
      if (profile.companyName || profile.displayName) {
        setValue('senderName', profile.companyName || profile.displayName || '');
      }
      if (profile.email) {
        setValue('senderEmail', profile.email);
      }
      if (profile.address) {
        setValue('senderAddress', profile.address);
      }
      if (profile.phone) {
        setValue('senderPhone', profile.phone);
      }
    }
  }, [profile, initialData, setValue]);

  const totals = React.useMemo(() => {
    const subtotal = watchedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const taxTotal = watchedItems.reduce((acc, item) => acc + (item.quantity * item.price * (item.tax / 100)), 0);
    const total = subtotal + taxTotal - watchedDiscount;
    return { subtotal, taxTotal, total };
  }, [watchedItems, watchedDiscount]);

  const onSubmit = async (data: InvoiceFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const invoiceData = {
        ...data,
        uid: user.uid,
        status: initialData?.status || 'pending',
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        updatedAt: serverTimestamp(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, 'invoices', initialData.id), invoiceData);
        toast.success('Invoice updated successfully');
      } else {
        await addDoc(collection(db, 'invoices'), {
          ...invoiceData,
          createdAt: serverTimestamp(),
        });
        toast.success('Invoice created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save invoice');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{initialData ? 'Edit Invoice' : 'Create New Invoice'}</h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Saving...' : 'Save Invoice'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sender Details */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Sender Details (From)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="senderName">Your Name / Company</Label>
                <Input id="senderName" {...register('senderName')} placeholder="Your Business Name" />
                {errors.senderName && <p className="text-xs text-destructive">{errors.senderName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Your Email</Label>
                <Input id="senderEmail" {...register('senderEmail')} placeholder="your@email.com" />
                {errors.senderEmail && <p className="text-xs text-destructive">{errors.senderEmail.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="senderAddress">Your Address</Label>
                <Textarea id="senderAddress" {...register('senderAddress')} placeholder="Your Business Address" rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderPhone">Your Phone</Label>
                <Input id="senderPhone" {...register('senderPhone')} placeholder="+1 234 567 890" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input id="clientName" {...register('clientName')} placeholder="Acme Corp" />
                {errors.clientName && <p className="text-xs text-destructive">{errors.clientName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input id="clientEmail" {...register('clientEmail')} placeholder="billing@acme.com" />
                {errors.clientEmail && <p className="text-xs text-destructive">{errors.clientEmail.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Client Address</Label>
              <Textarea id="clientAddress" {...register('clientAddress')} placeholder="123 Business St, City, Country" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Client Phone</Label>
              <Input id="clientPhone" {...register('clientPhone')} placeholder="+1 234 567 890" />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input id="invoiceNumber" {...register('invoiceNumber')} />
            </div>
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Popover>
                <PopoverTrigger className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start text-left font-normal", !watch('date') && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('date') ? format(watch('date'), "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={watch('date')} onSelect={(date) => date && setValue('date', date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start text-left font-normal", !watch('dueDate') && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('dueDate') ? format(watch('dueDate'), "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={watch('dueDate')} onSelect={(date) => date && setValue('dueDate', date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select onValueChange={(v) => setValue('currency', v)} defaultValue={watch('currency')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <Button type="button" size="sm" onClick={() => append({ description: '', quantity: 1, price: 0, tax: 0 })}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Tax %</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Input {...register(`items.${index}.description` as const)} placeholder="Item description" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" {...register(`items.${index}.quantity` as const, { valueAsNumber: true })} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" step="0.01" {...register(`items.${index}.price` as const, { valueAsNumber: true })} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" {...register(`items.${index}.tax` as const, { valueAsNumber: true })} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(watchedItems[index]?.quantity * watchedItems[index]?.price * (1 + watchedItems[index]?.tax / 100)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-end gap-2 border-t bg-muted/50 p-6">
            <div className="flex w-full max-w-[300px] items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{watch('currency')} {totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex w-full max-w-[300px] items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax Total</span>
              <span>{watch('currency')} {totals.taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex w-full max-w-[300px] items-center justify-between text-sm">
              <Label htmlFor="discount" className="text-muted-foreground">Discount</Label>
              <div className="flex items-center gap-2">
                <span>-</span>
                <Input 
                  id="discount" 
                  type="number" 
                  className="h-8 w-24 text-right" 
                  {...register('discount', { valueAsNumber: true })} 
                />
              </div>
            </div>
            <div className="mt-2 flex w-full max-w-[300px] items-center justify-between border-t pt-4 text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{watch('currency')} {totals.total.toFixed(2)}</span>
            </div>
          </CardFooter>
        </Card>

        {/* Notes & Terms */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} placeholder="Additional info for the client..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea id="terms" {...register('terms')} placeholder="Payment terms, bank details, etc." rows={4} />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};
