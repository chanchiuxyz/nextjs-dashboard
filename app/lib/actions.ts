'use server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
 import { z } from 'zod';
 import { signIn } from '@/auth';
 import { AuthError } from 'next-auth';


 export async function authenticate(
    prevState: string | undefined,
    formData: FormData,) {
        try {
            await signIn('credentials', formData)
        }
        catch (error) {
            if (error instanceof AuthError) {
                switch (error.type) {
                    case 'CredentialsSignin':
                        return 'Ivalid credentials'
                    default:
                        return 'An error occurred'
                }
        }
        throw error
    }
}

 export type State = {
     errors?: { 
         customerId?: string[];
         amount?: string[];
         status?: string[];
     };
     message?: string | null;
 }
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer...',
    }), 
    amount: z.coerce.number().gt(0, {message: 'Amount must be greater than 0'}),
    status: z.enum(['pending', 'paid'], {invalid_type_error: 'Please select an invoice status'}),
    date: z.string(),
});
const CreateInvoice = FormSchema.omit({id: true, date: true});
const UpdateInvoice = FormSchema.omit({id: true, date: true});
export async function createInvoice(prevState: State,formData: FormData) {
    // const rawFormData = {
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status'),
    // };
    const rawFormData = Object.fromEntries(formData);
    // const {customerId, amount, status} = CreateInvoice.parse({   
    //     customerId: formData.get('customerId'),
    //     amount:  formData.get('amount'),
    //     status: formData.get('status'),});
    const validateFields = CreateInvoice.safeParse({   
        customerId: formData.get('customerId'),
        amount:  formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validateFields.success) {
        return {
            errors: validateFields.error.flatten().fieldErrors,
            message: 'Missing or invalid fields.',
        }
    }

    const {customerId, amount, status} = validateFields.data;

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
//    insert data into database
    try {
    
        await sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
    }
    catch (error) {
        return {message: 'An error occurred while creating the invoice.'}
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');   
}

export async function updateInvoice(id: string, formData: FormData) {
    const rawFormData = Object.fromEntries(formData);
    const {customerId, amount, status} = CreateInvoice.parse({   
        customerId: formData.get('customerId'),
        amount:  formData.get('amount'),
        status: formData.get('status'),});
    const amountInCents = amount * 100;
    // const date = new Date().toISOString().split('T')[0];
    try {
        await sql`UPDATE invoices SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}  WHERE id = ${id}`;
    }
    catch (error) {
        return {
            message: 'An error occurred while updating the invoice.' 
        }
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');   
}

export async function deleteInvoice(id: string) {
    // throw new Error('Failed to Delete Invoice');
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
    }
    catch (error) {
        return {
            message: 'An error occurred while deleting the invoice.' 
        }
    }
    revalidatePath('/dashboard/invoices');
    // redirect('/dashboard/invoices');   
}