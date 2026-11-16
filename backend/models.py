"""
Pydantic Data Schemas for ZK-GitProof API.
Supports Phase 1 (Core MVP), Phase 2 (Anti-Gaming), Phase 3 (Enterprise), and Phase 4 (ATS JSON-LD).
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class MintBadgeRequest(BaseModel):
    candidate_id: str = Field(default="@alex-dev", description="Candidate handle or pseudonym")
    candidate_role: str = Field(default="Developer", description="Candidate role (e.g. Developer, Rust Core Engineer)")
    skill_title: str = Field(default="Merged 18 Pull Requests in Rust (Private Repository)", description="Human-readable skill statement")
    language: str = Field(default="Rust", description="Programming language or domain")
    pr_count: int = Field(default=18, ge=1, le=1000, description="Minimum PR count to prove")
    private_repo_name: str = Field(default="acme-corp/payment-api", description="Private repository name (never exposed)")
    company_name: str = Field(default="Tier-1 Enterprise / Quant Firm", description="Employer or client company name (redacted)")
    date_range: Optional[str] = Field(default="Jan 2026 - Oct 2026", description="Date range of activity")
    
    # Phase 2: Anti-Gaming Engine fields
    collaborators_count: Optional[int] = Field(default=4, ge=1, description="Repository collaborator count (must be >= 2)")
    lines_changed: Optional[int] = Field(default=1420, ge=1, description="Total PR diff additions/deletions (must be >= 500)")
    
    # Phase 3: Enterprise Mode
    enterprise_mode: Optional[bool] = Field(default=False, description="Whether badge was minted via contributionsCollection")
    manager_co_sign: Optional[Dict[str, Any]] = Field(default=None, description="Optional engineering manager co-signature")

class VerifyBadgeRequest(BaseModel):
    badge_id: Optional[str] = Field(None, description="Badge ID (e.g. zk-rust-15pr-88)")
    proof_payload: Optional[Dict[str, Any]] = Field(None, description="Full or partial proof JSON")

class ManagerCoSignRequest(BaseModel):
    badge_id: str = Field(..., description="Badge ID being co-signed")
    manager_name: str = Field(..., description="Engineering manager name")
    manager_title: str = Field(..., description="Engineering manager title (e.g. VP of Engineering)")
    manager_company: str = Field(..., description="Company name")
    manager_email: str = Field(..., description="Corporate email for verification")
    endorsement_note: Optional[str] = Field(default="I verify that this developer delivered high-impact engineering work in our confidential repository.", description="Endorsement comment")

class GitHubMockScanRequest(BaseModel):
    access_token_mode: str = Field(default="browser_local", description="Session mode: browser_local or mock")
    repo_category: Optional[str] = Field(default="acme_payment", description="Demo repository type")
    enterprise_mode: Optional[bool] = Field(default=False, description="Use contribution graph instead of repo stats")
