'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import path from 'path';
import fs from 'fs';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
  });
   
  const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
  }

  // Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

export async function deleteCustomer(id: string) {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
    revalidatePath('/dashboard/customers');
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw new Error('Failed to delete customer.');
  }
}

export async function createCustomer(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const image = formData.get('image') as File | null;

  let imageUrl = '/customers/default.png'; // fallback

  try {
    // Save uploaded image if provided
    if (image && image.size > 0) {
      const imagePath = path.join(process.cwd(), 'public/customers', image.name);
      const buffer = Buffer.from(await image.arrayBuffer());
      await fs.promises.writeFile(imagePath, buffer);
      imageUrl = `/customers/${image.name}`;
    }

    // Insert into database
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${imageUrl})
    `;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw new Error('Failed to create customer.');
  }

  // Revalidate and redirect
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const image = formData.get('image_url') as File | null;

  let imageUrl = `/customers/default.png`;

  try {
    // Handle image upload
    if (image && image.size > 0) {
      const imagePath = path.join(process.cwd(), 'public/customers', image.name);
      const buffer = Buffer.from(await image.arrayBuffer());
      await fs.promises.writeFile(imagePath, buffer);
      imageUrl = `/customers/${image.name}`;
    }

    // Update database
    await sql`
      UPDATE customers
      SET name = ${name},
          email = ${email},
          image_url = ${imageUrl}
      WHERE id = ${customerId}
    `;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw new Error('Failed to update customer.');
  }

  // Revalidate and redirect **outside of try/catch**
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

// export async function updateCustomer(customerId: string, formData: FormData) {
//   const name = formData.get('name') as string;
//   const email = formData.get('email') as string;
//   const image = formData.get('image_url') as File | null;

//   try {
//     let imageUrl = `/customers/default.png`;

//     if (image && image.size > 0) {
//       const imagePath = path.join(process.cwd(), 'public/customers', image.name);
//       const buffer = Buffer.from(await image.arrayBuffer());
//       await fs.promises.writeFile(imagePath, buffer);
//       imageUrl = `/customers/${image.name}`;
//     }

//     await sql`
//       UPDATE customers
//       SET name = ${name},
//           email = ${email},
//           image_url = ${imageUrl}
//       WHERE id = ${customerId}
//     `;

//     revalidatePath('/dashboard/customers');

//     return redirect('/dashboard/customers'); // must return redirect
//   } catch (error) {
//     console.error('Error updating customer:', error);
//     throw new Error('Failed to update customer.');
//   }
// }