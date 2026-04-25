import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AwardCategoryDto,
  CreateAwardCategoryRequest,
  UpdateAwardCategoryRequest,
} from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { useAdminMutation } from "./useAdminMutation";

const EMPTY_AWARD_CATEGORIES: AwardCategoryDto[] = [];
const EMPTY_ADMIN_NOMINATIONS_SUMMARY = [] as Awaited<
  ReturnType<typeof canhoesEventsRepo.getAdminNominationsSummary>
>;
const EMPTY_ADMIN_VOTES = [] as Awaited<
  ReturnType<typeof canhoesEventsRepo.loadAllAdminVotes>
>;

type CategoryFormState = {
  description: string;
  isActive: boolean;
  kind: AwardCategoryDto["kind"];
  name: string;
  sortOrder: string;
  voteQuestion: string;
  voteRules: string;
};

type CategoryUsage = {
  canDelete: boolean;
  deleteReason: string | null;
  nomineeCount: number;
  voteCount: number;
};

function buildInitialForm(sortOrder: number): CategoryFormState {
  return {
    description: "",
    isActive: true,
    kind: "Sticker",
    name: "",
    sortOrder: String(sortOrder),
    voteQuestion: "",
    voteRules: "",
  };
}

function buildFormFromCategory(category: AwardCategoryDto): CategoryFormState {
  return {
    description: category.description ?? "",
    isActive: category.isActive,
    kind: category.kind,
    name: category.name,
    sortOrder: String(category.sortOrder),
    voteQuestion: category.voteQuestion ?? "",
    voteRules: category.voteRules ?? "",
  };
}

