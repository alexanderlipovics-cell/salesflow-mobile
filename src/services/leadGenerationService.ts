/**
 * SalesFlow Mobile - Non Plus Ultra Lead Generation Service
 * 
 * API Service für das Lead-Generierungssystem:
 * - Verification (V-Score)
 * - Enrichment (E-Score)
 * - Intent (I-Score)
 * - Lead Acquisition
 * - Auto-Assignment
 * - Auto-Outreach
 */

import { supabase } from './supabase';
import {
  VerificationResult,
  EnrichmentResult,
  IntentResult,
  MessageIntentResult,
  CreateLeadRequest,
  CreateLeadResponse,
  WebFormSubmission,
  ImportResult,
  AssignLeadRequest,
  AssignmentResult,
  SLABreach,
  CreateOutreachRequest,
  OutreachResult,
  OutreachTemplate,
  QueuedOutreach,
  WebTrackingEvent,
  SocialEngagementEvent,
  CombinedScores,
  LeadWithScores,
  AcquisitionStats,
  PipelineStats,
  ApiResponse,
  BatchOperationResult,
  OutreachChannel,
  AssignmentMethod,
} from '../types/leadGeneration';

// API Base URL - anpassen für Production
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.salesflow.ai';
const API_PREFIX = '/api/lead-generation';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
  };
}

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE}${API_PREFIX}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.message || 'API Error',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API Call Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network Error',
    };
  }
}

// ============================================================================
// VERIFICATION SERVICE (V-Score)
// ============================================================================

export const verificationService = {
  /**
   * Verifiziert einen Lead (E-Mail, Telefon, Domain, Social)
   */
  async verifyLead(
    leadId: string,
    options?: {
      email?: string;
      phone?: string;
      companyDomain?: string;
      linkedinUrl?: string;
    }
  ): Promise<ApiResponse<VerificationResult>> {
    return apiCall<VerificationResult>('/verify', 'POST', {
      lead_id: leadId,
      email: options?.email,
      phone: options?.phone,
      company_domain: options?.companyDomain,
      linkedin_url: options?.linkedinUrl,
    });
  },

  /**
   * Startet Batch-Verifizierung für mehrere Leads
   */
  async verifyBatch(leadIds: string[]): Promise<ApiResponse<{ message: string }>> {
    return apiCall('/verify/batch', 'POST', leadIds);
  },
};

// ============================================================================
// ENRICHMENT SERVICE (E-Score)
// ============================================================================

export const enrichmentService = {
  /**
   * Reichert Lead-Daten an
   */
  async enrichLead(
    leadId: string,
    options?: {
      email?: string;
      companyName?: string;
      companyDomain?: string;
      personName?: string;
      linkedinUrl?: string;
    }
  ): Promise<ApiResponse<EnrichmentResult>> {
    return apiCall<EnrichmentResult>('/enrich', 'POST', {
      lead_id: leadId,
      email: options?.email,
      company_name: options?.companyName,
      company_domain: options?.companyDomain,
      person_name: options?.personName,
      linkedin_url: options?.linkedinUrl,
    });
  },
};

// ============================================================================
// INTENT SERVICE (I-Score)
// ============================================================================

export const intentService = {
  /**
   * Analysiert Kaufabsicht eines Leads
   */
  async analyzeIntent(
    leadId: string,
    messages?: Array<{ content: string; direction: string }>
  ): Promise<ApiResponse<IntentResult>> {
    return apiCall<IntentResult>('/intent', 'POST', {
      lead_id: leadId,
      messages,
    });
  },

  /**
   * Analysiert Intent einer einzelnen Nachricht (Live-Chat)
   */
  async analyzeMessageIntent(message: string): Promise<ApiResponse<MessageIntentResult>> {
    return apiCall<MessageIntentResult>(`/intent/message?message=${encodeURIComponent(message)}`, 'POST');
  },
};

// ============================================================================
// LEAD ACQUISITION SERVICE
// ============================================================================

