import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const badgeId = params.id;

  const credential = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://zk-gitproof.org/credentials/v1"
    ],
    id: `urn:uuid:${badgeId}`,
    type: ["VerifiableCredential", "ZeroKnowledgeSkillCredential"],
    issuer: {
      id: "did:web:zk-gitproof.org",
      name: "ZK-GitProof zkTLS Verifier Network"
    },
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: "did:github:@alex-dev",
      role: "Developer",
      skillStatement: "Merged 18 Pull Requests in Rust (Private Repository)",
      language: "Rust",
      activityTimeframe: "Jan 2026 - Oct 2026",
      redactedEntities: {
        organization: "[REDACTED]",
        repository: "[REDACTED]",
        sourceCode: "[NEVER EXPOSED]"
      },
      antiGamingCompliance: {
        collaboratorsCount: 4,
        linesChanged: 1420,
        passed: true
      }
    },
    proof: {
      type: "ZkTlsGroth16Signature2026",
      created: new Date().toISOString(),
      verificationMethod: "did:web:zk-gitproof.org#bn254-key-1",
      proofPurpose: "assertionMethod",
      merkleRoot: "0x8f4c2e1b9a7d3f5e6a8b0c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9e1f",
      witnessCommitment: "0x1234abcd5678ef901234abcd5678ef901234abcd5678ef901234abcd5678ef90",
      zkSignature: "e7c2a4f61b8d0e9a3f5c7b1d4e6a8f0b2c4d6e8a0f1b3c5d7e9a1b3c5d7e9f0a"
    }
  };

  return NextResponse.json(credential, {
    headers: {
      "Content-Type": "application/ld+json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