function toOptionalString(value: string) {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function parseSortOrder(value: string) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function buildCreatePayload(
  form: Readonly<CategoryFormState>
): CreateAwardCategoryRequest {
  return {
    name: form.name.trim(),
    sortOrder: parseSortOrder(form.sortOrder),
    kind: form.kind,
    description: toOptionalString(form.description),
    voteQuestion:
      form.kind === "UserVote" ? toOptionalString(form.voteQuestion) : null,
    voteRules:
      form.kind === "UserVote" ? toOptionalString(form.voteRules) : null,
  };
}

function buildUpdatePayload(
  form: Readonly<CategoryFormState>
): UpdateAwardCategoryRequest {
  return {
    name: form.name.trim(),
    sortOrder: parseSortOrder(form.sortOrder),
    isActive: form.isActive,
    kind: form.kind,
    description: toOptionalString(form.description),
    voteQuestion:
      form.kind === "UserVote" ? toOptionalString(form.voteQuestion) : null,
    voteRules:
      form.kind === "UserVote" ? toOptionalString(form.voteRules) : null,
  };
}

function formatKnownDependencyCount(label: string, count: number) {
  if (count === 0) return null;
  return `${count} ${label}${count > 1 ? "s" : ""}`;
}

function buildCategoryUsage(
  category: AwardCategoryDto,
  nomineeCount: number,
  voteCount: number
): CategoryUsage {
  const knownDependencyCount = nomineeCount + voteCount;

  if (knownDependencyCount > 0) {
    const parts = [
      formatKnownDependencyCount("nomeação", nomineeCount),
      formatKnownDependencyCount("voto", voteCount),
    ].filter(Boolean);

    return {
      canDelete: false,
      deleteReason: `Apagamento bloqueado por ${parts.join(
        " e "
      )} já associados.`,
      nomineeCount,
      voteCount,
    };
  }

  if (category.kind === "UserVote") {
    return {
      canDelete: false,
      deleteReason:
        "Categorias de voto oficial ficam protegidas aqui; a validação final de votos continua no backend.",
      nomineeCount,
      voteCount,
    };
  }

  return {
    canDelete: true,
    deleteReason: null,
    nomineeCount,
    voteCount,
  };
}

type CategorySheetState =
  | { mode: "create" }
  | { category: AwardCategoryDto; mode: "edit" };
  
export function useCategoriesAdmin(eventId: string | null, onUpdate: () => Promise<void>) {
  const queryClient = useQueryClient();
  const [sheetState, setSheetState] = useState<CategorySheetState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AwardCategoryDto | null>(
    null
  );
  const [form, setForm] = useState<CategoryFormState>(() =>
    buildInitialForm(1)
  );

  const categoriesQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.adminGetCategories(eventId!),
    queryKey: ["canhoes", "admin", "categories", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const nominationsSummaryQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.getAdminNominationsSummary(eventId!),
    queryKey: ["canhoes", "admin", "nominations-summary", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const votesQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.loadAllAdminVotes(eventId!),
    queryKey: ["canhoes", "admin", "votes", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const categories = categoriesQuery.data ?? EMPTY_AWARD_CATEGORIES;
  const nominationsSummary =
    nominationsSummaryQuery.data ?? EMPTY_ADMIN_NOMINATIONS_SUMMARY;
  const votes = votesQuery.data ?? EMPTY_ADMIN_VOTES;

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (left, right) =>
          left.sortOrder -
            right.sortOrder || left.name.localeCompare(right.name, "pt-PT")
      ),
    [categories]
  );

  const categoryUsageById = useMemo(() => {
    const nomineeCounts = nominationsSummary.reduce<Record<string, number>>(
      (acc, nominee) => {
        if (!nominee.categoryId) return acc;
        acc[nominee.categoryId] = (acc[nominee.categoryId] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const voteCounts = votes.reduce<Record<string, number>>((acc, vote) => {
      acc[vote.categoryId] = (acc[vote.categoryId] ?? 0) + 1;
      return acc;
    }, {});

    return Object.fromEntries(
      sortedCategories.map((category) => [
        category.id,
        buildCategoryUsage(
          category,
          nomineeCounts[category.id] ?? 0,
          voteCounts[category.id] ?? 0
        ),
      ])
    ) as Record<string, CategoryUsage>;
  }, [nominationsSummary, sortedCategories, votes]);

  const createCategory = useAdminMutation({
    mutationFn: (payload: CreateAwardCategoryRequest) =>
      canhoesEventsRepo.adminCreateCategory(eventId!, payload),
    onSuccess: async (createdCategory) => {
      queryClient.setQueryData<AwardCategoryDto[]>(
        ["canhoes", "admin", "categories", eventId],
        (current) => (current ? [...current, createdCategory] : [createdCategory])
      );
      setSheetState(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["canhoes", "admin", "nominations-summary", eventId],
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: ["canhoes", "admin", "votes", eventId],
          exact: true,
        }),
      ]);
      await onUpdate();
    },
    successMessage: "Categoria criada.",
  });

  const updateCategory = useAdminMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: UpdateAwardCategoryRequest;
    }) => canhoesEventsRepo.adminUpdateCategory(eventId!, categoryId, payload),
    onSuccess: async (updatedCategory) => {
      queryClient.setQueryData<AwardCategoryDto[]>(
        ["canhoes", "admin", "categories", eventId],
        (current) =>
          current?.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category
          ) ?? [updatedCategory]
      );
      setSheetState(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["canhoes", "admin", "nominations-summary", eventId],
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: ["canhoes", "admin", "votes", eventId],
          exact: true,
        }),
      ]);
      await onUpdate();
    },
    successMessage: "Categoria atualizada.",
  });

  const deleteCategory = useAdminMutation({
    mutationFn: (categoryId: string) =>
      canhoesEventsRepo.adminDeleteCategory(eventId!, categoryId),
    onSuccess: async (_data, categoryId) => {
      queryClient.setQueryData<AwardCategoryDto[]>(
        ["canhoes", "admin", "categories", eventId],
        (current) => current?.filter((category) => category.id !== categoryId) ?? []
      );
      setDeleteTarget(null);
      setSheetState(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["canhoes", "admin", "nominations-summary", eventId],
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: ["canhoes", "admin", "votes", eventId],
          exact: true,
        }),
      ]);
      await onUpdate();
    },
    successMessage: "Categoria apagada.",
  });

  const patchForm = (patch: Partial<CategoryFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const openCreateSheet = () => {
    setForm(buildInitialForm(sortedCategories.length + 1));
    setSheetState({ mode: "create" });
  };

  const openEditSheet = (category: AwardCategoryDto) => {
    setForm(buildFormFromCategory(category));
    setSheetState({ mode: "edit", category });
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setSheetState(null);
    }
  };

  const handleSave = () => {
    if (!eventId || !sheetState) return;

    if (sheetState.mode === "edit") {
      updateCategory.mutate({
        categoryId: sheetState.category.id,
        payload: buildUpdatePayload(form),
      });
    } else {
      createCategory.mutate(buildCreatePayload(form));
    }
  };
  
  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCategory.mutate(deleteTarget.id);
  };


  return {
    queries: {
      categories: categoriesQuery,
      nominationsSummary: nominationsSummaryQuery,
      votes: votesQuery,
    },
    mutations: {
      create: createCategory,
      update: updateCategory,
      delete: deleteCategory,
    },
    state: {
      sortedCategories,
      categoryUsageById,
      sheetState,
      deleteTarget,
      form,
      isLoading: categoriesQuery.isLoading || nominationsSummaryQuery.isLoading || votesQuery.isLoading,
      isBusy: createCategory.isPending || updateCategory.isPending || deleteCategory.isPending,
      queryError: categoriesQuery.error || nominationsSummaryQuery.error || votesQuery.error,
    },
    actions: {
      patchForm,
      openCreateSheet,
      openEditSheet,
      handleSheetOpenChange,
      handleSave,
      setDeleteTarget,
      handleDelete,

    },
  };
}
