function loadScript(url) {
    return new Promise((resolve, reject) => {
        // Check if the script is already loaded
        if (document.querySelector(`script[src="${url}"]`)) {
            resolve();
            return;
        }
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Script loading failed for ' + url));
        document.head.appendChild(script);
    });
}
class OutdoorScene extends Phaser.Scene {
    constructor() {
        super('OutdoorScene');
    }
    init() {
        console.log('OutdoorScene init');
    }
    create() {
        console.log('OutdoorScene create');
        // Your existing create logic here
    }

    preload() {
        this.load.image('background', 'https://play.rosebud.ai/assets/1.png?95lG');
        this.load.spritesheet('character_idle', 'https://play.rosebud.ai/assets/Idel Animation 48x48.png?OV5d', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('character_run', 'https://play.rosebud.ai/assets/Run Animation 48x48.png?1tjB', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.image('hologram', 'https://play.rosebud.ai/assets/Lovepik_com-380234703-blue-magic-light-effect-creative-aperture-gradient.png?BAtX');
        this.load.image('leftArrow', 'https://play.rosebud.ai/assets/Left-Arrow.png?YAQS');
        this.load.image('upArrow', 'https://play.rosebud.ai/assets/Up-Arrow.png?Gckf');
        this.load.image('downArrow', 'https://play.rosebud.ai/assets/Down-Arrow.png?NY03');
        this.load.image('rightArrow', 'https://play.rosebud.ai/assets/Right-Arrow.png?1z0S');
        this.load.image('squareFrame', 'https://play.rosebud.ai/assets/—Pngtree—white square frame border_5054088.png?g3yI');
    }

    create(data) {
        const backgroundImage = this.textures.get('background').getSourceImage();
        const worldWidth = backgroundImage.width;
        const worldHeight = backgroundImage.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.add.image(worldWidth / 2, worldHeight / 2, 'background').setOrigin(0.5);
        // Set character position based on where they're coming from
        if (data && data.fromMMCOE) {
            this.character = this.physics.add.sprite(data.exitX || 1500, data.exitY || 800, 'character_idle');
        } else {
            this.character = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'character_idle');
        }
        this.character.setCollideWorldBounds(true);
        this.character.setScale(2); // Increased from 1.5 to 2
        // Create animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('character_idle', {
                start: 0,
                end: 5
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('character_run', {
                start: 0,
                end: 7
            }),
            frameRate: 10,
            repeat: -1
        });
        // Start with idle animation
        this.character.play('idle');
        if (data && data.fadeIn) {
            this.cameras.main.fadeIn(1000);
        }
        const hologram = this.add.image(worldWidth * 0.92, worldHeight * 0.92, 'hologram');
        hologram.setScale(0.15);
        // Highlight MMCOE entry point with blue rectangle
        this.add.rectangle(worldWidth * 0.92, worldHeight * 0.92, 100, 100, 0x0000ff, 0).setOrigin(0.5);
        const mmcoeText = this.add.text(worldWidth * 0.88, worldHeight * 0.73, 'MMCOE', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        mmcoeText.setOrigin(0.5);

        // Add interaction zone for entering MMCOE (on the hologram)
        const enterZone = this.add.zone(worldWidth * 0.92, worldHeight * 0.92, 100, 100);
        this.physics.add.existing(enterZone, true);

        this.physics.add.overlap(this.character, enterZone, this.enterMMCOE, null, this);

        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.character, true, 0.05, 0.05);
        this.cameras.main.setZoom(1);

        this.cursors = this.input.keyboard.createCursorKeys();
        // Create arrow controls
        this.createArrowControls();
    }
    createArrowControls() {
        const {
            width,
            height
        } = this.scale;
        const arrowScale = 0.7; // Increased from 0.5 to 0.7 for bigger arrows
        const hitAreaScaler = 1.5; // Increase hit area for better touch sensitivity
        const padding = 30; // Reduced padding for tighter grouping
        const squareSize = 120; // Approximate size of the square frame
        const centerX = width - 190;
        const centerY = height - 120;

        this.leftArrow = this.add.image(centerX - squareSize / 2 - padding, centerY, 'leftArrow')
            .setScale(arrowScale)
            .setScrollFactor(0)
            .setInteractive({
                useHandCursor: true
            })
            .setOrigin(0.5);

        this.rightArrow = this.add.image(centerX + squareSize / 2 + padding, centerY, 'rightArrow')
            .setScale(arrowScale)
            .setScrollFactor(0)
            .setInteractive({
                useHandCursor: true
            })
            .setOrigin(0.5);

        this.upArrow = this.add.image(centerX, centerY - squareSize / 2 - padding, 'upArrow')
            .setScale(arrowScale)
            .setScrollFactor(0)
            .setInteractive({
                useHandCursor: true
            })
            .setOrigin(0.5);

        this.downArrow = this.add.image(centerX, centerY + squareSize / 2 + padding, 'downArrow')
            .setScale(arrowScale)
            .setScrollFactor(0)
            .setInteractive({
                useHandCursor: true
            })
            .setOrigin(0.5);

        // Add the square frame in the center of the arrows
        this.squareFrame = this.add.image(centerX, centerY, 'squareFrame')
            .setScale(0.07) // Keep the same scale for the square frame
            .setScrollFactor(0)
            .setOrigin(0.5);
        // Calculate the size of the square frame
        const frameWidth = this.squareFrame.width * this.squareFrame.scaleX;
        const frameHeight = this.squareFrame.height * this.squareFrame.scaleY;
        // Add the green semi-transparent box inside the square frame
        this.greenBox = this.add.rectangle(centerX - 20, centerY - 20, frameWidth * 0.7, frameHeight * 0.7, 0x00ff00, 0.5)
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setInteractive({
                useHandCursor: true
            })
            .setVisible(false);
        this.greenBoxText = this.add.text(centerX - 20, centerY - 20, 'Interact', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: {
                x: 5,
                y: 3
            }
        }).setOrigin(0.5).setScrollFactor(0).setVisible(false);
        // Add event listener for green box interaction
        this.greenBox.on('pointerdown', () => {
            if (typeof this.isNearRishabh === 'function' && this.isNearRishabh()) {
                this.interact('rishabh');
            }
        });
        // Make sure the square frame and green box are always on top
        this.squareFrame.setDepth(1000);
        this.greenBox.setDepth(1001);
        this.greenBoxText.setDepth(1002);
        // Increase hit area for each arrow
        [this.leftArrow, this.rightArrow, this.upArrow, this.downArrow].forEach(arrow => {
            const hitArea = new Phaser.Geom.Circle(
                arrow.width / 2,
                arrow.height / 2,
                Math.max(arrow.width, arrow.height) / 2 * hitAreaScaler
            );
            arrow.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
        });
        // Add input handling for arrow controls
        this.leftArrow.on('pointerdown', () => {
            this.leftArrowDown = true;
        });
        this.leftArrow.on('pointerup', () => {
            this.leftArrowDown = false;
        });
        this.leftArrow.on('pointerout', () => {
            this.leftArrowDown = false;
        });
        this.rightArrow.on('pointerdown', () => {
            this.rightArrowDown = true;
        });
        this.rightArrow.on('pointerup', () => {
            this.rightArrowDown = false;
        });
        this.rightArrow.on('pointerout', () => {
            this.rightArrowDown = false;
        });
        this.upArrow.on('pointerdown', () => {
            this.upArrowDown = true;
        });
        this.upArrow.on('pointerup', () => {
            this.upArrowDown = false;
        });
        this.upArrow.on('pointerout', () => {
            this.upArrowDown = false;
        });
        this.downArrow.on('pointerdown', () => {
            this.downArrowDown = true;
        });
        this.downArrow.on('pointerup', () => {
            this.downArrowDown = false;
        });
        this.downArrow.on('pointerout', () => {
            this.downArrowDown = false;
        });
    }

    enterMMCOE() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('GroundFloorScene', {
                    fromOutdoor: true,
                    fadeIn: true
                });
            }
        });
    }
    update() {
        const speed = 600;
        let velocityX = 0;
        let velocityY = 0;
        if (this.cursors.left.isDown || this.leftArrowDown) {
            velocityX = -speed;
            this.character.setFlipX(true);
        } else if (this.cursors.right.isDown || this.rightArrowDown) {
            velocityX = speed;
            this.character.setFlipX(false);
        }
        if (this.cursors.up.isDown || this.upArrowDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.downArrowDown) {
            velocityY = speed;
        }
        this.character.setVelocity(velocityX, velocityY);
        // If no movement, ensure the character is completely stopped and play idle animation
        if (velocityX === 0 && velocityY === 0) {
            this.character.body.reset(this.character.x, this.character.y);
            if (this.character.anims.currentAnim.key !== 'idle') {
                this.character.play('idle');
            }
        } else {
            // If moving, play run animation
            if (this.character.anims.currentAnim.key !== 'run') {
                this.character.play('run');
            }
        }
        // Check if near Rishabh and update green box visibility
        if (typeof this.isNearRishabh === 'function' && this.isNearRishabh()) {
            this.showGreenBox();
        } else {
            this.hideGreenBox();
        }
    }
    showGreenBox() {
        if (this.greenBox && this.greenBoxText) {
            this.greenBox.setVisible(true);
            this.greenBoxText.setVisible(true);
        }
    }
    hideGreenBox() {
        if (this.greenBox && this.greenBoxText) {
            this.greenBox.setVisible(false);
            this.greenBoxText.setVisible(false);
        }
    }
}
// Shared method for creating arrow controls
function createArrowControls(scene) {
    const {
        width,
        height
    } = scene.scale;
    const arrowScale = 1.2;
    const hitAreaScaler = 1.5;
    const padding = 10; // Reduced padding
    const squareSize = 200;
    const centerX = width - squareSize / 2 - padding; // Moved to the extreme right
    const centerY = height - squareSize / 2 - 10;
    scene.leftArrow = scene.add.image(centerX - squareSize / 2 - padding, centerY, 'leftArrow')
        .setScale(arrowScale)
        .setScrollFactor(0)
        .setInteractive({
            useHandCursor: true
        })
        .setOrigin(0.5);
    scene.rightArrow = scene.add.image(centerX + squareSize / 2 + padding, centerY, 'rightArrow')
        .setScale(arrowScale)
        .setScrollFactor(0)
        .setInteractive({
            useHandCursor: true
        })
        .setOrigin(0.5);
    scene.upArrow = scene.add.image(centerX, centerY - squareSize / 2 - padding, 'upArrow')
        .setScale(arrowScale)
        .setScrollFactor(0)
        .setInteractive({
            useHandCursor: true
        })
        .setOrigin(0.5);
    scene.downArrow = scene.add.image(centerX, centerY + squareSize / 2 + padding, 'downArrow')
        .setScale(arrowScale)
        .setScrollFactor(0)
        .setInteractive({
            useHandCursor: true
        })
        .setOrigin(0.5);
    scene.squareFrame = scene.add.image(centerX, centerY, 'squareFrame')
        .setScale(0.12) // Increased from 0.07 to 0.12
        .setScrollFactor(0)
        .setOrigin(0.5);
    [scene.leftArrow, scene.rightArrow, scene.upArrow, scene.downArrow].forEach(arrow => {
        const hitArea = new Phaser.Geom.Circle(
            arrow.width / 2,
            arrow.height / 2,
            Math.max(arrow.width, arrow.height) / 2 * hitAreaScaler
        );
        arrow.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    });
    scene.leftArrow.on('pointerdown', () => {
        scene.leftArrowDown = true;
    });
    scene.leftArrow.on('pointerup', () => {
        scene.leftArrowDown = false;
    });
    scene.leftArrow.on('pointerout', () => {
        scene.leftArrowDown = false;
    });
    scene.rightArrow.on('pointerdown', () => {
        scene.rightArrowDown = true;
    });
    scene.rightArrow.on('pointerup', () => {
        scene.rightArrowDown = false;
    });
    scene.rightArrow.on('pointerout', () => {
        scene.rightArrowDown = false;
    });
    scene.upArrow.on('pointerdown', () => {
        scene.upArrowDown = true;
    });
    scene.upArrow.on('pointerup', () => {
        scene.upArrowDown = false;
    });
    scene.upArrow.on('pointerout', () => {
        scene.upArrowDown = false;
    });
    scene.downArrow.on('pointerdown', () => {
        scene.downArrowDown = true;
    });
    scene.downArrow.on('pointerup', () => {
        scene.downArrowDown = false;
    });
    scene.downArrow.on('pointerout', () => {
        scene.downArrowDown = false;
    });
}
class MMCOEScene extends Phaser.Scene {
    constructor() {
        super('MMCOEScene');
        this.interactionMessageVisible = false;
        this.interactionZone = null;
    }
    isNearRishabh() {
        if (!this.rishabh || !this.character) return false;
        const distance = Phaser.Math.Distance.Between(
            this.character.x, this.character.y,
            this.rishabh.x, this.rishabh.y
        );
        return distance < 200; // Adjust this value to change the activation distance
    }
    preload() {
        this.load.image('mmcoeMap', 'https://play.rosebud.ai/assets/MMCOE MAP 2nd Floor- LABS.png?CuJ0');
        this.load.spritesheet('character_idle', 'https://play.rosebud.ai/assets/Idel Animation 48x48.png?OV5d', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('character_run', 'https://play.rosebud.ai/assets/Run Animation 48x48.png?1tjB', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.image('rishabh', 'https://play.rosebud.ai/assets/3badee8d7d5d93d673e787e4fbdc940e.png?43or');
        this.load.image('lift', 'https://play.rosebud.ai/assets/lift.png?PLACEHOLDER');
    }
    create(data) {
        const mmcoeMap = this.add.image(0, 0, 'mmcoeMap').setOrigin(0);
        const worldWidth = mmcoeMap.width;
        const worldHeight = mmcoeMap.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.isEnteringLift = false; // Initialize the isEnteringLift property
        // Create arrow controls
        createArrowControls(this);
        // Green box and its text removed
        // Set character position based on where they're coming from
        if (data.fromOutdoor) {
            this.character = this.physics.add.sprite(worldWidth - 50, worldHeight - 50, 'character_idle');
        } else if (data.fromEEL || data.fromPhysicsLab || data.fromLift) {
            this.character = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'character_idle');
        } else {
            this.character = this.physics.add.sprite(100, worldHeight - 100, 'character_idle');
        }
        this.character.setScale(6); // Increased to 6
        this.character.setCollideWorldBounds(true);
        // Create animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('character_idle', {
                start: 0,
                end: 5
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('character_run', {
                start: 0,
                end: 7
            }),
            frameRate: 10,
            repeat: -1
        });
        // Start with idle animation
        this.character.play('idle');
        console.log('Animations created:', this.anims.anims.size);
        // Remove the conditional scaling
        // Fade in the scene if coming from EEL
        if (data.fadeIn) {
            this.cameras.main.fadeIn(1000);
            this.character.body.moves = false; // Disable movement during fade-in
            this.time.delayedCall(1000, () => {
                this.character.body.moves = true; // Re-enable movement after fade-in
            });
        }

