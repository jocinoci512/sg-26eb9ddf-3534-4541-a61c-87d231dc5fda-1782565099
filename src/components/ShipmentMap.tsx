import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Truck, Ship, Plane, Clock, Navigation, CheckCircle2, ArrowRight, Calendar } from 'lucide-react';

interface ShipmentMapProps {
  pickupCity: string;
  pickupState: string;
  deliveryCity: string;
  deliveryState: string;
  currentStatus: string;
  shipmentType?: string;
}

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

const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending_pickup': 'bg-yellow-500',
    'booked': 'bg-blue-500',
    'picked_up': 'bg-indigo-500',
    'processing': 'bg-purple-500',
    'loaded': 'bg-cyan-500',
    'in_transit': 'bg-blue-600',
    'distribution_center': 'bg-orange-500',
    'customs_clearance': 'bg-amber-500',
    'out_for_delivery': 'bg-green-500',
    'delivered': 'bg-emerald-600',
    'completed': 'bg-emerald-600',
    'delayed': 'bg-red-500',
    'on_hold': 'bg-gray-500',
    'cancelled': 'bg-red-600',
  };
  return colorMap[status.toLowerCase()] || 'bg-gray-500';
};

const getMilestones = (shipmentType: string) => {
  return [
    { label: 'Booked', value: 10 },
    { label: 'Picked Up', value: 30 },
    { label: 'In Transit', value: 60 },
    { label: 'Out For Delivery', value: 90 },
    { label: 'Delivered', value: 100 },
  ];
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
  const milestones = getMilestones(shipmentType);
  const statusColor = getStatusColor(currentStatus);

  return (
    <div className="space-y-6">
      {/* Premium Status Header */}
      <Card className="border-2 overflow-hidden">
        <div className={`h-1.5 ${statusColor}`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${statusColor} bg-opacity-10`}>
                <Package className={`h-7 w-7 ${statusColor.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Current Status</p>
                <p className="text-2xl font-bold">{formatStatus(currentStatus)}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${statusColor} text-white border-0 px-5 py-2 text-base font-semibold shadow-lg`}>
                {progress}% Complete
              </Badge>
              {!isDelivered && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  In Progress
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Route Visualization */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-br from-primary/5 via-accent/5 to-background pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Navigation className="h-5 w-5 text-primary" />
            Shipment Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Location Cards - Premium Design */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Origin */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex items-start gap-4 p-6 rounded-xl border-2 border-primary/30 bg-background hover:shadow-lg transition-all">
                <div className="p-3 rounded-full bg-primary text-white shadow-md flex-shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Origin
                  </p>
                  <p className="font-bold text-2xl mb-1">{pickupCity}</p>
                  <p className="text-base text-muted-foreground font-medium">{pickupState}</p>
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex items-start gap-4 p-6 rounded-xl border-2 border-accent/30 bg-background hover:shadow-lg transition-all">
                <div className={`p-3 rounded-full ${isDelivered ? 'bg-green-500' : 'bg-accent'} text-white shadow-md flex-shrink-0`}>
                  {isDelivered ? <CheckCircle2 className="h-6 w-6" /> : <Navigation className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isDelivered ? 'bg-green-500' : 'bg-accent'} ${!isDelivered && 'animate-pulse'}`} />
                    Destination
                  </p>
                  <p className="font-bold text-2xl mb-1">{deliveryCity}</p>
                  <p className="text-base text-muted-foreground font-medium">{deliveryState}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Timeline */}
          <div className="relative py-12">
            {/* Background Track */}
            <div className="absolute top-1/2 left-0 right-0 h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full -translate-y-1/2 shadow-inner" />
            
            {/* Active Progress */}
            <div 
              className={`absolute top-1/2 left-0 h-3 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out shadow-lg`}
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${statusColor.replace('bg-', 'rgb(var(--')}), ${statusColor.replace('bg-', 'rgb(var(--')}) 80%)`
              }}
            />

            {/* Milestone Markers */}
            {milestones.map((milestone, index) => {
              const isActive = progress >= milestone.value;
              const isCurrent = progress >= milestone.value && (index === milestones.length - 1 || progress < milestones[index + 1].value);
              
              return (
                <div
                  key={milestone.label}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${milestone.value}%` }}
                >
                  {/* Marker */}
                  <div className={`
                    relative z-10 w-8 h-8 rounded-full border-4 border-background shadow-xl transition-all duration-300
                    ${isActive ? statusColor : 'bg-gray-300'}
                    ${isCurrent && 'ring-4 ring-primary/30 scale-110'}
                  `}>
                    {isActive && milestone.value === 100 && (
                      <CheckCircle2 className="absolute inset-0 m-auto h-5 w-5 text-white" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className={`
                    absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap
                    text-xs font-semibold transition-all duration-300
                    ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                    ${isCurrent && 'text-primary scale-110'}
                  `}>
                    {milestone.label}
                  </div>
                </div>
              );
            })}

            {/* Moving Vehicle with Pulse Effect */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out z-20"
              style={{ left: `${Math.min(progress, 95)}%` }}
            >
              <div className="relative">
                {/* Pulse Ring */}
                <div className={`absolute inset-0 rounded-full ${statusColor} opacity-20 animate-ping`} style={{ animationDuration: '2s' }} />
                
                {/* Vehicle Container */}
                <div className={`relative p-4 rounded-full ${statusColor} text-white shadow-2xl border-4 border-background`}>
                  <VehicleIcon className="h-7 w-7 animate-bounce-subtle" />
                </div>
                
                {/* Status Popup */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`${statusColor} text-white text-sm font-bold px-4 py-2 rounded-lg shadow-xl`}>
                    {formatStatus(currentStatus)}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                    <div className={`border-6 border-transparent ${statusColor.replace('bg-', 'border-t-')}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Journey Statistics Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="group relative overflow-hidden rounded-xl border-2 border-primary/20 p-4 hover:border-primary/40 transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform" />
              <div className="relative flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Progress</p>
                  <p className="text-xl font-bold">{progress}%</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border-2 border-accent/20 p-4 hover:border-accent/40 transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform" />
              <div className="relative flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <VehicleIcon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Transport</p>
                  <p className="text-xl font-bold capitalize">{shipmentType}</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border-2 border-primary/20 p-4 hover:border-primary/40 transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform" />
              <div className="relative flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Route</p>
                  <p className="text-sm font-bold truncate">{pickupState} → {deliveryState}</p>
                </div>
              </div>
            </div>

            <div className={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all hover:shadow-md ${isDelivered ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'}`}>
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform ${isDelivered ? 'bg-green-100' : 'bg-orange-100'}`} />
              <div className="relative flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDelivered ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {isDelivered ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Calendar className="h-5 w-5 text-orange-600" />}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Status</p>
                  <p className={`text-sm font-bold ${isDelivered ? 'text-green-700' : 'text-orange-700'}`}>
                    {isDelivered ? 'Completed' : 'In Transit'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Success Banner */}
          {isDelivered && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20" />
              <div className="relative flex items-center justify-center gap-3 text-center">
                <CheckCircle2 className="h-8 w-8 animate-bounce-subtle" />
                <div>
                  <p className="text-2xl font-bold mb-1">Package Delivered Successfully!</p>
                  <p className="text-green-100">
                    Your shipment has been delivered to {deliveryCity}, {deliveryState}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}