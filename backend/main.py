"""
FastAPI Server for ZK-GitProof
Complete implementation for Phase 1, Phase 2, Phase 3, and Phase 4.
Serves REST API, dynamic SVG generator, ATS JSON-LD credentials, and SPA frontend.
"""

import os
import time
import secrets
from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from typing import Dict, Any, List

from backend.crypto_zk import (
    generate_zk_proof,
    create_tampered_badge,
    verify_zk_proof,
    format_w3c_verifiable_credential
)
from backend.models import (
    MintBadgeRequest,
    VerifyBadgeRequest,
    ManagerCoSignRequest,
    GitHubMockScanRequest
)

app = FastAPI(
    title="ZK-GitProof API",
    description="Prove Your Private Code. Protect Your NDA.",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for minted badges and co-signatures
BADGES_DB: Dict[str, Dict[str, Any]] = {}
CO_SIGNATURES_DB: Dict[str, Dict[str, Any]] = {}

def seed_initial_badges():
    """Populate database with exact sample badges matching the screenshots."""
    # 1. Exact badge from Screenshot 3: @alex-dev, Merged 18 Pull Requests in Rust
    rust_badge = generate_zk_proof(
        candidate_id="@alex-dev",
        candidate_role="Developer",
        skill_title="Merged 18 Pull Requests in Rust (Private Repository)",
        language="Rust",
        pr_count=18,
        private_repo_name="acme-corp/payment-api",
        company_name="Tier-1 Enterprise / Quant Firm",
        date_range="Jan 2026 - Oct 2026",
        collaborators_count=4,
        lines_changed=1420,
        badge_id_override="zk-rust-15pr-88"
    )
    BADGES_DB["zk-rust-15pr-88"] = rust_badge

    # 2. Tampered Badge for Screenshot 4 testing
    tampered_badge = create_tampered_badge()
    BADGES_DB["zk-tampered-badge-99"] = tampered_badge

    # 3. 500+ Lines of Code (from Dashboard Screenshot 2)
    lines_badge = generate_zk_proof(
        candidate_id="@alex-dev",
        candidate_role="Developer",
        skill_title="500+ Lines of Rust/Python",
        language="Rust",
        pr_count=12,
        private_repo_name="acme-corp/data-pipeline",
        company_name="Tier-1 Enterprise / Quant Firm",
        date_range="Feb 2026 - Present",
        collaborators_count=5,
        lines_changed=840,
        badge_id_override="zk-lines-500-3d"
    )
    lines_badge["created_at"] = int(time.time()) - (3 * 86400)
    BADGES_DB["zk-lines-500-3d"] = lines_badge

    # 4. 50+ Contributions (from Dashboard Screenshot 2)
    contrib_badge = generate_zk_proof(
        candidate_id="@alex-dev",
        candidate_role="Developer",
        skill_title="50+ Private Contributions",
        language="TypeScript",
        pr_count=22,
        private_repo_name="acme-corp/internal-tooling",
        company_name="Tier-1 Enterprise / Quant Firm",
        date_range="Last 6 Months",
        collaborators_count=6,
        lines_changed=2300,
        badge_id_override="zk-contrib-50-5d"
    )
    contrib_badge["created_at"] = int(time.time()) - (5 * 86400)
    BADGES_DB["zk-contrib-50-5d"] = contrib_badge

seed_initial_badges()

# Paths
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ZK-GitProof",
        "badges_count": len(BADGES_DB),
        "protocol": "zkTLS / Reclaim Protocol v0.4.1 + BN254 Groth16",
        "version": "2.0.0"
    }

@app.get("/api/badges")
def list_badges():
    """List public badge metadata for dashboard and verification."""
    results = []
    for bid, data in BADGES_DB.items():
        pub = data["public_inputs"]
        results.append({
            "badge_id": bid,
            "candidate_id": data.get("candidate_id", "@alex-dev"),
            "candidate_role": data.get("candidate_role", "Developer"),
            "skill_title": pub["skill_title"],
            "language": pub["language"],
            "company": pub["company_redacted"],
            "date_range": pub.get("date_range", "2026"),
            "created_at": data["created_at"],
            "merkle_root": data["merkle_root"],
            "status": data["status"],
            "anti_gaming": pub.get("anti_gaming", {})
        })
    return {"badges": results}

@app.get("/api/badges/{badge_id}")
def get_badge(badge_id: str):
    """Retrieve full cryptographic proof and public inputs."""
    if badge_id not in BADGES_DB:
        raise HTTPException(status_code=404, detail=f"Badge '{badge_id}' not found")
    return BADGES_DB[badge_id]