        // Add a table instead of a chair
        this.table = this.add.rectangle(worldWidth * 0.1, worldHeight * 0.75, 100, 50, 0x8B4513);
        // Add Rishabh sitting behind the table
        this.rishabh = this.add.image(worldWidth * 0.1, worldHeight * 0.7, 'rishabh');
        this.rishabh.setScale(0.25);
        // Add lift exactly between the two labs at the top middle
        this.lift = this.add.image(worldWidth * 0.5, worldHeight * 0.1, 'lift');
        this.lift.setScale(0.2); // Adjust scale as needed
        // Add an invisible box to represent the lift portal
        this.liftPortal = this.add.rectangle(worldWidth * 0.5, worldHeight * 0.1, 100, 100, 0xFFA500, 0);
        this.liftPortal.setOrigin(0.5);
        this.liftPortal.setDepth(1); // Set depth lower than the character
        this.physics.add.existing(this.liftPortal, true); // Add static physics body to the liftPortal
        // Add overlap detection for automatic lift entry
        this.physics.add.overlap(this.character, this.liftPortal, this.enterLift, null, this);
        // Add an invisible marker for the EEL portal
        this.eelPortal = this.add.rectangle(worldWidth * 0.18, worldHeight * 0.42, 150, 150, 0x00ff00, 0);
        this.eelPortal.setOrigin(0.5);
        this.physics.add.existing(this.eelPortal, true); // Add static physics body
        // Add interaction zones
        // Create interaction zone for the table
        this.tableZone = this.add.zone(worldWidth * 0.08, worldHeight * 0.8, 800, 800);
        this.physics.add.existing(this.tableZone, true);
        // Add cyan box to visualize the interaction zone
        this.interactionZone = this.add.rectangle(
            this.tableZone.x,
            this.tableZone.y,
            800,
            800,
            0x00FFFF,
            0 // Set alpha to 0 to make it invisible
        );
        this.interactionZone.setOrigin(0.5);
        this.interactionZone.setDepth(1); // Keep the depth setting for proper layering
        this.physicsLabZone = this.add.rectangle(worldWidth * 0.82, worldHeight * 0.42, 50, 50, 0xffff00, 0);
        this.physics.add.existing(this.physicsLabZone, true);
        // Create and adjust Lift zone
        this.liftZone = this.add.zone(worldWidth * 0.5, worldHeight * 0.3, 250, 250);
        this.physics.add.existing(this.liftZone, true);
        // Create overlap check for the liftBox
        this.physics.add.overlap(this.character, this.liftBox, this.handleLiftInteraction, null, this);

