import { describe, expect, it } from "vitest";
import { AccountStatus, ContractStatus, UserRole } from "@acme/types";
import { EscrowStatus } from "@acme/database";
import { DomainError } from "@/server/errors/domain-errors";
import { ContractPolicy } from "./contract.policy";

describe("ContractPolicy escrow complete gate", () => {
  const actor = {
    userId: "u_client",
    role: UserRole.CLIENT,
    accountStatus: AccountStatus.ACTIVE
  };

  it("allows complete when escrow is not locked", () => {
    expect(() => ContractPolicy.assertContractCompletable(ContractStatus.IN_PROGRESS)).not.toThrow();
    expect(() => ContractPolicy.assertEscrowAllowsDirectComplete(EscrowStatus.NONE)).not.toThrow();
    expect(() => ContractPolicy.assertEscrowAllowsDirectComplete(EscrowStatus.FULLY_RELEASED)).not.toThrow();
  });

  it("blocks direct complete while escrow is LOCKED", () => {
    expect(() => ContractPolicy.assertEscrowAllowsDirectComplete(EscrowStatus.LOCKED)).toThrowError(DomainError);
    try {
      ContractPolicy.assertEscrowAllowsDirectComplete(EscrowStatus.LOCKED);
    } catch (e) {
      expect(e).toBeInstanceOf(DomainError);
      expect((e as DomainError).code).toBe("ESCROW_LOCKED_COMPLETE_FORBIDDEN");
    }
  });

  it("blocks direct complete while escrow is DISPUTED", () => {
    expect(() => ContractPolicy.assertEscrowAllowsDirectComplete(EscrowStatus.DISPUTED)).toThrowError(DomainError);
  });

  it("still requires participant for complete", () => {
    expect(() =>
      ContractPolicy.assertActorMayCompleteContract(actor, "other", "freelancer")
    ).toThrow();
  });
});
