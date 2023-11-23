import React from 'react';
import { Badge } from '@mantine/core';
import { TrelloCard } from './trellocard';

const COLORS = [
    'red',
    'pink',
    'grape',
    'violet',
    'indigo',
    'blue',
    'cyan',
    'green',
    'lime',
    'yellow',
    'orange',
    'teal',
];

interface Props {
    cardsByList: { [key: string]: TrelloCard[] };
    cardIds: string[];
    doneColumnNames: string[];
}

export default function SprintStatsList({ cardsByList, cardIds, doneColumnNames }: Props) {
    const cardInSprint = (card: TrelloCard) => cardIds.includes(card.shortLink);
    const handleLinkClicked = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        chrome.tabs.create({ url: e.currentTarget.href });
    };

    return (
        <div>
            {Object.entries(cardsByList)
                .filter(
                    ([listName, cards]) => !doneColumnNames.includes(listName) && cards.filter(cardInSprint).length > 0
                )
                .map(([listName, cards], idx) => (
                    <div key={listName} className="pt-2">
                        <Badge color={COLORS[idx]} rightSection={cards.filter(cardInSprint).length}>
                            {listName}
                        </Badge>
                        <ul>
                            {cards.filter(cardInSprint).map((card) => (
                                <li key={card.id} className="w-full px-4 py-1">
                                    <a
                                        href={card.shortUrl}
                                        onClick={handleLinkClicked}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {card.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
        </div>
    );
}