@app.get("/api/badges/{badge_id}/ats")
def get_ats_credential(badge_id: str):
    """
    Phase 4: Return W3C Verifiable Credential (JSON-LD) for ATS systems
    (Greenhouse, Lever, Workday) to verify candidate skill without breaking NDAs.
    """
    if badge_id not in BADGES_DB:
        raise HTTPException(status_code=404, detail=f"Badge '{badge_id}' not found")
    badge = BADGES_DB[badge_id]
    return format_w3c_verifiable_credential(badge)

@app.post("/api/proof/mint")
def mint_badge(payload: MintBadgeRequest):
    """
    Phase 1 & 2: Generate zero-knowledge proof for candidate's private GitHub PR contributions.
    Enforces Anti-Gaming thresholds:
    - Repository must have >= 2 collaborators
    - PR diff lines changed must be >= 500
    """
    collabs = payload.collaborators_count or 4
    diff_lines = payload.lines_changed or 1420
    
    # Phase 2 Anti-Gaming Threshold Enforcement
    if collabs < 2:
        raise HTTPException(
            status_code=400,
            detail=f"Anti-Gaming check failed: Repository has only {collabs} collaborator. Minimum 2 required."
        )
    if diff_lines < 500:
        raise HTTPException(
            status_code=400,
            detail=f"Anti-Gaming check failed: PR diff lines changed is {diff_lines}. Minimum 500 lines required."
        )

    badge = generate_zk_proof(
        candidate_id=payload.candidate_id,
        candidate_role=payload.candidate_role,
        skill_title=payload.skill_title,
        language=payload.language,
        pr_count=payload.pr_count,
        private_repo_name=payload.private_repo_name,
        company_name=payload.company_name,
        date_range=payload.date_range or "Jan 2026 - Present",
        collaborators_count=collabs,
        lines_changed=diff_lines,
        enterprise_mode=payload.enterprise_mode or False
    )
    BADGES_DB[badge["badge_id"]] = badge
    return {
        "success": True,
        "badge_id": badge["badge_id"],
        "badge": badge,
        "message": "ZK-GitProof badge minted successfully. Private repo and company details redacted with zkTLS."
    }

@app.post("/api/proof/verify")
def verify_badge(payload: VerifyBadgeRequest):
    """
    Verify a candidate badge cryptographically against the trusted verifier key.
    Detects tampered data and signature mismatches instantly.
    """
    if payload.badge_id:
        if payload.badge_id not in BADGES_DB:
            return {
                "valid": False,
                "message": f"Badge '{payload.badge_id}' not found in registry.",
                "details": {"status": "NOT_FOUND"}
            }
        proof_data = BADGES_DB[payload.badge_id]
    elif payload.proof_payload:
        proof_data = payload.proof_payload
    else:
        raise HTTPException(status_code=400, detail="Must provide badge_id or proof_payload")

    is_valid, msg, details = verify_zk_proof(proof_data)
    return {
        "valid": is_valid,
        "message": msg,
        "details": details
    }

@app.post("/api/enterprise/co-sign")
def create_manager_co_sign(req: ManagerCoSignRequest):
    """
    Phase 3: Enterprise Mode Manager Co-Signature.
    Generates a cryptographic co-signing endorsement token for an engineering manager.
    """
    if req.badge_id not in BADGES_DB:
        raise HTTPException(status_code=404, detail="Badge not found")

    co_sign_token = f"cosign_{secrets.token_hex(16)}"
    co_sign_record = {
        "token": co_sign_token,
        "badge_id": req.badge_id,
        "manager_name": req.manager_name,
        "manager_title": req.manager_title,
        "manager_company": req.manager_company,
        "manager_email": req.manager_email,
        "endorsement_note": req.endorsement_note,
        "signed_at": int(time.time()),
        "status": "ENDORSED"
    }
    CO_SIGNATURES_DB[co_sign_token] = co_sign_record
    BADGES_DB[req.badge_id]["co_signature"] = co_sign_record

    return {
        "success": True,
        "co_sign_token": co_sign_token,
        "share_url": f"/badge/{req.badge_id}?cosign={co_sign_token}",
        "record": co_sign_record
    }

@app.get("/api/enterprise/co-sign/{token}")
def get_co_sign(token: str):
    if token not in CO_SIGNATURES_DB:
        raise HTTPException(status_code=404, detail="Co-signature token not found")
    return CO_SIGNATURES_DB[token]

