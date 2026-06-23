import { Component } from '@angular/core';
import { ShowcaseItem } from '../branded-products/components/branding-showcase-block/branding-showcase-block.component';

interface ShowcaseSection {
    title: string;
    imageUrl: string;
    reverse: boolean;
    items: ShowcaseItem[];
}

interface BenefitCard {
    title: string;
    description: string;
    icon: 'customize' | 'quality' | 'lightning';
}

interface HeroContent {
    title: string;
    description: string;
    imageUrl: string;
    imageAlt: string;
}

@Component({
    selector: 'app-event-branding',
    standalone: false,
    templateUrl: './event-branding.component.html',
    styleUrls: ['./event-branding.component.scss']
})
export class EventBrandingComponent {
    showContactUs = false

    readonly heroContent: HeroContent = {
        title: 'Event & Corporate Merchandise',
        description: 'Tailored giveaways and premium gifts for events, trade shows, and corporate programs that boost brand recall and leave a lasting impression.',
        imageUrl: 'assets/images/event-hero.jpg',
        imageAlt: 'Event giveaways and branded activations'
    };

    sections: ShowcaseSection[] = [
        {
            title: 'Event Merchandise',
            imageUrl: 'assets/images/event1.jpg',
            reverse: false,
            items: [
                { text: 'Custom-branded items designed for conferences and activations to boost engagement and visibility.' },
            ]
        },
        {
            title: 'Trade Show Promotions',
            imageUrl: 'assets/images/event2.jpg',
            reverse: true,
            items: [
                { text: 'Eye-catching giveaways and display kits crafted to attract leads and reinforce your brand presence.' },
            ]
        },
        {
            title: 'Corporate Gifting',
            imageUrl: 'assets/images/event3.jpg',
            reverse: false,
            items: [
                { text: 'Personalized premium gifts and curated bundles that strengthen client relationships and reward employees.' },
            ]
        }
    ];

    benefits: BenefitCard[] = [
        {
            title: 'Flexible Customization',
            description: 'Adapt colors, print methods, placement, packaging, and messaging so every giveaway and display matches your campaign perfectly.',
            icon: 'customize'
        },
        {
            title: 'Premium Presentation',
            description: 'High-quality materials and polished finishing ensure your branded products look professional in every event setting.',
            icon: 'quality'
        },
        {
            title: 'Event-Ready Turnaround',
            description: 'Fast production timelines and scalable order quantities help you stay ready for launches, expos, and seasonal activations.',
            icon: 'lightning'
        }
    ];
}
