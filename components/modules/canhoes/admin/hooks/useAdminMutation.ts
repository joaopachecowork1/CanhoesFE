import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export function useAdminMutation<TData = unknown, TError = Error, TVariables = void>(
  options: UseMutationOptions<TData, TError, TVariables> & {
    successMessage?: string;
    invalidateKeys?: (string | number | null)[][];
  }
) {
  const queryClient = useQueryClient();
  const { successMessage, invalidateKeys, ...rest } = options;

  return useMutation<TData, TError, TVariables>({
    ...rest,
    onSuccess: (data, variables, context) => {
      if (successMessage) toast.success(successMessage);
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      toast.error(getErrorMessage(error as Error));
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
  });
}
