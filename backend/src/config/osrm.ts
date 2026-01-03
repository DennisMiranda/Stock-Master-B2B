interface OSRMConfig {
  baseUrl: string;
  profile: 'car' | 'bike' | 'foot';
}

export const osrmConfig: OSRMConfig = {
  baseUrl: process.env.OSRM_URL || 'http://router.project-osrm.org',
  profile: 'car',
};

export const getOSRMUrl = (service: 'route' | 'trip' | 'match'): string => {
  return `${osrmConfig.baseUrl}/${service}/v1/${osrmConfig.profile}`;
};