@app.post("/api/github/scan-demo")
def scan_demo_repos(req: GitHubMockScanRequest):
    """
    Simulates private repo discovery via GitHub GraphQL API.
    Provides private repositories with collaborator counts and line diffs.
    """
    repos = {
        "acme_payment": {
            "name": "acme-corp/payment-api",
            "language": "Rust",
            "private": True,
            "collaborators_count": 4,
            "lines_changed": 1420,
            "merged_prs": 18,
            "timeframe": "Jan 2026 - Oct 2026",
            "suggested_title": "Merged 18 Pull Requests in Rust (Private Repository)"
        },
        "acme_pipeline": {
            "name": "acme-corp/data-pipeline",
            "language": "Python",
            "private": True,
            "collaborators_count": 5,
            "lines_changed": 840,
            "merged_prs": 12,
            "timeframe": "Feb 2026 - Present",
            "suggested_title": "500+ Lines of Rust/Python"
        },
        "acme_tooling": {
            "name": "acme-corp/internal-tooling",
            "language": "TypeScript",
            "private": True,
            "collaborators_count": 6,
            "lines_changed": 2300,
            "merged_prs": 22,
            "timeframe": "Last 6 Months",
            "suggested_title": "50+ Private Contributions"
        }
    }
    selected = repos.get(req.repo_category, repos["acme_payment"])
    return {
        "connected_client_side": True,
        "authenticated_as": "@alex-dev",
        "enterprise_mode": req.enterprise_mode,
        "repository": selected,
        "anti_gaming_passed": selected["collaborators_count"] >= 2 and selected["lines_changed"] >= 500,
        "zk_redaction_preview": {
            "browser_view": selected["name"],
            "recruiter_view": "[REDACTED]"
        }
    }

@app.get("/api/badges/{badge_id}/svg")
def generate_badge_svg(badge_id: str):
    """Dynamic SVG badge representation for GitHub READMEs & portfolios."""
    badge = BADGES_DB.get(badge_id)
    if not badge or badge.get("status") == "TAMPERED":
        title = "ZK-GitProof: Unverified / Tampered"
        sub = "Status: Cryptographic Check Failed"
        status_color = "#ef4444"
    else:
        title = badge["public_inputs"]["skill_title"]
        sub = f"Company: {badge['public_inputs']['company_redacted']}"
        status_color = "#10b981"

    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" width="460" height="120" viewBox="0 0 460 120" fill="none">
    <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="460" y2="120" gradientUnits="userSpaceOnUse">
            <stop stop-color="#ffffff"/>
            <stop offset="1" stop-color="#f4fbf7"/>
        </linearGradient>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="60" y2="70" gradientUnits="userSpaceOnUse">
            <stop stop-color="#059669"/>
            <stop offset="1" stop-color="#10b981"/>
        </linearGradient>
    </defs>
    <rect x="2" y="2" width="456" height="116" rx="16" fill="url(#cardGrad)" stroke="#d1fae5" stroke-width="2"/>
    <g transform="translate(25, 25)">
        <polygon points="30,5 55,20 55,50 30,65 5,50 5,20" fill="url(#shieldGrad)" stroke="#34d399" stroke-width="2"/>
        <text x="30" y="42" font-family="monospace" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">&lt;/&gt;</text>
        <circle cx="48" cy="48" r="9" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
        <path d="M44 48 L47 51 L52 45" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="105" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#0f172a">{title}</text>
    <g transform="translate(105, 52)">
        <rect x="0" y="0" width="150" height="20" rx="4" fill="#f1f5f9"/>
        <text x="6" y="14" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500" fill="#475569">🏢 {sub}</text>
    </g>
    <g transform="translate(105, 80)">
        <rect x="0" y="0" width="165" height="22" rx="11" fill="#ecfdf5" stroke="#10b981" stroke-width="1"/>
        <circle cx="10" cy="11" r="4.5" fill="#10b981"/>
        <path d="M8 11 L10 13 L12.5 9" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="19" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#047857">Verified on ZK-GitProof</text>
    </g>
</svg>"""
    return Response(content=svg_content, media_type="image/svg+xml")

# SPA Fallback Routes: serve index.html for main pages
@app.get("/")
@app.get("/dashboard")
@app.get("/verify")
@app.get("/badge/{badge_id}")
@app.get("/settings")
def serve_spa(request: Request, badge_id: str = None):
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"status": "Frontend building"})

# Mount static files for JS and CSS
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend_root")
