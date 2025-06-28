import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Alert } from '../types';

interface AlertSystemProps {
  alerts: Alert[];
  onRemoveAlert: (id: string) => void;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ alerts, onRemoveAlert }) => {
  // Auto remove alerts after 5 seconds
  useEffect(() => {
    alerts.forEach(alert => {
      const timer = setTimeout(() => {
        onRemoveAlert(alert.id);
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [alerts, onRemoveAlert]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    const baseStyles = "flex items-center justify-between p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500/20 text-green-500 border border-green-500/30`;
      case 'error':
        return `${baseStyles} bg-red-500/20 text-red-500 border border-red-500/30`;
      case 'warning':
        return `${baseStyles} bg-yellow-500/20 text-yellow-500 border border-yellow-500/30`;
      case 'info':
        return `${baseStyles} bg-blue-500/20 text-blue-500 border border-blue-500/30`;
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${getAlertStyles(alert.type)} animate-slide-in-right`}
        >
          <div className="flex items-center space-x-3">
            {getAlertIcon(alert.type)}
            <span className="font-medium text-sm">{alert.message}</span>
          </div>
          
          <button
            onClick={() => onRemoveAlert(alert.id)}
            className="ml-4 hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertSystem;