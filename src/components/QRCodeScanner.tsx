import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Camera, CheckCircle, Utensils, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeScannerProps {
  onScanSuccess: (data: string) => void;
  onMarkAttendance: () => void;
  isActive: boolean;
  onToggle: () => void;
  scannedData: string | null;
  todaysMenu: any[];
  todayAttended: boolean;
}

export default function QRCodeScanner({ onScanSuccess, onMarkAttendance, isActive, onToggle, scannedData, todaysMenu, todayAttended }: QRCodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isActive) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-scanner',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (data) => {
          onScanSuccess(data);
          toast({
            title: "QR Code Scanned!",
            description: "Processing attendance...",
            duration: 2000,
          });
          onToggle(); // Stop scanner after successful scan
        },
        (error) => {
          // Ignore errors for cleaner UI
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [isActive, onScanSuccess, onToggle, toast]);

  return (
    <Card className="bg-gradient-card shadow-elegant border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          QR Code Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Button 
            onClick={onToggle}
            className={isActive ? "bg-destructive hover:bg-destructive/90" : "bg-gradient-primary hover:shadow-glow"}
          >
            {isActive ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Stop Scanner
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Start Scanner
              </>
            )}
          </Button>
        </div>
        
        {isActive ? (
          <div id="qr-scanner" className="w-full"></div>
        ) : scannedData ? (
          <div className="space-y-4">
            {/* Today's Menu Display */}
            <div className="bg-background/50 rounded-lg p-4 border">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Utensils className="h-4 w-4 text-primary" />
                Today's Menu
              </h3>
              {todaysMenu.length > 0 ? (
                <div className="space-y-2">
                  {todaysMenu.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                      <span className="text-sm">{item.items}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.mealType}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No menu available for today</p>
              )}
            </div>

            {/* Attendance Button */}
            <div className="text-center">
              <Button 
                onClick={onMarkAttendance}
                disabled={todayAttended}
                className={todayAttended ? "bg-green-500 hover:bg-green-600" : "bg-gradient-primary hover:shadow-glow"}
                size="lg"
              >
                {todayAttended ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Attendance Marked
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Click "Start Scanner" to scan the QR code</p>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground text-center">
          Scan the daily QR code to view today's menu and mark attendance
        </p>
      </CardContent>
    </Card>
  );
}