import { Component, OnInit } from '@angular/core';
import { GamesService } from 'src/app/services/games.service';

interface ResultTableRow {
    distribution: string;
    winners: string;
    singlePrize: string;
    totalPrizes: string;
}

interface ResultDraw {
    id: string;
    eventName: string;
    gameType: string;
    balls: Array<{ number: number | string }>;
    rows: ResultTableRow[];
}

@Component({
    selector: 'app-results',
    standalone: false,
    templateUrl: './results.component.html',
    styleUrl: './results.component.scss'
})

export class ResultsComponent implements OnInit {
    filters = ['Pick 2', 'Pick 3', 'Pick 4', 'Jackpot'];
    activeFilter = 'Jackpot';
    searchTerm = '';
    draws: ResultDraw[] = [];
    jackpotId = 38

    constructor(private gamesSrv: GamesService) { }

    async ngOnInit(): Promise<void> {
        await this.getResults();
    }

    async getResults(): Promise<void> {
        try {
            const response = await this.gamesSrv.getDrawResults(this.jackpotId);
            this.draws = this.normalizeDraws(response);
        } catch (error) {
            console.error('Error fetching results:', error);
            this.draws = this.getFallbackDraws();
        }

        if (this.draws.length === 0) {
            this.draws = this.getFallbackDraws();
        }
    }

    setFilter(filter: string): void {
        this.activeFilter = filter;
    }

    get filteredDraws(): ResultDraw[] {
        const normalizedFilter = this.activeFilter.toLowerCase();
        const normalizedSearch = this.searchTerm.trim().toLowerCase();

        return this.draws.filter((draw) => {
            const matchesFilter = normalizedFilter === 'all' || draw.gameType.toLowerCase().includes(normalizedFilter.toLowerCase());
            const matchesSearch = normalizedSearch.length === 0
                || draw.eventName.toLowerCase().includes(normalizedSearch)
                || draw.id.toLowerCase().includes(normalizedSearch);

            return matchesFilter && matchesSearch;
        });
    }

    get selectedDraw(): ResultDraw | null {
        return this.filteredDraws.length > 0 ? this.filteredDraws[0] : null;
    }

    trackByRow = (index: number, row: ResultTableRow): string => `${row.distribution}-${index}`;

    private normalizeDraws(response: any): ResultDraw[] {
        const source = this.extractArray(response);
        return source.map((item: any, index: number) => this.normalizeDraw(item, index));
    }

    private normalizeDraw(item: any, index: number): ResultDraw {
        const id = String(item?.DrawNumber ?? item?.ResultId ?? item?.DrawId ?? item?.EventId ?? index + 1);
        const drawDate = item?.DrawDate ? ` (${new Date(item.DrawDate).toLocaleDateString('en-US')})` : '';
        const eventName = String(item?.EventName ?? item?.Name ?? `Results Of Draw-${id}${drawDate}`);
        const gameType = String(item?.GameName ?? item?.Category ?? item?.Type ?? 'Jackpot');

        return {
            id,
            eventName,
            gameType,
            balls: this.extractBalls(item),
            rows: this.extractRows(item)
        };
    }

    private extractArray(response: any): any[] {
        if (Array.isArray(response)) {
            return response;
        }

        if (response && typeof response === 'object' && ('DrawNumber' in response || 'Ball1' in response)) {
            return [response];
        }

        if (Array.isArray(response?.Data)) {
            return response.Data;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.Results)) {
            return response.Results;
        }

        if (Array.isArray(response?.results)) {
            return response.results;
        }

