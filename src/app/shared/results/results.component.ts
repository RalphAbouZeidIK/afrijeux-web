import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { GamesService } from 'src/app/services/games.service';
import { OptionListItem } from 'src/app/shared/option-list/option-list.component';

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

interface ResultEventOption extends OptionListItem {
    eventDate?: string;
    versionId?: number;
}

@Component({
    selector: 'app-results',
    standalone: false,
    templateUrl: './results.component.html',
    styleUrl: './results.component.scss'
})

export class ResultsComponent implements OnInit {
    filters = ['Pick 2', 'Pick 3', 'Pick 4', 'Pick 5', 'Jackpot'];
    activeFilter = 'Jackpot';
    searchTerm = '';
    draws: ResultDraw[] = [];
    jackpotGameId = 38;
    pickXGameId = 35;
    currentGameId = this.jackpotGameId;
    eventOptions: ResultEventOption[] = [];
    selectedEventOption: ResultEventOption = {
        TicketTypeId: '',
        TicketTypeName: 'No events found'
    };
    showEventOptions = false;


    constructor(
        private gamesSrv: GamesService,
        private elementRef: ElementRef<HTMLElement>
    ) { }

    async ngOnInit(): Promise<void> {
        await this.loadResultsForFilter(this.activeFilter);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const dropdownHost = this.elementRef.nativeElement.querySelector('.results-view__dropdown');
        const target = event.target as Node | null;

        if (this.showEventOptions && dropdownHost && target && !dropdownHost.contains(target)) {
            this.showEventOptions = false;
        }
    }

