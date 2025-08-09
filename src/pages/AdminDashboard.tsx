import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { signOut, deleteUser, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  Utensils,
  Users,
  MessageSquare,
  BarChart3,
  QrCode,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  FileText,
  IndianRupee,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeMenu, useRealtimeFeedback, useRealtimeAttendance, useRealtimeLeaves, useRealtimePayments, useRealtimeUsers } from '@/hooks/useRealtimeData';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

export default function AdminDashboard() {
  const [user] = useAuthState(auth);
  const [newItem, setNewItem] = useState({
    day: '',
    mealType: '',
    items: ''
  });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [qrData, setQrData] = useState('');
  const [generatingQR, setGeneratingQR] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' });
  const [usersLoading, setUsersLoading] = useState(false);
  const { toast } = useToast();

  // Real-time data hooks
  const { menu: menuItems, loading: menuLoading } = useRealtimeMenu();
  const { feedback, loading: feedbackLoading } = useRealtimeFeedback();
  const { attendance, loading: attendanceLoading } = useRealtimeAttendance(null);
  const { leaves, loading: leavesLoading } = useRealtimeLeaves(null);
  const { payments, loading: paymentsLoading } = useRealtimePayments(null);
  const { users: realtimeUsers, loading: realtimeUsersLoading } = useRealtimeUsers();

  // Use real-time users data
  useEffect(() => {
    setAllUsers(realtimeUsers);
    setUsersLoading(realtimeUsersLoading);
  }, [realtimeUsers, realtimeUsersLoading]);

  const generateQRCode = async () => {
    setGeneratingQR(true);
    try {
      const today = new Date();
      const qrValue = `meal-attendance-${format(today, 'yyyy-MM-dd')}-${Date.now()}`;
      
      await addDoc(collection(db, 'daily_qr'), {
        date: format(today, 'yyyy-MM-dd'),
        qrValue,
        mealType: 'general',
        createdAt: serverTimestamp(),
        createdBy: user?.email
      });

      setQrData(qrValue);
      toast({
        title: "QR Code Generated!",
        description: "Today's attendance QR code is ready",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate QR code",
      });
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.day || !newItem.mealType || !newItem.items) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all fields",
      });
      return;
    }

    try {
      await addDoc(collection(db, 'weekly_menu'), {
        ...newItem,
        createdAt: serverTimestamp(),
        createdBy: user?.email
      });

      setNewItem({ day: '', mealType: '', items: '' });
      
      toast({
        title: "Menu item added",
        description: "New menu item has been added successfully",
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add menu item",
      });
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem || !editingItem.day || !editingItem.mealType || !editingItem.items) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all fields",
      });
      return;
    }

    try {
      const itemRef = doc(db, 'weekly_menu', editingItem.id);
      await updateDoc(itemRef, {
        day: editingItem.day,
        mealType: editingItem.mealType,
        items: editingItem.items,
        updatedAt: serverTimestamp()
      });

      setEditingItem(null);
      
      toast({
        title: "Menu item updated",
        description: "Menu item has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update menu item",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'weekly_menu', id));
      
      toast({
        title: "Menu item deleted",
        description: "Menu item has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete menu item",
      });
    }
  };

  const handleFeedbackResponse = async (feedbackId: string, status: string, response?: string) => {
    try {
      const feedbackRef = doc(db, 'feedback', feedbackId);
      await updateDoc(feedbackRef, {
        status,
        adminResponse: response || '',
        respondedAt: serverTimestamp(),
        respondedBy: user?.email
      });

      setSelectedFeedback(null);
      setFeedbackResponse('');
      
      toast({
        title: "Feedback Updated",
        description: `Feedback marked as ${status}`,
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update feedback",
      });
    }
  };

  const handleLeaveResponse = async (leaveId: string, status: string) => {
    try {
      const leaveRef = doc(db, 'leave_requests', leaveId);
      await updateDoc(leaveRef, {
        status,
        respondedAt: serverTimestamp(),
        respondedBy: user?.email
      });

      toast({
        title: "Leave Request Updated",
        description: `Leave request ${status}`,
      });
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update leave request",
      });
    }
  };

  const exportAttendanceData = () => {
    if (attendance.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No attendance data to export",
      });
      return;
    }

    const csvData = attendance.map(record => ({
      Date: format(new Date(record.timestamp?.seconds * 1000 || record.timestamp), 'yyyy-MM-dd'),
      Time: format(new Date(record.timestamp?.seconds * 1000 || record.timestamp), 'HH:mm:ss'),
      Email: record.userEmail,
      MealType: record.mealType || 'general'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `attendance-data-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    
    toast({
      title: "Data Exported",
      description: "Attendance data has been downloaded",
    });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.password || !newUser.name) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all fields",
      });
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      
      // Add user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: serverTimestamp(),
        createdBy: user?.email
      });

      setNewUser({ email: '', password: '', name: '', role: 'user' });
      
      // Refresh users list
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(users);
      
      toast({
        title: "User added",
        description: "New user has been created successfully",
      });
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add user",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (userEmail === 'megharajdandgavhal2004@gmail.com') {
      toast({
        variant: "destructive",
        title: "Cannot delete admin",
        description: "Cannot delete the admin user",
      });
      return;
    }

    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Refresh users list
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(users);
      
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user",
      });
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

  // Calculate stats
  const uniqueUsers = new Set(attendance.map(record => record.userId)).size;
  const pendingFeedbacks = feedback.filter(f => f.status === 'pending').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const monthlyRevenue = payments.filter(p => p.status === 'paid' && p.month === currentMonth).reduce((sum, p) => sum + p.amount, 0);

  const handlePaymentVerification = async (paymentId: string, status: 'paid' | 'rejected') => {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status,
        verifiedAt: serverTimestamp(),
        verifiedBy: user?.email
      });

      toast({
        title: "Payment Updated",
        description: `Payment ${status === 'paid' ? 'verified' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="bg-background/80 backdrop-blur-sm border-b shadow-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <span className="font-bold text-3xl">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="destructive" className="bg-gradient-primary">Admin</Badge>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">registered users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">₹{monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{pendingPayments}</div>
              <p className="text-xs text-muted-foreground">need verification</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Feedbacks</CardTitle>
              <MessageSquare className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{pendingFeedbacks}</div>
              <p className="text-xs text-muted-foreground">need response</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingLeaves}</div>
              <p className="text-xs text-muted-foreground">need approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Codes
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="leaves" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Leaves
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <div className="space-y-6">
              {/* Add New Menu Item */}
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="day">Day</Label>
                        <Select 
                          value={editingItem ? editingItem.day : newItem.day} 
                          onValueChange={(value) => editingItem ? setEditingItem({...editingItem, day: value}) : setNewItem(prev => ({ ...prev, day: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                            <SelectItem value="Saturday">Saturday</SelectItem>
                            <SelectItem value="Sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mealType">Meal Type</Label>
                        <Select 
                          value={editingItem ? editingItem.mealType : newItem.mealType} 
                          onValueChange={(value) => editingItem ? setEditingItem({...editingItem, mealType: value}) : setNewItem(prev => ({ ...prev, mealType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select meal type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Breakfast">Breakfast</SelectItem>
                            <SelectItem value="Lunch">Lunch</SelectItem>
                            <SelectItem value="Dinner">Dinner</SelectItem>
                            <SelectItem value="Snack">Snack</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="items">Menu Items</Label>
                        <Input
                          id="items"
                          placeholder="Rice, Dal, Sabji, Roti..."
                          value={editingItem ? editingItem.items : newItem.items}
                          onChange={(e) => editingItem ? setEditingItem({...editingItem, items: e.target.value}) : setNewItem(prev => ({ ...prev, items: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-gradient-primary hover:shadow-glow">
                        {editingItem ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        {editingItem ? 'Update Item' : 'Add Item'}
                      </Button>
                      {editingItem && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setEditingItem(null)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Menu List */}
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle>Current Menu ({menuItems.length} items)</CardTitle>
                </CardHeader>
                <CardContent>
                  {menuItems.length > 0 ? (
                    <div className="space-y-4">
                      {menuItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{item.day}</h3>
                              <Badge variant="secondary">{item.mealType}</Badge>
                            </div>
                            <p className="text-muted-foreground">{item.items}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No menu items added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-6">
              {/* Add New User */}
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add New User
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="userEmail">Email</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          placeholder="user@example.com"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userName">Name</Label>
                        <Input
                          id="userName"
                          placeholder="Full Name"
                          value={newUser.name}
                          onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userPassword">Password</Label>
                        <Input
                          id="userPassword"
                          type="password"
                          placeholder="Password (min 6 chars)"
                          value={newUser.password}
                          onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userRole">Role</Label>
                        <Select 
                          value={newUser.role} 
                          onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="bg-gradient-primary hover:shadow-glow">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Users List */}
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle>All Users ({allUsers.length} users)</CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : allUsers.length > 0 ? (
                    <div className="space-y-4">
                      {allUsers.map((userItem) => (
                        <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{userItem.name}</span>
                              <Badge variant={userItem.role === 'admin' ? 'destructive' : 'secondary'}>
                                {userItem.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{userItem.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Created: {userItem.createdAt ? new Date(userItem.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {userItem.email !== 'megharajdandgavhal2004@gmail.com' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-6">
              {/* Payment Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-card shadow-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">₹{totalRevenue.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">All time</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card shadow-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-500" />
                      This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-500">₹{monthlyRevenue.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">{currentMonth}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card shadow-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">{pendingPayments}</div>
                    <p className="text-sm text-muted-foreground">payments to verify</p>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Verification */}
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    Payment Verification ({payments.length} total)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {payments.length > 0 ? (
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <div key={payment.id} className="border rounded-lg p-4 bg-background/50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">₹{payment.amount.toLocaleString()}</h4>
                                <Badge variant={
                                  payment.status === 'paid' ? 'default' : 
                                  payment.status === 'rejected' ? 'destructive' : 'secondary'
                                }>
                                  {payment.status}
                                </Badge>
                                <Badge variant="outline">{payment.paymentMethod}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{payment.userEmail}</p>
                              <p className="text-sm">Transaction ID: {payment.transactionId}</p>
                              <p className="text-sm">Month: {payment.month}</p>
                            </div>
                            {payment.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handlePaymentVerification(payment.id, 'paid')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Verify
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handlePaymentVerification(payment.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                          {payment.createdAt && (
                            <p className="text-xs text-muted-foreground">
                              Submitted on {format(new Date(payment.createdAt.seconds * 1000), 'MMM dd, yyyy hh:mm a')}
                            </p>
                          )}
                          {payment.verifiedAt && (
                            <p className="text-xs text-green-600">
                              Verified by {payment.verifiedBy} on {format(new Date(payment.verifiedAt.seconds * 1000), 'MMM dd, yyyy hh:mm a')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <IndianRupee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No payments received yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="qr">
            <QRCodeGenerator
              onGenerate={generateQRCode}
              qrData={qrData}
              isGenerating={generatingQR}
            />
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="bg-gradient-card shadow-elegant border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Daily Attendance ({attendance.length} records)
                </CardTitle>
                <Button 
                  variant="outline" 
                  onClick={exportAttendanceData}
                  className="flex items-center gap-2 border-primary/20 hover:bg-primary/10"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {attendance.length > 0 ? (
                  <div className="space-y-4">
                    {/* Group attendance by date */}
                    {Object.entries(
                      attendance.reduce((groups: any, record) => {
                        const date = record.date || format(new Date(record.timestamp?.seconds * 1000 || record.timestamp), 'yyyy-MM-dd');
                        if (!groups[date]) groups[date] = [];
                        groups[date].push(record);
                        return groups;
                      }, {})
                    )
                    .sort(([a], [b]) => b.localeCompare(a)) // Sort by date desc
                    .slice(0, 7) // Show only last 7 days
                    .map(([date, records]: [string, any[]]) => (
                      <div key={date} className="border rounded-lg p-4 bg-background/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-primary">
                            {format(new Date(date), 'EEEE, MMM dd, yyyy')}
                          </h4>
                          <Badge variant="outline">{records.length} attendees</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {records.map((record) => (
                            <div key={record.id} className="flex items-center justify-between p-2 border rounded bg-background/50">
                              <div>
                                <p className="text-sm font-medium">{record.userName || record.userEmail}</p>
                                <p className="text-xs text-muted-foreground">
                                  {record.time || format(new Date(record.timestamp?.seconds * 1000 || record.timestamp), 'HH:mm')}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {record.mealType || 'General'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No attendance records yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <div className="space-y-6">
              <Card className="bg-gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    User Feedback ({feedback.length} total)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {feedback.length > 0 ? (
                    <div className="space-y-4">
                      {feedback.map((fb) => (
                        <div key={fb.id} className="border rounded-lg p-4 bg-background/50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{fb.subject}</h4>
                                <Badge variant={
                                  fb.status === 'resolved' ? 'default' : 
                                  fb.status === 'rejected' ? 'destructive' : 'secondary'
                                }>
                                  {fb.status}
                                </Badge>
                                <Badge variant="outline">{fb.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{fb.userEmail}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-sm ${i < fb.rating ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            {fb.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedFeedback(fb)}
                                >
                                  Respond
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleFeedbackResponse(fb.id, 'resolved')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleFeedbackResponse(fb.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm mb-2">{fb.message}</p>
                          {fb.adminResponse && (
                            <div className="bg-primary/10 p-3 rounded mt-3">
                              <p className="text-sm font-medium">Admin Response:</p>
                              <p className="text-sm">{fb.adminResponse}</p>
                            </div>
                          )}
                          {fb.createdAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(fb.createdAt.seconds * 1000), 'MMM dd, yyyy hh:mm a')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No feedback received yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Feedback Response Modal */}
              {selectedFeedback && (
                <Card className="bg-gradient-card shadow-elegant border-0">
                  <CardHeader>
                    <CardTitle>Respond to Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-background/50 rounded">
                      <p className="font-medium">{selectedFeedback.subject}</p>
                      <p className="text-sm text-muted-foreground">{selectedFeedback.message}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="response">Your Response</Label>
                      <Textarea
                        id="response"
                        value={feedbackResponse}
                        onChange={(e) => setFeedbackResponse(e.target.value)}
                        placeholder="Type your response..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleFeedbackResponse(selectedFeedback.id, 'resolved', feedbackResponse)}
                        className="bg-gradient-primary hover:shadow-glow"
                      >
                        Send & Resolve
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedFeedback(null);
                          setFeedbackResponse('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leaves">
            <Card className="bg-gradient-card shadow-elegant border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Leave Requests ({leaves.length} total)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaves.length > 0 ? (
                  <div className="space-y-4">
                    {leaves.map((leave) => (
                      <div key={leave.id} className="border rounded-lg p-4 bg-background/50">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">
                                {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                              </h4>
                              <Badge variant={
                                leave.status === 'approved' ? 'default' : 
                                leave.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {leave.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{leave.userEmail}</p>
                            <p className="text-sm">Meal Type: {leave.mealType}</p>
                          </div>
                          {leave.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleLeaveResponse(leave.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleLeaveResponse(leave.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm mb-2">
                          <span className="font-medium">Reason:</span> {leave.reason}
                        </p>
                        {leave.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            Requested on {format(new Date(leave.createdAt.seconds * 1000), 'MMM dd, yyyy hh:mm a')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No leave requests yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}