        // The lift portal and its related interactions have been removed
        // The EEL entry portal is part of the background image, no need to add it here
        // Exit portal has been deactivated
        // this.portalZone = this.add.zone(worldWidth - 50, worldHeight - 50, 100, 100);
        // this.physics.add.existing(this.portalZone, true);
        // Portal functionality removed
        // this.portalActive = false;
        // Portal activation removed
        // this.time.delayedCall(5000, () => {
        //     this.portalActive = true;
        //     console.log("Portal activated!");
        // }, [], this);
        // Overlap detection for portal removed
        this.physics.add.overlap(this.character, this.tableZone, this.enterTableZone, null, this);
        this.physics.world.on('worldbounds', this.onWorldBounds, this);
        this.physics.add.overlap(this.character, this.physicsLabZone, this.enterPhysicsLabZone, null, this);
        this.physics.add.overlap(this.character, this.liftZone, this.enterLiftZone, null, this);
        this.physics.add.overlap(this.character, this.liftPortal, this.enterLift, null, this);

        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.character, true, 0.05, 0.05);
        this.cameras.main.setZoom(0.35); // Zoomed out further

        this.cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.lKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        // Create interaction text
        this.interactionText = this.add.text(0, 0, 'Press E to Interact', {
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: {
                x: 15,
                y: 10
            }
        });
        this.interactionText.setOrigin(0, 1);
        this.interactionText.setScrollFactor(1);
        this.interactionText.setDepth(1000);
        this.interactionText.setVisible(false);
        // Initialize dialogue-related properties
        this.dialogueBox = null;
        this.dialogueText = null;
        this.currentDialogue = 0;
        this.dialogues = {
            rishabh: [
                "Hi There!",
                "There are two labs on this floor.",
                "The first lab is the Engineering Exploration Lab, where you can explore various engineering concepts.",
                "The second lab is the Physics Lab, where you can conduct experiments and study physical phenomena.",
                "There's also a lift between the two labs at the top middle of the floor for easy access to other floors."
            ],
            physicsLab: [
                "Welcome to the Physics Lab!",
                "This is where you can conduct experiments and study physical phenomena.",
                "Safety first! Always wear proper protective equipment when performing experiments."
            ],
            lift: [
                "This is the lift.",
                "It provides easy access to other floors of the building.",
                "Which floor would you like to go to?"
            ]
        };
        this.currentInteraction = null;
        // Remove interaction text as it's no longer needed
        // Disable player movement initially
        this.playerCanMove = false;
        // Enable player movement after a short delay
        this.time.delayedCall(1000, () => {
            this.playerCanMove = true;
        });
        // Create the interaction button (initially hidden)
        this.createInteractionButton();
    }
    createInteractionButton() {
        const buttonWidth = 100;
        const buttonHeight = 50;
        this.interactionButton = this.add.rectangle(
            this.cameras.main.width - buttonWidth / 2 - 10,
            this.cameras.main.height - buttonHeight / 2 - 10,
            buttonWidth,
            buttonHeight,
            0x00ff00,
            0.5
        );
        this.interactionButton.setScrollFactor(0);
        this.interactionButton.setDepth(1000);
        this.interactionButton.setInteractive();
        this.interactionButton.on('pointerdown', this.handleInteraction, this);
        this.interactionButton.visible = false;
        this.interactionButtonText = this.add.text(
            this.interactionButton.x,
            this.interactionButton.y,
            'Interact', {
                fontSize: '18px',
                fill: '#ffffff'
            }
        );
        this.interactionButtonText.setOrigin(0.5);
        this.interactionButtonText.setScrollFactor(0);
        this.interactionButtonText.setDepth(1001);
        this.interactionButtonText.visible = false;
    }
    checkNearRishabh() {
        const distance = Phaser.Math.Distance.Between(
            this.character.x, this.character.y,
            this.rishabh.x, this.rishabh.y
        );
        return distance < 200; // Adjust this value to change the activation distance
    }
    // usePortal method removed as it's no longer needed
    // usePortal() {
    //     if (this.portalActive) {
    //         this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
    //             if (progress === 1) {
    //                 this.scene.start('OutdoorScene', {
    //                     fadeIn: true
    //                 });
    //             }
    //         });
    //     }
    // }
    enterTableZone(character, zone) {
        if (!this.interactionMessageVisible) {
            this.showInteractionMessage('table');
        }
    }
    onWorldBounds() {
        this.hideInteractionMessage();
    }
    showInteractionMessage(interactionType) {
        if (interactionType === 'table') {
            // Position the text above the table, visible from a greater distance
            const textX = this.table.x + 400; // Shifted 400 pixels to the right (reduced from 500)
            const textY = this.table.y - 300; // Increased distance above the table (from 250 to 300)
            this.interactionText.setPosition(textX, textY);
            this.interactionText.setText('Press E to Interact');
            this.interactionText.setVisible(true);
            this.currentInteraction = interactionType;
            this.interactionMessageVisible = true;
        }
    }
    hideInteractionMessage() {
        this.interactionText.setVisible(false);
        this.currentInteraction = null;
        this.interactionMessageVisible = false;
    }
    isNearTable() {
        return Phaser.Geom.Intersects.RectangleToRectangle(
            this.character.getBounds(),
            this.tableZone.getBounds()
        );
    }

    showDialogue() {
        if (!this.dialogues[this.currentInteraction] || this.dialogues[this.currentInteraction].length === 0) {
            console.log(`No dialogue found for ${this.currentInteraction}`);
            return;
        }
        const {
            width,
            height
        } = this.sys.game.config;
        const boxHeight = 150; // Increased box height
        this.dialogueBox = this.add.rectangle(width / 2, height, width, boxHeight, 0x000000, 0.8);
        this.dialogueBox.setOrigin(0.5, 1);
        this.dialogueBox.setScrollFactor(0);
        this.dialogueText = this.add.text(width / 2, height - boxHeight / 2, this.dialogues[this.currentInteraction][this.currentDialogue], {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            wordWrap: {
                width: width - 40
            }
        });
        this.dialogueText.setOrigin(0.5);
        this.dialogueText.setScrollFactor(0);
    }
    nextDialogue() {
        this.currentDialogue++;
        if (this.currentDialogue < this.dialogues[this.currentInteraction].length) {
            this.dialogueText.setText(this.dialogues[this.currentInteraction][this.currentDialogue]);
        } else {
            this.dialogueBox.destroy();
            this.dialogueText.destroy();
            this.dialogueBox = null;
            this.dialogueText = null;
            this.currentDialogue = 0;
        }
    }
    interact(interactionType) {
        this.currentInteraction = interactionType || this.currentInteraction;
        if (!this.dialogueBox && this.dialogues[this.currentInteraction]) {
            this.showDialogue();
        } else if (this.dialogueBox) {
            this.nextDialogue();
        }
        console.log(`Interacting with ${this.currentInteraction}`); // Add this line for debugging
    }

    update() {
        const speed = 800;
        if (this.isNearLift && !this.isEnteringLift) {
            this.enterLift();
        }
        if (this.playerCanMove) {
            let velocityX = 0;
            let velocityY = 0;
            if (this.cursors.left.isDown || this.leftArrowDown) {
                velocityX = -speed;
                this.character.setFlipX(true);
            } else if (this.cursors.right.isDown || this.rightArrowDown) {
                velocityX = speed;
                this.character.setFlipX(false);
            }
            if (this.cursors.up.isDown || this.upArrowDown) {
                velocityY = -speed;
            } else if (this.cursors.down.isDown || this.downArrowDown) {
                velocityY = speed;
            }
            this.character.setVelocity(velocityX, velocityY);
            // Play the appropriate animation
            if (velocityX !== 0 || velocityY !== 0) {
                if (this.character.anims.currentAnim.key !== 'run') {
                    this.character.play('run');
                }
            } else {
                if (this.character.anims.currentAnim.key !== 'idle') {
                    this.character.play('idle');
                }
            }
        } else {
            this.character.setVelocity(0, 0);
            if (this.character.anims.currentAnim.key !== 'idle') {
                this.character.play('idle');
            }
        }

        // Debug logging
        console.log('Current animation:', this.character.anims.currentAnim ? this.character.anims.currentAnim.key : 'none');
        console.log('Velocity:', this.character.body.velocity.x, this.character.body.velocity.y);
        // Check if Arya is in the interaction zone and show/hide interaction box
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.character.getBounds(), this.tableZone.getBounds())) {
            if (!this.interactionMessageVisible) {
                this.showInteractionMessage('table');
            }
            if (this.squareFrame) {
                this.squareFrame.setTint(0x00ff00); // Change color when in the interaction zone
            }
            // Show the interaction button when near Rishabh
            this.interactionButton.visible = true;
            this.interactionButtonText.visible = true;
        } else {
            this.hideInteractionMessage();
            if (this.squareFrame) this.squareFrame.clearTint(); // Reset color when outside the zone
            // Hide the interaction button when not near Rishabh
            this.interactionButton.visible = false;
            this.interactionButtonText.visible = false;
        }
        // Check for 'E' key press when in the interaction zone and interaction message is visible
        if (Phaser.Input.Keyboard.JustDown(this.eKey) &&
            Phaser.Geom.Intersects.RectangleToRectangle(this.character.getBounds(), this.tableZone.getBounds()) &&
            this.interactionMessageVisible) {
            this.interact('rishabh');
        }
        // Check for key presses to interact with specific zones
        if (Phaser.Input.Keyboard.JustDown(this.rKey) && Phaser.Geom.Intersects.RectangleToRectangle(this.character.getBounds(), this.physicsLabZone.getBounds())) {
            this.interact('physicsLab');
        }
        if (Phaser.Input.Keyboard.JustDown(this.lKey) && Phaser.Geom.Intersects.RectangleToRectangle(this.character.getBounds(), this.liftZone.getBounds())) {
            this.interact('lift');
        }
        // Check for entering EEL
        this.physics.add.overlap(this.character, this.eelPortal, this.enterEEL, null, this);
        // Check for entering Physics Lab
        this.physics.add.overlap(this.character, this.physicsLabZone, this.enterPhysicsLab, null, this);
        // Check for entering EEL
        this.physics.add.overlap(this.character, this.eelPortal, this.enterEEL, null, this);
        // Check for entering Lift removed as it's now automatic
    }
    handleInteraction() {
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.character.getBounds(), this.tableZone.getBounds())) {
            this.interact('rishabh');
        }
    }
    isNearLift() {
        const distance = Phaser.Math.Distance.Between(
            this.character.x, this.character.y,
            this.liftBox.x, this.liftBox.y
        );
        return distance < 100; // Adjust this value to change the activation distance
    }
    enterLift() {
        if (this.isEnteringLift) return; // Prevent multiple calls

        // Check if the character is close enough to the lift portal
        const distance = Phaser.Math.Distance.Between(
            this.character.x, this.character.y,
            this.liftPortal.x, this.liftPortal.y
        );

        if (distance < 50) { // Adjust this value to change the activation distance
            this.isEnteringLift = true;
            console.log("Entering Lift");
            this.playerCanMove = false; // Disable player movement
            this.character.setVelocity(0, 0); // Stop any current movement
            this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
                if (progress === 1) {
                    this.scene.start('LiftScene', {
                        fadeIn: true
                    });
                }
            });
        }
    }
    enterPhysicsLab() {
        console.log("Entering Physics Lab");
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('PhysicsLabScene', {
                    entryX: 400,
                    entryY: 950,
                    fadeIn: true
                });
            }
        });
    }
    enterEEL() {
        console.log("Entering EEL");
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('EELScene', {
                    entryX: 450,
                    entryY: 950,
                    fadeIn: true
                });
            }
        });
    }
}
class EELScene extends Phaser.Scene {
    constructor() {
        super('EELScene');
        this.quizStarted = false;
        this.triggerRange = null;
    }
    preload() {
        this.load.image('eelBackground', 'https://play.rosebud.ai/assets/EEL.png?CT0z');
        this.load.spritesheet('character_idle', 'https://play.rosebud.ai/assets/Idel Animation 48x48.png?OV5d', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('character_run', 'https://play.rosebud.ai/assets/Run Animation 48x48.png?1tjB', {
            frameWidth: 48,
            frameHeight: 48
        });
    }
    create(data) {
        const eelMap = this.add.image(0, 0, 'eelBackground').setOrigin(0);
        const worldWidth = eelMap.width;
        const worldHeight = eelMap.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        // Create arrow controls
        createArrowControls(this);
        // Create blue rectangle
        this.createBlueRectangle();
        // Set character position based on entry point
        let entryX, entryY;
        if (data.fromQuiz) {
            // Position near the blue rectangle when coming from quiz
            entryX = this.blueRectangle.x + 150;
            entryY = this.blueRectangle.y + 100;
        } else {
            entryX = data.entryX || 450;
            entryY = data.entryY || 950;
        }
        this.character = this.physics.add.sprite(entryX, entryY, 'character_idle');
        if (data.fadeIn) {
            this.cameras.main.fadeIn(1000);
            this.character.setAlpha(0);
            this.tweens.add({
                targets: this.character,
                alpha: 1,
                duration: 1000
            });
        }
        this.character.setCollideWorldBounds(true);
        this.character.setScale(6); // Increased to 6
        // Create animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('character_idle', {
                start: 0,
                end: 5
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('character_run', {
                start: 0,
                end: 7
            }),
            frameRate: 10,
            repeat: -1
        });
        // Start with idle animation
        this.character.play('idle');
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.character, true, 0.05, 0.05);
        this.cameras.main.setZoom(0.35); // Zoomed out further to match FirstFloorScene
        this.cursors = this.input.keyboard.createCursorKeys();
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        // Add exit zone near the upper right corner
        this.exitZone = this.add.zone(worldWidth - 550, worldHeight / 16, 20, 40);
        this.physics.add.existing(this.exitZone, true);
        // Add small rectangle for the gateway
        this.gateway = this.add.rectangle(worldWidth - 550, worldHeight / 16, 20, 40, 0x0000ff, 0);
        this.physics.add.existing(this.gateway, true); // Add physics body to the gateway
        // Add overlap check for exit zone
        this.physics.add.overlap(this.character, this.exitZone, this.exitEEL, null, this);
        // Add helper text to guide the player
        this.add.text(worldWidth - 600, worldHeight / 16 - 30, 'Exit', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: {
                x: 5,
                y: 5
            }
        });
    }
    createBlueRectangle() {
        this.blueRectangle = this.add.rectangle(460, 255, 100, 50, 0x0000FF, 0);
        this.blueRectangle.setOrigin(0, 0);
        this.physics.add.existing(this.blueRectangle, true); // Add static physics body
        // Create the trigger range circle
        this.triggerRange = this.add.circle(
            this.blueRectangle.x + this.blueRectangle.width / 2,
            this.blueRectangle.y + this.blueRectangle.height / 2,
            150, // Radius of 150 pixels
            0xFFFF00, // Yellow color
            0 // Alpha set to 0 for invisibility
        );
        this.physics.add.existing(this.triggerRange, true); // Add static physics body to the trigger range
    }
    startQuiz() {
        if (!this.quizStarted) {
            this.quizStarted = true;
            this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
                if (progress === 1) {
                    this.scene.start('EELQuizScene');
                }
            });
        }
    }
    exitEEL(character, gateway) {
        // Disable player movement
        this.character.setVelocity(0);
        this.character.body.moves = false;
        // Start fade out effect
        this.cameras.main.fadeOut(1000, 0, 0, 0, (camera, progress) => {
            if (progress === 1) {
                // When fade out is complete, switch to MMCOEScene
                this.scene.start('MMCOEScene', {
                    fromEEL: true,
                    exitX: 450,
                    exitY: 150,
                    fadeIn: true
                });
            }
        });
    }

    update() {
        const speed = 600;
        let velocityX = 0;
        let velocityY = 0;
        if (this.cursors.left.isDown || this.leftArrowDown) {
            velocityX = -speed;
            this.character.setFlipX(true);
        } else if (this.cursors.right.isDown || this.rightArrowDown) {
            velocityX = speed;
            this.character.setFlipX(false);
        }
        if (this.cursors.up.isDown || this.upArrowDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.downArrowDown) {
            velocityY = speed;
        }
        this.character.setVelocity(velocityX, velocityY);
        // If no movement, ensure the character is completely stopped and play idle animation
        if (velocityX === 0 && velocityY === 0) {
            this.character.body.reset(this.character.x, this.character.y);
            if (this.character.anims.currentAnim.key !== 'idle') {
                this.character.play('idle');
            }
        } else {
            // If moving, play run animation
            if (this.character.anims.currentAnim.key !== 'run') {
                this.character.play('run');
            }
        }
        // Check if the character is very close to the blue rectangle
        const distance = Phaser.Math.Distance.Between(
            this.character.x, this.character.y,
            this.blueRectangle.x + this.blueRectangle.width / 2,
            this.blueRectangle.y + this.blueRectangle.height / 2
        );

        if (distance < 150) { // Trigger range of 150 pixels
            if (distance < 75 && !this.quizStarted) { // Quiz start range of 75 pixels
                this.startQuiz();
            }
        } else {
            this.quizStarted = false;
        }
    }
}
class PhysicsLabScene extends Phaser.Scene {
    constructor() {
        super('PhysicsLabScene');
    }
    preload() {
        // Load the correct Physics Lab background
        this.load.image('physicsLabBackground', 'https://play.rosebud.ai/assets/AP.png?GNlk');
        this.load.spritesheet('character_idle', 'https://play.rosebud.ai/assets/Idel Animation 48x48.png?OV5d', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('character_run', 'https://play.roseb ud.ai/assets/Run Animation 48x48.png?1tjB', {
            frameWidth: 48,
            frameHeight: 48
        });
    }
    create(data) {
        const physicsLabMap = this.add.image(0, 0, 'physicsLabBackground').setOrigin(0);
        const worldWidth = physicsLabMap.width;
        const worldHeight = physicsLabMap.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        // Create arrow controls
        createArrowControls(this);
        // Set character position based on entry point
        let entryX, entryY;
        if (data.fromQuiz) {
            entryX = data.entryX || this.orangeBox.x; // Use provided entryX or default to orange box x
            entryY = data.entryY || this.orangeBox.y; // Use provided entryY or default to orange box y
        } else {
            entryX = data.entryX || worldWidth / 2;
            entryY = data.entryY || worldHeight - 100;
        }
        this.character = this.physics.add.sprite(entryX, entryY, 'character_idle');
        if (data.fadeIn) {
            this.cameras.main.fadeIn(1000);
            this.character.setAlpha(0);
            this.tweens.add({
                targets: this.character,
                alpha: 1,
                duration: 1000
            });
        }
        this.character.setCollideWorldBounds(true);
        this.character.setScale(6); // Increased to 6
        // Create animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('character_idle', {
                start: 0,
                end: 5
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('character_run', {
                start: 0,
                end: 7
            }),
            frameRate: 10,
            repeat: -1
        });
        // Start with idle animation
        this.character.play('idle');
        // Add invisible blue box to middle left of the scene
        this.blueBox = this.add.rectangle(
            worldWidth * 0.10, // X position (10% of world width, kept the same)
            worldHeight * 0.35, // Y position (35% of world height, moved upwards)
            100, // Width of the box
            100, // Height of the box
            0x0000FF, // Blue color (won't be visible)
            0 // Set alpha to 0 for complete invisibility
        );
        this.physics.add.existing(this.blueBox, true); // Add static physics body to the blue box
        // Add overlap detection for the blue box
        this.physics.add.overlap(this.character, this.blueBox, this.handleBlueBoxOverlap, null, this);
        // The blue box is now completely invisible
        // Create a visible pink rectangle
        this.pinkBox = this.add.rectangle(
            worldWidth * 0.80, // X position (80% of world width)
            worldHeight * 0.9, // Y position (90% of world height, moved even further downwards)
            150, // Width of the box
            150, // Height of the box
            0xFF69B4, // Pink color
            0.5 // Set alpha to 0.5 for semi-transparency
        );
        this.physics.add.existing(this.pinkBox, true); // Add static physics body to the pink box
        // Create a new invisible orange rectangle in the middle left
        this.orangeBox = this.add.rectangle(
            worldWidth * 0.2, // X position (20% of world width)
            worldHeight * 0.5, // Y position (50% of world height)
            150, // Width of the box
            150, // Height of the box
            0xFFA500, // Orange color (won't be visible)
            0 // Set alpha to 0 for complete invisibility
        );
        this.physics.add.existing(this.orangeBox, true); // Add static physics body to the orange box
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.character, true, 0.05, 0.05);
        this.cameras.main.setZoom(0.5);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        // Old exit zone code removed
        // Add invisible exit gateway
        const boxWidth = 50;
        const boxHeight = 30;
        this.exitGateway = this.add.rectangle(
            worldWidth * 0.13, // Position X: 13% of the world width for a slight right shift
            worldHeight - boxHeight / 2, // Position Y: world height minus half of the box height
            boxWidth,
            boxHeight,
            0xFF0000, // Color doesn't matter as it will be invisible
            0 // Set alpha to 0 to make it invisible
        );
        this.exitGateway.setOrigin(0.5);
        this.physics.add.existing(this.exitGateway, true); // Add static physics body to the gateway
        // Add overlap detection for the exit gateway
        this.physics.add.overlap(this.character, this.exitGateway, this.handleExit, null, this);
    }
    update() {
        const speed = 600;
        let velocityX = 0;
        let velocityY = 0;
        if (this.cursors.left.isDown || this.leftArrowDown) {
            velocityX = -speed;
            this.character.setFlipX(true);
        } else if (this.cursors.right.isDown || this.rightArrowDown) {
            velocityX = speed;
            this.character.setFlipX(false);
        }
        if (this.cursors.up.isDown || this.upArrowDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.downArrowDown) {
            velocityY = speed;
        }
        this.character.setVelocity(velocityX, velocityY);
        // If no movement, ensure the character is completely stopped and play idle animation
        if (velocityX === 0 && velocityY === 0) {
            this.character.body.reset(this.character.x, this.character.y);
            if (this.character.anims.currentAnim.key !== 'idle') {
                this.character.play('idle');
            }
        } else {
            // If moving, play run animation
            if (this.character.anims.currentAnim.key !== 'run') {
                this.character.play('run');
            }
        }
    }
    handleBlueBoxOverlap() {
        this.startQuiz();
    }
    startQuiz() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('PhysicsQuizScene');
            }
        });
    }
    handleExit() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('MMCOEScene', {
                    fromPhysicsLab: true,
                    exitX: 5000,
                    exitY: 350, // Adjusted to match other exit points
                    fadeIn: true
                });
            }
        });
    }
}
class PAQuizScene extends Phaser.Scene {
    constructor() {
        super('PAQuizScene');
        this.score = 0;
        this.currentQuestion = 0;
        this.timer = null;
        this.timerText = null;
        this.questionText = null;
        this.answerTexts = [];
        this.questions = [{
            question: "Which of these is a classical dance form of India?",
            answers: ["Salsa", "Bharatanatyam", "Ballet", "Tap dance"],
            correct: 1
        }, {
            question: "What is the name of the classical Hindustani stringed instrument?",
            answers: ["Tabla", "Flute", "Sitar", "Harmonium"],
            correct: 2
        }, {
            question: "Which of these is a famous Carnatic music composer?",
            answers: ["Tyagaraja", "Beethoven", "Mozart", "Bach"],
            correct: 0
        }, {
            question: "What is the primary percussion instrument used in Hindustani classical music?",
            answers: ["Violin", "Tabla", "Guitar", "Piano"],
            correct: 1
        }, {
            question: "Which of these is a major form of Indian classical music?",
            answers: ["Jazz", "Rock", "Carnatic", "Pop"],
            correct: 2
        }];
    }
    preload() {
        this.load.image('quizBackground', 'https://play.rosebud.ai/assets/Rectangle.png?vtZb');
    }
    create() {
        const background = this.add.image(0, 0, 'quizBackground').setOrigin(0);
        background.displayWidth = this.sys.game.config.width;
        background.displayHeight = this.sys.game.config.height;
        this.questionText = this.add.text(400, 100, '', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            align: 'center',
            wordWrap: {
                width: 700
            }
        }).setOrigin(0.5);
        for (let i = 0; i < 4; i++) {
            this.answerTexts[i] = this.add.text(400, 200 + i * 60, '', {
                fontSize: '22px',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#87CEFA'
            }).setOrigin(0.5).setInteractive();
            this.answerTexts[i].on('pointerdown', () => this.checkAnswer(i));
        }
        this.timerText = this.add.text(400, 450, '', {
            fontSize: '26px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA'
        }).setOrigin(0.5);
        this.showNextQuestion();
    }
    showNextQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endQuiz();
            return;
        }
        const question = this.questions[this.currentQuestion];
        this.questionText.setText(question.question);
        for (let i = 0; i < 4; i++) {
            this.answerTexts[i].setText(`${String.fromCharCode(65 + i)}) ${question.answers[i]}`);
        }
        if (this.timer) {
            this.timer.remove();
        }
        this.timer = this.time.addEvent({
            delay: 10000,
            callback: this.timeUp,
            callbackScope: this
        });
    }
    checkAnswer(index) {
        const question = this.questions[this.currentQuestion];
        if (index === question.correct) {
            this.score++;
        }
        this.currentQuestion++;
        this.showNextQuestion();
    }
    timeUp() {
        this.currentQuestion++;
        this.showNextQuestion();
    }
    endQuiz() {
        this.questionText.setText('');
        for (let answerText of this.answerTexts) {
            answerText.setText('');
        }
        this.timerText.setText('');
        this.add.text(400, 250, `Quiz completed!\nYour score: ${this.score}/${this.questions.length}`, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            align: 'center'
        }).setOrigin(0.5);
        const exitButton = this.add.text(300, 400, 'Exit Quiz', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            backgroundColor: '#E0E0E0',
            padding: {
                x: 15,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        exitButton.on('pointerdown', () => this.exitQuiz());
        const retryButton = this.add.text(500, 400, 'Retry Quiz', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            backgroundColor: '#E0E0E0',
            padding: {
                x: 15,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        retryButton.on('pointerdown', () => this.retryQuiz());
    }
    exitQuiz() {
        this.scene.start('PAScene', {
            fromQuiz: true,
            entryX: this.sys.game.config.width / 2,
            entryY: this.sys.game.config.height * 0.6
        });
    }
    retryQuiz() {
        this.score = 0;
        this.currentQuestion = 0;
        if (this.timer) {
            this.timer.remove();
        }
        this.showNextQuestion();
    }
    update() {
        if (this.timer) {
            this.timerText.setText(`Time left: ${Math.ceil(this.timer.getRemaining() / 1000)}s`);
        }
    }
}
class FirstFloorScene extends Phaser.Scene {
    constructor() {
        super('FirstFloorScene');
        this.isNearOrangeBox = false;
        this.dialogueBox = null;
        this.dialogueText = null;
        this.dialogues = [
            "Hi! On This floor there are 2 rooms.",
            "One is for Performing Arts. Here you will get to know about various musical instruments and our musical traditions.",
            "The Next is Artificial Intelligence Lab. Here You will understand more about the impact of AI in our lives and our future.",
            "This is a special Lab and I suggest you to visit it at the end.",
            "Thank You!"
        ];
        this.currentDialogue = 0;
        this.dialogueCompleted = false;
        this.dialogueCooldown = 30000; // 30 seconds cooldown
        this.lastDialogueTime = 0;
        this.dialogueTimer = null;
    }
    preload() {
        this.load.image('firstFloorBackground', 'https://play.rosebud.ai/assets/First Floo final.png?wpcu');
        this.load.spritesheet('character_idle', 'https://play.rosebud.ai/assets/Idel Animation 48x48.png?OV5d', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('character_run', 'https://play.rosebud.ai/assets/Run Animation 48x48.png?1tjB', {
            frameWidth: 48,
            frameHeight: 48
        });
    }
    createDialogueBox() {
        const {
            width,
            height
        } = this.scale;
        this.dialogueBox = this.add.rectangle(width / 2, height - 150, width - 40, 250, 0x000000, 0.8);
        this.dialogueBox.setOrigin(0.5);
        this.dialogueBox.setScrollFactor(0);
        this.dialogueBox.setVisible(false);
        this.dialogueText = this.add.text(width / 2, height - 150, '', {
            fontSize: '28px',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            wordWrap: {
                width: width - 80
            }
        });
        this.dialogueText.setOrigin(0.5);
        this.dialogueText.setScrollFactor(0);
        this.dialogueText.setVisible(false);
        // Add touch interaction for mobile users
        this.input.on('pointerdown', this.progressDialogue, this);
    }
    create(data) {
        const firstFloorMap = this.add.image(0, 0, 'firstFloorBackground').setOrigin(0);
        const worldWidth = firstFloorMap.width;
        const worldHeight = firstFloorMap.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        // Create arrow controls
        createArrowControls(this);
        // Create dialogue box
        this.createDialogueBox();
        // Set character position based on entry point
        let entryX, entryY;
        if (data.fromLift) {
            entryX = worldWidth / 2;
            entryY = worldHeight / 2;
        } else {
            entryX = data.entryX || worldWidth / 2;
            entryY = data.entryY || worldHeight - 100;
        }
        this.character = this.physics.add.sprite(entryX, entryY, 'character_idle');
        // Add cyan rectangle
        this.cyanRectangle = this.add.rectangle(
            worldWidth * 0.15, // 15% from the left edge
            worldHeight * 0.85, // 85% from the top (near bottom)
            150, // Width of the rectangle
            100, // Height of the rectangle
            0x00FFFF, // Cyan color
            0 // Completely transparent
        );
        this.physics.add.existing(this.cyanRectangle, true); // Add static physics body
        // Add orange rectangle to the bottom left
        this.orangeRectangle = this.add.rectangle(
            700, // X position (moved right from 50 to 200)
            worldHeight - 450, // Y position (moved up from 50 to 150 pixels from the bottom)
            100, // Width of the rectangle
            100, // Height of the rectangle
            0xFFA500, // Orange color
            0 // Completely transparent
        );
        this.physics.add.existing(this.orangeRectangle, true); // Add static physics body
        if (data.fadeIn) {
            this.cameras.main.fadeIn(1000);
            this.character.setAlpha(0);
            this.tweens.add({
                targets: this.character,
                alpha: 1,
                duration: 1000
            });
        }
        this.character.setCollideWorldBounds(true);
        this.character.setScale(7); // Increased from 6 to 7
        // Create animations
        // Call the new method to create the yellow portal
        this.createYellowPortal();
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('character_idle', {
                start: 0,
                end: 5
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('character_run', {
                start: 0,
                end: 7
            }),
            frameRate: 10,
            repeat: -1
        });
        // Start with idle animation
        this.character.play('idle');
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.character, true, 0.05, 0.05);
        this.cameras.main.setZoom(0.35); // Decreased zoom for even larger visible area
        // Add blue rectangle in mid-left position (PA portal)
        this.blueRectangle = this.add.rectangle(
            worldWidth * 0.15, // 15% from the left edge (shifted left)
            worldHeight * 0.45, // 45% from the top (shifted up)
            150, // Width of the rectangle
            100, // Height of the rectangle
            0x0000FF, // Blue color
            0 // Completely transparent
        );
        this.physics.add.existing(this.blueRectangle, true); // Add static physics body
        // Add overlap detection for PA portal
        this.physics.add.overlap(this.character, this.blueRectangle, this.enterPAScene, null, this);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        // Add lift entrance (orange colored, but invisible)
        this.liftEntrance = this.add.rectangle(worldWidth / 2, worldHeight * 0.2, 200, 150, 0xFFA500, 0);
        this.physics.add.existing(this.liftEntrance, true);
        this.physics.add.overlap(this.character, this.liftEntrance, this.enterLift, null, this);
        // Add stairs to ground floor (invisible)
        this.stairsToGround = this.add.rectangle(100, worldHeight - 50, 100, 50, 0x0000ff, 0);
        this.physics.add.existing(this.stairsToGround, true);
        this.physics.add.overlap(this.character, this.stairsToGround, this.goToGroundFloor, null, this);
        // Add stairs to second floor (invisible)
        this.stairsToSecond = this.add.rectangle(worldWidth - 100, 50, 100, 50, 0x0000ff, 0);
        this.physics.add.existing(this.stairsToSecond, true);
        this.physics.add.overlap(this.character, this.stairsToSecond, this.goToSecondFloor, null, this);
    }
    showDialogue() {
        if (this.currentDialogue < this.dialogues.length) {
            this.dialogueBox.setVisible(true);
            this.dialogueText.setVisible(true);
            this.dialogueText.setText(this.dialogues[this.currentDialogue]);
            // Clear any existing timer
            if (this.dialogueTimer) {
                this.dialogueTimer.remove();
            }
            // Set a new timer for 7 seconds
            this.dialogueTimer = this.time.delayedCall(7000, this.progressDialogue, [], this);
        } else {
            this.hideDialogue();
        }
    }
    hideDialogue() {
        this.dialogueBox.setVisible(false);
        this.dialogueText.setVisible(false);
        this.currentDialogue = 0;
    }
    progressDialogue() {
        if (this.dialogueTimer) {
            this.dialogueTimer.remove();
        }
        this.currentDialogue++;
        if (this.currentDialogue < this.dialogues.length) {
            this.showDialogue();
        } else {
            this.hideDialogue();
            this.dialogueCompleted = true;
            this.lastDialogueTime = this.time.now;
        }
    }
    resetDialogue() {
        this.dialogueCompleted = false;
        this.currentDialogue = 0;
    }
    update() {
        const speed = 600;
        let velocityX = 0;
        let velocityY = 0;
        if (this.cursors.left.isDown || this.leftArrowDown) {
            velocityX = -speed;
            this.character.setFlipX(true);
        } else if (this.cursors.right.isDown || this.rightArrowDown) {
            velocityX = speed;
            this.character.setFlipX(false);
        }
        if (this.cursors.up.isDown || this.upArrowDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.downArrowDown) {
            velocityY = speed;
        }
        this.character.setVelocity(velocityX, velocityY);
        if (velocityX === 0 && velocityY === 0) {
            this.character.body.reset(this.character.x, this.character.y);
            if (this.character.anims.currentAnim.key !== 'idle') {
                this.character.play('idle');
            }
        } else {
            if (this.character.anims.currentAnim.key !== 'run') {
                this.character.play('run');
            }
        }

        // Check if dialogue cooldown has passed
        if (this.dialogueCompleted && this.time.now - this.lastDialogueTime > this.dialogueCooldown) {
            this.resetDialogue();
        }

        // Check if character is near the orange box
        const distance = Phaser.Math.Distance.Between(
            this.character.x, this.character.y,
            this.orangeRectangle.x, this.orangeRectangle.y
        );
        this.isNearOrangeBox = distance < 150;

        // Show dialogue when near orange box and dialogue is not completed
        if (this.isNearOrangeBox && !this.dialogueCompleted) {
            if (!this.dialogueBox.visible) {
                this.showDialogue();
            }
        } else if (!this.isNearOrangeBox && this.dialogueBox.visible) {
            this.hideDialogue();
        }

        // Progress dialogue when 'E' is pressed
        if (Phaser.Input.Keyboard.JustDown(this.eKey) && this.dialogueBox.visible) {
            this.progressDialogue();
        }
    }
    enterLift() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('LiftScene', {
                    fromFirstFloor: true,
                    entryX: this.sys.game.config.width / 2,
                    entryY: this.sys.game.config.height * 0.2,
                    fadeIn: true
                });
            }
        });
    }
    goToGroundFloor() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('GroundFloorScene', {
                    fromFirstFloor: true,
                    entryX: 100,
                    entryY: 100,
                    fadeIn: true
                });
            }
        });
    }
    goToSecondFloor() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('MMCOEScene', {
                    fromFirstFloor: true,
                    exitX: 100,
                    exitY: worldHeight - 100,
                    fadeIn: true
                });
            }
        });
    }
    enterPAScene() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('PAScene', {
                    fromFirstFloor: true,
                    fadeIn: true
                });
            }
        });
    }
    // Add this new method to create the visible yellow portal
    createYellowPortal() {
        const worldWidth = this.physics.world.bounds.width;
        const worldHeight = this.physics.world.bounds.height;
        // Create an invisible yellow rectangle
        this.yellowPortal = this.add.rectangle(
            worldWidth * 0.50, // Shifted slightly to the left
            worldHeight * 0.45, // Kept the same vertical position
            200,
            150,
            0xFFFF00,
            0 // Completely transparent
        );
        // Add physics to the portal
        this.physics.add.existing(this.yellowPortal, true);
        // Create an invisible pink rectangle in the mid-right
        this.pinkRectangle = this.add.rectangle(
            worldWidth * 0.82, // 82% from the left edge (shifted right)
            worldHeight * 0.48, // 48% from the top (shifted up)
            150, // Width of the rectangle
            100, // Height of the rectangle
            0xFF69B4, // Pink color
            0 // Completely transparent
        );
        // Add physics to the pink rectangle
        this.physics.add.existing(this.pinkRectangle, true);
        // Add overlap detection for the pink rectangle
        this.physics.add.overlap(this.character, this.pinkRectangle, this.enterAILab, null, this);
    }
    enterAILab() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('AILabScene', {
                    fromFirstFloor: true,
                    fadeIn: true
                });
            }
        });
    }
}
class PAScene extends Phaser.Scene {
    constructor() {
        super('PAScene');
    }
    preload() {
        this.load.image('paBackground', 'https://play.rosebud.ai/assets/PA.png?PNG6');
        this.load.spritesheet('character_idle', 'https://play.rosebud.ai/assets/Idel Animation 48x48.png?OV5d', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('character_run', 'https://play.rosebud.ai/assets/Run Animation 48x48.png?1tjB', {
            frameWidth: 48,
            frameHeight: 48
        });
    }
    create(data) {
        const paMap = this.add.image(0, 0, 'paBackground').setOrigin(0);
        paMap.setScale(0.7); // Zoom out the background image
        const worldWidth = paMap.width * paMap.scaleX;
        const worldHeight = paMap.height * paMap.scaleY;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        // Set character position based on entry point
        let entryX = data.fromQuiz ? data.entryX : worldWidth / 2;
        let entryY = data.fromQuiz ? data.entryY : worldHeight - 100;
        this.character = this.physics.add.sprite(entryX, entryY, 'character_idle');
        this.character.setCollideWorldBounds(true);
        this.character.setScale(5.5); // Reduced from 7 to 4
        // Create an invisible orange rectangle at the center and slightly downwards
        this.orangeRectangle = this.add.rectangle(
            worldWidth / 2,
            worldHeight * 0.6, // Positioned at 60% of the height
            100, // Width of the rectangle
            100, // Height of the rectangle
            0xFFA500, // Orange color
            0 // Set alpha to 0 for complete transparency
        );
        this.orangeRectangle.setOrigin(0.5);
        this.physics.add.existing(this.orangeRectangle, true); // Add static physics body

        // Create a pink rectangle at the mid-top, slightly to the left and downwards
        this.pinkRectangle = this.add.rectangle(
            worldWidth * 0.40, // X position (40% of the scene width, moved further left)
            worldHeight * 0.25, // Y position (25% from the top, moved further down)
            150, // Width
            100, // Height
            0xFF69B4, // Pink color
            0 // Alpha (completely transparent)
        );
        this.pinkRectangle.setOrigin(0.5); // Set origin to center
        this.physics.add.existing(this.pinkRectangle, true); // Add static physics body
        // Add overlap detection for the pink rectangle
        this.physics.add.overlap(this.character, this.pinkRectangle, this.enterPAQuiz, null, this);

        // Create arrow controls
        createArrowControls(this);
        if (data.fadeIn) {
            this.cameras.main.fadeIn(1000);
            this.character.setAlpha(0);
            this.tweens.add({
                targets: this.character,
                alpha: 1,
                duration: 1000
            });
        }
        // Create animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('character_idle', {
                start: 0,
                end: 5
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('character_run', {
                start: 0,
                end: 7
            }),
            frameRate: 10,
            repeat: -1
        });
        // Start with idle animation
        this.character.play('idle');
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.character, true, 0.05, 0.05);
        this.cameras.main.setZoom(0.5);
        this.cursors = this.input.keyboard.createCursorKeys();
        // Add exit zone
        this.exitZone = this.add.zone(50, worldHeight - 50, 100, 100);
        this.physics.add.existing(this.exitZone, true);
        this.physics.add.overlap(this.character, this.exitZone, this.exitPAScene, null, this);
    }
    update() {
        const speed = 600;
        let velocityX = 0;
        let velocityY = 0;
        if (this.cursors.left.isDown || this.leftArrowDown) {
            velocityX = -speed;
            this.character.setFlipX(true);
        } else if (this.cursors.right.isDown || this.rightArrowDown) {
            velocityX = speed;
            this.character.setFlipX(false);
        }
        if (this.cursors.up.isDown || this.upArrowDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.downArrowDown) {
            velocityY = speed;
        }
        this.character.setVelocity(velocityX, velocityY);
        if (velocityX === 0 && velocityY === 0) {
            this.character.body.reset(this.character.x, this.character.y);
            if (this.character.anims.currentAnim.key !== 'idle') {
                this.character.play('idle');
            }
        } else {
            if (this.character.anims.currentAnim.key !== 'run') {
                this.character.play('run');
            }
        }
    }
    exitPAScene() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                const worldWidth = this.physics.world.bounds.width;
                const worldHeight = this.physics.world.bounds.height;
                this.scene.start('FirstFloorScene', {
                    fromPAScene: true,
                    entryX: worldWidth * 0.50, // Match the x-coordinate of the yellow portal
                    entryY: worldHeight * 0.45, // Match the y-coordinate of the yellow portal
                    fadeIn: true
                });
            }
        });
    }
    enterPAQuiz() {
        if (this.character && this.character.active) {
            this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
                if (progress === 1) {
                    this.scene.start('PAQuizScene');
                }
            });
        }
    }
}
class PhysicsQuizScene extends Phaser.Scene {
    constructor() {
        super('PhysicsQuizScene');
        this.score = 0;
        this.currentQuestion = 0;
        this.timer = null;
        this.timerText = null;
        this.questionText = null;
        this.answerTexts = [];
        this.questions = [{
            question: "What is Newton's First Law of Motion?",
            answers: ["F = ma", "Objects at rest stay at rest unless acted upon by a force", "Every action has an equal and opposite reaction", "Energy is conserved in a closed system"],
            correct: 1
        }, {
            question: "What is the SI unit of force?",
            answers: ["Joule", "Newton", "Watt", "Pascal"],
            correct: 1
        }, {
            question: "What is the acceleration due to gravity on Earth (approximately)?",
            answers: ["5.6 m/s²", "7.8 m/s²", "9.8 m/s²", "11.2 m/s²"],
            correct: 2
        }, {
            question: "Which of the following is a vector quantity?",
            answers: ["Mass", "Temperature", "Velocity", "Time"],
            correct: 2
        }, {
            question: "What is the formula for kinetic energy?",
            answers: ["KE = mgh", "KE = 1/2 * m * v^2", "KE = F * d", "KE = P * V"],
            correct: 1
        }];
    }
    preload() {
        this.load.image('quizBackground', 'https://play.rosebud.ai/assets/Rectangle.png?vtZb');
    }
    create() {
        const background = this.add.image(0, 0, 'quizBackground').setOrigin(0);
        background.displayWidth = this.sys.game.config.width;
        background.displayHeight = this.sys.game.config.height;
        this.questionText = this.add.text(400, 100, '', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            align: 'center',
            wordWrap: {
                width: 700
            }
        }).setOrigin(0.5);
        for (let i = 0; i < 4; i++) {
            this.answerTexts[i] = this.add.text(400, 200 + i * 60, '', {
                fontSize: '22px',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#87CEFA'
            }).setOrigin(0.5).setInteractive();
            this.answerTexts[i].on('pointerdown', () => this.checkAnswer(i));
        }
        this.timerText = this.add.text(400, 450, '', {
            fontSize: '26px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA'
        }).setOrigin(0.5);
        this.showNextQuestion();
    }
    showNextQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endQuiz();
            return;
        }
        const question = this.questions[this.currentQuestion];
        this.questionText.setText(question.question);
        for (let i = 0; i < 4; i++) {
            this.answerTexts[i].setText(`${String.fromCharCode(65 + i)}) ${question.answers[i]}`);
        }
        if (this.timer) {
            this.timer.remove();
        }
        this.timer = this.time.addEvent({
            delay: 10000,
            callback: this.timeUp,
            callbackScope: this
        });
    }
    checkAnswer(index) {
        const question = this.questions[this.currentQuestion];
        if (index === question.correct) {
            this.score++;
        }
        this.currentQuestion++;
        this.showNextQuestion();
    }
    timeUp() {
        this.currentQuestion++;
        this.showNextQuestion();
    }
    endQuiz() {
        this.questionText.setText('');
        for (let answerText of this.answerTexts) {
            answerText.setText('');
        }
        this.timerText.setText('');
        this.add.text(400, 250, `Quiz completed!\nYour score: ${this.score}/${this.questions.length}`, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            align: 'center'
        }).setOrigin(0.5);
        const exitButton = this.add.text(300, 400, 'Exit Quiz', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            backgroundColor: '#E0E0E0',
            padding: {
                x: 15,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        exitButton.on('pointerdown', () => this.exitQuiz());
        const retryButton = this.add.text(500, 400, 'Retry Quiz', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            backgroundColor: '#E0E0E0',
            padding: {
                x: 15,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        retryButton.on('pointerdown', () => this.retryQuiz());
    }
    exitQuiz() {
        this.scene.start('PhysicsLabScene', {
            fromQuiz: true,
            entryX: this.sys.game.config.width * 0.2, // X position of the orange rectangle
            entryY: this.sys.game.config.height * 0.5 // Y position of the orange rectangle
        });
    }
    retryQuiz() {
        this.score = 0;
        this.currentQuestion = 0;
        if (this.timer) {
            this.timer.remove();
        }
        this.showNextQuestion();
    }
    update() {
        if (this.timer) {
            this.timerText.setText(`Time left: ${Math.ceil(this.timer.getRemaining() / 1000)}s`);
        }
    }
}
class LiftScene extends Phaser.Scene {
    constructor() {
        super('LiftScene');
    }
    preload() {
        this.load.image('liftBackground', 'https://play.rosebud.ai/assets/LIFT.png?CPIX');
    }
    create(data) {
        const {
            width,
            height
        } = this.scale;
        // Add background image
        this.add.image(width / 2, height / 2, 'liftBackground').setOrigin(0.5).setDisplaySize(width, height);
        if (data.fadeIn) {
            this.cameras.main.fadeIn(1000);
        }
        // Add cyan box to indicate Arya's entry point
        const entryBoxWidth = 50;
        const entryBoxHeight = 80;
        this.add.rectangle(
            width / 2,
            height - entryBoxHeight / 2,
            entryBoxWidth,
            entryBoxHeight,
            0x00FFFF,
            0 // Set alpha to 0 for full transparency
        ).setOrigin(0.5);
        // Add floor buttons
        const floors = ['Ground Floor', '1st Floor', '2nd Floor'];
        floors.forEach((floor, index) => {
            const button = this.add.text(width / 2, 120 + index * 60, floor, {
                fontSize: '24px',
                fill: '#ffffff',
                backgroundColor: '#555555',
                padding: {
                    x: 20,
                    y: 10
                }
            }).setOrigin(0.5).setInteractive();
            button.setDepth(1); // Set a lower depth value for buttons
            button.on('pointerdown', () => {
                this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
                    if (progress === 1) {
                        switch (floor) {
                            case 'Ground Floor':
                                this.scene.start('GroundFloorScene', {
                                    fromLift: true,
                                    fadeIn: true
                                });
                                break;
                            case '1st Floor':
                                this.scene.start('MMCOEScene', {
                                    fromLift: true,
                                    exitX: 2400, // Adjust these coordinates as needed
                                    exitY: 350,
                                    fadeIn: true
                                });
                                break;
                            case '2nd Floor':
                                this.scene.start('FirstFloorScene', {
                                    fromLift: true,
                                    fadeIn: true
                                });
                                break;
                            default:
                                console.log(`Selected floor: ${floor}`);
                        }
                    }
                });
            });
        });
        // Add exit button
        const exitButton = this.add.text(width / 2, height - 50, 'Exit Lift', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#aa0000',
            padding: {
                x: 20,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        exitButton.on('pointerdown', () => {
            this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
                if (progress === 1) {
                    this.scene.start('MMCOEScene', {
                        fromLift: true,
                        fadeIn: true
                    });
                }
            });
        });
    }
}
class GroundFloorScene extends Phaser.Scene {
    constructor() {
        super('GroundFloorScene');
    }
    preload() {
        // Load the ground floor background image
        this.load.image('groundFloorBackground', 'https://play.rosebud.ai/assets/Entrance Lobby.png?abnE');
        // Load character spritesheets
        this.load.spritesheet('character_idle', 'https://play.rosebud.ai/assets/Idel Animation 48x48.png?OV5d', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('character_run', 'https://play.rosebud.ai/assets/Run Animation 48x48.png?1tjB', {
            frameWidth: 48,
            frameHeight: 48
        });
    }
    create(data) {
        const groundFloorMap = this.add.image(0, 0, 'groundFloorBackground').setOrigin(0);
        const worldWidth = groundFloorMap.width;
        const worldHeight = groundFloorMap.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        // Create arrow controls
        createArrowControls(this);

        // Set character position based on entry point
        let entryX, entryY;
        if (data.fromOutdoor) {
            // Position near the entrance when coming from outdoor
            entryX = data.entryX || worldWidth / 2;
            entryY = data.entryY || worldHeight - 100;
        } else if (data.fromPlayground) {
            // Position when coming from playground
            entryX = data.entryX || 100;
            entryY = data.entryY || 700;
        } else {
            // Default position (yellow box) for other cases
            entryX = worldWidth / 2 + 240;
            entryY = worldHeight / 2 + 325;
        }
        this.character = this.physics.add.sprite(entryX, entryY, 'character_idle');
        if (data.fadeIn) {
            this.cameras.main.fadeIn(1000);
            this.character.setAlpha(0);
            this.tweens.add({
                targets: this.character,
                alpha: 1,
                duration: 1000
            });
        }
        this.character.setCollideWorldBounds(true);
        this.character.setScale(6); // Increased to 6
        // Create animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('character_idle', {
                start: 0,
                end: 5
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('character_run', {
                start: 0,
                end: 7
            }),
            frameRate: 10,
            repeat: -1
        });
        // Start with idle animation
        this.character.play('idle');
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.character, true, 0.05, 0.05);
        this.cameras.main.setZoom(0.5);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        // Create an invisible pink rectangle
        this.pinkBox = this.add.rectangle(
            worldWidth / 2 - 390, // x position (shifted 50 units left)
            worldHeight / 2 - 425, // y position (shifted 50 units up)
            200, // width of the rectangle
            150, // height of the rectangle
            0xFF69B4, // color (pink, but it won't be visible)
            0 // alpha (completely transparent)
        );
        this.physics.add.existing(this.pinkBox, true);
        // Create a transparent blue rectangle on the left side as a portal to the playground
        this.blueBox = this.add.rectangle(
            worldWidth * 0.1, // x position (10% of the world width)
            worldHeight * 0.5, // y position (50% of the world height)
            100, // width of the rectangle
            200, // height of the rectangle (made taller for easier interaction)
            0x0000FF, // color (blue)
            0 // alpha (completely transparent)
        );
        this.physics.add.existing(this.blueBox, true);
        // Add overlap detection for the blue box
        this.physics.add.overlap(this.character, this.blueBox, this.enterPlayground, null, this);
        // Create an invisible green box to define the interaction range
        this.greenBox = this.add.rectangle(
            worldWidth / 2 - 390, // x position (shifted 50 units left)
            worldHeight / 2 - 425, // y position (shifted 50 units up)
            200,
            150,
            0x00FF00,
            0 // Set alpha to 0 to make it invisible
        );
        this.greenBox.setDepth(1);
        this.physics.add.existing(this.greenBox, true);
        this.physics.add.overlap(this.character, this.greenBox, this.showWelcomeMessage, null, this);
        // Create an invisible yellow box
        this.yellowBox = this.add.rectangle(
            worldWidth / 2 + 240, // x position (shifted an additional 50 units left)
            worldHeight / 2 + 325, // y position (kept the same)
            200, // width of the rectangle
            150, // height of the rectangle
            0xFFFF00, // color (yellow, but it won't be visible)
            0 // alpha (completely transparent)
        );
        this.physics.add.existing(this.yellowBox, true);
        // Create an invisible rectangle for the lift entrance
        this.liftEntrance = this.add.rectangle(
            worldWidth - 250, // x position (near the right edge of the world)
            worldHeight / 3.5, // y position (shifted upwards)
            200, // width of the rectangle
            150, // height of the rectangle
            0x808080, // color (grey, but it won't be visible)
            0 // alpha (completely transparent)
        );
        // Add physics body to the lift entrance
        this.physics.add.existing(this.liftEntrance, true);
        // Add overlap check for the lift entrance
        this.physics.add.overlap(this.character, this.liftEntrance, this.enterLift, null, this);

        // Add exit zone (e.g., elevator or stairs)
        // Create an invisible rectangle for the exit portal
        this.exitPortal = this.add.rectangle(875, worldHeight - 50, 100, 50, 0x0000ff, 0);
        this.physics.add.existing(this.exitPortal, true);
        // Add overlap check for exit portal
        this.physics.add.overlap(this.character, this.exitPortal, this.handleExit, null, this);
    }

    enterLift() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('LiftScene', {
                    fromGroundFloor: true,
                    fadeIn: true
                });
            }
        });
    }

    handleExit() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('OutdoorScene', {
                    fromMMCOE: true,
                    fadeIn: true,
                    exitX: 1500, // Adjusted to be near the entry portal
                    exitY: 800 // Adjusted to be near the entry portal
                });
            }
        });
    }
    enterPlayground() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('PlaygroundScene', {
                    fromGroundFloor: true,
                    fadeIn: true,
                    entryX: 100,
                    entryY: 100
                });
            }
        });
    }
    update() {
        const speed = 600;
        let velocityX = 0;
        let velocityY = 0;
        if (this.cursors.left.isDown || this.leftArrowDown) {
            velocityX = -speed;
            this.character.setFlipX(true);
        } else if (this.cursors.right.isDown || this.rightArrowDown) {
            velocityX = speed;
            this.character.setFlipX(false);
        }
        if (this.cursors.up.isDown || this.upArrowDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.downArrowDown) {
            velocityY = speed;
        }
        this.character.setVelocity(velocityX, velocityY);
        // If no movement, ensure the character is completely stopped and play idle animation
        if (velocityX === 0 && velocityY === 0) {
            this.character.body.reset(this.character.x, this.character.y);
            if (this.character.anims.currentAnim.key !== 'idle') {
                this.character.play('idle');
            }
        } else {
            // If moving, play run animation
            if (this.character.anims.currentAnim.key !== 'run') {
                this.character.play('run');
            }
        }
        // Check if character is overlapping with the green box
        const isOverlapping = Phaser.Geom.Intersects.RectangleToRectangle(
            this.character.getBounds(),
            this.greenBox.getBounds()
        );

        if (isOverlapping) {
            this.showWelcomeMessage();
        } else {
            this.hideWelcomeMessage();
        }
    }
    showWelcomeMessage() {
        if (!this.welcomeText) {
            this.welcomeText = this.add.text(400, 300, 'Welcome To MMCOE!\nHow may I help you Today?', {
                fontSize: '24px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: {
                    x: 10,
                    y: 5
                },
                align: 'center'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        } else {
            this.welcomeText.setVisible(true);
        }
    }
    hideWelcomeMessage() {
        if (this.welcomeText) {
            this.welcomeText.setVisible(false);
        }
    }
}
class EELQuizScene extends Phaser.Scene {
    constructor() {
        super('EELQuizScene');
        this.score = 0;
        this.currentQuestion = 0;
        this.timer = null;
        this.timerText = null;
        this.questionText = null;
        this.answerTexts = [];
        this.questions = [{
            question: "What is the correct syntax to print a message to the console in C?",
            answers: ["print(\"Hello, World!\");", "printf(\"Hello, World!\");", "echo(\"Hello, World!\");", "cout << \"Hello, World!\";"],
            correct: 1
        }, {
            question: "Which of the following data types can store a single character in C?",
            answers: ["int", "float", "char", "double"],
            correct: 2
        }, {
            question: "What is the size of the int data type in C on most modern systems?",
            answers: ["2 bytes", "4 bytes", "8 bytes", "It depends on the system/compiler"],
            correct: 1
        }, {
            question: "Which of the following operators is used to get the address of a variable in C?",
            answers: ["*", "&", "->", "@"],
            correct: 1
        }, {
            question: "Which of the following is a correct way to declare an array of 10 integers in C?",
            answers: ["int arr[10];", "int[10] arr;", "array int[10];", "int[] arr(10);"],
            correct: 0
        }];
    }
    preload() {
        this.load.image('quizBackground', 'https://play.rosebud.ai/assets/Rectangle.png?vtZb');
    }
    create() {
        const background = this.add.image(0, 0, 'quizBackground').setOrigin(0);
        background.displayWidth = this.sys.game.config.width;
        background.displayHeight = this.sys.game.config.height;

        this.questionText = this.add.text(400, 100, '', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA', // Changed to light blue
            align: 'center',
            wordWrap: {
                width: 700
            }
        }).setOrigin(0.5);
        for (let i = 0; i < 4; i++) {
            this.answerTexts[i] = this.add.text(400, 200 + i * 60, '', {
                fontSize: '22px',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#87CEFA' // Changed to light blue
            }).setOrigin(0.5).setInteractive();
            this.answerTexts[i].on('pointerdown', () => this.checkAnswer(i));
        }
        this.timerText = this.add.text(400, 450, '', {
            fontSize: '26px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA' // Changed to light blue
        }).setOrigin(0.5);

