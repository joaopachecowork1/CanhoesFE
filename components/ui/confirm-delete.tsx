"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ConfirmDeleteProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  iconOnly?: boolean;
}

export function ConfirmDeleteAction({
  onConfirm,
  title = "Tem a certeza?",
  description = "Esta ação não pode ser desfeita. Vai eliminar permanentemente este item.",
  trigger,
  iconOnly = false,
}: ConfirmDeleteProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ? (
          trigger
        ) : iconOnly ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0 text-[var(--text-muted)] hover:bg-white/5 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="destructive" size="sm" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="border border-white/10 bg-zinc-950 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-zinc-100">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }} 
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
