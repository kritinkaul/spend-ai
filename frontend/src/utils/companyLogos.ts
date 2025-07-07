// Company domain mapping for logo fetching
export const companyLogos: Record<string, string> = {
  // Tech Giants
  'AAPL': 'apple.com',
  'GOOGL': 'google.com',
  'GOOG': 'google.com',
  'MSFT': 'microsoft.com',
  'AMZN': 'amazon.com',
  'META': 'meta.com',
  'TSLA': 'tesla.com',
  'NVDA': 'nvidia.com',
  'NFLX': 'netflix.com',
  'ADBE': 'adobe.com',
  'CRM': 'salesforce.com',
  'ORCL': 'oracle.com',
  'IBM': 'ibm.com',
  'INTC': 'intel.com',
  'AMD': 'amd.com',
  'PYPL': 'paypal.com',
  'UBER': 'uber.com',
  'LYFT': 'lyft.com',
  'SNAP': 'snap.com',
  'TWTR': 'twitter.com',
  'X': 'x.com',
  'SPOT': 'spotify.com',
  'SHOP': 'shopify.com',
  'SQ': 'squareup.com',
  'ZOOM': 'zoom.us',
  'DOCU': 'docusign.com',
  'CRWD': 'crowdstrike.com',
  'OKTA': 'okta.com',
  'SNOW': 'snowflake.com',
  'PLTR': 'palantir.com',
  'RBLX': 'roblox.com',
  
  // Finance
  'JPM': 'jpmorganchase.com',
  'BAC': 'bankofamerica.com',
  'WFC': 'wellsfargo.com',
  'GS': 'goldmansachs.com',
  'MS': 'morganstanley.com',
  'C': 'citigroup.com',
  'V': 'visa.com',
  'MA': 'mastercard.com',
  'AXP': 'americanexpress.com',
  'BRK.A': 'berkshirehathaway.com',
  'BRK.B': 'berkshirehathaway.com',
  'BHLB': 'berkshirehathaway.com',
  'BRK': 'berkshirehathaway.com',
  'USB': 'usbank.com',
  'TFC': 'truist.com',
  'PNC': 'pnc.com',
  'COF': 'capitalone.com',
  'SCHW': 'schwab.com',
  'BLK': 'blackrock.com',
  'SPGI': 'spglobal.com',
  'MCO': 'moodys.com',
  'CME': 'cmegroup.com',
  'ICE': 'theice.com',
  'CB': 'chubb.com',
  'PGR': 'progressive.com',
  'TRV': 'travelers.com',
  'ALL': 'allstate.com',
  'MET': 'metlife.com',
  'PRU': 'prudential.com',
  'AFL': 'aflac.com',
  
  // Healthcare & Pharma
  'JNJ': 'jnj.com',
  'PFE': 'pfizer.com',
  'UNH': 'unitedhealthgroup.com',
  'ABBV': 'abbvie.com',
  'TMO': 'thermofisher.com',
  'ABT': 'abbott.com',
  'LLY': 'lilly.com',
  'BMY': 'bms.com',
  'AMGN': 'amgen.com',
  'GILD': 'gilead.com',
  'CVS': 'cvshealth.com',
  'MRNA': 'modernatx.com',
  'MDT': 'medtronic.com',
  'DHR': 'danaher.com',
  'ISRG': 'intuitive.com',
  'BSX': 'bostonscientific.com',
  'EW': 'edwards.com',
  'SYK': 'stryker.com',
  'BDX': 'bd.com',
  'ZTS': 'zoetis.com',
  'REGN': 'regeneron.com',
  'VRTX': 'vrtx.com',
  'BIIB': 'biogen.com',
  
  // Consumer & Retail
  'WMT': 'walmart.com',
  'HD': 'homedepot.com',
  'PG': 'pg.com',
  'KO': 'coca-cola.com',
  'PEP': 'pepsico.com',
  'COST': 'costco.com',
  'TGT': 'target.com',
  'LOW': 'lowes.com',
  'SBUX': 'starbucks.com',
  'MCD': 'mcdonalds.com',
  'NKE': 'nike.com',
  'DIS': 'disney.com',
  'EBAY': 'ebay.com',
  'ETSY': 'etsy.com',
  'WBA': 'walgreens.com',
  'KR': 'kroger.com',
  'CL': 'colgatepalmolive.com',
  'KMB': 'kimberly-clark.com',
  'GIS': 'generalmills.com',
  'K': 'kelloggs.com',
  'HSY': 'hersheys.com',
  'MDLZ': 'mondelezinternational.com',
  'CPB': 'campbellsoup.com',
  'CAG': 'conagrabrands.com',
  'TSN': 'tysonfoods.com',
  'HRL': 'hormel.com',
  
  // Energy & Utilities
  'XOM': 'exxonmobil.com',
  'CVX': 'chevron.com',
  'COP': 'conocophillips.com',
  'SLB': 'slb.com',
  'EOG': 'eogresources.com',
  'KMI': 'kindermorgan.com',
  'OXY': 'oxy.com',
  'MPC': 'marathonpetroleum.com',
  'PSX': 'phillips66.com',
  'VLO': 'valero.com',
  'BKR': 'bakerhughes.com',
  'HAL': 'halliburton.com',
  'DVN': 'dvn.com',
  'FANG': 'diamondbackenergy.com',
  'MRO': 'marathonoil.com',
  'APA': 'apacorp.com',
  'NEE': 'nexteraenergy.com',
  'DUK': 'duke-energy.com',
  'SO': 'southerncompany.com',
  'D': 'dominionenergy.com',
  'EXC': 'exeloncorp.com',
  'XEL': 'xcelenergy.com',
  'SRE': 'sempra.com',
  'AEP': 'aep.com',
  'PCG': 'pgecorp.com',
  'ED': 'coned.com',
  'EIX': 'edison.com',
  'PPL': 'pplweb.com',
  'AWK': 'amwater.com',
  
  // Industrial & Materials
  'BA': 'boeing.com',
  'CAT': 'caterpillar.com',
  'GE': 'ge.com',
  'MMM': '3m.com',
  'HON': 'honeywell.com',
  'LMT': 'lockheedmartin.com',
  'RTX': 'rtx.com',
  'UPS': 'ups.com',
  'FDX': 'fedex.com',
  'DE': 'deere.com',
  'NUE': 'nucor.com',
  'USS': 'ussteel.com',
  'CLF': 'clevelandcliffs.com',
  'STLD': 'steeldynamics.com',
  'RS': 'reliance.com',
  'CMI': 'cummins.com',
  'EMR': 'emerson.com',
  'ITW': 'itw.com',
  'PH': 'parker.com',
  'ROK': 'rockwellautomation.com',
  'ETN': 'eaton.com',
  'JCI': 'johnsoncontrols.com',
  'IR': 'irco.com',
  'DOV': 'dovercorporation.com',
  'FTV': 'fortive.com',
  'IEX': 'idexcorp.com',
  'XYL': 'xylem.com',
  'VMC': 'vulcanmaterials.com',
  'MLM': 'martinmarietta.com',
  'NEM': 'newmont.com',
  'FCX': 'fcx.com',
  'AA': 'alcoa.com',
  'CE': 'celanese.com',
  'DD': 'dupont.com',
  'DOW': 'dow.com',
  'LYB': 'lyondellbasell.com',
  'PPG': 'ppg.com',
  'SHW': 'sherwin-williams.com',
  'APD': 'airproducts.com',
  'LIN': 'linde.com',
  'ECL': 'ecolab.com',
  'IFF': 'iff.com',
  
  // Real Estate
  'AMT': 'americantower.com',
  'PLD': 'prologis.com',
  'CCI': 'crowncastle.com',
  'EQIX': 'equinix.com',
  'WELL': 'welltower.com',
  'DLR': 'digitalrealty.com',
  'PSA': 'publicstorage.com',
  'EXR': 'extendedstay.com',
  'AVB': 'avalonbay.com',
  'EQR': 'equityapartments.com',
  'MAA': 'maac.com',
  'UDR': 'udr.com',
  'ESS': 'essex.com',
  'VTR': 'ventas.com',
  'HCP': 'healthpeak.com',
  'ARE': 'alexanderrealestate.com',
  'BXP': 'bxp.com',
  'VNO': 'vno.com',
  'KIM': 'kimcorealty.com',
  'REG': 'regencycenters.com',
  'FRT': 'federalrealty.com',
  'SPG': 'simon.com',
  'MAC': 'macerich.com',
  'PEI': 'preit.com',
  
  // Telecom
  'VZ': 'verizon.com',
  'T': 'att.com',
  'TMUS': 't-mobile.com',
  'CMCSA': 'comcast.com',
  'CHTR': 'charter.com',
  'S': 'sprint.com',
  'DISH': 'dish.com',
  'SIRI': 'siriusxm.com',
  'LUMN': 'lumen.com',
  'FTR': 'frontier.com',
  'VIA': 'viacom.com',
  'FOXA': 'fox.com',
  'FOX': 'fox.com',
  'NWSA': 'newscorp.com',
  'NWS': 'newscorp.com',
  'WBD': 'wbd.com',
  'PARA': 'paramount.com',
  'LYV': 'livenation.com',
  
  // Transportation & Logistics
  'UNP': 'up.com',
  'CSX': 'csx.com',
  'NSC': 'nscorp.com',
  'BNI': 'bnsf.com',
  'KSU': 'kcsouthern.com',
  'DAL': 'delta.com',
  'UAL': 'united.com',
  'AAL': 'aa.com',
  'LUV': 'southwest.com',
  'ALK': 'alaskaair.com',
  'JBLU': 'jetblue.com',
  'SAVE': 'spirit.com',
  'HA': 'hawaiianairlines.com',
  'SKYW': 'skywest.com',
  'MESA': 'mesa-air.com',
  'CHRW': 'chrobinson.com',
  'XPO': 'xpo.com',
  'ODFL': 'odfl.com',
  'SAIA': 'saia.com',
  'ARCB': 'arcb.com',
  'LSTR': 'landstar.com',
  'WERN': 'werner.com',
  'SNDR': 'schneider.com',
  'KNX': 'knightswift.com',
  'HTLD': 'heartland.com',
  'MATX': 'matson.com',
  'KEX': 'kirbyinland.com',
  'GNK': 'genco.com',
  'SBLK': 'starbulk.com',
  'SHIP': 'seanergy.com',
  'EURN': 'euronav.com',
  'TNK': 'teekay.com',
  'TNP': 'teekaytankers.com',
  'INSW': 'internationalsw.com',
  'TOPS': 'topsships.com',
  'CPLP': 'capitallimited.com',
  'GLOP': 'gaslogpartners.com',
  'GMLP': 'golar.com',
  'NAT': 'nordicamerican.com',
  'FRO': 'frontline.com',
  'DHT': 'dhtankers.com',
  'STNG': 'scorpiotankers.com',
  'TK': 'teekay.com',
  'ASC': 'ardmoresw.com',
  'HMLP': 'hamiltonpartners.com',
  'KNOP': 'kinder.com',
};

