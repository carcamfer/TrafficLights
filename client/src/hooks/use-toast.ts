
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
}

type ToastActionType = (props: Omit<Toast, 'id'>) => void;

// Hook simplificado para emitir toasts
export const useToast = () => {
  const toast: ToastActionType = (props) => {
    // Implementación simple que muestra un alert
    // En una implementación real, esto usaría un sistema de toast UI
    const message = `${props.title || ''} ${props.description || ''}`;
    alert(message);
  };

  return {
    toast
  };
};
