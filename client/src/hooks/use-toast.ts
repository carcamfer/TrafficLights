import { useState } from "react";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    setToasts((prevToasts) => [...prevToasts, props]);
    console.log(`Toast: ${props.title} - ${props.description || ''}`);

    // Simple way to show toast without relying on complex components
    alert(`${props.title}\n${props.description || ''}`);
  };

  return { toast, toasts };
}