import { Component } from '@angular/core';
import { LegalPageContent } from '../legal-content.model';

@Component({
    selector: 'app-privacy-policy',
    standalone: false,
    templateUrl: './privacy-policy.component.html'
})
export class PrivacyPolicyComponent {
    content: LegalPageContent = {
        title: 'Privacy Policy',
        subtitle: 'This Privacy Policy explains how WinBig General Trading L.L.C. (“WinBig” or “Company”) collects, uses, stores, and protects your personal data when you access or use the website and related services. By using the platform, you acknowledge and agree to the processing of your personal data as described in this Policy. WinBig acts as the data controller for all personal data collected through the Services.',
        sections: [
            {
                id: 'personal-data-and-registration',
                title: 'Personal Data and Registration',
                paragraphs: [
                    'WinBig collects and processes personal data necessary to create and manage your account and provide access to its services. This includes information such as your name, date and place of birth, contact details, address, preferred language and currency, and identification documents such as passport or ID. Additional information may also be collected during your use of the platform.',
                    'Your personal data is used to operate your account, process transactions, verify your identity, ensure platform security, and comply with legal and regulatory obligations. WinBig may retain personal data, including transaction history, after account closure where required for legal, regulatory, or operational purposes.',
                    'Personal data may be shared only when necessary with payment providers, service partners, and relevant authorities for transaction processing, verification, fraud prevention, or legal compliance. Data may also be transferred internationally to support service operations. WinBig does not sell or rent personal data to third parties.',
                    'You are responsible for ensuring that your information remains accurate and up to date, and you may access and update your data through your account.'
                ]
            },
            {
                id: 'delete-account',
                title: 'Delete Account',
                paragraphs: [
                    'Users may request deletion of their account and associated personal data at any time. WinBig will process such requests in accordance with applicable laws, while retaining certain information where required for legal, regulatory, or legitimate business purposes.'
                ]
            },
            {
                id: 'security',
                title: 'Security',
                paragraphs: [
                    'WinBig applies appropriate technical and organizational security measures to protect personal data against unauthorized access, alteration, loss, or misuse. Sensitive information is encrypted and handled securely. While all reasonable measures are taken, no system can guarantee absolute security.'
                ]
            },
            {
                id: 'information-collection-and-use',
                title: 'Information Collection and Use',
                paragraphs: [
                    'WinBig is the sole owner of the information collected through the website and uses it exclusively to provide, operate, and improve its services. Data is collected during registration, transactions, and user interaction with the platform.',
                    'Personal data is not sold or rented. It may only be shared where necessary to operate the services, process transactions, support promotions, or comply with legal obligations. In certain cases, data may be shared with operational partners involved in delivering services or promotional activities.'
                ]
            },
            {
                id: 'payment-information',
                title: 'Payment Information',
                paragraphs: [
                    'All payments made through the platform are processed via authorized external payment providers such as banks, retailers, or payment gateways. Users provide payment details directly to these providers, and WinBig does not collect or store sensitive payment information. The Company only receives confirmation of payment success or failure.',
                    'Refunds may be granted in specific cases such as non-delivery or defective products, subject to verification and approval, and are processed back to the original payment method within a reasonable timeframe. Refunds are not applicable for change of mind.',
                    'Prizes or rewards may include cash or goods and are governed by applicable promotional rules. All decisions related to payments, refunds, prizes, and disputes remain at the sole discretion of WinBig.',
                ]
            }
        ]
    };
}
