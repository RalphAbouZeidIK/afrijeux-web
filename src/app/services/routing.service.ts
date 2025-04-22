// user-route.config.ts

export const UserRouteConfig = {
  deposit: {
    path: 'deposit',
    title: 'routerLinks.UserTitles.deposit',
    showLink: true,
  },
  withdraw: {
    path: 'withdraw',
    title: 'routerLinks.UserTitles.withdraw',
    showLink: true,
  },
  myBets: {
    path: 'my-bets',
    title: 'routerLinks.UserTitles.myBets',
    showLink: true,
  },
  logout: {
    path: 'logout',
    title: 'routerLinks.UserTitles.logout',
    showLink: false,
  },
};
