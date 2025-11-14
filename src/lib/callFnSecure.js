import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";

export async function callFnSecure(functionName, payload) {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    console.error(`Erro ao invocar a função '${functionName}':`, error);
    
    let errorMessage = error.message;
    try {
      const errorObj = JSON.parse(error.context?.response?.text || '{}');
      if (errorObj.error) {
        errorMessage = errorObj.error;
      }
    } catch (e) {
      // Silently fail if parsing fails, stick to original message
    }

    throw new Error(errorMessage);
  }

  return data;
}