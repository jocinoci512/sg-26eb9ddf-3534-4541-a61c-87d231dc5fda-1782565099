import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Package, Clock } from 'lucide-react';

interface ShipmentMapProps {
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  status: string;
}

export function ShipmentMap({
  pickupAddress,
  pickupCity,
  pickupState,
  deliveryAddress,
  deliveryCity,
  deliveryState,
  status,
}: ShipmentMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState('');

  // Calculate progress based on shipment status
  useEffect(() => {
    const statusProgress: Record<string, number> = {
      'booked': 0,
      'pending_pickup': 5,
      'picked_up': 15,
      'processing': 25,
      'loaded': 30,
      'in_transit': 60,
      'distribution_center': 75,
      'customs_clearance': 80,
      'out_for_delivery': 90,
      'delivered': 100,
      'completed': 100,
    };

    const currentProgress = statusProgress[status] || 0;
    setProgress(currentProgress);

    // Calculate estimated distance (simplified)
    const estimatedDistance = Math.floor(Math.random() * 2000) + 500;
    setDistance(estimatedDistance);

    // Calculate ETA based on progress
    if (currentProgress < 100) {
      const remainingDays = Math.ceil((100 - currentProgress) / 20);
      const etaDate = new Date();
      etaDate.setDate(etaDate.getDate() + remainingDays);
      setEta(etaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    } else {
      setEta('Delivered');
    }
  }, [status]);

  // Draw animated route on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Starting and ending points
    const startX = 60;
    const startY = height / 2;
    const endX = width - 60;
    const endY = height / 2;

    // Calculate current position based on progress
    const currentX = startX + (endX - startX) * (progress / 100);
    const currentY = startY + Math.sin((currentX - startX) / 50) * 20;

    // Draw route line (dashed for remaining, solid for completed)
    ctx.beginPath();
    ctx.strokeStyle = '#1E5AA8';
    ctx.lineWidth = 3;
    
    // Draw completed path
    const gradient = ctx.createLinearGradient(startX, 0, currentX, 0);
    gradient.addColorStop(0, '#0B1F3A');
    gradient.addColorStop(1, '#1E5AA8');
    ctx.strokeStyle = gradient;
    
    ctx.moveTo(startX, startY);
    for (let x = startX; x <= currentX; x += 5) {
      const y = startY + Math.sin((x - startX) / 50) * 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw remaining path (dashed)
    ctx.beginPath();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    for (let x = currentX; x <= endX; x += 5) {
      const y = startY + Math.sin((x - startX) / 50) * 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw pickup marker (start)
    ctx.beginPath();
    ctx.arc(startX, startY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#0B1F3A';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw delivery marker (end)
    ctx.beginPath();
    ctx.arc(endX, endY, 12, 0, Math.PI * 2);
    ctx.fillStyle = progress === 100 ? '#10B981' : '#1E5AA8';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw current position marker (animated)
    if (progress > 0 && progress < 100) {
      // Pulsing animation
      const pulse = Math.sin(Date.now() / 300) * 3 + 15;
      
      ctx.beginPath();
      ctx.arc(currentX, currentY, pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30, 90, 168, 0.2)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(currentX, currentY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#1E5AA8';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Animate
    const animationId = requestAnimationFrame(() => {});
    return () => cancelAnimationFrame(animationId);
  }, [progress]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Map Canvas */}
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 p-8">
          <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full h-auto"
            style={{ maxHeight: '200px' }}
          />

          {/* Pickup Label */}
          <div className="absolute left-8 top-4">
            <div className="bg-white rounded-lg shadow-lg p-3 border-2 border-primary max-w-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-primary">Pickup</p>
                  <p className="text-xs font-medium">{pickupCity}, {pickupState}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Label */}
          <div className="absolute right-8 top-4">
            <div className={`bg-white rounded-lg shadow-lg p-3 border-2 max-w-xs ${progress === 100 ? 'border-green-500' : 'border-accent'}`}>
              <div className="flex items-start gap-2">
                <MapPin className={`w-4 h-4 flex-shrink-0 mt-0.5 ${progress === 100 ? 'text-green-600' : 'text-accent'}`} />
                <div>
                  <p className={`text-xs font-semibold ${progress === 100 ? 'text-green-600' : 'text-accent'}`}>
                    {progress === 100 ? 'Delivered' : 'Delivery'}
                  </p>
                  <p className="text-xs font-medium">{deliveryCity}, {deliveryState}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="bg-white border-t p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Progress</span>
              </div>
              <div className="text-2xl font-bold text-primary">{progress}%</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Navigation className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Distance</span>
              </div>
              <div className="text-2xl font-bold text-accent">{distance} mi</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-secondary" />
                <span className="text-sm text-muted-foreground">ETA</span>
              </div>
              <div className="text-2xl font-bold text-secondary">{eta}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Status</span>
              </div>
              <Badge className="text-sm font-semibold">
                {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Shipment Progress</span>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}