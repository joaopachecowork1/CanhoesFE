"use client";

import { useEffect, useState } from "react";
import { Flame, Gavel } from "lucide-react";
import { toast } from "sonner";

import type { CanhoesStateDto, GalaMeasureDto } from "@/lib/api/types";
import {
  CanhoesModuleHeader,
  formatCanhoesPhaseLabel,
} from "@/components/modules/canhoes/CanhoesModuleParts";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CanhoesMeasuresModule() {
  const [canhoesState, setCanhoesState] = useState<CanhoesStateDto | null>(null);
  const [measureList, setMeasureList] = useState<GalaMeasureDto[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [proposalText, setProposalText] = useState("");
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMeasures = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [nextState, nextMeasures] = await Promise.all([
        canhoesRepo.getState(),
        canhoesRepo.getMeasures(),
      ]);

      setCanhoesState(nextState);
      setMeasureList(nextMeasures);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Nao foi possivel carregar as medidas desta edicao."
      );
      logFrontendError("CanhoesMeasures.loadMeasures", error);
      setCanhoesState(null);
      setMeasureList([]);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMeasures();
  }, []);

  const isNominationPhase = canhoesState?.phase === "nominations";
  const canSubmitProposal = proposalText.trim().length >= 5 && isNominationPhase;
  let submitButtonLabel = "Propostas fechadas";
  if (isNominationPhase) {
    submitButtonLabel = "Propor";
  }
  if (isSubmitting) {
    submitButtonLabel = "A enviar...";
  }

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

  const filteredMeasures = measureList.filter((measure) =>
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
          canhoesState ? `Fase: ${formatCanhoesPhaseLabel(canhoesState.phase)}` : undefined
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
          <label className="space-y-2">
            <span className="canhoes-field-label">Texto</span>
            <Textarea
              value={proposalText}
              onChange={(event) => setProposalText(event.target.value)}
              placeholder="Ex.: Quem perder paga uma rodada"
            />
          </label>

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
              onAction={() => void loadMeasures()}
            />
          ) : null}

          {isLoading ? <p className="body-small text-[var(--color-text-muted)]">A carregar...</p> : null}

          {!isLoading && !errorMessage && filteredMeasures.length === 0 ? (
            <p className="body-small text-[var(--color-text-muted)]">Ainda não há medidas.</p>
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
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
