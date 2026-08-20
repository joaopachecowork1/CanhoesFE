import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export function useAdminMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    successMessage?: string;
    invalidateKeys?: (string | number | null)[][];
  }
) {
  const queryClient = useQueryClient();
  const { successMessage, invalidateKeys, ...rest } = options;

  return useMutation<TData, TError, TVariables, TContext>({
    ...rest,
    onSuccess: (data, variables, context) => {
      if (successMessage) toast.success(successMessage);
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      if (options.onSuccess) {
        (
          options.onSuccess as (
            data: TData,
            variables: TVariables,
            context: TContext | undefined,
          ) => void
        )(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      toast.error(
        getErrorMessage(error as Error, "Ocorreu um erro ao processar o pedido."),
      );
      if (options.onError) {
        (
          options.onError as (
            error: TError,
            variables: TVariables,
            context: TContext | undefined,
          ) => void
        )(error, variables, context);
      }
    },
  });
}
