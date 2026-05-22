/**
 * Environment file that changes based on the build type
 */
const baseUrl: string = 'https://services.winbig.win/';

export const environment = {
  production: true,
  isTesting: baseUrl !== 'https://services.winbig.win/',
  //BaseUrl: 'https://services.winbig.win/',
  FrontURL: 'https://m1.winbig.win/',
  BaseUrl: baseUrl,
  //FrontURL: 'http://test.gamecooks.com:1212/',
  gcSrv: 'GameCooksService/',
  subUrls: {
    auth: 'GameCooksAuth/',
    pmu: 'AfrijeuxPMU/',
    master: 'Master/',
  }
};
