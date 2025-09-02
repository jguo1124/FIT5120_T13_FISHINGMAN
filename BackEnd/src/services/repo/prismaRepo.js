import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getSpeciesByCode(code) {
  return prisma.species.findUnique({ where: { code } }); 
}

export async function getZoneByCode(zoneCode) {
  return prisma.zone.findUnique({ where: { code: zoneCode } });
}

export async function getRuleSnapshot(code, zoneCode, onDateStr) {
  
  throw new Error("DB mode not implemented yet");
}

export async function getCurrentVersionId() {
  const v = await prisma.regulationVersion.findFirst({ orderBy: { id: "desc" } });
  return v?.id ?? 0;
}