// Generate potential domain names from company name
const generatePotentialDomains = (companyName: string): string[] => {
  if (!companyName) return [];
  
  const cleanName = companyName
    .toLowerCase()
    .replace(/\s+(inc\.?|corp\.?|corporation|company|co\.?|ltd\.?|llc|group|holdings?)$/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
  
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) return [];
  
  const potentialDomains: string[] = [];
  
  // Single word or concatenated words
  if (words.length === 1) {
    potentialDomains.push(`${words[0]}.com`);
  } else {
    // Concatenated words
    potentialDomains.push(`${words.join('')}.com`);
    
    // First word only
    potentialDomains.push(`${words[0]}.com`);
    
    // First two words if more than 2
    if (words.length > 2) {
      potentialDomains.push(`${words[0]}${words[1]}.com`);
    }
    
    // With hyphens
    potentialDomains.push(`${words.join('-')}.com`);
  }
  
  return potentialDomains;
};

// Company logo mapping for popular stocks
const logoMap: Record<string, string> = {
  'AAPL': 'https://logo.clearbit.com/apple.com',
  'MSFT': 'https://logo.clearbit.com/microsoft.com',
  'GOOGL': 'https://logo.clearbit.com/google.com',
  'GOOG': 'https://logo.clearbit.com/google.com',
  'AMZN': 'https://logo.clearbit.com/amazon.com',
  'TSLA': 'https://logo.clearbit.com/tesla.com',
  'META': 'https://logo.clearbit.com/meta.com',
  'NVDA': 'https://logo.clearbit.com/nvidia.com',
  'NFLX': 'https://logo.clearbit.com/netflix.com',
  'UBER': 'https://logo.clearbit.com/uber.com',
  'LYFT': 'https://logo.clearbit.com/lyft.com',
  'MCD': 'https://logo.clearbit.com/mcdonalds.com',
  'KO': 'https://logo.clearbit.com/coca-cola.com',
  'WMT': 'https://logo.clearbit.com/walmart.com',
  'JPM': 'https://logo.clearbit.com/jpmorganchase.com',
  'V': 'https://logo.clearbit.com/visa.com',
  'MA': 'https://logo.clearbit.com/mastercard.com',
  'DIS': 'https://logo.clearbit.com/disney.com',
  'NKE': 'https://logo.clearbit.com/nike.com',
  'INTC': 'https://logo.clearbit.com/intel.com',
  'AMD': 'https://logo.clearbit.com/amd.com',
  'CRM': 'https://logo.clearbit.com/salesforce.com',
  'ORCL': 'https://logo.clearbit.com/oracle.com',
  'IBM': 'https://logo.clearbit.com/ibm.com',
  'PYPL': 'https://logo.clearbit.com/paypal.com',
  'ADBE': 'https://logo.clearbit.com/adobe.com',
  'SPOT': 'https://logo.clearbit.com/spotify.com',
  'TWTR': 'https://logo.clearbit.com/twitter.com',
  'X': 'https://logo.clearbit.com/x.com',
  'SNAP': 'https://logo.clearbit.com/snap.com',
  'SQ': 'https://logo.clearbit.com/squareup.com',
  'SHOP': 'https://logo.clearbit.com/shopify.com',
  'ZM': 'https://logo.clearbit.com/zoom.us',
  'ROKU': 'https://logo.clearbit.com/roku.com',
  'PINS': 'https://logo.clearbit.com/pinterest.com'
};