    async getResults(eventId?: string | number, gameId: number = this.currentGameId): Promise<void> {
        try {
            const response = await this.gamesSrv.getDrawResults(gameId, eventId);
            this.draws = this.normalizeDraws(response);
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    }

    async getEventResultIds(gameId: number, versionId?: number): Promise<void> {
        try {
            const response = await this.gamesSrv.getEventResultIds(gameId);
            const normalizedOptions = this.normalizeEventOptions(response);
            const filteredOptions = this.filterEventOptionsByVersion(normalizedOptions, versionId);

            this.eventOptions = filteredOptions.sort((a, b) => this.getEventTimeValue(b.eventDate) - this.getEventTimeValue(a.eventDate));

            if (this.eventOptions.length > 0) {
                this.selectedEventOption = this.eventOptions[0];
                await this.getResults(this.selectedEventOption.TicketTypeId, gameId);
                return;
            }

            this.selectedEventOption = {
                TicketTypeId: '',
                TicketTypeName: 'No events found'
            };
            this.draws = [];
        } catch (error) {
            console.error('Error fetching event result IDs:', error);
            this.eventOptions = [];
            this.draws = [];
        }
    }

    toggleEventOptions(): void {
        this.showEventOptions = !this.showEventOptions;
    }

    async onEventChange(option: OptionListItem): Promise<void> {
        this.selectedEventOption = option;
        this.showEventOptions = false;
        await this.getResults(option.TicketTypeId, this.currentGameId);
    }


    async setFilter(filter: string): Promise<void> {
        this.activeFilter = filter;
        this.showEventOptions = false;
        await this.loadResultsForFilter(filter);
    }

    get filteredDraws(): ResultDraw[] {
        const normalizedFilter = this.normalizeCompareText(this.activeFilter);
        const normalizedSearch = this.searchTerm.trim().toLowerCase();

        return this.draws.filter((draw) => {
            const normalizedGameType = this.normalizeCompareText(draw.gameType);
            const matchesFilter = normalizedFilter === 'all'
                || normalizedGameType.includes(normalizedFilter)
                || normalizedFilter.includes(normalizedGameType);
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
        const nameFromApi = item?.EventName ?? item?.Name ?? `${id}${drawDate}`;
        const eventName = String(`Results Of Draw - ${nameFromApi} `);
        const gameType = String(item?.GameName ?? item?.VersionType ?? item?.Category ?? item?.Type ?? 'Jackpot');

        return {
            id,
            eventName,
            gameType,
            balls: this.extractBalls(item),
            rows: this.extractRows(item)
        };
    }

    private normalizeEventOptions(response: any): ResultEventOption[] {
        const source = this.extractArray(response);

        return source
            .map((item: any, index: number) => this.normalizeEventOption(item, index))
            .filter((item: ResultEventOption | null): item is ResultEventOption => item !== null);
    }

    private normalizeEventOption(item: any, index: number): ResultEventOption | null {
        if (item === null || item === undefined || item === '') {
            return null;
        }

        if (typeof item === 'string' || typeof item === 'number') {
            return {
                TicketTypeId: item,
                TicketTypeName: `Draw ${item}`,
                eventDate: '',
                versionId: undefined
            };
        }

        const eventId = item?.GameEventId ?? item?.EventId ?? item?.DrawNumber ?? item?.Id ?? item?.Value ?? item?.id ?? item?.value;

        if (eventId === null || eventId === undefined || eventId === '') {
            return null;
        }

        const drawNumber = item?.DrawNumber ?? eventId ?? index + 1;
        const fallbackName = `Draw ${drawNumber}`;
        const eventName = item?.EventName ?? item?.Name ?? item?.Label ?? item?.Description ?? fallbackName;
        const rawEventDate = item?.DrawDate ?? item?.EventDate ?? item?.GameEventDate;
        const eventDate = this.formatEventOptionDate(rawEventDate);
        const parsedVersionId = this.parseVersionId(item?.VersionId ?? item?.ConfigurationVersionId ?? item?.VersionType);

        return {
            TicketTypeId: eventId,
            TicketTypeName: eventDate ? `${eventName} - ${eventDate}` : String(eventName),
            eventDate: rawEventDate,
            versionId: parsedVersionId
        };
    }

    private extractArray(response: any): any[] {
        if (Array.isArray(response)) {
            return response;
        }

        if (response && typeof response === 'object' && ('DrawNumber' in response || 'Ball1' in response || 'GameEventId' in response)) {
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
            return mappedApiRows;
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

    private formatEventOptionDate(value: any): string {
        if (!value) {
            return '';
        }

        const parsedDate = new Date(value);

        if (Number.isNaN(parsedDate.getTime())) {
            return '';
        }

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(parsedDate);
    }

    private async loadResultsForFilter(filter: string): Promise<void> {
        const normalizedFilter = filter.toLowerCase();

        if (normalizedFilter === 'jackpot') {
            this.currentGameId = this.jackpotGameId;
            await this.getEventResultIds(this.jackpotGameId);
            return;
        }

        const versionId = this.getVersionIdFromFilter(normalizedFilter);
        this.currentGameId = this.pickXGameId;
        await this.getEventResultIds(this.pickXGameId, versionId);
    }

    private getVersionIdFromFilter(normalizedFilter: string): number | undefined {
        if (normalizedFilter === 'pick 2') {
            return 2;
        }
        if (normalizedFilter === 'pick 3') {
            return 3;
        }
        if (normalizedFilter === 'pick 4') {
            return 4;
        }
        if (normalizedFilter === 'pick 5') {
            return 5;
        }
        return undefined;
    }

    private filterEventOptionsByVersion(options: ResultEventOption[], versionId?: number): ResultEventOption[] {
        if (!versionId) {
            return options;
        }

        return options.filter((option) => Number(option.versionId) === Number(versionId));
    }

    private parseVersionId(value: any): number | undefined {
        if (value === null || value === undefined || value === '') {
            return undefined;
        }

        const numericValue = Number(value);
        if (!Number.isNaN(numericValue)) {
            return numericValue;
        }

        if (typeof value === 'string') {
            const match = value.match(/(\d+)/);
            if (match) {
                const extracted = Number(match[1]);
                return Number.isNaN(extracted) ? undefined : extracted;
            }
        }

        return undefined;
    }

    private getEventTimeValue(value: any): number {
        if (!value) {
            return 0;
        }

        const parsedDate = new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
    }

    private normalizeCompareText(value: string): string {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
    }


}
