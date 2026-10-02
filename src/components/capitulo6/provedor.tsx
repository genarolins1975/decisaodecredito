"use client";
import type { ReactNode } from "react";
import { ProvedorRoteiro } from "@/components/capitulo7/base";
import { BASE_C6, PERGUNTAS, SLIDE, TOTAL } from "@/lib/capitulo6/roteiro";

/** Os quadros do capítulo 6 usam o kit do capítulo 7 com o roteiro, as perguntas e a declaração da base deste capítulo. */
const ROTEIRO_C6 = { SLIDE, PERGUNTAS, TOTAL, base: BASE_C6 };
export function ProvedorC6({ children }: { children: ReactNode }) { return <ProvedorRoteiro value={ROTEIRO_C6}>{children}</ProvedorRoteiro>; }
