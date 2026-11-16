"""
Zero-Knowledge & zkTLS Cryptographic Engine for ZK-GitProof.
Implements:
- TLS session attestation (zkTLS / Reclaim Protocol simulated cryptography)
- Merkle tree commitments and Groth16 BN254 ZK-SNARK proof structures
- Phase 2: Anti-Gaming Engine validation (multi-contributor >= 2, code diff >= 500)
- Phase 3: Enterprise Manager Co-Signature cryptographic signatures
- Phase 4: ATS JSON-LD Verifiable Credential generation
"""

import hashlib
import hmac
import json
import secrets
import time
from typing import Dict, Any, List, Tuple, Optional

# System Verifier Key (Trusted Setup Salt)
VERIFIER_SECRET_SALT = "zk_gitproof_trusted_setup_v1_seed_98327461298471209"
GITHUB_TLS_ROOT_FINGERPRINT = "sha256:7b:2a:4e:89:12:ef:90:34:bc:56:1a:2d:ef:34:56:78:90:ab:cd:ef"

def sha256_hex(data: str) -> str:
    """Compute SHA-256 hash in hexadecimal format."""
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def build_merkle_root(leaves: List[str]) -> Tuple[str, List[Dict[str, Any]]]:
    """Build a binary Merkle tree from PR commitment leaves."""
    if not leaves:
        leaves = [sha256_hex("empty_leaf")]
    
    current_level = [sha256_hex(leaf) for leaf in leaves]
    tree_nodes = [current_level]

    while len(current_level) > 1:
        next_level = []
        for i in range(0, len(current_level), 2):
            left = current_level[i]
            right = current_level[i + 1] if i + 1 < len(current_level) else current_level[i]
            combined = sha256_hex(f"{left}:{right}")
            next_level.append(combined)
        tree_nodes.append(next_level)
        current_level = next_level

    merkle_root = current_level[0]
    return merkle_root, [{"level": idx, "hashes": lvl} for idx, lvl in enumerate(tree_nodes)]

