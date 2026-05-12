import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AdminNomineeDto,
  AdminVoteAuditRowDto,
  AwardCategoryDto,
  CreateAwardCategoryRequest,
  UpdateAwardCategoryRequest,
} from "@/lib/api/types";
import { adminRepo } from "@/lib/repositories/adminRepo";
import { useAdminMutation } from "./useAdminMutation";

const EMPTY_AWARD_CATEGORIES: AwardCategoryDto[] = [];
const EMPTY_ADMIN_VOTES: AdminVoteAuditRowDto[] = [];
const EMPTY_NOMINATIONS: AdminNomineeDto[] = [];

type CategoryFormState = {
  description: string;
  isActive: boolean;
  kind: string;
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
    isActive: category.isActive ?? false,
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
    queryFn: () => adminRepo.getCategories(eventId!),
    queryKey: ["canhoes", "admin", "categories", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const nominationsSummaryQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => adminRepo.getNominationsPaged(eventId!, 0, 1000), // Get all for summary
    queryKey: ["canhoes", "admin", "nominations", "summary", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const votesQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => adminRepo.getVotesPaged(eventId!, 0, 1000),
    queryKey: ["canhoes", "admin", "votes", "audit", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
    select: (data) => data.votes,
  });

  const categories = categoriesQuery.data ?? EMPTY_AWARD_CATEGORIES;
  const nominations = nominationsSummaryQuery.data?.nominations ?? EMPTY_NOMINATIONS;
  const votes = votesQuery.data ?? EMPTY_ADMIN_VOTES;

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (left, right) =>
          (left.sortOrder ?? 0) -
            (right.sortOrder ?? 0) || left.name.localeCompare(right.name, "pt-PT")
      ),
    [categories]
  );

  const categoryUsageById = useMemo(() => {
    const noms = nominations;
    const vts = votes;
    const nomineeCounts = noms.reduce<Record<string, number>>(
      (acc, nominee) => {
        if (!nominee.categoryId) return acc;
        acc[nominee.categoryId] = (acc[nominee.categoryId] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const voteCounts = vts.reduce<Record<string, number>>((acc, vote) => {
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
  }, [nominations, sortedCategories, votes]);

  const createCategory = useAdminMutation({
    mutationFn: (payload: CreateAwardCategoryRequest) =>
      adminRepo.createCategory(eventId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories", eventId] });
      setSheetState(null);
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
    }) => adminRepo.updateCategory(eventId!, categoryId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories", eventId] });
      setSheetState(null);
      await onUpdate();
    },
    successMessage: "Categoria atualizada.",
  });

  const deleteCategory = useAdminMutation({
    mutationFn: (categoryId: string) =>
      adminRepo.deleteCategory(eventId!, categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories", eventId] });
      setDeleteTarget(null);
      setSheetState(null);
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
