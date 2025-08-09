import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Upload, CreditCard, CheckCircle } from 'lucide-react';

interface PaymentSectionProps {
  userPaymentStatus?: 'pending' | 'paid' | 'expired' | null;
}

export function PaymentSection({ userPaymentStatus }: PaymentSectionProps) {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
    }
  };

  const handlePaymentSubmission = async () => {
    if (!user || !transactionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter transaction ID",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Unknown',
        amount: 3000,
        currency: 'INR',
        transactionId: transactionId.trim(),
        paymentMethod: 'UPI',
        status: 'pending',
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        createdAt: serverTimestamp(),
        verifiedAt: null,
        verifiedBy: null,
      });

      toast({
        title: "Payment Submitted",
        description: "Your payment has been submitted for verification",
      });

      setTransactionId('');
      setPaymentScreenshot(null);
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: "Error",
        description: "Failed to submit payment",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  const getStatusColor = () => {
    switch (userPaymentStatus) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (userPaymentStatus) {
      case 'paid': return 'Payment Verified ✓';
      case 'pending': return 'Payment Under Review';
      case 'expired': return 'Payment Expired';
      default: return 'Payment Required';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5" />
          Monthly Meal Fees
        </CardTitle>
        <CardDescription>
          <span className={getStatusColor()}>{getStatusText()}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {userPaymentStatus !== 'paid' && (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">₹3,000</p>
              <p className="text-sm text-muted-foreground">Per Month</p>
            </div>

            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/9c7d80ff-4e92-4d0f-acbf-bf36eaa4ddd2.png" 
                alt="Payment QR Code"
                className="w-64 h-64 object-contain border rounded-lg"
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Scan QR code with any UPI app</p>
              <p>UPI ID: megharajdandgavhal2004@okicici</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="transactionId">Transaction ID *</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter UPI transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </>
        )}

        {userPaymentStatus === 'paid' && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <p className="text-green-600 font-medium">Payment Verified</p>
            <p className="text-sm text-muted-foreground">Your meal service is active</p>
          </div>
        )}
      </CardContent>

      {userPaymentStatus !== 'paid' && (
        <CardFooter>
          <Button 
            onClick={handlePaymentSubmission}
            disabled={isSubmitting || !transactionId.trim()}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Payment'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}