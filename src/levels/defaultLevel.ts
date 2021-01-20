import { ILevel } from './ILevel';

export const defaultLevel: ILevel = {
    name: 'My Level',
    cities: [
        {
            name: 'Rome',
            production: 0,
            stock: 0,
            x: 900,
            y: 350,
        },
        {
            name: 'Cathargo',
            production: 0,
            stock: 0,
            x: 200,
            y: 300,
        },
    ],
    travelPaths: [
        {
            first: 'Rome',
            second: 'Cathargo',
        },
    ],
    background: 'background2',
    player: {
        stock: 0,
        location: 'Rome',
    },
};
