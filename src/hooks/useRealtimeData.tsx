import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useRealtimeMenu() {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const menuQuery = query(
      collection(db, 'weekly_menu'),
      orderBy('day', 'asc')
    );

    const unsubscribe = onSnapshot(menuQuery, (snapshot) => {
      const menuData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenu(menuData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { menu, loading };
}

export function useRealtimeFeedback() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const feedbackQuery = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(feedbackQuery, (snapshot) => {
      const feedbackData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeedback(feedbackData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { feedback, loading };
}

export function useRealtimeAttendance(userId?: string | null) {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until we know whether to listen for a specific user or for all (admin)
    if (userId === undefined) {
      setAttendance([]);
      setLoading(false);
      return;
    }

    let q;
    if (userId) {
      // User-specific listener without orderBy to avoid composite index requirement
      q = query(
        collection(db, 'attendance'),
        where('userId', '==', userId)
      );
    } else {
      // userId === null -> admin view (listen to all)
      q = query(
        collection(db, 'attendance'),
        orderBy('timestamp', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // Sort client-side for stability (newest first)
        const getTime = (r: any) =>
          r?.timestamp?.seconds
            ? r.timestamp.seconds * 1000
            : r?.date
            ? new Date(r.date).getTime()
            : 0;
        data.sort((a, b) => getTime(b) - getTime(a));
        setAttendance(data);
        setLoading(false);
      },
      (error) => {
        console.error('Attendance listener error:', error);
        setAttendance([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { attendance, loading };
}

export function useRealtimeLeaves(userId?: string | null) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId === undefined) {
      setLeaves([]);
      setLoading(false);
      return;
    }

    let q;
    if (userId) {
      q = query(
        collection(db, 'leave_requests'),
        where('userId', '==', userId)
      );
    } else {
      q = query(
        collection(db, 'leave_requests'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const getTime = (r: any) =>
          r?.createdAt?.seconds ? r.createdAt.seconds * 1000 : 0;
        data.sort((a, b) => getTime(b) - getTime(a));
        setLeaves(data);
        setLoading(false);
      },
      (error) => {
        console.error('Leaves listener error:', error);
        setLeaves([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { leaves, loading };
}

export function useRealtimeQRCode() {
  const [qrCode, setQRCode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qrQuery = query(
      collection(db, 'daily_qr'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(qrQuery, (snapshot) => {
      const firstDoc = snapshot.docs[0];
      const qrData = firstDoc ? {
        id: firstDoc.id,
        ...firstDoc.data()
      } : null;
      setQRCode(qrData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { qrCode, loading };
}

export function useRealtimePayments(userId?: string | null) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId === undefined) {
      setPayments([]);
      setLoading(false);
      return;
    }

    let q;
    if (userId) {
      q = query(
        collection(db, 'payments'),
        where('userId', '==', userId)
      );
    } else {
      q = query(
        collection(db, 'payments'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const getTime = (r: any) =>
          r?.createdAt?.seconds ? r.createdAt.seconds * 1000 : 0;
        data.sort((a, b) => getTime(b) - getTime(a));
        setPayments(data);
        setLoading(false);
      },
      (error) => {
        console.error('Payments listener error:', error);
        setPayments([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { payments, loading };
}

export function useUserPaymentStatus(userId: string) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const paymentQuery = query(
      collection(db, 'payments'),
      where('userId', '==', userId),
      where('month', '==', currentMonth)
    );

    const unsubscribe = onSnapshot(
      paymentQuery,
      (snapshot) => {
        type PaymentDoc = {
          id: string;
          status?: 'pending' | 'paid' | 'expired';
          createdAt?: any;
          month?: string;
          amount?: number;
          [key: string]: any;
        };
        const data: PaymentDoc[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        const getTime = (r: any) => (r?.createdAt?.seconds ? r.createdAt.seconds * 1000 : 0);
        data.sort((a, b) => getTime(b) - getTime(a));
        setPaymentStatus(data[0]?.status ?? null);
        setLoading(false);
      },
      (error) => {
        console.error('Payment status listener error:', error);
        setPaymentStatus(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { paymentStatus, loading };
}

export function useRealtimeUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { users, loading };
}