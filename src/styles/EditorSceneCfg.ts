const sidebarX = 50;
const sidebarImgToTextXOffset = 40;
const sidebarImgToTextYOffset = -22;
export const EditorSceneCfg = {
    playerStock: {
        img: {
            x: sidebarX,
            y: 200,
        },
        text: {
            x: sidebarX + sidebarImgToTextXOffset,
            y: 200 + sidebarImgToTextYOffset,
        },
    },
    playButton: {
        x: sidebarX,
        y: 200 + 80 * 1,
    },
    deleteCityButton: {
        x: sidebarX,
        y: 200 + 80 * 2,
    },
    startNewMapButton: {
        x: sidebarX,
        y: 200 + 80 * 3,
    },
    downloadButton: {
        x: sidebarX,
        y: 200 + 80 * 4,
    },
};
