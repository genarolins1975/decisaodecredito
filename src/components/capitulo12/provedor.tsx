"use client";
import type { ReactNode } from "react";
import { ProvedorRoteiro } from "@/components/capitulo7/base";
import { BASE_C12, PERGUNTAS, SLIDE, TOTAL } from "@/lib/capitulo12/roteiro";

/** Os quadros do capítulo 12 usam o kit do capítulo 7 com o roteiro e as quatro perguntas deste capítulo. */
const ROTEIRO_C12 = { SLIDE, PERGUNTAS, TOTAL, base: BASE_C12 };
export function ProvedorC12({ children }: { children: ReactNode }) { return <ProvedorRoteiro value={ROTEIRO_C12}>{children}</ProvedorRoteiro>; }
