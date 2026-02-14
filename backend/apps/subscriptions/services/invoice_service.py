import logging
from django.utils import timezone
from django.template.loader import render_to_string
from decimal import Decimal
from io import BytesIO
import uuid

from ..models import Invoice, PaymentTransaction

logger = logging.getLogger(__name__)


class InvoiceService:
    """
    Service for managing invoices.
    
    Handles:
    - Invoice generation
    - Invoice number generation
    - PDF generation
    """

    @staticmethod
    def generate_invoice_number() -> str:
        """
        Generate a unique invoice number.
        
        Format: INV-YYYYMMDD-{random}
        
        Returns:
            Invoice number string
        """
        today = timezone.now().strftime('%Y%m%d')
        unique_part = str(uuid.uuid4().hex[:8]).upper()
        return f"INV-{today}-{unique_part}"

    @staticmethod
    def create_invoice(
        user,
        payment_transaction: PaymentTransaction,
        tax: Decimal = Decimal('0.00'),
        notes: str = ''
    ) -> Invoice:
        """
        Create an invoice for a payment transaction.
        
        Args:
            user: User object
            payment_transaction: PaymentTransaction object
            tax: Tax amount (default 0)
            notes: Additional notes for invoice
        
        Returns:
            Invoice object
        """
        invoice_number = InvoiceService.generate_invoice_number()
        
        # Calculate totals
        subtotal = payment_transaction.amount
        total = subtotal + tax

        invoice = Invoice.objects.create(
            user=user,
            payment_transaction=payment_transaction,
            invoice_number=invoice_number,
            status='issued',
            subtotal=subtotal,
            tax=tax,
            total=total,
            description=f"Subscription to {payment_transaction.subscription_plan.display_name}",
            notes=notes,
            due_date=timezone.now() + timezone.timedelta(days=30)
        )

        logger.info(f"Invoice {invoice_number} created for user {user.id}")

        return invoice

    @staticmethod
    def get_invoice_context(invoice: Invoice) -> dict:
        """
        Get context dictionary for invoice rendering.
        
        Args:
            invoice: Invoice object
        
        Returns:
            Dictionary with invoice details
        """
        return {
            'invoice': invoice,
            'user': invoice.user,
            'transaction': invoice.payment_transaction,
            'plan': invoice.payment_transaction.subscription_plan,
            'company': {
                'name': 'PrepGenius AI',
                'email': 'support@prepgenius.com',
                'phone': '+234 (0) XXX XXX XXXX',
                'address': 'Nigeria',
            },
            'currency': '₦'
        }

    @staticmethod
    def generate_pdf(invoice: Invoice) -> BytesIO:
        """
        Generate PDF for an invoice.
        
        Args:
            invoice: Invoice object
        
        Returns:
            BytesIO object with PDF content
        """
        try:
            from weasyprint import HTML, CSS
        except ImportError:
            logger.error("WeasyPrint not installed. Cannot generate PDF.")
            return None

        context = InvoiceService.get_invoice_context(invoice)
        
        # Render HTML template
        html_string = render_to_string(
            'subscriptions/invoice_template.html',
            context
        )

        try:
            # Generate PDF
            html = HTML(string=html_string)
            pdf_file = html.write_pdf()
            
            pdf_buffer = BytesIO(pdf_file)
            return pdf_buffer
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            return None

    @staticmethod
    def mark_invoice_as_paid(invoice: Invoice):
        """
        Mark an invoice as paid.
        
        Args:
            invoice: Invoice object
        """
        invoice.mark_as_paid()
        logger.info(f"Invoice {invoice.invoice_number} marked as paid")

    @staticmethod
    def get_user_invoices(user, status=None):
        """
        Get all invoices for a user.
        
        Args:
            user: User object
            status: Optional status filter
        
        Returns:
            QuerySet of invoices
        """
        invoices = Invoice.objects.filter(user=user)
        
        if status:
            invoices = invoices.filter(status=status)
        
        return invoices.order_by('-issue_date')

    @staticmethod
    def get_invoice_statistics(user) -> dict:
        """
        Get invoice statistics for a user.
        
        Args:
            user: User object
        
        Returns:
            Dictionary with stats
        """
        invoices = Invoice.objects.filter(user=user)
        
        stats = {
            'total_invoices': invoices.count(),
            'paid_invoices': invoices.filter(status='paid').count(),
            'pending_invoices': invoices.filter(status='issued').count(),
            'total_amount': sum(inv.total for inv in invoices),
            'total_paid': sum(inv.total for inv in invoices.filter(status='paid')),
        }
        
        return stats
