/**
 * SalesFlow Mobile - Non Plus Ultra Lead Generation Types
 * 
 * TypeScript Typdefinitionen für das Lead-Generierungssystem:
 * - Verification (V-Score)
 * - Enrichment (E-Score)
 * - Intent (I-Score)
 * - Lead Acquisition
 * - Auto-Assignment
 * - Auto-Outreach
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum SourceType {
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  WEB_FORM = 'web_form',
  WEB_SCRAPE = 'web_scrape',
  MANUAL = 'manual',
  IMPORT = 'import',
  REFERRAL = 'referral',
  CHAT = 'chat',
  WHATSAPP = 'whatsapp',
}

export enum IntentStage {
  AWARENESS = 'awareness',
  CONSIDERATION = 'consideration',
  DECISION = 'decision',
  PURCHASE = 'purchase',
}

export enum BuyingRole {
  CHAMPION = 'champion',
  DECISION_MAKER = 'decision_maker',
  INFLUENCER = 'influencer',
  USER = 'user',
  BLOCKER = 'blocker',
  UNKNOWN = 'unknown',
}

export enum OutreachChannel {
  EMAIL = 'email',
  LINKEDIN_DM = 'linkedin_dm',
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
}

export enum OutreachStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  OPENED = 'opened',
  CLICKED = 'clicked',
  REPLIED = 'replied',
  BOUNCED = 'bounced',
}

export enum AssignmentMethod {
  AUTO = 'auto',
  MANUAL = 'manual',
  ROUND_ROBIN = 'round_robin',
  SCORE_BASED = 'score_based',
}

export enum LeadTemperature {
  HOT_VERIFIED = 'hot_verified',
  HOT = 'hot',
  WARM = 'warm',
  COOL = 'cool',
  COLD = 'cold',
}

// ============================================================================
// VERIFICATION TYPES (V-Score)
// ============================================================================

export interface EmailValidation {
  valid: boolean;
  syntax_ok: boolean;
  domain_exists: boolean;
  mx_records: boolean;
  smtp_check: boolean;
  catch_all: boolean;
  disposable: boolean;
  role_based: boolean;
  score: number;
}

export interface PhoneValidation {
  valid: boolean;
  phone_type: 'mobile' | 'landline' | 'voip' | 'unknown';
  carrier?: string;
  country_code?: string;
  formatted?: string;
  score: number;
}

export interface DomainValidation {
  exists: boolean;
  age_days?: number;
  ssl_valid: boolean;
  on_spam_list: boolean;
  score: number;
}

export interface SocialValidation {
  profiles_found: number;
  linkedin_verified: boolean;
  linkedin_connections: number;
  linkedin_activity_score: number;
  facebook_verified: boolean;
  instagram_verified: boolean;
  profile_image_authentic: boolean;
  score: number;
}

export interface VerificationResult {
  lead_id: string;
  v_score: number;
  email_valid?: boolean;
  phone_valid?: boolean;
  is_duplicate: boolean;
  details: {
    email_score: number;
    phone_score: number;
    domain_score: number;
    social_score: number;
    behavioral_score: number;
  };
}

// ============================================================================
// ENRICHMENT TYPES (E-Score)
// ============================================================================

export interface CompanyData {
  name?: string;
  domain?: string;
  industry?: string;
  sub_industry?: string;
  size_range?: string;
  employee_count?: number;
  founded_year?: number;
  revenue_range?: string;
  revenue_estimate?: number;
  company_type?: string;
  description?: string;
  logo_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  country?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  timezone?: string;
}

export interface PersonData {
  title?: string;
  seniority?: string;
  department?: string;
  linkedin_url?: string;
  photo_url?: string;
  bio?: string;
}

export interface TechStackItem {
  name: string;
  category: string;
  confidence: number;
}

export interface ICPMatchResult {
  match_score: number;
  reasons: Array<{
    factor: string;
    match: boolean;
    value: string;
    score_impact: number;
  }>;
}

export interface EnrichmentResult {
  lead_id: string;
  e_score: number;
  company: CompanyData;
  person: PersonData;
  icp_match_score: number;
  tech_stack: TechStackItem[];
}

// ============================================================================
// INTENT TYPES (I-Score)
// ============================================================================

export interface WebActivityData {
  visits_30d: number;
  visits_7d: number;
  total_page_views: number;
  unique_pages: number;
  avg_time_on_site_seconds: number;
  bounce_rate: number;
  high_intent_pages: Array<{
    page: string;
    visits: number;
    time_spent: number;
    category: string;
  }>;
  pricing_page_visits: number;
  demo_page_visits: number;
  case_study_views: number;
}

export interface DirectSignals {
  requested_demo: boolean;
  requested_quote: boolean;
  asked_about_pricing: boolean;
  mentioned_competitor: boolean;
  competitor_mentioned?: string;
  mentioned_budget: boolean;
  mentioned_timeline: boolean;
  intent_keywords_found: Array<{
    keyword: string;
    category: string;
    count: number;
  }>;
}

export interface RFMScores {
  recency_score: number;
  frequency_score: number;
  depth_score: number;
}

export interface IntentResult {
  lead_id: string;
  i_score: number;
  intent_stage: IntentStage;
  buying_role: BuyingRole;
  direct_signals: DirectSignals;
  activity: {
    website_visits_7d: number;
    pricing_page_visits: number;
    demo_page_visits: number;
    last_activity_at?: string;
    activity_frequency: string;
  };
}

export interface MessageIntentResult {
  keywords_found: Array<{
    keyword: string;
    category: string;
  }>;
  intent_category: string;
  intent_strength: number;
  suggested_response_type: string;
}

// ============================================================================
// LEAD ACQUISITION TYPES
// ============================================================================

export interface CreateLeadRequest {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  company_domain?: string;
  title?: string;
  linkedin_url?: string;
  notes?: string;
  tags?: string[];
  source_type?: SourceType;
  source_campaign?: string;
}

export interface CreateLeadResponse {
  success: boolean;
  lead_id?: string;
  is_duplicate: boolean;
  duplicate_lead_id?: string;
  errors: string[];
}

export interface WebFormSubmission {
  form_data: Record<string, any>;
  form_id?: string;
  page_url?: string;
  referrer?: string;
}

export interface ImportResult {
  total_rows: number;
  imported: number;
  duplicates: number;
  errors: number;
  error_details: Array<{
    row: number;
    error: string;
  }>;
}

// ============================================================================
// ASSIGNMENT TYPES
// ============================================================================

export interface AssignLeadRequest {
  lead_id: string;
  force_user_id?: string;
  method?: AssignmentMethod;
}

export interface AssignmentResult {
  success: boolean;
  lead_id: string;
  assigned_to?: string;
  assignment_id?: string;
  method: AssignmentMethod;
  score: number;
  sla_hours: number;
  reasons: string[];
  error?: string;
}

export interface SLABreach {
  id: string;
  lead_id: string;
  assigned_to: string;
  created_at: string;
  sla_first_contact_hours: number;
  sla_breached: boolean;
  hours_overdue: number;
  lead?: {
    name: string;
    email?: string;
    p_score?: number;
  };
}

// ============================================================================
// OUTREACH TYPES
// ============================================================================

export interface CreateOutreachRequest {
  lead_id: string;
  channel: OutreachChannel;
  template_id?: string;
  send_immediately?: boolean;
  custom_message?: string;
}

export interface OutreachResult {
  success: boolean;
  outreach_id?: string;
  scheduled_at?: string;
  error?: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  description?: string;
  channel: OutreachChannel;
  subject_template?: string;
  body_template: string;
  target_intent_stage?: IntentStage;
  target_p_score_min?: number;
  target_p_score_max?: number;
  times_used: number;
  avg_open_rate?: number;
  avg_reply_rate?: number;
  avg_conversion_rate?: number;
  is_active: boolean;
}

export interface QueuedOutreach {
  id: string;
  lead_id: string;
  template_id?: string;
  channel: OutreachChannel;
  subject?: string;
  body: string;
  scheduled_at: string;
  status: OutreachStatus;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
}

// ============================================================================
// TRACKING TYPES
// ============================================================================

export interface WebTrackingEvent {
  lead_id?: string;
  visitor_id: string;
  event_type: 'page_view' | 'click' | 'form_start' | 'form_submit' | 'download' | 'video_play';
  event_url: string;
  session_id?: string;
  time_on_page?: number;
  scroll_depth?: number;
  page_title?: string;
}

export interface SocialEngagementEvent {
  lead_id?: string;
  platform: 'linkedin' | 'facebook' | 'instagram' | 'twitter';
  engagement_type: 'comment' | 'like' | 'share' | 'dm' | 'mention' | 'follow';
  user_id?: string;
  username?: string;
  post_id?: string;
  post_url?: string;
  comment_text?: string;
}

// ============================================================================
// COMBINED SCORE TYPES
// ============================================================================

export interface CombinedScores {
  lead_id: string;
  p_score: number;
  v_score: number;
  e_score: number;
  i_score: number;
  lead_temperature: LeadTemperature;
  priority: 1 | 2 | 3 | 4 | 5;
  intent_stage: IntentStage;
}

export interface LeadWithScores {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  platform: string;
  tags: string[];
  
  // Scores
  p_score: number;
  v_score?: number;
  e_score?: number;
  i_score?: number;
  
  // Verification
  email_valid?: boolean;
  phone_valid?: boolean;
  is_duplicate?: boolean;
  
  // Enrichment
  company_industry?: string;
  company_size_range?: string;
  person_title?: string;
  person_seniority?: string;
  icp_match_score?: number;
  
  // Intent
  intent_stage?: IntentStage;
  buying_role?: BuyingRole;
  website_visits_7d?: number;
  pricing_page_visits?: number;
  last_activity_at?: string;
  
  // Assignment
  assigned_to?: string;
  assignment_status?: string;
  
  // Derived
  lead_temperature: LeadTemperature;
  priority: number;
  
  // Timestamps
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface AcquisitionStats {
  period_days: number;
  total_leads: number;
  by_source: Record<string, number>;
  by_campaign: Record<string, number>;
  top_sources: Array<[string, number]>;
  top_campaigns: Array<[string, number]>;
}

export interface PipelineStats {
  total: number;
  hot: number;
  warm: number;
  cool: number;
  cold: number;
  by_status: Record<string, number>;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BatchOperationResult {
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

