import { useState } from "react";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PriceRecommendationCard } from "@/components/PriceRecommendationCard";
import { ElasticityCurveChart } from "@/components/ElasticityCurveChart";
import { PriceConfidenceIndicator } from "@/components/PriceConfidenceIndicator";
import { HistoricalRangeComparison } from "@/components/HistoricalRangeComparison";
import { OccupancyChart } from "@/components/OccupancyChart";
import { InfluenceFactorsGrid } from "@/components/InfluenceFactorsGrid";
import { OriginInfoCard } from "@/components/OriginInfoCard";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getAvailableDestinations } from "@/data/ports";
import { usePredictionData, useMockData } from "@/hooks/usePredictionData";
import { useOccupancyData } from "@/hooks/useOccupancyData";
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
    returnDate: "",
    departureTime: "08:00",
    arrivalTime: "10:00",
    tripType: "one-way",
    travelType: "passenger",
    tariffClass: "basic",
    vessel: "any",
    ticketQuantity: "1",
    adults: "1",
    children: "0",
    infants: "0",
    bonusType: "none",
    serviceGroup: "seat",
  });

  const [predictionModel, setPredictionModel] = useState("xgboost");
  const [useGCD, setUseGCD] = useState(true);
  const [waveCondition, setWaveCondition] = useState("calm");
  const [includeIVA, setIncludeIVA] = useState(true);

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
    waveCondition: waveCondition,
  };

  const { 
    predictionData, 
    historicalData, 
    isLoading, 
    error, 
    refetch 
  } = usePredictionData(predictionFilters);

  const mockData = useMockData(predictionFilters);

  // Obtener datos de ocupación
  const { occupancyData, isLoading: isLoadingOccupancy, error: occupancyError } = useOccupancyData({
    origin: filters.origin,
    destination: filters.destination,
    date: filters.date,
    vessel: filters.vessel
  });

  // Usar datos reales si están disponibles y GCD está conectado, sino usar mock data
  const currentData = (useGCD && predictionData) ? {
    optimalPrice: predictionData.optimalPrice,
    expectedRevenue: predictionData.expectedRevenue,
    currentPrice: predictionData.currentPrice,
    competitorPrice: predictionData.competitorPrice,
    confidence: predictionData.confidence,
    influenceFactors: predictionData.influenceFactors,
  } : mockData;


  return (
    <div className="flex min-h-screen w-full bg-background">
      <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
      
      <main className="flex-1 p-8 space-y-8">
        <header className="flex items-center justify-between">
          {/* Logo izquierdo */}
          <img src={baleariaLogoText} alt="Baleària" className="h-16" />
          
          {/* Título y subtítulo centrados */}
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold text-foreground">
              Dashboard de Revenue Management
            </h1>
            <p className="text-muted-foreground">
              Modelo basado en Algoritmos Predictivos para predecir la demanda de precio
            </p>
          </div>
          
          {/* Logo derecho */}
          <img src={baleariaLogo} alt="Baleària" className="h-20 w-20" />
        </header>

        <Separator />

        <section className="space-y-6">
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

          {/* Puerto de Origen arriba */}
          <div className="w-full">
            <OriginInfoCard originId={filters.origin} />
          </div>

          {/* Precio Óptimo e Ingreso Esperado abajo */}
          <div className="w-full">
            <PriceRecommendationCard
              optimalPrice={currentData.optimalPrice}
              expectedRevenue={currentData.expectedRevenue}
              currentPrice={currentData.currentPrice}
              includeIVA={includeIVA}
              onIVAChange={setIncludeIVA}
            />
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

                <div className="max-w-md">
                  <Label htmlFor="wave-condition" className="text-foreground font-semibold mb-2 block">
                    Condición del oleaje
                  </Label>
                  <Select value={waveCondition} onValueChange={setWaveCondition}>
                    <SelectTrigger id="wave-condition">
                      <SelectValue placeholder="Seleccionar oleaje" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calm">Calmo (0-0.5m)</SelectItem>
                      <SelectItem value="light">Ligero (0.5-1m)</SelectItem>
                      <SelectItem value="moderate">Moderado (1-2m)</SelectItem>
                      <SelectItem value="rough">Agitado (2-3m)</SelectItem>
                      <SelectItem value="very-rough">Muy agitado (3-4m)</SelectItem>
                      <SelectItem value="high">Alto (4m+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="max-w-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-iva" 
                      checked={includeIVA} 
                      onCheckedChange={(checked) => setIncludeIVA(checked === true)}
                    />
                    <Label 
                      htmlFor="include-iva" 
                      className="text-foreground font-semibold cursor-pointer"
                    >
                      Con IVA
                    </Label>
                  </div>
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

          {/* Componentes de Coherencia del Pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PriceConfidenceIndicator
              confidence={currentData.confidence}
              optimalPrice={currentData.optimalPrice}
              currentPrice={currentData.currentPrice}
              competitorPrice={currentData.competitorPrice}
            />
            
            <HistoricalRangeComparison
              optimalPrice={currentData.optimalPrice}
              currentPrice={currentData.currentPrice}
            />
          </div>

          <OccupancyChart 
            occupancyData={occupancyData} 
            isLoading={isLoadingOccupancy}
            error={occupancyError}
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
