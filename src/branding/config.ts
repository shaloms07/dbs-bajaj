import bajajLogo from '../assets/bajaj-logo.svg';
import dbsLogo from '../assets/dbs-logo.png';
import { AuthUser } from '../store/authStore';

export type BrandId = 'dbs' | 'bajaj';

export interface BrandingConfig {
  id: BrandId;
  shortName: string;
  companyName: string;
  appName: string;
  dashboardName: string;
  apiName: string;
  scoreLabel: string;
  underwritingConsoleLabel: string;
  vehicleLookupReportTitle: string;
  filePrefix: string;
  logoSrc: string;
  logoAlt: string;
  loginHeadline: string;
  loginAccessCopy: string;
}

const BRAND_BY_IDENTIFIER: Record<string, BrandId> = {
  'insurer@example.com': 'dbs',
  'bgil.admin': 'bajaj'
};

export const DEFAULT_BRAND_ID: BrandId = 'dbs';

export const BRANDING_CONFIGS: Record<BrandId, BrandingConfig> = {
  dbs: {
    id: 'dbs',
    shortName: 'DBS',
    companyName: 'DBS',
    appName: 'DBS Insurer Dashboard',
    dashboardName: 'DBS Dashboard',
    apiName: 'DBS API',
    scoreLabel: 'DBS Score',
    underwritingConsoleLabel: 'DBS underwriting console',
    vehicleLookupReportTitle: 'DBS Vehicle Lookup Report',
    filePrefix: 'dbs',
    logoSrc: dbsLogo,
    logoAlt: 'DBS logo',
    loginHeadline: 'Assess vehicle risk with the DBS workflow.',
    loginAccessCopy: 'Enter your credentials to access the DBS Insurer Dashboard.'
  },
  bajaj: {
    id: 'bajaj',
    shortName: 'Bajaj',
    companyName: 'Bajaj General Insurance',
    appName: 'Bajaj Insurer Dashboard',
    dashboardName: 'Bajaj Dashboard',
    apiName: 'Bajaj API',
    scoreLabel: 'Bajaj Score',
    underwritingConsoleLabel: 'Bajaj General Insurance underwriting console',
    vehicleLookupReportTitle: 'Bajaj Vehicle Lookup Report',
    filePrefix: 'bajaj',
    logoSrc: bajajLogo,
    logoAlt: 'Bajaj General Insurance logo',
    loginHeadline: 'Assess vehicle risk with the DBS workflow.',
    loginAccessCopy: 'Enter your credentials to access the Bajaj Insurer Dashboard.'
  }
};

function normalizeIdentifier(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

export function getBrandingConfig(brandId: BrandId = DEFAULT_BRAND_ID) {
  return BRANDING_CONFIGS[brandId];
}

export function resolveBrandIdForUser(user?: AuthUser | null): BrandId {
  const identifiers = [user?.username, user?.email, user?.name].map(normalizeIdentifier);

  for (const identifier of identifiers) {
    if (identifier && BRAND_BY_IDENTIFIER[identifier]) {
      return BRAND_BY_IDENTIFIER[identifier];
    }
  }

  return DEFAULT_BRAND_ID;
}

export function resolveBrandingForUser(user?: AuthUser | null) {
  return getBrandingConfig(resolveBrandIdForUser(user));
}
