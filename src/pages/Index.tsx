import { useState } from "react";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PriceRecommendationCard } from "@/components/PriceRecommendationCard";
import { ElasticityCurveChart } from "@/components/ElasticityCurveChart";
import { InfluenceFactorsGrid } from "@/components/InfluenceFactorsGrid";
import { OriginInfoCard } from "@/components/OriginInfoCard";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getAvailableDestinations } from "@/data/ports";
import { usePredictionData, useMockData } from "@/hooks/usePredictionData";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { AlertCircle, RefreshCw } from "lucide-react";
import baleariaLogo from "@/assets/balearia-logo.png";
import baleariaLogoText from "@/assets/balearia-logo-text.png";

const Index = () => {
  const [filters, setFilters] = useState({
    origin: "denia",
    stopover: "none",
    destination: "ibiza",
    date: new Date().toISOString().split('T')[0],
    tripType: "one-way",
    travelType: "passenger",
    tariffClass: "basic",
    vessel: "any",
    ticketQuantity: "1",
  });

  const [predictionModel, setPredictionModel] = useState("xgboost");
  const [useGCD, setUseGCD] = useState(true);
  const [isGCDConnected, setIsGCDConnected] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      
      // Si cambia el origen, verificar que el destino actual sea válido
      if (key === "origin") {
        const availableDestinations = getAvailableDestinations(value);
        const currentDestinationValid = availableDestinations.some(
          dest => dest.id === prev.destination
        );
        
        // Si el destino actual no es válido para el nuevo origen, usar el primer destino disponible
        if (!currentDestinationValid && availableDestinations.length > 0) {
          newFilters.destination = availableDestinations[0].id;
        }
      }
      
      return newFilters;
    });
  };

  // Usar datos reales de GCD o fallback a mock data
  const predictionFilters = {
    origin: filters.origin,
    destination: filters.destination,
    date: filters.date,
    travelType: filters.travelType,
    tariffClass: filters.tariffClass,
    model: predictionModel,
  };

  const { 
    predictionData, 
    historicalData, 
    isLoading, 
    error, 
    refetch 
  } = usePredictionData(predictionFilters);

  const mockData = useMockData(predictionFilters);

  // Usar datos reales si están disponibles y GCD está conectado, sino usar mock data
  const currentData = (useGCD && isGCDConnected && predictionData) ? {
    optimalPrice: predictionData.optimalPrice,
    expectedRevenue: predictionData.expectedRevenue,
    currentPrice: predictionData.currentPrice,
    competitorPrice: predictionData.competitorPrice,
    influenceFactors: predictionData.influenceFactors,
  } : mockData;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
      
      <main className="flex-1 p-8 space-y-8">
        <header className="flex items-start justify-between">
          <img src={baleariaLogoText} alt="Baleària" className="h-16" />
          <img src={baleariaLogo} alt="Baleària" className="h-20 w-20" />
        </header>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Dashboard de Revenue Management
          </h1>
          <p className="text-muted-foreground">
            Modelo basado en Algoritmos Predictivos para predecir la demanda de precio
          </p>
        </div>

        <Separator />

        <section className="space-y-6">
          {/* Estado de conexión */}
          <ConnectionStatus onStatusChange={setIsGCDConnected} />

          {/* Alertas de estado */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refetch}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Cargando datos de predicción desde Google Cloud Datastore...
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PriceRecommendationCard
              optimalPrice={currentData.optimalPrice}
              expectedRevenue={currentData.expectedRevenue}
              currentPrice={currentData.currentPrice}
            />
            <OriginInfoCard originId={filters.origin} />
          </div>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="max-w-md">
                  <Label htmlFor="prediction-model" className="text-foreground font-semibold mb-2 block">
                    Modelo de predicción
                  </Label>
                  <Select value={predictionModel} onValueChange={setPredictionModel}>
                    <SelectTrigger id="prediction-model">
                      <SelectValue placeholder="Seleccionar modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xgboost">XGBoost</SelectItem>
                      <SelectItem value="lightgbm">LightGBM</SelectItem>
                      <SelectItem value="random-forest">Random Forest</SelectItem>
                      <SelectItem value="neural-network">Red Neuronal</SelectItem>
                      <SelectItem value="linear-regression">Regresión Lineal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="max-w-md">
                  <Label htmlFor="data-source" className="text-foreground font-semibold mb-2 block">
                    Fuente de datos
                  </Label>
                  <Select value={useGCD ? "gcd" : "mock"} onValueChange={(value) => setUseGCD(value === "gcd")}>
                    <SelectTrigger id="data-source">
                      <SelectValue placeholder="Seleccionar fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gcd">Google Cloud Datastore</SelectItem>
                      <SelectItem value="mock">Datos de prueba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {predictionData && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Confianza del modelo:</span> {(predictionData.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Última actualización: {new Date(predictionData.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <ElasticityCurveChart
            optimalPrice={currentData.optimalPrice}
            competitorPrice={currentData.competitorPrice}
          />

          <InfluenceFactorsGrid factors={currentData.influenceFactors} />
        </section>

        <footer className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Objetivo:</span> Herramienta diseñada para maximizar ingresos por pasaje mediante recomendaciones basadas en datos.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} Baleària - Todos los derechos reservados
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
