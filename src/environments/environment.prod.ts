/**
 * Environment file that changes based on the build type
 */
export const environment = {
  production: true,
  BaseUrl: 'http://test.gamecooks.com:5000/',
  gcSrv: 'GameCooksService/',
  subUrls: {
    auth: 'GameCooksAuth/',
    pmu: 'AfrijeuxPMU/',
    master: 'Master/',
  }
};
