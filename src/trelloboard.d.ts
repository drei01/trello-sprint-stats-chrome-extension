export interface TrelloBoard {
    id: string;
    name: string;
    desc: string;
    descData: null;
    closed: boolean;
    idOrganization: string;
    idEnterprise: null;
    pinned: boolean;
    url: string;
    shortUrl: string;
    prefs: Prefs;
    labelNames: { [key: string]: string };
}

export interface Prefs {
    permissionLevel: string;
    hideVotes: boolean;
    voting: string;
    comments: string;
    invitations: string;
    selfJoin: boolean;
    cardCovers: boolean;
    isTemplate: boolean;
    cardAging: string;
    calendarFeedEnabled: boolean;
    hiddenPluginBoardButtons: any[];
    switcherViews: SwitcherView[];
    background: string;
    backgroundColor: null;
    backgroundImage: string;
    backgroundImageScaled: BackgroundImageScaled[];
    backgroundTile: boolean;
    backgroundBrightness: string;
    backgroundBottomColor: string;
    backgroundTopColor: string;
    canBePublic: boolean;
    canBeEnterprise: boolean;
    canBeOrg: boolean;
    canBePrivate: boolean;
    canInvite: boolean;
}

export interface BackgroundImageScaled {
    width: number;
    height: number;
    url: string;
}

export interface SwitcherView {
    viewType: string;
    enabled: boolean;
}
