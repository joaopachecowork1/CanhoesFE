"use client";

import { useEffect, useMemo, useState } from "react";
import { Cigarette, Inbox } from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { useEventOverview } from "@/hooks/useEventOverview";
import type { AwardCategoryDto, NomineeDto } from "@/lib/api/types";
import {
  CanhoesFileTrigger,
  CanhoesMediaThumb,
  CanhoesModuleHeader,
  formatEventPhaseLabel,
  getNomineeStatusBadgeVariant,
} from "@/components/modules/canhoes/CanhoesModuleParts";
import { CompactSegmentTabs } from "@/components/modules/canhoes/CompactSegmentTabs";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { InlineLoader } from "@/components/ui/inline-loader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NO_CATEGORY = "__none__";

/** Map backend phase type to legacy display label */
function isNominationPhase(phaseType?: string): boolean {
  return phaseType === "PROPOSALS";
}

export function CanhoesNomineesModule() {
  const { overview } = useEventOverview();
  const [categoryList, setCategoryList] = useState<AwardCategoryDto[]>([]);
  const [nomineeList, setNomineeList] = useState<NomineeDto[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(NO_CATEGORY);
  const [activeListCategoryId, setActiveListCategoryId] = useState<string | null>(null);
  const [nomineeTitle, setNomineeTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const canSubmit = nomineeTitle.trim().length >= 2;

  const loadNominees = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [nextCategories, nextNominees] = await Promise.all([
        canhoesRepo.getCategories(),
        canhoesRepo.getNominees(undefined, "nominees"),
      ]);

      setCategoryList(nextCategories);
      setNomineeList(nextNominees);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Nao foi possivel carregar as nomeacoes desta edicao."
      );
      logFrontendError("CanhoesNominees.loadNominees", error);
      setCategoryList([]);
      setNomineeList([]);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNominees();
  }, []);

  const nomineesByCategory = useMemo(() => {
    const nomineesMap = new Map<string, NomineeDto[]>();

    for (const nominee of nomineeList) {
      const categoryKey = nominee.categoryId ?? "__uncategorized";
      const nomineesForCategory = nomineesMap.get(categoryKey) ?? [];

      nomineesForCategory.push(nominee);
      nomineesMap.set(categoryKey, nomineesForCategory);
    }

    return nomineesMap;
  }, [nomineeList]);

  const phaseType = overview?.activePhase?.type;
  const nominationPhase = isNominationPhase(phaseType);
  let submitButtonLabel = "Nomeações fechadas";
  if (nominationPhase) {
    submitButtonLabel = "Submeter";
  }
  if (isSubmitting) {
    submitButtonLabel = "A submeter...";
  }

  const nomineeGroups = useMemo(() => {
    const groups = categoryList
      .map((category) => ({
        id: category.id,
        label: category.name,
        nominees: nomineesByCategory.get(category.id) ?? [],
      }))
      .filter((group) => group.nominees.length > 0);

    const uncategorized = nomineesByCategory.get("__uncategorized") ?? [];
    if (uncategorized.length > 0) {
      groups.push({
        id: "__uncategorized",
        label: "Sem categoria",
        nominees: uncategorized,
      });
    }

    return groups;
  }, [categoryList, nomineesByCategory]);

  useEffect(() => {
    if (nomineeGroups.length === 0) {
      setActiveListCategoryId(null);
      return;
    }

    setActiveListCategoryId((current) => {
      if (current && nomineeGroups.some((group) => group.id === current)) return current;
      return nomineeGroups[0].id;
    });
  }, [nomineeGroups]);

  const selectedGroup = nomineeGroups.find((group) => group.id === activeListCategoryId) ?? null;
  let nomineeListContent: JSX.Element | null = null;
  if (!isLoading && !errorMessage) {
    if (nomineeGroups.length === 0) {
      nomineeListContent = (
        <EmptyState icon={Inbox} title="Sem nomeacoes" description="Ainda nao ha nomeacoes nesta edicao." />
      );
    } else {
      nomineeListContent = (
        <div className="space-y-3">
          <CompactSegmentTabs
            activeId={selectedGroup?.id ?? ""}
            items={nomineeGroups.map((group) => ({
              id: group.id,
              label: group.label,
              badge: String(group.nominees.length),
            }))}
            onSelect={setActiveListCategoryId}
          />

          {selectedGroup ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{selectedGroup.label}</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="max-h-[48svh] space-y-3 overflow-y-auto pr-1">
                  {selectedGroup.nominees.map((nominee) => (
                    <div key={nominee.id} className="canhoes-list-item flex items-center gap-3 p-2.5">
                      <CanhoesMediaThumb alt={nominee.title} src={nominee.imageUrl} />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{nominee.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {new Date(nominee.createdAtUtc).toLocaleString()}
                        </p>
                      </div>

                      <Badge variant={getNomineeStatusBadgeVariant(nominee.status)}>{nominee.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      );
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit || !nominationPhase) return;

    if (selectedFile && !selectedFile.type.startsWith("image/")) {
      toast.error("Só é permitido upload de imagens.");
      return;
    }

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      toast.error("A imagem excede 10MB.");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdNominee = await canhoesRepo.createNominee({
        categoryId: selectedCategoryId === NO_CATEGORY ? null : selectedCategoryId,
        kind: "nominees",
        title: nomineeTitle.trim(),
      });

      if (selectedFile) {
        await canhoesRepo.uploadNomineeImage(createdNominee.id, selectedFile);
      }

      setNomineeTitle("");
      setSelectedCategoryId(NO_CATEGORY);
      setSelectedFile(null);
      await loadNominees();
      toast.success("Nomeação submetida com sucesso.");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Nao foi possivel submeter a nomeacao."
      );
      logFrontendError("CanhoesNominees.handleSubmit", error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <CanhoesModuleHeader
        icon={Cigarette}
        title="Canhoes do Ano"
        description="Submete uma nomeacao com layout simples e controlos legiveis em mobile."
        badgeLabel={
          phaseType ? `Fase: ${formatEventPhaseLabel(phaseType)}` : undefined
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Submeter nomeação</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <span id="nomination-category-label" className="canhoes-field-label">Categoria</span>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} aria-labelledby="nomination-category-label">
                <SelectTrigger>
                  <SelectValue placeholder="Escolhe a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>(Admin decide depois)</SelectItem>
                  {categoryList.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="nomination-title-input" className="canhoes-field-label">Título</label>
              <Input
                id="nomination-title-input"
                value={nomineeTitle}
                onChange={(event) => setNomineeTitle(event.target.value)}
                placeholder="Ex.: O sticker mais lendário"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CanhoesFileTrigger
              fileName={selectedFile?.name}
              onChange={setSelectedFile}
              placeholder="Adicionar imagem (opcional)"
            />

            <Button disabled={!isNominationPhase || !canSubmit || isSubmitting} onClick={() => void handleSubmit()}>
              {submitButtonLabel}
            </Button>
          </div>

          <p className="canhoes-helper-text">A nomeação começa como pendente até aprovação de um admin.</p>
        </CardContent>
      </Card>

      {errorMessage ? (
        <ErrorAlert
          title="Erro ao carregar nomeacoes"
          description={errorMessage}
          actionLabel="Tentar novamente"
          onAction={() => void loadNominees()}
        />
      ) : null}

      {isLoading ? <InlineLoader label="A carregar nomeacoes" /> : null}

      {nomineeListContent}
    </div>
  );
}


