import { MultiSelect, TagsInput, ActionIcon } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import React, { useEffect, useState } from 'react';
import { TrelloChrome } from './TrelloChrome';
import { TrelloCard } from './trellocard';
import SprintStatsGraph from './SprintStatsGraph';
import { TrelloList } from './trellolist';
import SprintStatsList from './SprintStatsList';

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
    const [showSettings, setShowSettings] = useState(false);

    const handleShowSettings = () => setShowSettings(true);

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
        const clipboardData = event.clipboardData.getData('text');
        console.log(`handleCardUrlsChange: ${clipboardData}`);
        const newCardIds = extractTrelloCardIds(clipboardData);
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
                    console.log(`cardIds:`, cardIds);
                    setCardUrls(cardIds);
                });
        }
    }, [cardsByList]);

    const doneColumnIds = columns.filter((column) => doneColumns?.includes(column.name)).map((column) => column.id);
    const cardIds = cardUrls?.map(cardUrlToId).filter((id): id is string => !!id) || [];

    return (
        <div className="flex flex-col px-8 pb-8 pt-4 bg-[#F0F0F0]" style={{ minHeight: 800 }}>
            {!showSettings && (
                <div className="flex">
                    <ActionIcon onClick={handleShowSettings} variant="light" color="dark" className="ml-auto">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </ActionIcon>
                </div>
            )}
            <DatePickerInput
                type="range"
                label="Sprint Dates"
                placeholder="Pick sprint dates"
                value={sprintDates}
                onChange={handleSprintDatesChange}
                className="mb-4"
            />
            {showSettings && (
                <>
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
                </>
            )}

            {sprintDates && doneColumns && cardsByList && (
                <>
                    <SprintStatsGraph
                        cardsByList={cardsByList}
                        doneColumnIds={doneColumnIds}
                        startDate={(sprintDates as [Date, Date])[0]}
                        endDate={(sprintDates as [Date, Date])[1]}
                        sprintLabels={[]}
                        cardIds={cardIds}
                    />
                    <SprintStatsList cardsByList={cardsByList} cardIds={cardIds} doneColumnNames={doneColumns} />
                </>
            )}
        </div>
    );
}