        return [];
    }

    private extractBalls(item: any): Array<{ number: number | string }> {
        const candidate = item?.numbers ?? item?.Balls ?? item?.balls ?? item?.WinningNumbers;

        if (Array.isArray(candidate)) {
            return candidate.map((value: any) => {
                const num = Number(value?.number ?? value);
                return { number: Number.isNaN(num) ? (value?.number ?? value) : num };
            });
        }

        if (typeof candidate === 'string') {
            return candidate
                .replace('Balls:', '')
                .replace(/'/g, '')
                .split(',')
                .map((value) => value.trim())
                .filter((value) => value.length > 0)
                .map((value) => {
                    const num = Number(value);
                    return { number: Number.isNaN(num) ? value : num };
                });
        }

        const numberedBalls = [item?.Ball1, item?.Ball2, item?.Ball3, item?.Ball4, item?.Ball5, item?.Ball6]
            .filter((value) => value !== null && value !== undefined && value !== '');

        if (numberedBalls.length > 0) {
            return numberedBalls.map((value) => ({ number: Number(value) }));
        }

        return [7, 2, 5, 24, 11, 4].map((value) => ({ number: value }));
    }

    private extractRows(item: any): ResultTableRow[] {
        const rowSources = item?.PrizeTable
            ?? item?.prizeTable
            ?? item?.Prizes
            ?? item?.prizes
            ?? item?.Distribution
            ?? item?.distribution
            ?? item?.rows;

        if (!Array.isArray(rowSources) || rowSources.length === 0) {
            const mappedApiRows = this.mapJackpotRows(item);
            return mappedApiRows.length > 0 ? mappedApiRows : this.getFallbackRows();
        }

        return rowSources.map((row: any, index: number) => ({
            distribution: String(row?.Distribution ?? row?.distribution ?? row?.Label ?? row?.label ?? '-'),
            winners: this.formatAmount(row?.Winners ?? row?.winners ?? row?.Count ?? row?.count ?? 0),
            singlePrize: this.formatAmount(row?.SinglePrize ?? row?.singlePrize ?? row?.Amount ?? row?.amount ?? row?.Prize ?? row?.prize ?? 0),
            totalPrizes: this.formatAmount(row?.TotalPrizes ?? row?.totalPrizes ?? row?.Total ?? row?.total ?? 0)
        }));
    }

    private mapJackpotRows(item: any): ResultTableRow[] {
        const rows = [
            {
                distribution: '6 Good Numbers',
                winners: item?.JackpotWinners,
                singlePrize: item?.SingleJackpotPrize,
                totalPrizes: item?.TotalJackpotPrizes
            },
            {
                distribution: '5 Good Numbers',
                winners: item?.FiveWinners,
                singlePrize: item?.SingleFivePrize,
                totalPrizes: item?.TotalFivePrizes
            },
            {
                distribution: '4 Good Numbers',
                winners: item?.FourWinners,
                singlePrize: item?.SingleFourPrize,
                totalPrizes: item?.TotalFourPrizes
            },
            {
                distribution: '3 Good Numbers',
                winners: item?.ThreeWinners,
                singlePrize: item?.SingleThreePrize,
                totalPrizes: item?.TotalThreePrizes
            }
        ];

        return rows
            .filter((row) => row.winners !== undefined || row.singlePrize !== undefined || row.totalPrizes !== undefined)
            .map((row) => ({
                distribution: row.distribution,
                winners: this.formatAmount(row.winners ?? 0),
                singlePrize: this.formatAmount(row.singlePrize ?? 0),
                totalPrizes: this.formatAmount(row.totalPrizes ?? 0)
            }));
    }

    private formatAmount(value: any): string {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
            return String(value ?? 0);
        }
        return new Intl.NumberFormat('en-US').format(parsed);
    }

    private getFallbackRows(): ResultTableRow[] {
        return [
            { distribution: '6 Good Numbers', winners: '0', singlePrize: '0', totalPrizes: '0' },
            { distribution: '5 Good Numbers', winners: '3', singlePrize: '7,000', totalPrizes: '21,000' },
            { distribution: '4 Good Numbers', winners: '16', singlePrize: '350', totalPrizes: '5,600' },
            { distribution: '3 Good Numbers', winners: '27', singlePrize: '35', totalPrizes: '945' }
        ];
    }

    private getFallbackDraws(): ResultDraw[] {
        return [{
            id: '2024-001',
            eventName: 'Results Of Draw-2024-001',
            gameType: 'Jackpot',
            balls: [7, 2, 5, 24, 11, 4].map((number) => ({ number })),
            rows: this.getFallbackRows()
        }];
    }
}
