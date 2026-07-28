import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

const models = Prisma.dmmf.datamodel.models;

function model(name: string) {
  const found = models.find((m) => m.name === name);
  if (!found) throw new Error(`Model ${name} not found in schema`);
  return found;
}

function field(modelName: string, fieldName: string) {
  const found = model(modelName).fields.find((f) => f.name === fieldName);
  if (!found) throw new Error(`Field ${modelName}.${fieldName} not found in schema`);
  return found;
}

describe("Prisma schema — money rule", () => {
  it("has no Float or Decimal scalar field anywhere (integer minor units only)", () => {
    const offenders = models.flatMap((m) =>
      m.fields
        .filter((f) => f.kind === "scalar" && (f.type === "Float" || f.type === "Decimal"))
        .map((f) => `${m.name}.${f.name}`),
    );
    expect(offenders).toEqual([]);
  });

  it.each([
    ["RateCard", "basePriceAmount"],
    ["Brief", "budgetAmount"],
    ["Booking", "baseAmount"],
    ["Booking", "talentFeeAmount"],
    ["Booking", "clientFeeAmount"],
    ["Payment", "amount"],
  ])("%s.%s is an Int", (modelName, fieldName) => {
    const f = field(modelName, fieldName);
    expect(f.type).toBe("Int");
  });
});

describe("Prisma schema — X3: styleTags/verification are separate", () => {
  it("Creator.styleTags and Creator.verification are distinct fields", () => {
    const styleTags = field("Creator", "styleTags");
    const verification = field("Creator", "verification");

    expect(styleTags.name).not.toBe(verification.name);
    expect(styleTags.kind).toBe("scalar");
    expect(styleTags.type).toBe("String");
    expect(styleTags.isList).toBe(true);

    expect(verification.kind).toBe("enum");
    expect(verification.type).toBe("VerificationState");
  });
});

describe("Prisma schema — X1: payment provider is free text, not an enum", () => {
  it("Payment.provider is a String (validated against an allowlist in application code)", () => {
    const provider = field("Payment", "provider");
    expect(provider.kind).toBe("scalar");
    expect(provider.type).toBe("String");
  });
});
