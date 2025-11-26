import React from 'react';
import { Bell, X, Clock, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAlertas } from '@/hooks/useAlertas';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Popup de Alertas de Pagamento
 * Exibe alertas de vencimento de cobranças no canto superior direito
 */
export const AlertasPagamentoPopup = () => {
  const {
    alertas,
    loading,
    mostrarPopup,
    setMostrarPopup,
    stats,
    marcarComoLido,
    marcarTodosComoLidos
  } = useAlertas();

  const { toast } = useToast();
  const navigate = useNavigate();

  if (!mostrarPopup || alertas.length === 0) return null;

  const handleMarcarLido = async (alertaId) => {
    try {
      await marcarComoLido(alertaId);
      toast({
        title: 'Alerta marcado como lido',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro ao marcar alerta',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleMarcarTodosLidos = async () => {
    try {
      await marcarTodosComoLidos();
      toast({
        title: 'Todos os alertas foram marcados como lidos',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro ao marcar alertas',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleVerCobranca = (cobrancaId) => {
    navigate(`/financeiro/cobrancas?id=${cobrancaId}`);
    setMostrarPopup(false);
  };

  const getUrgenciaStyles = (urgencia) => {
    switch (urgencia) {
      case 'VENCIDO':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-500',
          icon: <AlertTriangle size={16} className="text-red-600" />
        };
      case 'VENCE HOJE':
      case 'VENCE AMANHÃ':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          border: 'border-orange-500',
          icon: <Clock size={16} className="text-orange-600" />
        };
      case 'URGENTE':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-500',
          icon: <Clock size={16} className="text-yellow-600" />
        };
      default:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-500',
          icon: <Bell size={16} className="text-blue-600" />
        };
    }
  };

  // Mostrar apenas os 5 alertas mais urgentes
  const alertasVisiveis = alertas.slice(0, 5);
  const alertasRestantes = alertas.length - alertasVisiveis.length;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md bg-white shadow-2xl rounded-lg border-l-4 border-orange-500 animate-slide-in-right">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-full">
            <Bell className="text-orange-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Alertas de Pagamento</h3>
            <p className="text-xs text-gray-500">
              {stats.total} alerta{stats.total !== 1 ? 's' : ''} pendente{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMostrarPopup(false)}
          className="h-8 w-8 p-0"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="p-3 bg-gray-50 border-b grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="font-bold text-red-600">{stats.vencidos}</div>
          <div className="text-gray-600">Vencidos</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-orange-600">{stats.urgentes}</div>
          <div className="text-gray-600">Urgentes</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-green-600">
            R$ {(stats.valorTotal / 1000).toFixed(1)}k
          </div>
          <div className="text-gray-600">Total</div>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-sm">Carregando alertas...</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {alertasVisiveis.map((alerta) => {
              const styles = getUrgenciaStyles(alerta.urgencia);

              return (
                <div
                  key={alerta.alerta_id}
                  className={`p-3 rounded-lg ${styles.bg} border ${styles.border} transition-all hover:shadow-md`}
                >
                  {/* Header do Alerta */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      {styles.icon}
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${styles.text}`}>
                          {alerta.cliente_nome}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {alerta.descricao}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-lg font-bold text-gray-800">
                        R$ {parseFloat(alerta.valor).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                      <p className={`text-xs font-medium ${styles.text}`}>
                        {alerta.urgencia}
                        {alerta.dias_para_vencimento !== null && (
                          <span className="ml-1">
                            ({alerta.dias_para_vencimento > 0 ? '+' : ''}{alerta.dias_para_vencimento} dias)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVerCobranca(alerta.cobranca_id)}
                        className="h-7 px-2 text-xs"
                        title="Ver cobrança"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarcarLido(alerta.alerta_id)}
                        className="h-7 px-2 text-xs"
                        title="Marcar como lido"
                      >
                        <CheckCircle size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {alertasRestantes > 0 && (
              <div className="text-center py-2 text-sm text-gray-500">
                + {alertasRestantes} alerta{alertasRestantes !== 1 ? 's' : ''} adiciona{alertasRestantes !== 1 ? 'is' : 'l'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-gray-50 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleMarcarTodosLidos}
          className="flex-1 text-xs"
          disabled={loading || alertas.length === 0}
        >
          <EyeOff size={14} className="mr-1" />
          Marcar todos como lidos
        </Button>
        <Button
          size="sm"
          onClick={() => navigate('/financeiro/cobrancas')}
          className="flex-1 text-xs bg-orange-500 hover:bg-orange-600"
        >
          Ver todas as cobranças
        </Button>
      </div>
    </div>
  );
};

// Animação CSS para slide-in
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
`;
document.head.appendChild(style);
