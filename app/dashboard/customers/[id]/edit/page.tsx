import Form from '@/app/ui/customers/edit-customer';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomerById } from '@/app/lib/data';

export default async function Page(props: { params: { id: string } }) {
  const { id } = props.params;

  // Fetch the single customer details
  const customer = await fetchCustomerById(id);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          {
            label: 'Edit Customer',
            href: `/dashboard/customers/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form customer={customer} />
    </main>
  );
}
