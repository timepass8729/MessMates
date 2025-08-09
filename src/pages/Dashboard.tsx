import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Utensils, 
  Calendar, 
  MessageSquare, 
  QrCode, 
  IndianRupee,
  LogOut,
  Clock,
  CheckCircle,
  History,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeMenu, useRealtimeAttendance, useRealtimeLeaves, useRealtimeQRCode, useUserPaymentStatus, useRealtimePayments } from '@/hooks/useRealtimeData';
import QRCodeScanner from '@/components/QRCodeScanner';
import FeedbackForm from '@/components/FeedbackForm';
import LeaveRequestForm from '@/components/LeaveRequestForm';
import { PaymentSection } from '@/components/PaymentSection';
import { format, isToday, parseISO } from 'date-fns';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [todayAttended, setTodayAttended] = useState(false);
  const { toast } = useToast();

  // Real-time data hooks
  const { menu: weeklyMenu, loading: menuLoading } = useRealtimeMenu();
  const { attendance, loading: attendanceLoading } = useRealtimeAttendance(user?.uid);
  const { leaves, loading: leavesLoading } = useRealtimeLeaves(user?.uid);
  const { qrCode, loading: qrLoading } = useRealtimeQRCode();
  const { paymentStatus, loading: paymentLoading } = useUserPaymentStatus(user?.uid || '');
  const { payments, loading: paymentsLoading } = useRealtimePayments(user?.uid);

  useEffect(() => {
    // Check if user has already marked attendance today
    if (attendance.length > 0) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayAttendance = attendance.find(record => 
        record.date === today
      );
      setTodayAttended(!!todayAttendance);
    }
  }, [attendance]);

  const handleQRScan = async (qrData: string) => {
    if (!user || !qrCode) return;

    try {
      // Verify QR code is valid for today
      const qrDate = parseISO(qrCode.date);
      if (!isToday(qrDate)) {
        toast({
          variant: "destructive",
          title: "Invalid QR Code",
          description: "This QR code is not valid for today",
        });
        return;
      }

      // Store scanned data and show menu
      setScannedData(qrData);
      setScannerActive(false);
      
      toast({
        title: "QR Code Scanned!",
        description: "View today's menu and mark your attendance",
      });
    } catch (error) {
      console.error('Error processing QR scan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process QR code. Please try again.",
      });
    }
  };

  const handleMarkAttendance = async () => {
    if (!user || !qrCode || !scannedData) return;

    try {
      // Check if already attended today
      if (todayAttended) {
        toast({
          variant: "destructive",
          title: "Already Attended",
          description: "You have already marked attendance for today",
        });
        return;
      }

      // Double check by querying database for today's attendance
      const today = new Date();
      const todayDateString = format(today, 'yyyy-MM-dd');
      
      const todayAttendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', user.uid),
        where('date', '==', todayDateString)
      );
      
      const todayAttendanceSnapshot = await getDocs(todayAttendanceQuery);
      
      if (!todayAttendanceSnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Already Attended",
          description: "You have already marked attendance for today",
        });
        setTodayAttended(true);
        return;
      }

      // Mark attendance
      const attendanceDate = new Date();
      await addDoc(collection(db, 'attendance'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split('@')[0] || 'Unknown',
        timestamp: serverTimestamp(),
        date: todayDateString,
        time: format(attendanceDate, 'HH:mm:ss'),
        qrCodeId: qrCode.id,
        mealType: qrCode.mealType || 'general'
      });

      // Update local state immediately for better UX
      setTodayAttended(true);
      setScannedData(null); // Reset scanned data
      
      toast({
        title: "Attendance Marked!",
        description: "Your meal attendance has been recorded successfully. Count will update momentarily.",
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
      });
    }
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    if (!user) return;

    setFeedbackSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        ...feedbackData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback. We'll review it soon.",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
      });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleLeaveSubmit = async (leaveData: any) => {
    if (!user) return;

    setLeaveSubmitting(true);
    try {
      await addDoc(collection(db, 'leave_requests'), {
        ...leaveData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      toast({
        title: "Leave Request Submitted!",
        description: "Your leave request has been submitted for approval.",
      });
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit leave request. Please try again.",
      });
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "Please try again",
      });
    }
  };

  // Calculate monthly attendance (resets every 30 days from first attendance)
  const calculateMonthlyAttendance = () => {
    if (attendance.length === 0) return [];
    
    // Sort attendance by date (using date field primarily, timestamp as fallback)
    const sortedAttendance = [...attendance].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(a.timestamp?.seconds * 1000 || a.timestamp);
      const dateB = b.date ? new Date(b.date) : new Date(b.timestamp?.seconds * 1000 || b.timestamp);
      return dateA.getTime() - dateB.getTime();
    });
    
    const firstAttendanceDate = sortedAttendance[0].date ? 
      new Date(sortedAttendance[0].date) : 
      new Date(sortedAttendance[0].timestamp?.seconds * 1000 || sortedAttendance[0].timestamp);
    const currentDate = new Date();
    
    // Calculate current cycle start date (every 30 days from first attendance)
    const daysSinceFirst = Math.floor((currentDate.getTime() - firstAttendanceDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentCycle = Math.floor(daysSinceFirst / 30);
    const cycleStartDate = new Date(firstAttendanceDate.getTime() + (currentCycle * 30 * 24 * 60 * 60 * 1000));
    const cycleEndDate = new Date(cycleStartDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    return attendance.filter(record => {
      const recordDate = record.date ? 
        new Date(record.date) : 
        new Date(record.timestamp?.seconds * 1000 || record.timestamp);
      return recordDate >= cycleStartDate && recordDate < cycleEndDate;
    });
  };

  const monthlyAttendance = calculateMonthlyAttendance();

  // Calculate estimated bill based on monthly attendance
  const calculateBill = () => {
    const monthlyAttendanceCount = monthlyAttendance.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyApprovedLeaves = leaves.filter(leave => {
      const leaveDate = new Date(leave.createdAt?.seconds * 1000 || leave.createdAt);
      return leave.status === 'approved' && 
             leaveDate.getMonth() === currentMonth && 
             leaveDate.getFullYear() === currentYear;
    }).length;
    
    return (monthlyAttendanceCount - monthlyApprovedLeaves) * 80; // ₹80 per meal
  };

  const estimatedBill = calculateBill();

  // Get today's menu
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysMenu = weeklyMenu.filter(item => 
    item.day.toLowerCase() === today.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="bg-background/80 backdrop-blur-sm border-b shadow-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Smart Mess Manager</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{monthlyAttendance.length}</div>
              <p className="text-xs text-muted-foreground">meals this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Bill</CardTitle>
              <IndianRupee className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">₹{estimatedBill}</div>
              <p className="text-xs text-muted-foreground">this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              <Clock className="h-4 w-4 text-accent-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${todayAttended ? 'text-green-500' : 'text-primary'}`}>
                {todayAttended ? 'Attended' : 'Ready'}
              </div>
              <p className="text-xs text-muted-foreground">
                {todayAttended ? 'attendance marked' : 'to mark attendance'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="leaves" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Leaves
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <Card className="bg-gradient-card shadow-elegant border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  Weekly Menu
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyMenu.length > 0 ? (
                  <div className="space-y-4">
                    {weeklyMenu.map((day) => (
                      <div key={day.id} className="border rounded-lg p-4 bg-background/50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{day.day}</h3>
                          <Badge variant="secondary">{day.mealType}</Badge>
                        </div>
                        <p className="text-muted-foreground">{day.items}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Menu will be updated by admin</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <QRCodeScanner
              onScanSuccess={handleQRScan}
              onMarkAttendance={handleMarkAttendance}
              isActive={scannerActive}
              onToggle={() => setScannerActive(!scannerActive)}
              scannedData={scannedData}
              todaysMenu={todaysMenu}
              todayAttended={todayAttended}
            />
          </TabsContent>

          <TabsContent value="payment">
            <div className="flex justify-center">
              <PaymentSection userPaymentStatus={paymentStatus} />
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackForm
              onSubmit={handleFeedbackSubmit}
              isSubmitting={feedbackSubmitting}
            />
          </TabsContent>

          <TabsContent value="leaves">
            <div className="space-y-6">
              <LeaveRequestForm
                onSubmit={handleLeaveSubmit}
                isSubmitting={leaveSubmitting}
              />
              
              {/* Leave History */}
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Your Leave Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaves.length > 0 ? (
                    <div className="space-y-3">
                      {leaves.map((leave) => (
                        <div key={leave.id} className="border rounded-lg p-4 bg-background/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                            </span>
                            <Badge variant={
                              leave.status === 'approved' ? 'default' : 
                              leave.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {leave.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Meal Type: {leave.mealType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Reason: {leave.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No leave requests yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Attendance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   {monthlyAttendance.length > 0 ? (
                     <div className="space-y-3">
                       <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                         <p className="text-sm font-medium">Monthly Attendance Summary</p>
                         <p className="text-xs text-muted-foreground">
                           {monthlyAttendance.length} meals attended in current cycle 
                           (resets every 30 days from first attendance)
                         </p>
                       </div>
                       {monthlyAttendance.slice(0, 10).map((record) => (
                        <div key={record.id} className="border rounded-lg p-4 bg-background/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {format(new Date(record.timestamp?.seconds * 1000 || record.timestamp), 'MMM dd, yyyy')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(record.timestamp?.seconds * 1000 || record.timestamp), 'hh:mm a')}
                              </p>
                            </div>
                            <Badge variant="default">
                              {record.mealType || 'Meal'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No attendance records yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-secondary" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   {payments.length > 0 ? (
                     <div className="space-y-3">
                       {payments.slice(0, 10).map((payment) => (
                        <div key={payment.id} className="border rounded-lg p-4 bg-background/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">₹{payment.amount}</p>
                              <p className="text-sm text-muted-foreground">
                                {payment.month || format(new Date(payment.createdAt?.seconds * 1000 || payment.createdAt), 'MMM yyyy')}
                              </p>
                            </div>
                            <Badge variant={
                              payment.status === 'paid' ? 'default' : 
                              payment.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {payment.status}
                            </Badge>
                          </div>
                          {payment.transactionId && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Transaction ID: {payment.transactionId}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <IndianRupee className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No payment records yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}