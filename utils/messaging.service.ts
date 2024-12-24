import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MessagingService {
    private readonly baseUrl = 'https://messaging-service.co.tz'; // Update if there's a different base URL
    private readonly apiKey = process.env.NEXTSMS_API_KEY; // Store securely in environment variables
    private readonly apiSecret = process.env.NEXTSMS_API_SECRET; // Store securely in environment variables

    async sendSms(to: string, text: string): Promise<void> {
    try {
        const authHeader = `Basic ${Buffer.from(
            `${this.apiKey}:${this.apiSecret}`,
        ).toString('base64')}`;

        console.log('Authorization Header:', authHeader); // Log the authorization header to check if it's correctly formed
        console.log('SMS Request:', {
            from: 'e-CU App',
            to,
            text,
        });

        const response = await axios.post(
            `${this.baseUrl}/api/sms/v1/text/single`,
            {
                from: 'e-CU App', // Replace with your registered NextSMS Sender ID
                to,
                text,
            },
            {
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            },
        );

        if (response.data.status !== 'success') {
            throw new InternalServerErrorException(
                `Failed to send SMS: ${response.data.text || 'Unknown error'}`,
            );
        }

        console.log(`Sending SMS to ${to}: ${text}`);
        console.log('SMS sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending SMS:', error.response?.data || error.text);
        throw new InternalServerErrorException('Failed to send SMS');
    }
}

    async sendBulkSms(numbers: string[], text: string): Promise<void> {
        const errors = [];
        for (const number of numbers) {
            try {
                await this.sendSms(number, text);
            } catch (error) {
                errors.push({ number, error: error.message });
            }
        }
        if (errors.length) {
            console.error('Errors sending bulk SMS:', errors);
            throw new InternalServerErrorException(
                'Failed to send SMS to some recipients. Check logs for details.',
            );
        }
        console.log('Bulk SMS sent successfully');
    }
}


const messagingService = new MessagingService();

const mobileNumbers = [
    '255748867304', //Rinward
    '255713951999', //Winnie
    '255697931196', //Zaudati
    '255626602200', //Witty
    '255785701768', //Mbeke
    '255625395553', //Nyelu
    '255627229912', //Kassim
    '255621555169', //Pedro
    '255718352944', //Salum
    '255742073002', //Macheyeki
    '255623344513', //Mtweve
    '255768897274', //George
    // Add more numbers as needed
];

const message = `Expense Management System

From Qela Technologies (T) Ltd:

Merry Christmas & Happy New Year 2025! Enjoy your day, and we wish you all the best in your future endeavors & prosperity.
`;

// Set the desired time to send the SMS
const targetTime = new Date('2024-12-25T03:30:00'); // Midnight on Christmas

const now = new Date();
const timeDifference = targetTime.getTime() - now.getTime();

if (timeDifference > 0) {
    console.log(
        `SMS scheduled to be sent at ${targetTime.toISOString()} (${targetTime.toLocaleString()})`,
    );
    setTimeout(() => {
        messagingService
            .sendBulkSms(mobileNumbers, message)
            .then(() => console.log('All SMS sent successfully'))
            .catch((error) => console.error('Error sending bulk SMS:', error.message));
    }, timeDifference);
} else {
    console.error('The specified time has already passed.');
}
