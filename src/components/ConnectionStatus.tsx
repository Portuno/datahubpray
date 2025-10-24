import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { gcdService } from '@/services/gcdService';

interface ConnectionStatusProps {
  onStatusChange: (isConnected: boolean) => void;
}

export const ConnectionStatus = ({ onStatusChange }: ConnectionStatusProps) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [datastoreInfo, setDatastoreInfo] = useState<string | null>(null);
  const maxRetries = 3;

  const checkConnection = async (isRetry = false) => {
    if (!isRetry) {
      setStatus('connecting');
      setErrorMessage(null);
    }

    try {
      console.log('🔄 Checking GCD connection...');
      
      // Verificar conexión con Google Cloud Datastore
      await gcdService.getRouteInfo('valencia', 'palma');
      
      console.log('✅ GCD connected successfully');
      setStatus('connected');
      onStatusChange(true);
      setRetryCount(0);
      
      // Obtener información del namespace
      const namespace = import.meta.env.VITE_DATASTORE_NAMESPACE || 'balearia-pricing';
      setDatastoreInfo(`Namespace: ${namespace} | Project: ${import.meta.env.VITE_GCP_PROJECT_ID}`);
      
    } catch (error: any) {
      console.error('❌ GCD connection error:', error);
      setErrorMessage(`Error de conexión: ${error.message || 'Error desconocido'}`);
      setStatus('error');
      onStatusChange(false);
      setDatastoreInfo(null);

      // Retry automático
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setRetryCount(prev => prev + 1);
        setTimeout(() => checkConnection(true), delay);
      }
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleRetry = () => {
    setRetryCount(0);
    checkConnection();
  };

  const renderStatus = () => {
    switch (status) {
      case 'connecting':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Conectando a GCD...
          </Badge>
        );
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            GCD Conectado
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Error de Conexión
          </Badge>
        );
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Database className="h-4 w-4 mr-2" />
          Estado de la Conexión GCD
        </CardTitle>
        {renderStatus()}
      </CardHeader>
      
      {status === 'connected' && datastoreInfo && (
        <CardContent className="pt-0">
          <div className="text-xs text-muted-foreground">
            {datastoreInfo}
          </div>
        </CardContent>
      )}
      
      {status === 'error' && (
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{errorMessage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={status === 'connecting'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${status === 'connecting' ? 'animate-spin' : ''}`} />
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
};