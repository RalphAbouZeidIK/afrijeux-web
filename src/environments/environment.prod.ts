/**
 * Environment file that changes based on the build type
 */
export const environment = {
  production: true,
  //BaseUrl: 'https://services.winbig.win/',
  //FrontURL: 'https://m1.winbig.win/',
  BaseUrl: 'http://test.gamecooks.com:5000/',
  FrontURL: 'http://test.gamecooks.com:1212/',
  gcSrv: 'GameCooksService/',
  subUrls: {
    auth: 'GameCooksAuth/',
    pmu: 'AfrijeuxPMU/',
    master: 'Master/',
  }
};
