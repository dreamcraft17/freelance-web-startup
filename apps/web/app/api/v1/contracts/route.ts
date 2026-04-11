import { NextResponse } from "next/server";
import { ContractService } from "@/server/services/contract.service";
import { getAuthActor } from "@/server/http/route-helpers";

const contractService = new ContractService();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const contractId = url.searchParams.get("id");
  if (!contractId) {
    return NextResponse.json({ success: false, error: "Missing contract id" }, { status: 400 });
  }

  const actor = getAuthActor(request);
  const data = await contractService.getByIdForActor(actor, contractId);
  return NextResponse.json({ success: true, data });
}
