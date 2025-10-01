"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';

export default function MpesaTestPage() {
  const [formData, setFormData] = useState({
    amount: '',
    phoneNumber: '',
    accountReference: '',
    transactionDesc: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phoneNumber,
          amount: parseFloat(formData.amount),
          orderDetails: {
            accountReference: formData.accountReference,
            transactionDesc: formData.transactionDesc
          }
        }),
      });

      const data = await res.json();
      setResponse(data);
      
      if (data.success) {
        alert('STK Push sent! Check your phone to complete the payment.');
      } else {
        alert(`Payment failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Payment failed. Please try again.');
      setResponse({ success: false, error: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            M-Pesa Payment Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (KSh)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="254712345678"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: 254XXXXXXXXX
              </p>
            </div>

            <div>
              <Label htmlFor="accountReference">Account Reference</Label>
              <Input
                id="accountReference"
                placeholder="TEST001"
                value={formData.accountReference}
                onChange={(e) => handleInputChange('accountReference', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="transactionDesc">Transaction Description</Label>
              <Input
                id="transactionDesc"
                placeholder="Test Payment"
                value={formData.transactionDesc}
                onChange={(e) => handleInputChange('transactionDesc', e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Pay Now'}
            </Button>
          </form>

          {response && (
            <div className="mt-6 p-4 rounded-lg bg-muted">
              <h3 className="font-medium mb-2">Response:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 text-xs text-muted-foreground space-y-1">
            <p>• This is a test page for M-Pesa integration</p>
            <p>• Use Safaricom test numbers for testing</p>
            <p>• Test number: 254708374149</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
