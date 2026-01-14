import { NextResponse } from 'next/server';

const mockCountryEvents = [
    { country: 'United States', events: 5342 },
    { country: 'China', events: 4521 },
    { country: 'Russia', events: 3890 },
    { country: 'Germany', events: 2456 },
    { country: 'Brazil', events: 1987 },
    { country: 'India', events: 1654 },
    { country: 'UK', events: 1432 },
    { country: 'France', events: 1234 },
    { country: 'Japan', events: 987 },
    { country: 'Australia', events: 765 },
];

export async function GET() {
    await new Promise(resolve => setTimeout(resolve, 50));
    return NextResponse.json(mockCountryEvents);
}
