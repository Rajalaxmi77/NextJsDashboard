import CustomerForm from '@/app/ui/customers/customer-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
export default async function Page() {
    return (
        <main>
          <Breadcrumbs
            breadcrumbs={[
              { label: 'Customers', href: '/dashboard/invoices' },
              {
                label: 'Create Customer',
                href: '/dashboard/customers/create',
                active: true,
              },
            ]}
          />
         <CustomerForm/>
        </main>
      );
    }