import { Component } from '@angular/core';
import { LegalPageContent } from '../legal-content.model';

@Component({
    selector: 'app-terms-of-service',
    standalone: false,
    templateUrl: './terms-of-service.component.html'
})
export class TermsOfServiceComponent {
    content: LegalPageContent = {
        title: 'Terms and Conditions',
        subtitle: 'WinBig General Trading L.L.C. (“WinBig” or “Company”) is a company registered and licensed by the Department of Economic Development under license number 1371374. <br> WinBig operates through its website winbig.win, offering promotional products and related services.',
        sections: [
            {
                id: 'acceptance-of-terms',
                title: 'Acceptance of Terms',
                paragraphs: [
                    'By accessing or using the Website, you agree to comply with these Terms & Conditions, as well as any additional rules related to specific products, promotions, or services.',
                    'WinBig reserves the right to update or modify these Terms at any time.'
                ]
            },
            {
                id: 'account-registration',
                title: 'Account Registration',
                paragraphs: [
                    '•	Users must create an account with accurate and complete information ',
                    '•	Each user is allowed only one account ',
                    '•	Account credentials must be kept confidential; users are responsible for all activity under their account ',
                    '•	WinBig reserves the right to refuse, suspend, or close any account at its discretion '
                ]
            },
            {
                id: 'use-of-the-platform',
                title: 'Use of the Platform',
                paragraphs: [
                    '•	The Website must be used in compliance with applicable laws ',
                    '•	Any fraudulent activity, manipulation, or misuse of the platform is strictly prohibited ',
                    '•	WinBig may suspend or terminate accounts involved in misconduct or abuse '
                ]
            },
            {
                id: 'payments',
                title: 'Payments (Deposits)',
                paragraphs: [
                    '•	Payments are processed through authorised third-party payment providers (e.g., retailers, banks, or payment gateways) ',
                    '•	Users must provide payment details directly to these providers; WinBig does not store or process sensitive payment information ',
                    '•	Deposits can only be made using payment methods registered in the user’s name ',
                    '•	WinBig reserves the right to perform identity verification checks before or after any transaction ',
                    '•	All transactions may be monitored to prevent fraud, money laundering, or unauthorized use ',
                    '•	WinBig may refuse or cancel any transaction that is deemed suspicious or non-compliant '
                ]
            },
            {
                id: 'withdrawals',
                title: 'Withdrawals',
                paragraphs: [
                    '•	Withdrawal requests may be processed only after full account verification ',
                    '•	Funds will generally be returned using the same method used for deposit, where applicable ',
                    '•	WinBig may request identification documents (e.g., ID, passport, or driver’s license) before processing withdrawals ',
                    '•	Withdrawals are typically processed within 24 hours, subject to verification and operational constraints ',
                    '•	WinBig reserves the right to delay or decline withdrawals in cases of suspected fraud, misuse, or regulatory requirements '
                ]
            },
            {
                id: 'promotions',
                title: 'Promotions & Bonuses',
                paragraphs: [
                    '•	Each promotion is subject to its own specific terms and conditions ',
                    '•	Bonuses are personal and may be limited to one per user unless stated otherwise ',
                    '•	WinBig reserves the right to modify, suspend, or cancel promotions at any time ',
                    '•	Any misuse of promotions may result in cancellation of bonuses, winnings, and/or account suspension '
                ]
            },
            {
                id: 'inactive',
                title: 'Inactive & Dormant Accounts',
                paragraphs: [
                    '•	An account may be considered inactive if there is no activity for a defined period ',
                    '•	WinBig may apply administrative fees to inactive accounts with a positive balance ',
                    '•	Accounts with zero balance may be classified as dormant and may be closed at the Company’s discretion ',
                    '•	Where applicable, WinBig will attempt to notify the user before applying fees or closing the account ',
                    '•	Users are encouraged to maintain activity or withdraw funds to avoid inactivity status '
                ]
            },
            {
                id: 'account-closure',
                title: 'Account Closure',
                paragraphs: [
                    'Users may request account closure at any time. Any remaining balance will be communicated and can be withdrawn prior to closure.'
                ]
            },
            {
                id: 'fraud',
                title: 'Fraud & Security',
                paragraphs: [
                    'WinBig reserves the right to:',
                    '•	Investigate and report suspicious or illegal activity ',
                    '•	Suspend or permanently close accounts involved in fraud ',
                    '•	Cancel transactions or participation where misuse is detected ',
                    '•	Cooperate with authorities and provide required information when necessary '
                ]
            },
            {
                id: 'pricing',
                title: 'Pricing',
                paragraphs: [
                    'All prices are displayed in AED and may be updated at any time without prior notice.'
                ]
            },
            {
                id: 'liability',
                title: 'Liability & Service Availability',
                paragraphs: [
                    'WinBig may suspend or interrupt the Website for maintenance or operational reasons.',
                    'The Company is not liable for interruptions or technical issues beyond its control.'
                ]
            },
            {
                id: 'governing-law',
                title: 'Governing Law',
                paragraphs: [
                    'These Terms are governed by the laws of the UAE. Any disputes shall fall under the jurisdiction of UAE courts.'
                ]
            },
            {
                id: 'general',
                title: 'General',
                paragraphs: [
                    'If any provision of these Terms is found invalid or unenforceable, the remaining provisions shall remain in full force.'
                ]
            },
            {
                id: 'address',
                title: 'Address',
                paragraphs: [
                    'You may contact us by sending us an e-mail to <a href="mailto:info@winbiggt.com">info@winbiggt.com</a> ',
                    '•	Our office is located at:',
                    'St number 1, Sultan Bin Khalifa Bin Zayed Al Nhyan <br>Mall 1<br>Dubai, United Arab Emirates'
                ]
            },
        ]
    };
}
