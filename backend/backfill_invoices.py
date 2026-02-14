import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.base")
django.setup()

from apps.subscriptions.models import Invoice
from apps.subscriptions.services.invoice_service import InvoiceService
from django.core.files.base import ContentFile

def backfill_invoices():
    invoices = Invoice.objects.filter(pdf_file='')
    print(f"Found {invoices.count()} invoices without PDFs.")

    for invoice in invoices:
        print(f"Generating PDF for invoice {invoice.invoice_number}...")
        try:
            pdf_buffer = InvoiceService.generate_pdf(invoice)
            if pdf_buffer:
                invoice.pdf_file.save(
                    f"{invoice.invoice_number}.pdf",
                    ContentFile(pdf_buffer.getvalue()),
                    save=True
                )
                print(f"Successfully generated PDF for {invoice.invoice_number}")
            else:
                print(f"Failed to generate PDF for {invoice.invoice_number}")
        except Exception as e:
            print(f"Error generating PDF for {invoice.invoice_number}: {e}")

if __name__ == "__main__":
    backfill_invoices()
