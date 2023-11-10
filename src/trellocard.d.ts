export interface TrelloCard {
    id: string;
    badges: Badges;
    checkItemStates: any[];
    closed: boolean;
    dueComplete: boolean;
    dateLastActivity: string;
    desc: string;
    descData: DescData;
    due: null;
    dueReminder: null;
    email: string;
    idBoard: string;
    idChecklists: any[];
    idList: string;
    idMembers: any[];
    idMembersVoted: any[];
    idShort: number;
    idAttachmentCover: null;
    labels: Label[];
    idLabels: any[];
    manualCoverAttachment: boolean;
    name: string;
    pos: number;
    shortLink: string;
    shortUrl: string;
    start: null;
    subscribed: boolean;
    url: string;
    cover: Cover;
    isTemplate: boolean;
    cardRole: null;
}

interface Label {
    id: string;
    idBoard: string;
    name: string;
    color: string;
    uses: number;
}

export interface Badges {
    attachmentsByType: AttachmentsByType;
    location: boolean;
    votes: number;
    viewingMemberVoted: boolean;
    subscribed: boolean;
    fogbugz: string;
    checkItems: number;
    checkItemsChecked: number;
    checkItemsEarliestDue: null;
    comments: number;
    attachments: number;
    description: boolean;
    due: null;
    dueComplete: boolean;
    start: null;
}

export interface AttachmentsByType {
    trello: Trello;
}

export interface Trello {
    board: number;
    card: number;
}

export interface Cover {
    idAttachment: null;
    color: null;
    idUploadedBackground: null;
    size: string;
    brightness: string;
    idPlugin: null;
}

export interface DescData {
    emoji: Emoji;
}

export interface Emoji {}
