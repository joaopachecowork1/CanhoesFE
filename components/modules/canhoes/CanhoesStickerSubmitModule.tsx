"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Cigarette, Inbox } from "lucide-react";
import { toast } from "sonner";

import {
  CanhoesFileTrigger,
  CanhoesMediaThumb,
  CanhoesModuleHeader,
  formatEventPhaseLabel,
  getNomineeStatusBadgeVariant,
} from "@/components/modules/canhoes/CanhoesModuleParts";
import { useEventOverview } from "@/hooks/useEventOverview";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { InlineLoader } from "@/components/ui/inline-loader";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import type {
  AwardCategoryDto,
  NomineeDto,
} from "@/lib/api/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CanhoesStickerSubmitModule() {
  const { overview, event } = useEventOverview();
  const eventId = event?.id ?? null;

  const [categoryList, setCategoryList] = useState<AwardCategoryDto[]>([]);
  const [nomineeList, setNomineeList] = useState<NomineeDto[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [stickerTitle, setStickerTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const selectedFilePreviewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ""),
    [selectedFile]
  );

  useEffect(() => {
    return () => {
      if (selectedFilePreviewUrl) {
        URL.revokeObjectURL(selectedFilePreviewUrl);
      }
    };
  }, [selectedFilePreviewUrl]);

  const loadStickerData = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [nextCategories, nextNominees] = await Promise.all([
        canhoesEventsRepo.getUserCategories(eventId),
        canhoesEventsRepo.getApprovedNominees(eventId),
      ]);

      setCategoryList(Array.isArray(nextCategories) ? nextCategories : []);
      setNomineeList(Array.isArray(nextNominees) ? nextNominees : []);

      const defaultStickerCategory = (nextCategories ?? []).find((category) =>
        category.name.toLowerCase().includes("sticker")
      );

      setSelectedCategoryId(
        (currentCategoryId) => currentCategoryId || defaultStickerCategory?.id || ""
      );
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Nao foi possivel carregar os stickers desta edicao."
      );
      logFrontendError("CanhoesStickerSubmit.loadStickerData", error);
      setCategoryList([]);
      setNomineeList([]);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadStickerData();
  }, [loadStickerData]);

  const phaseType = overview?.activePhase?.type;
  const nominationPhase = phaseType === "PROPOSALS";
  const canSubmit = stickerTitle.trim().length >= 2;
  const submitButtonLabel = nominationPhase
    ? isSubmitting
      ? "A submeter..."
      : "Submeter sticker"
    : "Nomeacoes fechadas";

  const stickersWithImage = useMemo(
    () => nomineeList.filter((nominee) => nominee.imageUrl),
    [nomineeList]
  );

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("So podes enviar imagens");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("A imagem excede 15MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!nominationPhase || !canSubmit || !eventId) return;

    setIsSubmitting(true);

    try {
      const createdNominee = await canhoesEventsRepo.createNomination(eventId, {
        categoryId: selectedCategoryId || null,
        kind: "stickers",
        title: stickerTitle.trim(),
      });

      if (selectedFile) {
        await canhoesEventsRepo.uploadNomineeImage(eventId, createdNominee.id, selectedFile);
      }

      setStickerTitle("");
      setSelectedFile(null);
      await loadStickerData();
      toast.success("Sticker submetido");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Nao foi possivel submeter o sticker."
      );
      logFrontendError("CanhoesStickerSubmit.handleSubmit", error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="page-hero px-4 py-4 sm:px-5 sm:py-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--color-title)]">
            <Cigarette className="h-4 w-4 text-[var(--color-fire)]" />
            <span className="editorial-kicker">Sticker do ano</span>
          </div>
          <CanhoesModuleHeader
            icon={Cigarette}
            title="Arquivo de stickers"
            description="O fluxo de upload agora segue a mesma logica do feed: preview real, validacao explicita e URLs de imagem normalizadas para funcionar em mobile, Vercel e backend remoto."
            badgeLabel={
              phaseType ? `Fase: ${formatEventPhaseLabel(phaseType)}` : undefined
            }
          />
        </div>
      </section>

      <Card>
        <CardHeader className="space-y-1">
          <p className="editorial-kicker">Submissao</p>
          <CardTitle>Enviar um novo sticker</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage ? (
            <ErrorAlert
              title="Erro ao carregar stickers"
              description={errorMessage}
              actionLabel="Tentar novamente"
              onAction={() => void loadStickerData()}
            />
          ) : null}

          {isLoading ? (
            <InlineLoader label="A carregar stickers" />
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-2">
              <span id="sticker-category-label" className="canhoes-field-label">Categoria</span>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} aria-labelledby="sticker-category-label">
                <SelectTrigger>
                  <SelectValue placeholder="Escolhe a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="sticker-title-input" className="canhoes-field-label">Titulo</label>
              <Input
                id="sticker-title-input"
                value={stickerTitle}
                onChange={(event) => setStickerTitle(event.target.value)}
                placeholder="Ex: O sticker mais lendario"
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-3">
              <p className="canhoes-field-label">Imagem</p>
              <CanhoesFileTrigger
                className="gap-3 rounded-[var(--radius-md-token)] border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-panel)]"
                fileName={selectedFile?.name}
                iconClassName="text-[var(--neon-cyan)]"
                onChange={handleFileChange}
                placeholder="Adicionar imagem (opcional)"
              />
              <p className="canhoes-helper-text">
                Preview local antes do submit. O sticker fica pendente ate um
                admin aprovar.
              </p>
            </div>

            <div className="rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-panel)]">
              <CanhoesMediaThumb
                alt={selectedFile?.name ?? "Preview do sticker"}
                src={selectedFilePreviewUrl}
                normalizeSrc={false}
                frameClassName="aspect-square h-auto w-full rounded-[calc(var(--radius-md-token)-4px)] bg-[var(--color-bg-surface)]"
                imageClassName="h-full w-full object-cover"
                iconClassName="h-6 w-6"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="canhoes-helper-text">
              O upload usa o mesmo padrao de media do feed para evitar URLs
              partidas depois de guardar.
            </p>

            <Button
              disabled={!nominationPhase || !canSubmit || isSubmitting}
              onClick={() => void handleSubmit()}
              className="w-full sm:w-auto"
            >
              {submitButtonLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="editorial-kicker">Galeria</p>
            <h2 className="heading-3 text-[var(--color-text-primary)]">
              Stickers submetidos
            </h2>
          </div>
          <Badge variant="secondary">{stickersWithImage.length}</Badge>
        </div>

        {!isLoading && !errorMessage && stickersWithImage.length === 0 ? (
          <EmptyState icon={Inbox} title="Sem stickers" description="Ainda nao ha stickers com imagem para mostrar." />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stickersWithImage.map((nominee) => (
            <Card key={nominee.id} className="overflow-hidden">
              <CanhoesMediaThumb
                alt={nominee.title}
                src={nominee.imageUrl}
                frameClassName="aspect-square h-auto w-full rounded-none bg-[var(--color-bg-surface)]"
                iconClassName="h-6 w-6"
              />

              <CardContent className="space-y-3 pt-4">
                <div className="space-y-1">
                  <p className="truncate font-semibold text-[var(--color-text-primary)]">
                    {nominee.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {new Date(nominee.createdAtUtc).toLocaleString("pt-PT")}
                  </p>
                </div>

                <Badge variant={getNomineeStatusBadgeVariant(nominee.status)}>
                  {nominee.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
