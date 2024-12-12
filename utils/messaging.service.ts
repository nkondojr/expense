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

}
