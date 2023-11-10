import './main.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TrelloChrome } from './TrelloChrome';
import { TrelloCard } from './trellocard';
import SprintStats from './SprintStats';
import { TrelloList } from './trellolist';

const theme = createTheme({});

const Popup = () => {
    const [trelloChrome, setTrelloChrome] = useState<TrelloChrome>();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cardsByList, setCardsByList] = useState<{ [key: string]: TrelloCard[] }>({});
    const [columns, setColumns] = useState<TrelloList[]>();
    useEffect(() => {
        const chromeTrello = new TrelloChrome();
        chromeTrello.bind();
        setTrelloChrome(chromeTrello);
        chromeTrello.isLoggedIn().then(setIsLoggedIn);
    }, []);
    useEffect(() => {
        if (isLoggedIn) {
            chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                const activeTab = tabs[0];
                const boardId = activeTab.url?.split('b/')[1].split('/')[0];
                if (boardId) {
                    const lists = await trelloChrome?.getBoardLists(boardId);
                    const cards = await trelloChrome?.getCardsOnBoard(boardId);
                    if (cards && lists) {
                        const cardsByList = cards.reduce<{ [key: string]: TrelloCard[] }>((acc, card) => {
                            const list = lists.find((list) => list.id === card.idList);
                            if (list) {
                                acc[list.name] = acc[list.name] || [];
                                acc[list.name].push(card);
                            }

                            return acc;
                        }, {});

                        setCardsByList(cardsByList);
                        setColumns(lists);
                    }
                }
            });
        }
    }, [isLoggedIn]);

    const handleConnect = useCallback(() => {
        trelloChrome?.authenticate();
    }, [trelloChrome]);

    return (
        <>
            {!isLoggedIn && (
                <div id="loggedOut">
                    <div className="py-8 px-4 md:py-16 md:px-8 mb-8 bg-gray-200 rounded text-center">
                        <button
                            onClick={handleConnect}
                            id="connectLink"
                            className="inline-block align-middle text-center select-none border font-normal whitespace-no-wrap rounded  no-underline bg-green-500 text-white hover:green-600 py-3 px-4 leading-tight text-xl"
                        >
                            Connect Trello
                        </button>
                        <p>Click the big green button to connect to your Trello account.</p>
                    </div>
                </div>
            )}

            {isLoggedIn && trelloChrome && cardsByList && columns && (
                <SprintStats cardsByList={cardsByList} trelloChrome={trelloChrome} columns={columns} />
            )}
        </>
    );
};

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <MantineProvider theme={theme}>
            <Popup />
        </MantineProvider>
    </React.StrictMode>
);