export const acquisitionService = {
  /**
   * Erfasst einen neuen Lead
   */
  async createLead(data: CreateLeadRequest): Promise<ApiResponse<CreateLeadResponse>> {
    return apiCall<CreateLeadResponse>('/acquire', 'POST', data);
  },

  /**
   * Verarbeitet Web-Formular Submission
   */
  async handleWebForm(submission: WebFormSubmission): Promise<ApiResponse<CreateLeadResponse>> {
    return apiCall<CreateLeadResponse>('/acquire/web-form', 'POST', submission);
  },

  /**
   * Importiert Leads aus CSV (Base64 encoded)
   */
  async importCSV(
    csvContent: string,
    options?: {
      skipDuplicates?: boolean;
      defaultTags?: string[];
    }
  ): Promise<ApiResponse<ImportResult>> {
    const formData = new FormData();
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'import.csv');
    
    const headers = await getAuthHeaders();
    delete headers['Content-Type']; // Let browser set it for FormData
    
    try {
      const response = await fetch(
        `${API_BASE}${API_PREFIX}/import/csv?skip_duplicates=${options?.skipDuplicates ?? true}${options?.defaultTags ? `&default_tags=${options.defaultTags.join(',')}` : ''}`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );
      
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
      };
    }
  },

  /**
   * Holt Akquisitions-Statistiken
   */
  async getStats(days: number = 30): Promise<ApiResponse<AcquisitionStats>> {
    return apiCall<AcquisitionStats>(`/stats/acquisition?days=${days}`);
  },
};

// ============================================================================
// ASSIGNMENT SERVICE
// ============================================================================

export const assignmentService = {
  /**
   * Weist Lead dem optimalen Verkäufer zu
   */
  async assignLead(request: AssignLeadRequest): Promise<ApiResponse<AssignmentResult>> {
    return apiCall<AssignmentResult>('/assign', 'POST', request);
  },

  /**
   * Batch-Zuweisung unzugewiesener Leads
   */
  async assignUnassignedLeads(limit: number = 50): Promise<ApiResponse<BatchOperationResult>> {
    return apiCall<BatchOperationResult>(`/assign/batch?limit=${limit}`, 'POST');
  },

  /**
   * Holt SLA-Verletzungen
   */
  async getSLABreaches(): Promise<ApiResponse<{ count: number; breaches: SLABreach[] }>> {
    return apiCall('/sla/breaches');
  },
};

// ============================================================================
// OUTREACH SERVICE
// ============================================================================

