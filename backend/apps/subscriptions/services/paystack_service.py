import os
import requests
import logging
from typing import Dict, Any, Optional
from uuid import uuid4

logger = logging.getLogger(__name__)


class PaystackService:
    """
    Service for handling Paystack payment integration.
    
    Handles:
    - Payment initialization
    - Payment verification
    - Customer management
    - Subscription management
    """

    def __init__(self):
        """Initialize Paystack service with API credentials."""
        self.api_key = os.getenv('PAYSTACK_SECRET_KEY')
        self.public_key = os.getenv('PAYSTACK_PUBLIC_KEY')
        self.base_url = 'https://api.paystack.co'
        
        if not self.api_key:
            logger.warning('PAYSTACK_SECRET_KEY environment variable not set')

    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authorization."""
        return {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

    def initialize_transaction(
        self,
        amount: int,
        email: str,
        reference: Optional[str] = None,
        user_id: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Initialize a Paystack transaction.
        
        Args:
            amount: Amount in kobo (smallest currency unit)
            email: Customer email
            reference: Unique reference for the transaction
            user_id: User ID for metadata
            metadata: Additional metadata
        
        Returns:
            Response from Paystack API
        """
        if not reference:
            reference = f"txn_{uuid4().hex[:16]}"

        payload = {
            'amount': amount,
            'email': email,
            'reference': reference,
            'metadata': metadata or {'user_id': user_id}
        }

        try:
            response = requests.post(
                f'{self.base_url}/transaction/initialize',
                json=payload,
                headers=self._get_headers(),
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack initialization error: {str(e)}")
            raise Exception(f"Payment initialization failed: {str(e)}")

    def verify_transaction(
        self,
        reference: str
    ) -> Dict[str, Any]:
        """
        Verify a Paystack transaction.
        
        Args:
            reference: Paystack transaction reference
        
        Returns:
            Response from Paystack API
        """
        try:
            response = requests.get(
                f'{self.base_url}/transaction/verify/{reference}',
                headers=self._get_headers(),
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack verification error: {str(e)}")
            raise Exception(f"Payment verification failed: {str(e)}")

    def create_customer(
        self,
        email: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a customer in Paystack for recurring charges.
        
        Args:
            email: Customer email
            first_name: Customer first name
            last_name: Customer last name
            phone: Customer phone number
        
        Returns:
            Response from Paystack API
        """
        payload = {
            'email': email,
            'first_name': first_name or '',
            'last_name': last_name or '',
            'phone': phone or ''
        }

        try:
            response = requests.post(
                f'{self.base_url}/customer',
                json=payload,
                headers=self._get_headers(),
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack customer creation error: {str(e)}")
            raise Exception(f"Customer creation failed: {str(e)}")

    def create_plan(
        self,
        name: str,
        description: str,
        amount: int,
        interval: str,
        plan_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a subscription plan in Paystack.
        
        Args:
            name: Plan name
            description: Plan description
            amount: Amount in kobo
            interval: Interval (monthly, quarterly, annual, weekly, hourly)
            plan_code: Optional custom plan code
        
        Returns:
            Response from Paystack API
        """
        payload = {
            'name': name,
            'description': description,
            'amount': amount,
            'interval': interval
        }

        if plan_code:
            payload['plan_code'] = plan_code

        try:
            response = requests.post(
                f'{self.base_url}/plan',
                json=payload,
                headers=self._get_headers(),
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack plan creation error: {str(e)}")
            raise Exception(f"Plan creation failed: {str(e)}")

    def create_subscription(
        self,
        customer_code: str,
        plan_code: str,
        authorization_code: Optional[str] = None,
        start_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a subscription in Paystack.
        
        Args:
            customer_code: Paystack customer code
            plan_code: Paystack plan code
            authorization_code: User's authorization code for charge
            start_date: Optional start date (YYYY-MM-DD format)
        
        Returns:
            Response from Paystack API
        """
        payload = {
            'customer': customer_code,
            'plan': plan_code
        }

        if authorization_code:
            payload['authorization'] = authorization_code

        if start_date:
            payload['start_date'] = start_date

        try:
            response = requests.post(
                f'{self.base_url}/subscription',
                json=payload,
                headers=self._get_headers(),
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack subscription creation error: {str(e)}")
            raise Exception(f"Subscription creation failed: {str(e)}")

    def disable_subscription(
        self,
        subscription_code: str,
        token: str
    ) -> Dict[str, Any]:
        """
        Disable (cancel) a subscription.
        
        Args:
            subscription_code: Paystack subscription code
            token: Token/authorization code for cancellation
        
        Returns:
            Response from Paystack API
        """
        payload = {
            'token': token
        }

        try:
            response = requests.post(
                f'{self.base_url}/subscription/disable/{subscription_code}',
                json=payload,
                headers=self._get_headers(),
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack subscription disable error: {str(e)}")
            raise Exception(f"Subscription cancellation failed: {str(e)}")

    def list_transactions(
        self,
        limit: int = 50,
        page: int = 1,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        List transactions.
        
        Args:
            limit: Number of records to return
            page: Page number
            status: Filter by status (success, failed, etc.)
        
        Returns:
            Response from Paystack API
        """
        params = {
            'perPage': limit,
            'page': page
        }

        if status:
            params['status'] = status

        try:
            response = requests.get(
                f'{self.base_url}/transaction',
                params=params,
                headers=self._get_headers(),
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack list transactions error: {str(e)}")
            raise Exception(f"Failed to list transactions: {str(e)}")

    def export_transactions(self) -> Dict[str, Any]:
        """
        Export transactions for download.
        
        Returns:
            Response from Paystack API with download URL
        """
        try:
            response = requests.get(
                f'{self.base_url}/transaction/export',
                headers=self._get_headers(),
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack export error: {str(e)}")
            raise Exception(f"Failed to export transactions: {str(e)}")
