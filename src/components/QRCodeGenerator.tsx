import React from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface QRCodeGeneratorProps {
  onGenerate: () => void;
  qrData: string;
  isGenerating: boolean;
}

export default function QRCodeGenerator({ onGenerate, qrData, isGenerating }: QRCodeGeneratorProps) {
  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qr-code-${format(new Date(), 'yyyy-MM-dd')}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-elegant border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Daily QR Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={onGenerate}
            disabled={isGenerating}
            className="bg-gradient-primary hover:shadow-glow"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Generate Today's QR
          </Button>
          {qrData && (
            <Button 
              variant="outline"
              onClick={downloadQR}
              className="border-primary/20 hover:bg-primary/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>
        
        {qrData && (
          <div className="flex justify-center p-4 bg-background rounded-lg">
            <QRCode
              id="qr-code-svg"
              value={qrData}
              size={200}
              bgColor="transparent"
              fgColor="hsl(var(--primary))"
            />
          </div>
        )}
        
        <p className="text-sm text-muted-foreground text-center">
          Generate a new QR code for today's meal attendance
        </p>
      </CardContent>
    </Card>
  );
}