        this.showNextQuestion();
    }
    showNextQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endQuiz();
            return;
        }

        const question = this.questions[this.currentQuestion];
        this.questionText.setText(question.question);

        for (let i = 0; i < 4; i++) {
            this.answerTexts[i].setText(`${String.fromCharCode(65 + i)}) ${question.answers[i]}`);
        }

        if (this.timer) {
            this.timer.remove();
        }

        this.timer = this.time.addEvent({
            delay: 10000,
            callback: this.timeUp,
            callbackScope: this
        });
    }
    checkAnswer(index) {
        const question = this.questions[this.currentQuestion];
        if (index === question.correct) {
            this.score++;
        }
        this.currentQuestion++;
        this.showNextQuestion();
    }
    timeUp() {
        this.currentQuestion++;
        this.showNextQuestion();
    }
    endQuiz() {
        // Clear existing texts
        this.questionText.setText('');
        for (let answerText of this.answerTexts) {
            answerText.setText('');
        }
        this.timerText.setText('');
        // Add new completion text, shifted downwards
        this.add.text(400, 250, `Quiz completed!\nYour score: ${this.score}/${this.questions.length}`, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            align: 'center'
        }).setOrigin(0.5);
        // Create exit button, adjusted position
        const exitButton = this.add.text(300, 400, 'Exit Quiz', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA', // Changed to light blue
            backgroundColor: '#E0E0E0',
            padding: {
                x: 15,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        exitButton.on('pointerdown', () => this.exitQuiz());
        // Create retry button, adjusted position
        const retryButton = this.add.text(500, 400, 'Retry Quiz', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA', // Changed to light blue
            backgroundColor: '#E0E0E0',
            padding: {
                x: 15,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        retryButton.on('pointerdown', () => this.retryQuiz());
    }
    exitQuiz() {
        this.scene.start('EELScene', {
            fromQuiz: true,
            entryX: this.sys.game.config.width * 0.10 + 800,
            entryY: this.sys.game.config.height * 0.35
        });
    }
    retryQuiz() {
        this.score = 0;
        this.currentQuestion = 0;
        if (this.timer) {
            this.timer.remove();
        }
        this.showNextQuestion();
    }
    update() {
        if (this.timer) {
            this.timerText.setText(`Time left: ${Math.ceil(this.timer.getRemaining() / 1000)}s`);
        }
    }
}
class LoadingScene extends Phaser.Scene {
    constructor() {
        super('LoadingScene');
        this.loadingProgress = 0;
    }
    preload() {
        console.log('LoadingScene preload started');
        // Load assets
        this.load.image('loadingBackground1', 'https://play.rosebud.ai/assets/WhatsApp Image 2024-11-30 at 11.10.32 PM.png?Eija');
        this.load.image('loadingBackground2', 'https://play.rosebud.ai/assets/WhatsApp Image 2024-11-14 at 10.25.47 PM.png?ln6D');
        this.load.image('loadingBackground3', 'https://play.rosebud.ai/assets/WhatsApp Image 2024-11-14 at 10.34.21 PM.png?qjoU');
        this.load.image('loadingBackground4', 'https://play.rosebud.ai/assets/WhatsApp Image 2024-11-14 at 11.05.02 PM (1).png?Zhzi');
        this.load.image('background', 'https://play.rosebud.ai/assets/1.png?95lG');
        this.load.spritesheet('character_idle', 'https://play.rosebud.ai/assets/Idel Animation 48x48.png?OV5d', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('character_run', 'https://play.rosebud.ai/assets/Run Animation 48x48.png?1tjB', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.image('hologram', 'https://play.rosebud.ai/assets/Lovepik_com-380234703-blue-magic-light-effect-creative-aperture-gradient.png?BAtX');
        this.load.image('leftArrow', 'https://play.rosebud.ai/assets/Left-Arrow.png?YAQS');
        this.load.image('upArrow', 'https://play.rosebud.ai/assets/Up-Arrow.png?Gckf');
        this.load.image('downArrow', 'https://play.rosebud.ai/assets/Down-Arrow.png?NY03');
        this.load.image('rightArrow', 'https://play.rosebud.ai/assets/Right-Arrow.png?1z0S');
        this.load.image('squ areFrame', 'https://play.rosebud.ai/assets/—Pngtree—white square frame border_5054088.png?g3yI');
        console.log('LoadingScene preload completed');
    }
    create() {
        const {
            width,
            height
        } = this.scale;
        // Create a container for the background images
        const backgroundContainer = this.add.container(0, 0);
        // Display the loading backgrounds
        const background1 = this.add.image(width / 2, height / 2 + 50, 'loadingBackground1').setOrigin(0.5).setScale(1.2);
        const background2 = this.add.image(width / 2, height / 2, 'loadingBackground2').setOrigin(0.5).setScale(0.8);
        const background3 = this.add.image(width / 2, height / 2, 'loadingBackground3').setOrigin(0.5);
        const background4 = this.add.image(width / 2, height / 2, 'loadingBackground4').setOrigin(0.5);
        // Add all backgrounds to the container
        backgroundContainer.add([background1, background2, background3, background4]);
        // Initially, only show the first background
        background2.setVisible(false);
        background3.setVisible(false);
        background4.setVisible(false);
        // Create the loading bar
        const barWidth = 400;
        const barHeight = 20;
        const progressBoxWidth = barWidth + 10;
        const progressBoxHeight = barHeight + 10;
        // Create a background for the progress bar
        const progressBoxBackground = this.add.graphics();
        progressBoxBackground.fillStyle(0x000000, 0.8);
        progressBoxBackground.fillRect(
            width / 2 - progressBoxWidth / 2,
            height - 100 - progressBoxHeight / 2,
            progressBoxWidth,
            progressBoxHeight
        );
        // Create the progress box
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(
            width / 2 - barWidth / 2,
            height - 100 - barHeight / 2,
            barWidth,
            barHeight
        );
        // Create the progress bar
        this.progressBar = this.add.graphics();
        // Ensure UI elements are on top
        progressBoxBackground.setDepth(10);
        progressBox.setDepth(11);
        this.progressBar.setDepth(12);
        console.log('Loading complete, starting image sequence...');
        this.startImageSequence(background1, background2, background3, background4);
    }
    startImageSequence(background1, background2, background3, background4) {
        // Display first image for 3 seconds
        this.time.delayedCall(3000, () => {
            background1.setVisible(false);
            background2.setVisible(true);
            this.updateLoadingBar(0.25);
            // Display second image for 3.5 seconds
            this.time.delayedCall(3500, () => {
                background2.setVisible(false);
                background3.setVisible(true);
                this.updateLoadingBar(0.5);
                // Display third image for 3 seconds
                this.time.delayedCall(3000, () => {
                    background3.setVisible(false);
                    background4.setVisible(true);
                    this.updateLoadingBar(0.75);
                    // Display fourth image for 5 seconds
                    this.time.delayedCall(5000, () => {
                        this.updateLoadingBar(1);
                        console.log('Image sequence complete, starting OutdoorScene...');
                        this.time.delayedCall(1000, () => {
                            this.scene.start('OutdoorScene');
                        });
                    });
                });
            });
        });
    }
    updateLoadingBar(targetProgress) {
        this.tweens.add({
            targets: this,
            loadingProgress: targetProgress,
            duration: 1000,
            ease: 'Power2',
            onUpdate: () => {
                const {
                    width,
                    height
                } = this.scale;
                const barWidth = 400;
                const barHeight = 20;
                this.progressBar.clear();
                this.progressBar.fillStyle(0x00FFFF, 1);
                this.progressBar.fillRect(
                    width / 2 - barWidth / 2,
                    height - 100 - barHeight / 2,
                    barWidth * this.loadingProgress,
                    barHeight
                );
            }
        });
    }
}

class PlaygroundScene extends Phaser.Scene {
    constructor() {
        super('PlaygroundScene');
    }
    preload() {
        this.load.image('playgroundBackground', 'https://play.rosebud.ai/assets/Playground.png?zywU');
        this.load.spritesheet('character_idle', 'https://play.rosebud.ai/assets/Idel Animation 48x48.png?OV5d', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('character_run', 'https://play.rosebud.ai/assets/Run Animation 48x48.png?1tjB', {
            frameWidth: 48,
            frameHeight: 48
        });
    }
    create(data) {
        const playgroundMap = this.add.image(0, 0, 'playgroundBackground').setOrigin(0);
        const worldWidth = playgroundMap.width;
        const worldHeight = playgroundMap.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        // Create arrow controls
        createArrowControls(this);
        // Set character position
        this.character = this.physics.add.sprite(worldWidth / 2, worldHeight - 100, 'character_idle');
        this.character.setCollideWorldBounds(true);
        this.character.setScale(6); // Increased to 6
        if (data.fadeIn) {
            this.cameras.main.fadeIn(1000);
            this.character.setAlpha(0);
            this.tweens.add({
                targets: this.character,
                alpha: 1,
                duration: 1000
            });
        }
        // Add yellow rectangle to the bottom left
        this.yellowRectangle = this.add.rectangle(
            480, // x position (increased from 50 to 100)
            worldHeight - 120, // y position (kept the same)
            100, // width
            100, // height
            0xFFFF00, // yellow color
            0 // alpha (completely transparent)
        );
        this.yellowRectangle.setOrigin(0, 1); // Set origin to bottom-left corner
        this.physics.add.existing(this.yellowRectangle, true); // Add static physics body

        // Add overlap detection for the yellow rectangle
        this.physics.add.overlap(this.character, this.yellowRectangle, this.enterSportsQuiz, null, this);
        // Create animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('character_idle', {
                start: 0,
                end: 5
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('character_run', {
                start: 0,
                end: 7
            }),
            frameRate: 10,
            repeat: -1
        });
        // Start with idle animation
        this.character.play('idle');
        // Add transparent blue rectangle for exit and quiz re-entry
        this.blueRectangle = this.add.rectangle(
            385, // x position (kept the same)
            50, // y position (kept the same)
            150, // width (kept the same)
            100, // height (kept the same)
            0x0000FF, // color (blue)
            0 // alpha set to 0 for complete transparency
        );
        this.blueRectangle.setOrigin(0, 0); // Set origin to top-left corner
        // Add physics body to the blue rectangle
        this.physics.add.existing(this.blueRectangle, true);
        // We'll handle the overlap in the update function
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.character, true, 0.05, 0.05);
        this.cameras.main.setZoom(0.5);
        this.cursors = this.input.keyboard.createCursorKeys();
        // Add E key for interaction
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
    update() {
        // Check for proximity to blue rectangle
        const distanceToBlueRect = Phaser.Math.Distance.Between(
            this.character.x, this.character.y,
            this.blueRectangle.x + this.blueRectangle.width / 2,
            this.blueRectangle.y + this.blueRectangle.height / 2
        );
        // Set a threshold distance for automatic exit (adjust as needed)
        const exitThreshold = 100;
        if (distanceToBlueRect < exitThreshold) {
            this.exitToGroundFloor();
        }
        const speed = 600;
        let velocityX = 0;
        let velocityY = 0;
        if (this.cursors.left.isDown || this.leftArrowDown) {
            velocityX = -speed;
            this.character.setFlipX(true);
        } else if (this.cursors.right.isDown || this.rightArrowDown) {
            velocityX = speed;
            this.character.setFlipX(false);
        }
        if (this.cursors.up.isDown || this.upArrowDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.downArrowDown) {
            velocityY = speed;
        }
        this.character.setVelocity(velocityX, velocityY);
        // If no movement, ensure the character is completely stopped and play idle animation
        if (velocityX === 0 && velocityY === 0) {
            this.character.body.reset(this.character.x, this.character.y);
            if (this.character.anims.currentAnim.key !== 'idle') {
                this.character.play('idle');
            }
        } else {
            // If moving, play run animation
            if (this.character.anims.currentAnim.key !== 'run') {
                this.character.play('run');
            }
        }
        // Debug logging
        console.log('Current animation:', this.character.anims.currentAnim ? this.character.anims.currentAnim.key : 'none');
        console.log('Velocity:', this.character.body.velocity.x, this.character.body.velocity.y);
    }
    exitToGroundFloor() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('GroundFloorScene', {
                    fromPlayground: true,
                    fadeIn: true,
                    entryX: 100,
                    entryY: 700
                });
            }
        });
    }
    enterSportsQuiz() {
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('SportsQuizScene');
            }
        });
    }
}
class SportsQuizScene extends Phaser.Scene {
    constructor() {
        super('SportsQuizScene');
        this.score = 0;
        this.currentQuestion = 0;
        this.timer = null;
        this.timerText = null;
        this.questionText = null;
        this.answerTexts = [];
        this.questions = [{
            question: "What sport uses a bat and a ball with wickets?",
            answers: ["Football", "Basketball", "Cricket", "Tennis"],
            correct: 2
        }, {
            question: "In which sport do players score by shooting a ball through a hoop?",
            answers: ["Football", "Basketball", "Cricket", "Volleyball"],
            correct: 1
        }, {
            question: "What is the main objective in football (soccer)?",
            answers: ["Hit wickets", "Score baskets", "Score goals", "Make home runs"],
            correct: 2
        }, {
            question: "How many players are on a cricket team during a match?",
            answers: ["9", "10", "11", "12"],
            correct: 2
        }, {
            question: "What is the shape of a football (soccer) field?",
            answers: ["Circle", "Triangle", "Square", "Rectangle"],
            correct: 3
        }];
    }
    preload() {
        this.load.image('quizBackground', 'https://play.rosebud.ai/assets/Rectangle.png?vtZb');
    }
    create() {
        const background = this.add.image(0, 0, 'quizBackground').setOrigin(0);
        background.displayWidth = this.sys.game.config.width;
        background.displayHeight = this.sys.game.config.height;
        this.questionText = this.add.text(400, 100, '', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            align: 'center',
            wordWrap: {
                width: 700
            }
        }).setOrigin(0.5);
        for (let i = 0; i < 4; i++) {
            this.answerTexts[i] = this.add.text(400, 200 + i * 60, '', {
                fontSize: '22px',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#87CEFA'
            }).setOrigin(0.5).setInteractive();
            this.answerTexts[i].on('pointerdown', () => this.checkAnswer(i));
        }
        this.timerText = this.add.text(400, 450, '', {
            fontSize: '26px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA'
        }).setOrigin(0.5);
        this.showNextQuestion();
    }
    showNextQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endQuiz();
            return;
        }
        const question = this.questions[this.currentQuestion];
        this.questionText.setText(question.question);
        for (let i = 0; i < 4; i++) {
            this.answerTexts[i].setText(`${String.fromCharCode(65 + i)}) ${question.answers[i]}`);
        }
        if (this.timer) {
            this.timer.remove();
        }
        this.timer = this.time.addEvent({
            delay: 10000,
            callback: this.timeUp,
            callbackScope: this
        });
    }
    checkAnswer(index) {
        const question = this.questions[this.currentQuestion];
        if (index === question.correct) {
            this.score++;
        }
        this.currentQuestion++;
        this.showNextQuestion();
    }
    timeUp() {
        this.currentQuestion++;
        this.showNextQuestion();
    }
    endQuiz() {
        this.questionText.setText('');
        for (let answerText of this.answerTexts) {
            answerText.setText('');
        }
        this.timerText.setText('');
        this.add.text(400, 250, `Quiz completed!\nYour score: ${this.score}/${this.questions.length}`, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            align: 'center'
        }).setOrigin(0.5);
        const exitButton = this.add.text(300, 400, 'Exit Quiz', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            backgroundColor: '#E0E0E0',
            padding: {
                x: 15,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        exitButton.on('pointerdown', () => this.exitQuiz());
        const retryButton = this.add.text(500, 400, 'Retry Quiz', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#87CEFA',
            backgroundColor: '#E0E0E0',
            padding: {
                x: 15,
                y: 10
            }
        }).setOrigin(0.5).setInteractive();
        retryButton.on('pointerdown', () => this.retryQuiz());
    }
    exitQuiz() {
        this.scene.start('PlaygroundScene', {
            fromQuiz: true,
            entryX: this.sys.game.config.width / 2,
            entryY: this.sys.game.config.height - 100
        });
    }
    retryQuiz() {
        this.score = 0;
        this.currentQuestion = 0;
        if (this.timer) {
            this.timer.remove();
        }
        this.showNextQuestion();
    }
    update() {
        if (this.timer) {
            this.timerText.setText(`Time left: ${Math.ceil(this.timer.getRemaining() / 1000)}s`);
        }
    }
}
class AILabScene extends Phaser.Scene {
    constructor() {
        super('AILabScene');
        this.dialogueSentences = [
            "Greetings, human! I'm AI Robo.",
            "What an incredible journey we've had through MMCOE!",
            "We've explored various labs and facilities.",
            "The future of AI is incredibly exciting and full of potential.",
            "For college students, AI offers amazing opportunities:",
            "1. Enhancing research capabilities",
            "2. Automating tedious tasks",
            "3. Providing personalized learning",
            "4. Opening new career paths",
            "Embrace AI, and shape the future!",
            "It's been a pleasure guiding you through MMCOE.",
            "I hope you've enjoyed the tour as much as I have.",
            "It's time for us to wrap up our journey now.",
            "Remember, the future is bright with AI!"
        ];
        this.currentSentenceIndex = 0;
        this.isAdvancing = false;
        this.imageSequence = [
            'image1',
            'image2',
            'image3',
            'image4',
            'image5'
        ];
        this.currentImageIndex = 0;
    }
    preload() {
        this.load.image('aiLabBackground', 'https://play.rosebud.ai/assets/AI LAB 2 (2).png?FrFP');
        this.load.image('image1', 'https://play.rosebud.ai/assets/WhatsApp Image 2024-11-15 at 1.03.10 AM.jpeg?yr58');
        this.load.image('image2', 'https://play.rosebud.ai/assets/WhatsApp Image 2024-11-15 at 1.11.30 AM.jpeg?8XGe');
        this.load.image('image3', 'https://play.rosebud.ai/assets/WhatsApp Image 2024-11-14 at 10.54.53 PM.jpeg?bTwa');
        this.load.image('image4', 'https://play.rosebud.ai/assets/WhatsApp Image 2024-11-16 at 1.55.18 PM.jpeg?LJrN');
        this.load.image('image5', 'https://play.rosebud.ai/assets/WhatsApp Image 2024-11-14 at 11.05.04 PM.jpeg?R24q');
    }
    create() {
        const {
            width,
            height
        } = this.scale;
        const aiLabMap = this.add.image(width / 2, height / 2, 'aiLabBackground');
        aiLabMap.setDisplaySize(width, height);
        this.cameras.main.setBounds(0, 0, width, height);
        // Create comic-style dialogue box
        this.dialogueBox = this.add.graphics();
        this.updateDialogueBox();
        // Create text for dialogue
        this.dialogueText = this.add.text(width / 2, height - 110, '', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#000000',
            align: 'center',
            wordWrap: {
                width: width - 100
            }
        });
        this.dialogueText.setOrigin(0.5);
        // Create interaction prompt
        this.interactionPrompt = this.add.text(width / 2, height - 20, 'Tap or Press E to continue', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        this.interactionPrompt.setOrigin(0.5);
        // Initially show dialogue box and text with the first sentence
        this.showDialogue();
        // Set up keyboard input
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        // Set up touch input
        this.input.on('pointerdown', this.handleInteraction, this);
    }
    updateDialogueBox() {
        const {
            width,
            height
        } = this.scale;
        const boxWidth = width - 60;
        const boxHeight = 160;
        const borderRadius = 20;
        const triangleHeight = 20;
        const x = 30;
        const y = height - boxHeight - 30;
        this.dialogueBox.clear();
        // Add shadow
        this.dialogueBox.fillStyle(0x000000, 0.3);
        this.dialogueBox.fillRoundedRect(x + 5, y + 5, boxWidth, boxHeight, borderRadius);
        // Main box
        this.dialogueBox.fillStyle(0xFFFFFF, 0.9);
        this.dialogueBox.fillRoundedRect(x, y, boxWidth, boxHeight, borderRadius);
        // Triangle
        this.dialogueBox.fillStyle(0xFFFFFF, 0.9);
        this.dialogueBox.fillTriangle(
            x + boxWidth / 2 - triangleHeight,
            y,
            x + boxWidth / 2 + triangleHeight,
            y,
            x + boxWidth / 2,
            y - triangleHeight
        );
        // Border
        this.dialogueBox.lineStyle(3, 0x000000, 1);
        this.dialogueBox.strokeRoundedRect(x, y, boxWidth, boxHeight, borderRadius);
        this.dialogueBox.beginPath();
        this.dialogueBox.moveTo(x + boxWidth / 2 - triangleHeight, y);
        this.dialogueBox.lineTo(x + boxWidth / 2, y - triangleHeight);
        this.dialogueBox.lineTo(x + boxWidth / 2 + triangleHeight, y);
        this.dialogueBox.closePath();
        this.dialogueBox.strokePath();
    }
    showDialogue() {
        this.dialogueBox.setVisible(true);
        this.dialogueText.setVisible(true);
        this.dialogueText.setText(this.dialogueSentences[this.currentSentenceIndex]);
        this.interactionPrompt.setVisible(true);
    }
    hideDialogue() {
        this.dialogueBox.setVisible(false);
        this.dialogueText.setVisible(false);
        this.interactionPrompt.setVisible(false);
    }
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.handleInteraction();
        }
    }
    handleInteraction() {
        if (!this.isAdvancing) {
            this.isAdvancing = true;
            this.currentSentenceIndex++;
            if (this.currentSentenceIndex < this.dialogueSentences.length) {
                this.showDialogue();
            } else {
                this.hideDialogue();
                this.startImageSequence();
            }
            // Reset the advancing flag after a short delay
            this.time.delayedCall(200, () => {
                this.isAdvancing = false;
            });
        }
    }
    startImageSequence() {
        this.showNextImage();
    }
    showNextImage() {
        if (this.currentImageIndex < this.imageSequence.length - 1) {
            const imageName = this.imageSequence[this.currentImageIndex];
            if (this.currentImage) {
                this.currentImage.destroy();
            }
            this.displayNewImage(imageName);
        } else {
            // Display the final constant image
            if (this.currentImage) {
                this.currentImage.destroy();
            }
            this.displayFinalImage();
            // End the game here
            this.endGame();
        }
    }
    displayNewImage(imageName) {
        this.currentImage = this.add.image(this.scale.width / 2, this.scale.height / 2, imageName);
        this.fitImageToFrame(this.currentImage);
        if (this.currentImageIndex === 0) {
            // Apply fade effect only for the first image
            this.currentImage.alpha = 0;
            this.tweens.add({
                targets: this.currentImage,
                alpha: 1,
                duration: 1000,
                onComplete: () => {
                    this.currentImageIndex++;
                    this.time.delayedCall(5000, () => {
                        this.showNextImage();
                    });
                }
            });
        } else {
            // For subsequent images, display without fade
            this.currentImage.alpha = 1;
            this.currentImageIndex++;
            this.time.delayedCall(5000, () => {
                this.showNextImage();
            });
        }
    }
    displayFinalImage() {
        this.currentImage = this.add.image(this.scale.width / 2, this.scale.height / 2, 'image5');
        this.fitImageToFrame(this.currentImage);
        // Remove any existing input listeners
        this.input.off('pointerdown', this.handleInteraction, this);
        this.input.keyboard.off('keydown-E');
        // Disable all scene updates
        this.scene.pause();
    }
    endGame() {
        // You can add any final game ending logic here if needed
        console.log('Game ended');
    }
    fitImageToFrame(image) {
        const scaleX = this.scale.width / image.width;
        const scaleY = this.scale.height / image.height;
        const scale = Math.max(scaleX, scaleY);
        image.setScale(scale);
        image.setPosition(this.scale.width / 2, this.scale.height / 2);
    }
}