export const outreachService = {
  /**
   * Erstellt personalisierte Outreach-Nachricht
   */
  async createOutreach(request: CreateOutreachRequest): Promise<ApiResponse<OutreachResult>> {
    return apiCall<OutreachResult>('/outreach', 'POST', request);
  },

  /**
   * Verarbeitet Outreach-Queue
   */
  async processQueue(limit: number = 50): Promise<ApiResponse<BatchOperationResult>> {
    return apiCall<BatchOperationResult>(`/outreach/process-queue?limit=${limit}`, 'POST');
  },

  /**
   * Erstellt Batch-Outreach für neue Leads
   */
  async createBatchOutreach(
    daysBack: number = 1,
    limit: number = 100
  ): Promise<ApiResponse<BatchOperationResult>> {
    return apiCall<BatchOperationResult>(
      `/outreach/batch?days_back=${daysBack}&limit=${limit}`,
      'POST'
    );
  },

  /**
   * Holt Outreach-Templates
   */
  async getTemplates(channel?: OutreachChannel): Promise<ApiResponse<OutreachTemplate[]>> {
    const { data, error } = await supabase
      .from('outreach_templates')
      .select('*')
      .eq('is_active', true)
      .order('avg_reply_rate', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    let templates = data || [];
    if (channel) {
      templates = templates.filter(t => t.channel === channel);
    }

    return { success: true, data: templates };
  },

  /**
   * Holt geplante Outreach-Nachrichten
   */
  async getQueuedOutreach(leadId?: string): Promise<ApiResponse<QueuedOutreach[]>> {
    let query = supabase
      .from('outreach_queue')
      .select('*')
      .eq('status', 'pending')
      .order('scheduled_at');

    if (leadId) {
      query = query.eq('lead_id', leadId);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  },
};

// ============================================================================
// TRACKING SERVICE
// ============================================================================

export const trackingService = {
  /**
   * Trackt Web-Event
   */
  async trackWebEvent(event: WebTrackingEvent): Promise<ApiResponse<{ success: boolean }>> {
    return apiCall('/track/web', 'POST', event);
  },

  /**
   * Trackt Social-Event
   */
  async trackSocialEvent(event: SocialEngagementEvent): Promise<ApiResponse<{ success: boolean }>> {
    return apiCall('/track/social', 'POST', event);
  },
};

// ============================================================================
// COMBINED OPERATIONS
// ============================================================================

export const leadGenerationService = {
  /**
   * Führt vollständige Lead-Verarbeitung durch
   */
  async processLeadFull(
    leadId: string,
    options?: {
      verify?: boolean;
      enrich?: boolean;
      analyzeIntent?: boolean;
      assign?: boolean;
      createOutreach?: boolean;
    }
  ): Promise<ApiResponse<{
    lead_id: string;
    verification?: { v_score: number };
    enrichment?: { e_score: number };
    intent?: { i_score: number; stage: string };
    assignment?: { assigned_to?: string; score: number };
    outreach?: { outreach_id?: string; scheduled_at?: string };
    p_score?: number;
  }>> {
    const params = new URLSearchParams();
    if (options?.verify !== undefined) params.append('verify', String(options.verify));
    if (options?.enrich !== undefined) params.append('enrich', String(options.enrich));
    if (options?.analyzeIntent !== undefined) params.append('analyze_intent', String(options.analyzeIntent));
    if (options?.assign !== undefined) params.append('assign', String(options.assign));
    if (options?.createOutreach !== undefined) params.append('create_outreach', String(options.createOutreach));

    return apiCall(`/process-lead/${leadId}?${params.toString()}`, 'POST');
  },

  /**
   * Holt alle Scores für einen Lead
   */
  async getLeadScores(leadId: string): Promise<ApiResponse<CombinedScores>> {
    return apiCall<CombinedScores>(`/score/${leadId}`);
  },

  /**
   * Holt Lead mit allen Scores und Enrichment-Daten
   */
  async getLeadWithScores(leadId: string): Promise<ApiResponse<LeadWithScores>> {
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError) {
      return { success: false, error: leadError.message };
    }

    // Verification
    const { data: verification } = await supabase
      .from('lead_verifications')
      .select('v_score, email_valid, phone_valid, is_duplicate')
      .eq('lead_id', leadId)
      .single();

    // Enrichment
    const { data: enrichment } = await supabase
      .from('lead_enrichments')
      .select('e_score, company_industry, company_size_range, person_title, person_seniority, icp_match_score')
      .eq('lead_id', leadId)
      .single();

    // Intent
    const { data: intent } = await supabase
      .from('lead_intents')
      .select('i_score, intent_stage, buying_committee_role, website_visits_7d, pricing_page_visits, last_activity_at')
      .eq('lead_id', leadId)
      .single();

    // Assignment
    const { data: assignment } = await supabase
      .from('lead_assignments')
      .select('assigned_to, status')
      .eq('lead_id', leadId)
      .eq('status', 'accepted')
      .single();

    // Combine
    const pScore = lead.p_score || 0;
    let temperature: LeadWithScores['lead_temperature'] = 'cold';
    if (pScore >= 80 && (verification?.v_score || 0) >= 70) {
      temperature = 'hot_verified';
    } else if (pScore >= 80) {
      temperature = 'hot';
    } else if (pScore >= 60) {
      temperature = 'warm';
    } else if (pScore >= 40) {
      temperature = 'cool';
    }

    const result: LeadWithScores = {
      ...lead,
      v_score: verification?.v_score,
      e_score: enrichment?.e_score,
      i_score: intent?.i_score,
      email_valid: verification?.email_valid,
      phone_valid: verification?.phone_valid,
      is_duplicate: verification?.is_duplicate,
      company_industry: enrichment?.company_industry,
      company_size_range: enrichment?.company_size_range,
      person_title: enrichment?.person_title,
      person_seniority: enrichment?.person_seniority,
      icp_match_score: enrichment?.icp_match_score,
      intent_stage: intent?.intent_stage,
      buying_role: intent?.buying_committee_role,
      website_visits_7d: intent?.website_visits_7d,
      pricing_page_visits: intent?.pricing_page_visits,
      last_activity_at: intent?.last_activity_at,
      assigned_to: assignment?.assigned_to,
      assignment_status: assignment?.status,
      lead_temperature: temperature,
      priority: pScore >= 80 ? 5 : pScore >= 60 ? 4 : pScore >= 40 ? 3 : pScore >= 20 ? 2 : 1,
    };

    return { success: true, data: result };
  },

  /**
   * Holt Hot Leads mit vollständigen Daten
   */
  async getHotLeads(limit: number = 20): Promise<ApiResponse<LeadWithScores[]>> {
    const { data, error } = await supabase
      .from('v_leads_with_scores')
      .select('*')
      .gte('p_score', 75)
      .order('p_score', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  },

  /**
   * Holt Pipeline-Statistiken
   */
  async getPipelineStats(): Promise<ApiResponse<PipelineStats>> {
    return apiCall<PipelineStats>('/stats/pipeline');
  },
};

// ============================================================================
// EXPORT DEFAULT SERVICE
// ============================================================================

export default {
  verification: verificationService,
  enrichment: enrichmentService,
  intent: intentService,
  acquisition: acquisitionService,
  assignment: assignmentService,
  outreach: outreachService,
  tracking: trackingService,
  ...leadGenerationService,
};

