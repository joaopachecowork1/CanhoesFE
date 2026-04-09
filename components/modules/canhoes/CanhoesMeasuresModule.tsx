"use client";

import { useEffect, useState } from "react";
import { Flame, Gavel, Inbox } from "lucide-react";
import { toast } from "sonner";

import type { GalaMeasureDto } from "@/lib/api/types";
import {
  CanhoesModuleHeader,
  formatEventPhaseLabel,
} from "@/components/modules/canhoes/CanhoesModuleParts";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { useEventOverview } from "@/hooks/useEventOverview";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { InlineLoader } from "@/components/ui/inline-loader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CanhoesMeasuresModule() {
  const { overview } = useEventOverview();
  const [measures, setMeasures] = useState<GalaMeasureDto[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [proposalText, setProposalText] = useState("");
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextMeasures = await canhoesRepo.getMeasures();
      setMeasures(nextMeasures);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Nao foi possivel carregar as medidas desta edicao."
      );
      logFrontendError("CanhoesMeasures.loadMeasures", error);
      setMeasures([]);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const phaseType = overview?.activePhase?.type;
  const nominationPhase = phaseType === "PROPOSALS";
  const canSubmitProposal = proposalText.trim().length >= 5 && nominationPhase;
  const submitButtonLabel = isSubmitting
    ? "A enviar..."
    : nominationPhase
    ? "Propor"
    : "Propostas fechadas";

  const handleProposalSubmit = async () => {
    if (!canSubmitProposal) return;

    setIsSubmitting(true);
    try {
      await canhoesRepo.createMeasureProposal({ text: proposalText.trim() });
      setProposalText("");
      toast.success("Medida proposta");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Nao foi possivel submeter a medida."
      );
      logFrontendError("CanhoesMeasures.handleProposalSubmit", error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMeasures = measures.filter((measure) =>
    search.trim()
      ? measure.text.toLowerCase().includes(search.trim().toLowerCase())
      : true
  );

  return (
    <div className="space-y-4">
      <CanhoesModuleHeader
        icon={Flame}
        title="Medidas"
        description="Junta regras e castigos para a gala sem partir o layout em mobile."
        badgeLabel={
          phaseType ? `Fase: ${formatEventPhaseLabel(phaseType)}` : undefined
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-4 w-4 text-[var(--color-fire)]" />
            Propor medida
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="measure-text-input" className="canhoes-field-label">Texto</label>
            <Textarea
              id="measure-text-input"
              value={proposalText}
              onChange={(event) => setProposalText(event.target.value)}
              placeholder="Ex.: Quem perder paga uma rodada"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="canhoes-helper-text">A proposta fica pendente até aprovação de um admin.</p>
            <Button disabled={!canSubmitProposal || isSubmitting} onClick={() => void handleProposalSubmit()}>
              {submitButtonLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Medidas aprovadas</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Procurar medida"
            className="h-9"
          />

          {errorMessage ? (
            <ErrorAlert
              title="Erro ao carregar medidas"
              description={errorMessage}
              actionLabel="Tentar novamente"
              onAction={() => void loadData()}
            />
          ) : null}

          {isLoading ? <InlineLoader label="A carregar medidas" /> : null}

          {!isLoading && !errorMessage && filteredMeasures.length === 0 ? (
            <EmptyState icon={Inbox} title="Sem medidas" description="Ainda nao ha medidas nesta edicao." />
          ) : null}

          {isLoading ? null : (
            <div className="max-h-[44svh] space-y-2 overflow-y-auto pr-1">
              {filteredMeasures.map((measure) => (
                <div key={measure.id} className="canhoes-list-item space-y-1 p-2.5">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{measure.text}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {new Date(measure.createdAtUtc).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
