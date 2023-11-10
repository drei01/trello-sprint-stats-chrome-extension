import { MultiSelect, TagsInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import React, { useEffect, useState } from 'react';
import { TrelloChrome } from './TrelloChrome';
import { TrelloCard } from './trellocard';
import SprintStatsGraph from './SprintStatsGraph';
import { TrelloList } from './trellolist';

const DEFAULT_DONE_COLUMNS = [
    'QA Dev',
    'Ready for Master',
    'Ready for release',
    'Released in Sprint',
    'Notify Customer Team',
];

const DEFAULT_SPRINT_LABELS = ['Sprint'];

const DONE_COLUMNS_STORAGE_KEY = 'doneColumns';
const SPRINT_DATES_STORAGE_KEY = 'sprintDates';
const SPRINT_CARD_IDS_STORAGE_KEY = 'sprintCardIds';

const trelloRegex = /(?:https?:\/\/)?(?:www\.)?trello\.com\/c\/([a-zA-Z0-9]{8,})/g;

function extractTrelloCardIds(value?: string) {
    if (!value) {
        return [];
    }
    const matches = value.match(trelloRegex);
    if (matches) {
        return matches.map((url) => url.match(trelloRegex)?.[0]).filter((id): id is string => !!id);
    } else {
        return [];
    }
}

const cardUrlToId = (url: string) => {
    const id = url.matchAll(trelloRegex)?.next()?.value?.[1];
    if (!id) {
        console.log('Failed to parse card id from url:', url);
    }
    return id;
};

interface Props {
    cardsByList: { [key: string]: TrelloCard[] };
    columns: TrelloList[];
    trelloChrome: TrelloChrome;
}

export default function SprintStats({ cardsByList, trelloChrome, columns }: Props) {
    const [sprintDates, setSprintDates] = useState<[Date | null, Date | null]>([null, null]);
    const [doneColumns, setDoneColumns] = useState<string[]>();
    const [labels, setLabels] = useState<string[]>();
    const [sprintLabels, setSprintLabels] = useState<string[]>(DEFAULT_SPRINT_LABELS);
    const [cardUrls, setCardUrls] = useState<string[]>();

    const handleDoneColumnsChange = (doneColumns: string[]) => {
        setDoneColumns(doneColumns);
        trelloChrome.toStorage(DONE_COLUMNS_STORAGE_KEY, doneColumns);
    };

    const handleSprintDatesChange = (dates: [Date | null, Date | null]) => {
        setSprintDates(dates);
        const [start, end] = dates;
        trelloChrome.toStorage(SPRINT_DATES_STORAGE_KEY, [start?.toISOString(), end?.toISOString()]);
    };

    const handleCardUrlsPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        console.log(`handleCardUrlsChange: ${event.currentTarget.value}`);
        const newCardIds = extractTrelloCardIds(event.currentTarget.value);
        console.log(`newCardIds:`, newCardIds);
        setCardUrls(newCardIds);
        trelloChrome.toStorage(SPRINT_CARD_IDS_STORAGE_KEY, newCardIds);
    };

    useEffect(() => {
        if (cardsByList) {
            const labels = Object.values(cardsByList)
                .map((cards) => cards.map((card) => card.labels).flat())
                .flat()
                .map((label) => label.name);
            setLabels(Array.from(new Set(labels)));

            trelloChrome
                .getFromStorage(DONE_COLUMNS_STORAGE_KEY)
                .then((res) => (res ? JSON.parse(res) : DEFAULT_DONE_COLUMNS))
                .then((dc) => Object.keys(cardsByList).filter((listName) => dc.includes(listName)))
                .then(setDoneColumns);

            trelloChrome
                .getFromStorage(SPRINT_DATES_STORAGE_KEY)
                .then((res) => (res ? JSON.parse(res) : [null, null]))
                .then(([start, end]): [Date | null, Date | null] => [
                    start ? new Date(start) : null,
                    end ? new Date(end) : null,
                ])
                .then(setSprintDates);

            trelloChrome
                .getFromStorage(SPRINT_CARD_IDS_STORAGE_KEY)
                .then((res) => (res ? JSON.parse(res) : []))
                .then((cardIds) => {
                    setCardUrls(cardIds);
                });
        }
    }, [cardsByList]);

    const doneColumnIds = columns.filter((column) => doneColumns?.includes(column.name)).map((column) => column.id);
    const cardIds = cardUrls?.map(cardUrlToId).filter((id): id is string => !!id) || [];

    return (
        <div className="flex flex-col p-8 bg-[#F0F0F0]" style={{ minHeight: 800 }}>
            <DatePickerInput
                type="range"
                label="Sprint Dates"
                placeholder="Pick sprint dates"
                value={sprintDates}
                onChange={handleSprintDatesChange}
                className="mb-4"
            />
            <MultiSelect
                label="'Done' columns"
                placeholder="Pick column"
                data={Object.keys(cardsByList)}
                value={doneColumns}
                onChange={handleDoneColumnsChange}
                className="mb-4"
            />
            {/*labels && (
                <MultiSelect
                    label="Sprint labels"
                    placeholder="Pick label"
                    data={labels}
                    value={sprintLabels}
                    onChange={setSprintLabels}
                    className="mb-4"
                />
            )*/}
            {cardUrls && (
                <TagsInput
                    label="Sprint Cards"
                    placeholder="Paste a list of trello card urls"
                    value={cardUrls}
                    onPaste={handleCardUrlsPaste}
                    onChange={setCardUrls}
                    clearable
                    mah={100}
                    className="overflow-y-scroll"
                />
            )}

            {sprintDates && doneColumns && sprintLabels && cardsByList && (
                <SprintStatsGraph
                    cardsByList={cardsByList}
                    doneColumnIds={doneColumnIds}
                    startDate={(sprintDates as [Date, Date])[0]}
                    endDate={(sprintDates as [Date, Date])[1]}
                    sprintLabels={sprintLabels}
                    cardIds={cardIds}
                />
            )}
        </div>
    );
}
