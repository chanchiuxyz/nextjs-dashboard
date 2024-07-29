'use server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
 import { z } from 'zod';
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(), 
    amount: z.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});
const CreateInvoice = FormSchema.omit({id: true, date: true});
export async function createInvoice(formData: FormData) {
    // const rawFormData = {
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status'),
    // };
    const rawFormData = Object.fromEntries(formData);
    const {customerId, amount, status} = CreateInvoice.parse({   
        customerId: formData.get('customerId'),
        amount: Number(formData.get('amount')),
        status: formData.get('status'),});
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    // console.log('Date',date);
    
    // console.log('rawFormData',rawFormData);
    await sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

    
}