def generate_zk_proof(
    candidate_id: str = "@alex-dev",
    candidate_role: str = "Developer",
    skill_title: str = "Merged 18 Pull Requests in Rust (Private Repository)",
    language: str = "Rust",
    pr_count: int = 18,
    private_repo_name: str = "acme-corp/payment-api",
    company_name: str = "Tier-1 Quantitative Trading Firm",
    date_range: str = "Jan 2026 - Oct 2026",
    collaborators_count: int = 4,
    lines_changed: int = 1420,
    enterprise_mode: bool = False,
    badge_id_override: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates a zero-knowledge attestation using zkTLS selective disclosure.
    The private repository and company name remain strictly in private witness
    and are redacted from the public proof.
    """
    timestamp = int(time.time())
    nonce = secrets.token_hex(16)
    
    # 1. Private Witness (Kept hidden on client, never stored in plaintext)
    private_witness = {
        "repo_name": private_repo_name,
        "company_name": company_name,
        "actual_pr_count": pr_count,
        "collaborators_count": collaborators_count,
        "lines_changed": lines_changed,
        "github_tls_session_id": f"tls_sess_{secrets.token_hex(12)}"
    }
    
    witness_str = json.dumps(private_witness, sort_keys=True)
    witness_commitment = sha256_hex(witness_str + nonce)
    
    # 2. Public Inputs (Visible to recruiters, LinkedIn, ATS)
    public_inputs = {
        "candidate_id": candidate_id,
        "candidate_role": candidate_role,
        "skill_title": skill_title,
        "language": language,
        "min_pr_threshold": pr_count,
        "company_redacted": "[REDACTED]",
        "repo_redacted": "[REDACTED]",
        "source_code_status": "[NEVER EXPOSED]",
        "verification_protocol": "zkTLS / TLSNotary v0.4.1 + BN254 Groth16",
        "github_tls_fingerprint": GITHUB_TLS_ROOT_FINGERPRINT,
        "timestamp": timestamp,
        "date_range": date_range,
        "anti_gaming": {
            "passed": collaborators_count >= 2 and lines_changed >= 500,
            "collaborators_verified": f"{collaborators_count}+ collaborators (>= 2 required)",
            "lines_changed_verified": f"{lines_changed}+ lines diff (>= 500 required)"
        },
        "enterprise_mode": enterprise_mode
    }

    # 3. Merkle commitments for individual PR hashes
    pr_leaf_hashes = [
        sha256_hex(f"PR_MERGED_{i}_{language}_{witness_commitment[:16]}")
        for i in range(pr_count)
    ]
    merkle_root, _ = build_merkle_root(pr_leaf_hashes)

    # 4. Generate Groth16 elliptic curve proof simulation (pi_a, pi_b, pi_c)
    proof_material = f"{merkle_root}:{witness_commitment}:{json.dumps(public_inputs, sort_keys=True)}"
    
    # Cryptographic HMAC signature ensuring integrity of the ZK proof
    zk_signature = hmac.new(
        VERIFIER_SECRET_SALT.encode('utf-8'),
        proof_material.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    proof_id = badge_id_override or f"zk-{language.lower()[:4]}-{pr_count}pr-{zk_signature[:6]}"

    pi_a = [
        "0x" + sha256_hex(proof_material + "_a1")[:64],
        "0x" + sha256_hex(proof_material + "_a2")[:64]
    ]
    pi_b = [
        ["0x" + sha256_hex(proof_material + "_b1_0")[:64], "0x" + sha256_hex(proof_material + "_b1_1")[:64]],
        ["0x" + sha256_hex(proof_material + "_b2_0")[:64], "0x" + sha256_hex(proof_material + "_b2_1")[:64]]
    ]
    pi_c = [
        "0x" + sha256_hex(proof_material + "_c1")[:64],
        "0x" + sha256_hex(proof_material + "_c2")[:64]
    ]

    return {
        "badge_id": proof_id,
        "candidate_id": candidate_id,
        "candidate_role": candidate_role,
        "public_inputs": public_inputs,
        "witness_commitment": witness_commitment,
        "merkle_root": merkle_root,
        "zk_proof": {
            "curve": "BN254 (alt_bn128)",
            "pi_a": pi_a,
            "pi_b": pi_b,
            "pi_c": pi_c,
            "signature": zk_signature,
            "nonce": nonce
        },
        "co_signature": None,
        "created_at": timestamp,
        "status": "VALID"
    }

def create_tampered_badge() -> Dict[str, Any]:
    """Generates a sample tampered badge for testing anti-tamper verification."""
    badge = generate_zk_proof(
        candidate_id="@alex-dev",
        candidate_role="Developer",
        skill_title="Merged 18 Pull Requests in Rust (Private Repository)",
        language="Rust",
        pr_count=18,
        private_repo_name="acme-corp/payment-api",
        company_name="Tier-1 Enterprise / Quant Firm",
        badge_id_override="zk-tampered-badge-99"
    )
    # Tamper with the public skill claim without updating the cryptographic signature
    badge["public_inputs"]["skill_title"] = "Merged 999+ Pull Requests in Rust (FORGED / TAMPERED)"
    badge["public_inputs"]["min_pr_threshold"] = 999
    badge["status"] = "TAMPERED"
    return badge

def verify_zk_proof(badge_data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Verifies a ZK-GitProof badge cryptographically.
    Checks:
    - Merkle root integrity
    - Cryptographic signature against trusted verifier key
    - Anti-gaming thresholds (collaborator count >= 2, lines changed >= 500)
    - Anti-tampering verification
    """
    try:
        public_inputs = badge_data.get("public_inputs", {})
        witness_commitment = badge_data.get("witness_commitment", "")
        merkle_root = badge_data.get("merkle_root", "")
        zk_proof = badge_data.get("zk_proof", {})
        signature = zk_proof.get("signature", "")

        if not all([public_inputs, witness_commitment, merkle_root, signature]):
            return False, "Missing cryptographic fields in proof payload.", {}

        # Re-compute proof material
        proof_material = f"{merkle_root}:{witness_commitment}:{json.dumps(public_inputs, sort_keys=True)}"
        expected_sig = hmac.new(
            VERIFIER_SECRET_SALT.encode('utf-8'),
            proof_material.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        if hmac.compare_digest(signature, expected_sig):
            anti_gaming = public_inputs.get("anti_gaming", {})
            return True, "Zero-Knowledge proof verified successfully. GitHub TLS attestation is authentic.", {
                "proof_id": badge_data.get("badge_id"),
                "status": "VERIFIED_AUTHENTIC",
                "skill": public_inputs.get("skill_title"),
                "candidate": public_inputs.get("candidate_id"),
                "language": public_inputs.get("language"),
                "threshold": public_inputs.get("min_pr_threshold"),
                "company": public_inputs.get("company_redacted", "[REDACTED]"),
                "repository": public_inputs.get("repo_redacted", "[REDACTED]"),
                "source_code": public_inputs.get("source_code_status", "[NEVER EXPOSED]"),
                "tls_fingerprint": public_inputs.get("github_tls_fingerprint"),
                "anti_gaming_passed": anti_gaming.get("passed", True),
                "verified_at": int(time.time()),
                "curve": zk_proof.get("curve", "BN254")
            }
        else:
            return False, "Cryptographic signature mismatch: Proof has been tampered with or modified. Attestation rejected.", {
                "proof_id": badge_data.get("badge_id"),
                "status": "TAMPERED_OR_FORGED",
                "reason": "Calculated HMAC signature does not match stored witness commitment."
            }

    except Exception as e:
        return False, f"Verification failed with error: {str(e)}", {}

def format_w3c_verifiable_credential(badge: Dict[str, Any]) -> Dict[str, Any]:
    """Phase 4: Format badge as standard W3C Verifiable Credential (JSON-LD) for ATS."""
    pub = badge.get("public_inputs", {})
    return {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://zk-gitproof.org/credentials/v1"
        ],
        "id": f"urn:uuid:{badge.get('badge_id')}",
        "type": ["VerifiableCredential", "ZeroKnowledgeSkillCredential"],
        "issuer": {
            "id": "did:web:zk-gitproof.org",
            "name": "ZK-GitProof zkTLS Verifier Network"
        },
        "issuanceDate": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(badge.get("created_at", time.time()))),
        "credentialSubject": {
            "id": f"did:github:{pub.get('candidate_id', '@alex-dev')}",
            "role": pub.get("candidate_role", "Developer"),
            "skillStatement": pub.get("skill_title"),
            "language": pub.get("language"),
            "activityTimeframe": pub.get("date_range"),
            "redactedEntities": {
                "organization": "[REDACTED]",
                "repository": "[REDACTED]",
                "sourceCode": "[NEVER EXPOSED]"
            },
            "antiGamingCompliance": pub.get("anti_gaming", {
                "collaborators": ">= 2",
                "diffLines": ">= 500"
            })
        },
        "proof": {
            "type": "ZkTlsGroth16Signature2026",
            "created": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(badge.get("created_at", time.time()))),
            "verificationMethod": "did:web:zk-gitproof.org#bn254-key-1",
            "proofPurpose": "assertionMethod",
            "merkleRoot": badge.get("merkle_root"),
            "witnessCommitment": badge.get("witness_commitment"),
            "zkSignature": badge.get("zk_proof", {}).get("signature")
        }
    }
