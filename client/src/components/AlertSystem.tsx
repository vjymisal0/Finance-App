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
    const baseStyles = "flex items-center justify-between p-4 rounded-xl shadow-xl-colored transition-all duration-300 transform translate-x-0 backdrop-blur-sm border";

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500/20 text-green-400 border-green-500/30 shadow-glow`;
      case 'error':
        return `${baseStyles} bg-red-500/20 text-red-400 border-red-500/30 shadow-glow-red`;
      case 'warning':
        return `${baseStyles} bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-glow-yellow`;
      case 'info':
        return `${baseStyles} bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-glow-blue`;
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 space-y-3 max-w-sm w-full">
      {alerts.map((alert, index) => (
        <div
          key={alert.id}
          className={`${getAlertStyles(alert.type)} animate-slide-in-right hover-lift`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-shrink-0">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm block truncate">{alert.message}</span>
              <div className="text-xs opacity-75 mt-1">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>

          <button
            onClick={() => onRemoveAlert(alert.id)}
            className="ml-4 flex-shrink-0 hover:opacity-70 transition-opacity p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-xl overflow-hidden">
            <div
              className={`h-full transition-all duration-5000 ease-linear ${alert.type === 'success' ? 'bg-green-400' :
                  alert.type === 'error' ? 'bg-red-400' :
                    alert.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                }`}
              style={{
                width: '100%',
                animation: 'shrink 5s linear forwards'
              }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .shadow-glow-red {
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
        }
        .shadow-glow-yellow {
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AlertSystem;