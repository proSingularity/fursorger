import { GameObjects } from "phaser";
import { Color } from "./Color";

type Style = Partial<Phaser.Types.GameObjects.Text.TextStyle>;

export const TextConfig: { [key: string]: Style } = {
    title: {
        fontFamily: "FellEnglishSC",
        fontSize: "118px",
        color: Color.WhiteSilver,
    },
    subTitle: {
        fontFamily: "Metamorphous",
        color: Color.WhiteSilver,
    },
    creditsHeader: {
        fontFamily: "Metamorphous",
        fontSize: "40px",
        color: Color.WhiteSilver,
    },
    credits: {
        fontFamily: "Metamorphous",
        fontSize: "20px",
        color: Color.WhiteSilver,
        align: "left",
    },
    banner: {
        fontFamily: "Metamorphous",
        fontSize: "28px",
        color: Color.WhiteSilver,
    },
    version: {
        fontFamily: "Metamorphous",
        color: Color.WhiteSilver,
    },
    xl: {
        fontFamily: "Metamorphous",
        fontSize: "32px",
        color: Color.Black,
    },
    lg: {
        fontFamily: "Metamorphous",
        fontSize: "18px",
        color: Color.Black,
    },
    md: {
        fontFamily: "Metamorphous",
        fontSize: "16px",
        color: Color.Black,
    },
    sm: {
        fontFamily: "Metamorphous",
        fontSize: "12px",
        color: Color.Black,
    },
    debug: {
        fontFamily: "Courier",
        fontSize: "12px",
        color: Color.HackerGreen,
    },
};

export const setDefaultTextStyle = (text: GameObjects.Text) =>
    text.setStyle(TextConfig.lg).setColor(Color.Black);