class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }
    preload() {
        this.load.image('startBackground', 'https://play.rosebud.ai/assets/WhatsApp Image 2024-11-30 at 11.46.44 PM.jpeg?rxjo');
    }
    create() {
        const {
            width,
            height
        } = this.scale;
        // Add background image
        const background = this.add.image(width / 2, height / 2, 'startBackground');
        // Zoom in the background image by making it larger than the screen
        background.setDisplaySize(width * 1.5, height * 1.5);
        // Center the image
        background.setPosition(width / 2, height / 2);
        // Add start button
        const startButton = this.add.text(width / 2, height / 2, 'Start Game', {
                fontSize: '32px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: {
                    x: 20,
                    y: 10
                }
            })
            .setOrigin(0.5)
            .setInteractive({
                useHandCursor: true
            })
            .on('pointerdown', () => this.startGame());
        // Add hover effect
        startButton.on('pointerover', () => startButton.setStyle({
            fill: '#ff0'
        }));
        startButton.on('pointerout', () => startButton.setStyle({
            fill: '#ffffff'
        }));
    }
    startGame() {
        this.scene.start('LoadingScene');
    }
}
const config = {
    type: Phaser.AUTO,
    parent: 'renderDiv',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    width: 800,
    height: 600,
    scene: [StartScene, LoadingScene, OutdoorScene, MMCOEScene, EELScene, PhysicsLabScene, LiftScene, GroundFloorScene, EELQuizScene, PhysicsQuizScene, FirstFloorScene,PAQuizScene, PAScene, PlaygroundScene,AILabScene,SportsQuizScene,],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false
        }
    }
};
window.phaserGame = new Phaser.Game(config);
