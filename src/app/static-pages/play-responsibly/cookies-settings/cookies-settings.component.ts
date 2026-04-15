import { Component } from '@angular/core';
import { GenericService } from 'src/app/services/generic.service';

interface CookieCategory {
    id: 'essential' | 'analytics' | 'marketing' | 'preference';
    title: string;
    description: string;
    enabled: boolean;
    required?: boolean;
}

@Component({
    selector: 'app-cookies-settings',
    standalone: false,
    templateUrl: './cookies-settings.component.html',
    styleUrl: './cookies-settings.component.scss'
})
export class CookiesSettingsComponent {
    constructor(private gnrcSrv: GenericService) { }
    cookieCategories: CookieCategory[] = [
        {
            id: 'essential',
            title: 'Essential Cookies',
            description: 'These cookies are necessary for the website to function and cannot be disabled. They are usually set in response to actions made by you, such as setting your privacy preferences, logging in, or filling in forms.',
            enabled: true,
            required: true
        },
        {
            id: 'analytics',
            title: 'Analytics Cookies',
            description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our service and user experience.',
            enabled: true
        },
        {
            id: 'marketing',
            title: 'Marketing Cookies',
            description: 'These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third-party advertisers.',
            enabled: false
        },
        {
            id: 'preference',
            title: 'Preference Cookies',
            description: 'These cookies enable the website to remember choices you make (such as your language preference or the region you are in) and provide enhanced, more personal features.',
            enabled: true
        }
    ];

    toggleCookie(category: CookieCategory): void {
        if (category.required) {
            return;
        }

        category.enabled = !category.enabled;
    }

    rejectAll(): void {
        this.cookieCategories = this.cookieCategories.map((category) => ({
            ...category,
            enabled: category.required ? true : false
        }));
    }

    acceptAll(): void {
        this.cookieCategories = this.cookieCategories.map((category) => ({
            ...category,
            enabled: true
        }));
    }

    saveSettings(): void {
        this.gnrcSrv.setModalData(true, true, 'Settings Saved');
    }
}
