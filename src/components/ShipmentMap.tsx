import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Truck, Ship, Plane, Clock, Navigation } from 'lucide-react';

interface ShipmentMapProps {
  pickupCity: string;
  pickupState: string;
  deliveryCity: string;
  deliveryState: string;
  currentStatus: string;
  shipmentType?: string;
}

// Calculate progress percentage based on status
const getProgressFromStatus = (status: string): number => {
  const statusMap: Record<string, number> = {
    'pending_pickup': 10,
    'booked': 10,
    'picked_up': 30,
    'processing': 35,
    'loaded': 40,
    'in_transit': 60,
    'distribution_center': 75,
    'customs_clearance': 80,
    'out_for_delivery': 90,
    'delivered': 100,
    'completed': 100,
  };
  return statusMap[status.toLowerCase()] || 0;
};

// Get vehicle icon based on shipment type
const getVehicleIcon = (type?: string) => {
  if (!type) return Truck;
  const iconMap: Record<string, any> = {
    'truck': Truck,
    'air': Plane,
    'ocean': Ship,
    'rail': Truck,
  };
  return iconMap[type.toLowerCase()] || Truck;
};

// Format status for display
const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get status color
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending_pickup': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'booked': 'bg-blue-100 text-blue-800 border-blue-300',
    'picked_up': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'processing': 'bg-purple-100 text-purple-800 border-purple-300',
    'loaded': 'bg-cyan-100 text-cyan-800 border-cyan-300',
    'in_transit': 'bg-blue-100 text-blue-800 border-blue-300',
    'distribution_center': 'bg-orange-100 text-orange-800 border-orange-300',
    'customs_clearance': 'bg-amber-100 text-amber-800 border-amber-300',
    'out_for_delivery': 'bg-green-100 text-green-800 border-green-300',
    'delivered': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'completed': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'delayed': 'bg-red-100 text-red-800 border-red-300',
    'on_hold': 'bg-gray-100 text-gray-800 border-gray-300',
    'cancelled': 'bg-red-100 text-red-800 border-red-300',
  };
  return colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export function ShipmentMap({ 
  pickupCity, 
  pickupState, 
  deliveryCity, 
  deliveryState, 
  currentStatus,
  shipmentType = 'truck'
}: ShipmentMapProps) {
  const progress = getProgressFromStatus(currentStatus);
  const VehicleIcon = getVehicleIcon(shipmentType);
  const isDelivered = progress === 100;

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <p className="text-lg font-semibold">{formatStatus(currentStatus)}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(currentStatus)} border px-4 py-2 text-sm font-medium`}>
              {progress}% Complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Route Visualization */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-8">
            {/* Location Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Location */}
              <div className="relative">
                <div className="flex items-start gap-4 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                  <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                      Pickup Location
                    </p>
                    <p className="font-bold text-lg">{pickupCity}</p>
                    <p className="text-sm text-muted-foreground">{pickupState}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Location */}
              <div className="relative">
                <div className="flex items-start gap-4 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                  <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                    <Navigation className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                      Delivery Location
                    </p>
                    <p className="font-bold text-lg">{deliveryCity}</p>
                    <p className="text-sm text-muted-foreground">{deliveryState}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar with Vehicle */}
            <div className="relative py-8">
              {/* Route Line */}
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full -translate-y-1/2" />
              
              {/* Progress Line */}
              <div 
                className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-primary to-primary/70 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />

              {/* Start Marker */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1">
                <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg" />
              </div>

              {/* End Marker */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1">
                <div className={`w-4 h-4 rounded-full ${isDelivered ? 'bg-green-500' : 'bg-gray-300'} border-4 border-background shadow-lg transition-colors duration-300`} />
              </div>

              {/* Vehicle Icon */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out"
                style={{ left: `${progress}%` }}
              >
                <div className="relative">
                  <div className="p-3 rounded-full bg-primary text-white shadow-xl border-4 border-background animate-bounce-gentle">
                    <VehicleIcon className="h-6 w-6" />
                  </div>
                  {/* Status Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg">
                      {formatStatus(currentStatus)}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <p className="font-semibold">{progress}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Transport Type</p>
                  <p className="font-semibold capitalize">{shipmentType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Navigation className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Route</p>
                  <p className="font-semibold text-sm">{pickupCity} → {deliveryCity}</p>
                </div>
              </div>
            </div>

            {/* Delivery Status Message */}
            {isDelivered && (
              <div className="text-center p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold flex items-center justify-center gap-2">
                  <span className="text-2xl">✓</span>
                  Package successfully delivered to {deliveryCity}, {deliveryState}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}