import { TrelloBoard } from './trelloboard';
import { TrelloCard } from './trellocard';
import { TrelloList } from './trellolist';

const TRELLO_API_KEY = process.env.TRELLO_API_KEY || '';
if (!TRELLO_API_KEY) {
    throw new Error('TRELLO_API_KEY not set. Add it to your .env file');
}

class TrelloContext {
    private static key: string;
    private static token: string;
    public static urlRoot = 'https://trello.com/1';

    public static initialize(appKey: string, appToken: string) {
        TrelloContext.key = appKey;
        TrelloContext.token = appToken;
    }

    public static getSignedUrl(url: String): string {
        return (
            TrelloContext.urlRoot +
            url +
            (url.indexOf('?') == -1 ? '?' : '&') +
            'key=' +
            TrelloContext.key +
            '&token=' +
            TrelloContext.token
        );
    }
}

const toKey = (key: string) => `trellochrome_${key}`;

export class TrelloChrome {
    public async toStorage(key: string, data: any) {
        chrome.storage.sync.set({ [toKey(key)]: JSON.stringify(data) });
    }

    public async getFromStorage(key: string): Promise<string> {
        const keyName = toKey(key);
        return (await chrome.storage.sync.get(keyName).then((res) => res[keyName])) || '';
    }

    private async getToken(): Promise<string> {
        // Testing locally?
        var parts = window.location.href.split('#token=');
        if (parts.length > 1) {
            return parts[1];
        }

        return this.getFromStorage('token');
    }

    public async isLoggedIn(): Promise<boolean> {
        var token = await this.getToken();
        return token != null && token.length > 0;
    }

    // Authenticates with Trello.
    public async authenticate() {
        // Check if we're auth'd already
        if (await this.isLoggedIn()) {
            return;
        }

        var redirectUrl = chrome.identity.getRedirectURL('/trello');
        var authUrl =
            TrelloContext.urlRoot +
            '/authorize?' +
            'response_type=token' +
            '&key=' +
            TRELLO_API_KEY +
            '&response_type=token' +
            '&return_url=' +
            encodeURI(redirectUrl) +
            '&scope=read,write,account&expiration=never' +
            '&name=Small%20Trello%20Chrome%20Improvements';

        console.log(authUrl);
        const toStorage = this.toStorage;

        chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, function (responseUrl) {
            console.log(responseUrl);
            if (!responseUrl) {
                console.log('No response URL');
                return;
            }
            var parts = responseUrl.split('#token=');
            toStorage('token', parts[1]).then(() => window.location.reload());
        });
    }

    public getBoard(boardId: string): Promise<TrelloBoard> {
        return fetch(TrelloContext.getSignedUrl('/boards/' + boardId), { method: 'GET' }).then((res) => res.json());
    }

    public getBoardLists(boardId: string): Promise<TrelloList[]> {
        return fetch(TrelloContext.getSignedUrl('/boards/' + boardId + '/lists'), { method: 'GET' }).then((res) =>
            res.json()
        );
    }

    public getCardsOnBoard(boardId: string): Promise<TrelloCard[]> {
        if (!this.isLoggedIn()) {
            throw new Error('Not logged in');
        }

        return fetch(TrelloContext.getSignedUrl('/boards/' + boardId + '/cards'), { method: 'GET' }).then((res) =>
            res.json()
        );
    }

    private async initialize() {
        TrelloContext.initialize(TRELLO_API_KEY, await this.getToken());
    }

    public async bind() {
        if (await this.isLoggedIn()) {
            await this.initialize();
        }
    }
}
