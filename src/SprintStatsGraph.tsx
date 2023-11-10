import { Line, ResponsiveLine } from '@nivo/line';
import dayjs from 'dayjs';
import React from 'react';
import { TrelloCard } from './trellocard';

interface Props {
    startDate: Date;
    endDate: Date;
    cardsByList: { [key: string]: TrelloCard[] };
    doneColumnIds: string[];
    sprintLabels: string[];
    cardIds: string[];
}

export default function SprintStatsGraph({
    startDate,
    endDate,
    cardsByList,
    doneColumnIds,
    sprintLabels,
    cardIds,
}: Props) {
    const sprintCards = Object.values(cardsByList)
        .flat()
        .filter(
            (card) => cardIds.includes(card.shortLink) || card.labels.some((label) => sprintLabels.includes(label.name))
        );
    const doneCards = sprintCards.filter((card) => doneColumnIds.includes(card.idList));
    const doneCardsByLastActivity = doneCards.reduce<TrelloCard[][]>((acc, card) => {
        const lastActivity = dayjs(card.dateLastActivity);
        const lastActivityWeek = lastActivity.diff(startDate, 'week');
        acc[lastActivityWeek] = acc[lastActivityWeek] || [];
        acc[lastActivityWeek].push(card);

        return acc;
    }, []);
    const totalCards = sprintCards.length;
    const weeks = dayjs(endDate).diff(startDate, 'week');
    const weeksWithRefinement = weeks + 1;
    const dataExpected = Array.from({ length: weeksWithRefinement }).map((_, i) => {
        if (i === 0) {
            return { x: i, y: totalCards };
        } else if (i === weeksWithRefinement - 1) {
            return { x: i, y: 0 };
        } else {
            return { x: i, y: totalCards - (totalCards / weeksWithRefinement) * i };
        }
    });
    const dataActual = Array.from({ length: weeksWithRefinement }).map((_, i) => {
        if (i === 0) {
            return { x: i, y: totalCards };
        } else {
            const cardsDone = doneCardsByLastActivity.reduce(
                (acc, cards, week) => (week <= i ? acc + cards.length : acc),
                0
            );
            return { x: i, y: totalCards - cardsDone };
        }
    });

    return (
        <>
            <div className="flex flex-col">
                <div>Weeks: {weeks}</div>
                <div>Total cards: {totalCards}</div>
                <div>Sprint Card Ids: {cardIds.length}</div>
                <div className="w-full h-96">
                    <ResponsiveLine
                        data={[
                            { id: 'Expected', data: dataExpected },
                            { id: 'Actual', data: dataActual },
                        ]}
                        margin={{ top: 10, right: 10, bottom: 50, left: 40 }}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Week',
                            legendOffset: 36,
                            legendPosition: 'middle',
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Remaining cards',
                            legendOffset: -35,
                            legendPosition: 'middle',
                        }}
                        xScale={{
                            type: 'point',
                        }}
                        yScale={{
                            type: 'linear',
                            stacked: false,
                            min: 0,
                            max: totalCards,
                        }}
                    />
                </div>
            </div>
        </>
    );
}
