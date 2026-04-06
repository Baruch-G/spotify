import { environmentSecrets } from './environment.secret';

export const environment = {
  production: false,
  spotifyClientId: '59eaaca39450479c9d97fd2da47ac4c5',
  spotifyClientSecret: environmentSecrets.spotifyClientSecret
};