/**
 * Get company logo URL for a given stock symbol
 * Falls back to domain-based logo if symbol not in map
 */
export function getCompanyLogoUrl(symbol: string, companyName?: string): string | null {
  // Check if we have a direct mapping
  if (logoMap[symbol.toUpperCase()]) {
    return logoMap[symbol.toUpperCase()];
  }

  // Try to derive from company name
  if (companyName) {
    const cleanName = companyName
      .toLowerCase()
      .replace(/\s+(inc|corp|corporation|ltd|company|co|llc)\.?$/i, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();

    if (cleanName) {
      return `https://logo.clearbit.com/${cleanName}.com`;
    }
  }

  // Fallback - try symbol as domain
  return `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
}

/**
 * Check if a logo URL is likely to work
 */
export function isValidLogoUrl(url: string): boolean {
  return url.includes('clearbit.com') || url.startsWith('https://');
}

export const getCompanyDomain = (symbol: string): string => {
  return companyLogos[symbol.toUpperCase()] || '';
};

// Helper function to get multiple potential logo URLs for fallback
export const getCompanyLogoUrls = (symbol: string, companyName?: string): string[] => {
  const urls: string[] = [];
  const upperSymbol = symbol.toUpperCase();
  
  // Direct mapping first
  const domain = companyLogos[upperSymbol];
  if (domain) {
    urls.push(`https://logo.clearbit.com/${domain}`);
  }
  
  // Company name based domains
  if (companyName) {
    const potentialDomains = generatePotentialDomains(companyName);
    potentialDomains.forEach(domain => {
      urls.push(`https://logo.clearbit.com/${domain}`);
    });
  }
  
  // Symbol-based fallback
  const symbolLower = symbol.toLowerCase();
  urls.push(`https://logo.clearbit.com/${symbolLower}.com`);
  
  // Remove duplicates
  return [...new Set(urls)];
}; 