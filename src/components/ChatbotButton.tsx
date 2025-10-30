import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const ChatbotButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/chatbot");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip/Card que aparece al hacer hover */}
      {isHovered && (
        <Card className="absolute bottom-16 right-0 p-3 shadow-lg bg-white border-primary/20 w-64 animate-in slide-in-from-bottom-2">
          <p className="text-sm font-medium text-gray-900">
            ¿Necesitas ayuda?
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Inicia una conversación con nuestro asistente virtual
          </p>
        </Card>
      )}

      {/* Botón flotante */}
      <Button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 group"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
      </Button>

      {/* Pulse animation ring */}
      <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20 pointer-events-none" />
    </div>
  );
};

