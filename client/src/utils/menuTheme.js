const titleStyle  = {
    fontFamily: '"Press Start 2P"',
    fontSize: '34px',
}

export const panelStyles = {
    borderRadius: '20px',
    background: 'rgba(9, 23, 18, 0.76) ',
    border: '1px solid rgba(203, 233, 186, 0.22)',
    backdropFilter: 'blur(8px)',
    boxSizing: 'border-box',
    fontFamily: '"Press Start 2P", sans-serif'
};

export function addMenuBackdrop(scene) {
    const width = scene.scale.width;
    const height = scene.scale.height;

    scene.cameras.main.setBackgroundColor('#091016');

    scene.add
        .image(width / 2, height / 2, 'menuForest')
        .setDisplaySize(width, height)

    scene.add
        .rectangle(width / 2, height / 2, width, height, 0x071018, 0.18)
        .setOrigin(0.5);
}

export function addBrandTitle(scene, y = 110, text = 'glimmer') {
    return scene.add
        .text(scene.scale.width / 2, y, text, titleStyle )
        .setOrigin(0.5);
}

export function applyMenuPanelStyles(element) {
    Object.assign(element.style, panelStyles);
}
