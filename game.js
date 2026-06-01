/**
 * Cozy Fishing Valley - 2D Adventure & Fishing Game
 * Framework: Phaser 3 (Arcade Physics)
 * Multi-Scene Parallel Architecture & Procedural Cozy Assets
 */

// Global state to sync with HTML sidebar
let caughtCount = 0;
const fishCaughtLog = [];

// Procedural Sound Effects Synthesizer using HTML5 Web Audio API
class SFX {
    static init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    static playCast() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.03, this.ctx.currentTime); // Quiet balanced casting
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    static playPerfectCast() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1500, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime); // Quiet chime
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
    }

    static playPlop() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime); // Soft cozy water splash
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    static playReel() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        // Fast gear teeth ticking sound
        osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
        osc.frequency.setValueAtTime(150, this.ctx.currentTime + 0.015);

        gain.gain.setValueAtTime(0.02, this.ctx.currentTime); // Soft clicky volume
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
    }

    static playVictory() {
        this.init();
        if (!this.ctx) return;
        // Soft major arpeggio (C4, E4, G4, C5) - satisfying and cozy
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = 'triangle'; // pure woodwind-like cozy tone
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.08);

            gain.gain.setValueAtTime(0.03, this.ctx.currentTime + index * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.08 + 0.35);

            osc.start(this.ctx.currentTime + index * 0.08);
            osc.stop(this.ctx.currentTime + index * 0.08 + 0.35);
        });
    }

    static playFail() {
        this.init();
        if (!this.ctx) return;
        // Soft sad minor descent arpeggio (G4, Eb4, C4)
        const notes = [392.00, 311.13, 261.63];
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.1);

            gain.gain.setValueAtTime(0.025, this.ctx.currentTime + index * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.1 + 0.4);

            osc.start(this.ctx.currentTime + index * 0.1);
            osc.stop(this.ctx.currentTime + index * 0.1 + 0.4);
        });
    }
}

// 1. BootScene: Generates all pixel-art textures procedurally at runtime
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Star particle for matching green bar sparks
        const starCanvas = this.textures.createCanvas('sparkle', 8, 8);
        const starCtx = starCanvas.context;
        starCtx.fillStyle = '#ffffff';
        starCtx.beginPath();
        starCtx.moveTo(4, 0); starCtx.lineTo(5, 3); starCtx.lineTo(8, 4); starCtx.lineTo(5, 5);
        starCtx.lineTo(4, 8); starCtx.lineTo(3, 5); starCtx.lineTo(0, 4); starCtx.lineTo(3, 3);
        starCtx.closePath(); starCtx.fill();
        starCanvas.refresh();

        // Wave Bubble particle
        const bubbleCanvas = this.textures.createCanvas('bubble', 10, 10);
        const bubbleCtx = bubbleCanvas.context;
        bubbleCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        bubbleCtx.lineWidth = 1.5;
        bubbleCtx.beginPath();
        bubbleCtx.arc(5, 5, 3.5, 0, Math.PI * 2);
        bubbleCtx.stroke();
        bubbleCanvas.refresh();

        // Create dynamic 16x16 pixel-art fishing bobber float
        const bobberCanvas = this.textures.createCanvas('tile-bobber', 16, 16);
        const bobberCtx = bobberCanvas.context;
        // Shadow
        bobberCtx.fillStyle = 'rgba(0,0,0,0.2)';
        bobberCtx.fillRect(2, 10, 12, 3);
        // Red top half
        bobberCtx.fillStyle = '#ff3838';
        bobberCtx.beginPath();
        bobberCtx.arc(8, 6, 5, Math.PI, 0);
        bobberCtx.fill();
        // White bottom half
        bobberCtx.fillStyle = '#ffffff';
        bobberCtx.beginPath();
        bobberCtx.arc(8, 6, 5, 0, Math.PI);
        bobberCtx.fill();
        // Antenna stick
        bobberCtx.fillStyle = '#ffe59e';
        bobberCtx.fillRect(7, 0, 2, 4);
        bobberCanvas.refresh();

        // Create Procedural World Tiles
        this.createTileTexture('tile-sand', '#ffe59e', '#e2c074', 'sand');
        this.createTileTexture('tile-shore', '#74b9ff', '#ffffff', 'shore');
        this.createTileTexture('tile-deep', '#0984e3', '#2d3436', 'deep');
        this.createTileTexture('tile-grass', '#81b29a', '#f2cc8f', 'grass');
        this.createTileTexture('tile-rock', '#6e4e37', '#ab7a5e', 'rock');
        this.createTileTexture('tile-palm', '#27ae60', '#2ecc71', 'palm');
        this.createTileTexture('tile-coral', '#fd79a8', '#ff7675', 'coral');
        this.createTileTexture('tile-stone', '#7f8c8d', '#bdc3c7', 'stone');
        this.createTileTexture('tile-bridge', '#ab7a5e', '#d2a379', 'bridge');

        // Create 4-directional Player Poses (Normal, Cast, Charge)
        const directions = ['down', 'up', 'left', 'right'];
        directions.forEach(dir => {
            this.createPlayerTexture(`player-${dir}`, dir, 'normal');
            this.createPlayerTexture(`player-cast-${dir}`, dir, 'cast');
            this.createPlayerTexture(`player-charge-${dir}`, dir, 'charge');
        });
    }

    create() {
        this.scene.start('OverworldScene');
    }

    // Dynamic tile painters
    createTileTexture(key, baseColor, detailColor, type) {
        const canvas = this.textures.createCanvas(key, 40, 40);
        const ctx = canvas.context;
        
        // Base fill
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 40, 40);

        // Add soft borders or noise texture to make it look pixel-cozy
        ctx.fillStyle = detailColor;
        if (type === 'sand') {
            // tiny sand dots
            for (let i = 0; i < 6; i++) {
                ctx.fillRect(Math.random() * 36 + 2, Math.random() * 36 + 2, 2, 2);
            }
        } else if (type === 'shore') {
            // water ripples
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(4, 10, 12, 3);
            ctx.fillRect(20, 28, 16, 3);
        } else if (type === 'deep') {
            // deep ocean shade lines
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.fillRect(10, 18, 20, 4);
            ctx.fillRect(2, 32, 14, 4);
        } else if (type === 'grass') {
            // little flower dots
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(Math.random() * 36 + 2, Math.random() * 36 + 2, 3, 3);
            }
        } else if (type === 'rock') {
            // Fill with sand color first to blend into beach
            ctx.fillStyle = '#ffe59e';
            ctx.fillRect(0, 0, 40, 40);

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(6, 26, 28, 6);

            // Main block (driftwood / rock shape)
            ctx.fillStyle = baseColor; // #6e4e37 (mahogany)
            ctx.fillRect(8, 10, 24, 18);
            ctx.fillRect(6, 13, 28, 12);
            ctx.fillRect(11, 7, 18, 24);

            // Highlights
            ctx.fillStyle = detailColor; // #ab7a5e
            ctx.fillRect(10, 9, 8, 4);
            ctx.fillRect(8, 12, 4, 3);

            // Dark cracks / textures
            ctx.fillStyle = '#3d2314';
            ctx.fillRect(16, 14, 2, 8);
            ctx.fillRect(22, 12, 4, 2);
        } else if (type === 'palm') {
            // Sand base fill first
            ctx.fillStyle = '#ffe59e';
            ctx.fillRect(0, 0, 40, 40);

            // Shadow under tree
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(20, 34, 12, 4, 0, 0, Math.PI*2);
            ctx.fill();

            // Trunk (curved woody brown trunk)
            ctx.strokeStyle = '#6e4e37'; // dark brown trunk outline
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(20, 36);
            ctx.quadraticCurveTo(14, 24, 20, 12);
            ctx.stroke();

            ctx.strokeStyle = '#d2a379'; // lighter brown highlight line inside trunk
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(19.5, 34);
            ctx.quadraticCurveTo(14.5, 24, 19.5, 14);
            ctx.stroke();

            // Trunk horizontal ridges
            ctx.fillStyle = '#3d2314';
            ctx.fillRect(15, 28, 4, 1.5);
            ctx.fillRect(13, 20, 4, 1.5);
            ctx.fillRect(15, 14, 4, 1.5);

            // Palm/Coconut Leaves (curved forest green fans)
            ctx.fillStyle = '#27ae60'; // Main green leaves
            ctx.beginPath(); ctx.ellipse(10, 8, 10, 4, -0.4, 0, Math.PI*2); ctx.fill(); // leaf 1
            ctx.beginPath(); ctx.ellipse(30, 8, 10, 4, 0.4, 0, Math.PI*2); ctx.fill();  // leaf 2
            ctx.beginPath(); ctx.ellipse(20, 4, 5, 8, 0, 0, Math.PI*2); ctx.fill();    // leaf 3
            ctx.beginPath(); ctx.ellipse(12, 14, 8, 4, 0.3, 0, Math.PI*2); ctx.fill();  // leaf 4
            ctx.beginPath(); ctx.ellipse(28, 14, 8, 4, -0.3, 0, Math.PI*2); ctx.fill(); // leaf 5

            // Leaf highlights (lighter pastel green inside)
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.ellipse(10, 7, 7, 2, -0.4, 0, Math.PI*2);
            ctx.ellipse(30, 7, 7, 2, 0.4, 0, Math.PI*2);
            ctx.ellipse(20, 4, 3, 5, 0, 0, Math.PI*2);
            ctx.fill();

            // Coconuts!
            ctx.fillStyle = '#e2c074';
            ctx.beginPath();
            ctx.arc(17, 12, 3, 0, Math.PI*2);
            ctx.arc(23, 13, 2.5, 0, Math.PI*2);
            ctx.fill();
        } else if (type === 'coral') {
            // Sand base fill first
            ctx.fillStyle = '#ffe59e';
            ctx.fillRect(0, 0, 40, 40);

            // Shell shadow
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(10, 24, 20, 6);

            // Coral stems
            ctx.fillStyle = baseColor; // pastel pink
            ctx.fillRect(12, 14, 4, 12);
            ctx.fillRect(8, 14, 4, 4);
            ctx.fillRect(24, 16, 4, 10);
            ctx.fillRect(28, 16, 4, 4);
            ctx.fillRect(18, 10, 4, 16);
            ctx.fillRect(16, 22, 8, 4);

            // Highlights
            ctx.fillStyle = detailColor; // lighter pink
            ctx.fillRect(18, 10, 2, 4);
            ctx.fillRect(12, 14, 2, 3);
            ctx.fillRect(24, 16, 2, 3);
        } else if (type === 'stone') {
            // Sand base fill first
            ctx.fillStyle = '#ffe59e';
            ctx.fillRect(0, 0, 40, 40);

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(4, 28, 32, 6);

            // Main block (stone shape)
            ctx.fillStyle = baseColor; // #7f8c8d (grey)
            ctx.fillRect(8, 10, 24, 20);
            ctx.fillRect(6, 14, 28, 14);
            ctx.fillRect(12, 6, 16, 26);

            // Highlights
            ctx.fillStyle = detailColor; // #bdc3c7 (light grey)
            ctx.fillRect(12, 8, 8, 4);
            ctx.fillRect(8, 14, 4, 4);

            // Dark cracks / textures
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(16, 12, 2, 10);
            ctx.fillRect(20, 18, 6, 2);
        } else if (type === 'bridge') {
            // Base fill is dark wood border
            ctx.fillStyle = '#3d2314';
            ctx.fillRect(0, 0, 40, 40);

            // Draw horizontal wooden planks
            ctx.fillStyle = baseColor; // #ab7a5e (warm wood)
            ctx.fillRect(2, 2, 36, 10);
            ctx.fillRect(2, 14, 36, 12);
            ctx.fillRect(2, 28, 36, 10);

            // Highlights on plank top edges
            ctx.fillStyle = detailColor; // #d2a379 (caramel)
            ctx.fillRect(2, 2, 36, 2);
            ctx.fillRect(2, 14, 36, 2);
            ctx.fillRect(2, 28, 36, 2);

            // Rusty iron nails in planks
            ctx.fillStyle = '#4a3e3d';
            ctx.fillRect(6, 6, 2, 2);
            ctx.fillRect(32, 6, 2, 2);
            ctx.fillRect(6, 19, 2, 2);
            ctx.fillRect(32, 19, 2, 2);
            ctx.fillRect(6, 32, 2, 2);
            ctx.fillRect(32, 32, 2, 2);
        }
        
        // Outline grid
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 40, 40);
        
        canvas.refresh();
    }

    // Dynamic pixel characters (straw hat, overalls)
    createPlayerTexture(key, direction, isCast = false) {
        const canvas = this.textures.createCanvas(key, 32, 42);
        const ctx = canvas.context;

        // Shadow under player
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(16, 38, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Hat (Cozy straw hat)
        ctx.fillStyle = '#d2a379'; // Straw gold
        ctx.fillRect(4, 12, 24, 6); // Hat brim
        ctx.fillStyle = '#ab7a5e'; // Dark straw crown
        ctx.fillRect(9, 6, 14, 7); // Hat dome
        ctx.fillStyle = '#e07a5f'; // Cute red hat ribbon
        ctx.fillRect(9, 11, 14, 2);

        // 2. Head & Face
        ctx.fillStyle = '#ffdbac'; // Skin tone
        ctx.fillRect(8, 17, 16, 8); // Head box
        
        // Eyes and hair details based on direction
        ctx.fillStyle = '#4a3e3d'; // Eye/hair color
        if (direction === 'down') {
            ctx.fillRect(11, 20, 2, 2); // left eye
            ctx.fillRect(19, 20, 2, 2); // right eye
            ctx.fillStyle = '#e07a5f';   // blush
            ctx.fillRect(10, 22, 2, 1);
            ctx.fillRect(20, 22, 2, 1);
        } else if (direction === 'left') {
            ctx.fillRect(9, 20, 2, 2); // left-looking eye
            ctx.fillStyle = '#ab7a5e';   // hair back
            ctx.fillRect(20, 17, 4, 8);
        } else if (direction === 'right') {
            ctx.fillRect(21, 20, 2, 2); // right-looking eye
            ctx.fillStyle = '#ab7a5e';
            ctx.fillRect(8, 17, 4, 8);
        } else if (direction === 'up') {
            ctx.fillStyle = '#ab7a5e';   // pure hair covering back head
            ctx.fillRect(8, 17, 16, 8);
        }

        // 3. Body (Mahogany dungarees overalls)
        ctx.fillStyle = '#6e4e37'; // brown overalls
        ctx.fillRect(8, 25, 16, 10);
        ctx.fillStyle = '#fdfaf6'; // warm shirt under
        ctx.fillRect(8, 25, 16, 2); // top shirt line
        ctx.fillStyle = '#3d5a80'; // blue details
        ctx.fillRect(11, 25, 2, 4); // straps
        ctx.fillRect(19, 25, 2, 4);

        // 4. Feet (Tiny pixel boots)
        ctx.fillStyle = '#4a3e3d';
        ctx.fillRect(9, 35, 5, 3);
        ctx.fillRect(18, 35, 5, 3);

        // 5. Fishing Rod holding overlay
        ctx.strokeStyle = '#d2a379'; // Wooden pole
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (isCast) {
            if (direction === 'down') {
                ctx.moveTo(22, 29); ctx.lineTo(34, 38);
            } else if (direction === 'left') {
                ctx.moveTo(10, 29); ctx.lineTo(-8, 32);
            } else if (direction === 'right') {
                ctx.moveTo(22, 29); ctx.lineTo(40, 32);
            } else if (direction === 'up') {
                ctx.moveTo(10, 27); ctx.lineTo(2, 22);
            }
        } else {
            if (direction === 'down') {
                ctx.moveTo(22, 29); ctx.lineTo(34, 18);
            } else if (direction === 'left') {
                ctx.moveTo(10, 29); ctx.lineTo(-2, 18);
            } else if (direction === 'right') {
                ctx.moveTo(22, 29); ctx.lineTo(34, 18);
            } else if (direction === 'up') {
                ctx.moveTo(10, 27); ctx.lineTo(2, 12);
            }
        }
        ctx.stroke();

        canvas.refresh();
    }
}

// 2. OverworldScene: Top-Down exploration scene (Grid map, shoreline trigger, difficulty modal)
class OverworldScene extends Phaser.Scene {
    constructor() {
        super('OverworldScene');
    }

    create() {
        this.cameras.main.flash(500, 246, 235, 217);

        // Map Setup: 20 columns by 15 rows of 40x40 tiles
        // Grid setup: 
        // 0 = Sand, 1 = Shoreline Wave Line (Collidable, Fishing trigger!), 2 = Deep Ocean (Collidable)
        // 3 = Driftwood (Collidable), 4 = Coconut Tree (Collidable), 5 = Sea Coral (Walkable), 6 = Grey Rock (Collidable)
        // 7 = Wooden Bridge Pier (Walkable!)
        this.mapLayout = [
            [4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 4, 0], // Row 0 (Palm trees at top)
            [0, 0, 3, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 5, 0, 0, 0], // Row 1
            [0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0], // Row 2 (Grey rocks)
            [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0], // Row 3
            [4, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 4], // Row 4 (Palm trees on sides)
            [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 6, 0], // Row 5
            [0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 6
            [0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0], // Row 7 (Player spawn at col 9, row 7 is clear!)
            [0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0], // Row 8
            [0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0], // Row 9
            [0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0], // Row 10
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Row 11 (Bridge in columns 9-10)
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 7, 7, 2, 2, 2, 2, 2, 2, 2, 2, 2], // Row 12
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 7, 7, 2, 2, 2, 2, 2, 2, 2, 2, 2], // Row 13
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 7, 7, 2, 2, 2, 2, 2, 2, 2, 2, 2]  // Row 14
        ];

        // Draw Map tiles & Create static physics obstacles group
        this.obstacles = this.physics.add.staticGroup();
        this.fishingZones = []; // array of tile coords representing shoreline water

        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 20; c++) {
                const val = this.mapLayout[r][c];
                const px = c * 40 + 20;
                const py = r * 40 + 20;

                // Base sand is drawn underneath all upper beach elements (rows 0-10)
                if (r <= 10) {
                    this.add.image(px, py, 'tile-sand');
                }

                if (val === 2) {
                    // Deep Ocean
                    const tile = this.add.image(px, py, 'tile-deep');
                    this.obstacles.add(tile);
                } else if (val === 1) {
                    // Shoreline wave crashing zone (blocks movement, triggers fishing)
                    const tile = this.add.image(px, py, 'tile-shore');
                    this.obstacles.add(tile); // Add to physics obstacles group
                    this.fishingZones.push({ row: r, col: c, x: px, y: py });
                } else if (val === 3) {
                    // Driftwood obstacle
                    const tile = this.add.image(px, py, 'tile-rock');
                    this.obstacles.add(tile);
                } else if (val === 4) {
                    // Coconut tree obstacle
                    const tile = this.add.image(px, py, 'tile-palm');
                    this.obstacles.add(tile);
                } else if (val === 5) {
                    // Walkable Sea Coral background detail
                    this.add.image(px, py, 'tile-coral');
                } else if (val === 6) {
                    // Grey Rock obstacle
                    const tile = this.add.image(px, py, 'tile-stone');
                    this.obstacles.add(tile);
                } else if (val === 7) {
                    // Wooden bridge pier plank
                    this.add.image(px, py, 'tile-bridge');
                }
            }
        }

        // Add dynamic animated wave layer graphics (behind player)
        this.waveGraphics = this.add.graphics();

        // Spawn Player Sprite in middle of Sand beach (column 9, row 7 = 360, 280)
        this.player = this.physics.add.sprite(360, 280, 'player-down');
        this.player.setCollideWorldBounds(true);
        this.player.setSize(22, 20); // compact collider size around feet
        this.player.setOffset(5, 20);

        // Add Collision between player and deep water obstacles
        this.physics.add.collider(this.player, this.obstacles);

        // 1.5x Camera Zoom & Smooth Player Follow for cozy Stardew Valley exploration
        this.cameras.main.setZoom(1.5);
        this.cameras.main.setBounds(0, 0, 800, 600); // Lock camera boundaries to map size
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08); // Lerp follow coordinates

        // Setup Controls (WASD & Arrows)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        // Facing direction tracking ('down', 'up', 'left', 'right')
        this.playerFacing = 'down';

        // Shoreline Alert Tooltip Bubble (hidden initially)
        this.shoreAlert = this.add.text(0, 0, '🎣 กด Spacebar เพื่อตกปลา', {
            fontFamily: 'Fredoka',
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#4a3e3d',
            backgroundColor: '#a8d5ba', // Pastel Green glow
            padding: { x: 8, y: 4 },
            borderRadius: 6
        }).setOrigin(0.5, 1.8).setVisible(false).setStroke('#fdfaf6', 2);

        // Dialog UI Layer (For Difficulty Modal inside Phaser)
        this.dialogActive = false;
        this.dialogContainer = null;

        // Custom Toast notification drawer
        this.toastText = null;

        // Listen for results from the Parallel Fishing scene
        this.game.events.on('fishing-success', this.onFishingSuccess, this);
        this.game.events.on('fishing-fail', this.onFishingFail, this);

        // Hook clean-ups to prevent double event listeners if scene resets
        this.events.on('shutdown', () => {
            this.game.events.off('fishing-success', this.onFishingSuccess, this);
            this.game.events.off('fishing-fail', this.onFishingFail, this);
        });

        // Angling state machine initialization
        this.anglingState = 'idle'; // 'idle', 'charging', 'launching', 'waiting', 'biting'
        this.chargePower = 0;
        this.chargeDir = 1;
        this.bobberSprite = null;

        this.chargeGraphics = this.add.graphics();
        this.chargeGraphics.setDepth(100); // render on top of player/tiles

        this.biteAlert = this.add.text(0, 0, '❗ BITE!', {
            fontFamily: 'Fredoka',
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#fdfaf6',
            backgroundColor: '#e07a5f',
            padding: { x: 10, y: 6 },
            borderRadius: 6
        }).setOrigin(0.5, 2.4).setVisible(false).setStroke('#3d2314', 3.5).setDepth(200);

        // Fishing line graphics overlay - high depth to ensure visibility on top of everything!
        this.fishingLineGraphics = this.add.graphics();
        this.fishingLineGraphics.setDepth(150);

        // Universal keydown SPACE and mouse pointerdown listener
        this.input.keyboard.on('keydown-SPACE', () => {
            this.handleAnglingInput();
        });
        this.input.on('pointerdown', () => {
            this.handleAnglingInput();
        });
    }

    update(time, delta) {
        // Redraw dynamic animated wave line at the shoreline boundary (Row 11 = y: 440)
        this.drawAnimatedWaves(time);

        // Angling State Machine Handling
        if (this.anglingState !== 'idle') {
            this.player.setVelocity(0, 0); // Lock movement

            if (this.anglingState === 'charging') {
                // Check if space key or mouse is still held down
                const isHolding = this.keys.SPACE.isDown || this.input.activePointer.isDown;
                if (isHolding) {
                    // Update power bar charge value
                    this.chargePower += this.chargeDir * delta * 0.18; // speed of charging meter
                    if (this.chargePower >= 100) {
                        this.chargePower = 100;
                        this.chargeDir = -1;
                    } else if (this.chargePower <= 0) {
                        this.chargePower = 0;
                        this.chargeDir = 1;
                    }

                    // Render vertical charge power meter beside the player's head
                    if (this.chargeGraphics) {
                        this.chargeGraphics.clear();
                        const px = this.player.x + 18;
                        const py = this.player.y - 25;
                        const barW = 8;
                        const barH = 36;

                        // Dark wood outer border card
                        this.chargeGraphics.fillStyle(0x3d2314, 0.85);
                        this.chargeGraphics.fillRect(px - 2, py - 2, barW + 4, barH + 4);

                        // Empty bar black inner background
                        this.chargeGraphics.fillStyle(0x222222, 0.95);
                        this.chargeGraphics.fillRect(px, py, barW, barH);

                        // Fill height based on charge percent
                        const fillH = (this.chargePower / 100) * barH;
                        const fillY = py + barH - fillH;

                        let fillColor = 0x81b29a; // Cozy green
                        if (this.chargePower > 85) {
                            fillColor = 0xe07a5f; // Cozy max red/orange
                        } else if (this.chargePower > 50) {
                            fillColor = 0xf2cc8f; // Cozy mid yellow
                        }

                        this.chargeGraphics.fillStyle(fillColor, 1);
                        this.chargeGraphics.fillRect(px, fillY, barW, fillH);
                    }
                } else {
                    // Released! Fire the bobber launch
                    this.launchBobber();
                }
            } else {
                // If launching, waiting, or biting: Draw the realistic high-contrast double-pass line
                if (this.bobberSprite && this.fishingLineGraphics) {
                    this.fishingLineGraphics.clear();
                    const tip = this.getRodTipPosition();
                    const bx = this.bobberSprite.x;
                    const by = this.bobberSprite.y - 4; // attach to the antenna stick tip of the bobber

                    // Pass 1: Draw high-contrast thick dark border outline
                    this.fishingLineGraphics.lineStyle(3.5, 0x3d2314, 0.9); // Thick charcoal outline
                    this.fishingLineGraphics.lineBetween(tip.x, tip.y, bx, by);

                    // Pass 2: Draw bright cozy white inner core line on top!
                    this.fishingLineGraphics.lineStyle(1.5, 0xffffff, 0.95); // Bright white inner core
                    this.fishingLineGraphics.lineBetween(tip.x, tip.y, bx, by);
                } else {
                    if (this.fishingLineGraphics) this.fishingLineGraphics.clear();
                }

                if (this.anglingState === 'waiting') {
                    // Floating bounce animation in water
                    if (this.bobberSprite) {
                        this.bobberSprite.y = this.bobberTargetY + Math.sin(time * 0.005) * 2.5;
                    }
                } else if (this.anglingState === 'biting') {
                    // Floating bounce animation in water
                    if (this.bobberSprite) {
                        this.bobberSprite.y = this.bobberTargetY + Math.sin(time * 0.005) * 2.5;
                    }

                    this.biteAlert.setVisible(true);
                    this.biteAlert.setPosition(this.player.x, this.player.y);
                    this.biteAlert.setScale(1 + Math.sin(time * 0.02) * 0.08); // Pulse animation
                    if (time > this.biteEndTime) {
                        this.failBiteReaction(); // Response window closed
                    }
                }
            }

            if (this.anglingState !== 'biting') {
                this.biteAlert.setVisible(false);
            }
            return;
        }

        if (this.dialogActive) {
            // Freeze player physics completely if modal popup is active
            this.player.setVelocity(0, 0);
            return;
        }

        // 1. INPUT HANDLING: 8-Directional Movement (WASD + Arrows)
        let velX = 0;
        let velY = 0;
        const walkSpeed = 160;

        // X axis movement
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            velX = -walkSpeed;
            this.playerFacing = 'left';
            this.player.setTexture('player-left');
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            velX = walkSpeed;
            this.playerFacing = 'right';
            this.player.setTexture('player-right');
        }

        // Y axis movement
        if (this.cursors.up.isDown || this.keys.W.isDown) {
            velY = -walkSpeed;
            this.playerFacing = 'up';
            this.player.setTexture('player-up');
        } else if (this.cursors.down.isDown || this.keys.S.isDown) {
            velY = walkSpeed;
            this.playerFacing = 'down';
            this.player.setTexture('player-down');
        }

        // Diagonal speed clamp (normalize vector speed)
        if (velX !== 0 && velY !== 0) {
            velX *= 0.7071;
            velY *= 0.7071;
        }

        this.player.setVelocity(velX, velY);

        // 2. SHORELINE PROXIMITY CHECKING
        const canFish = this.checkShorelineProximity();
        if (this.proximityAlertActive === undefined) {
            this.proximityAlertActive = false;
        }

        if (canFish) {
            if (!this.proximityAlertActive) {
                this.proximityAlertActive = true;
                SFX.playPlop(); // Soft alert bubble sound!
            }
            this.shoreAlert.setVisible(true);
            this.shoreAlert.setPosition(this.player.x, this.player.y);
        } else {
            this.proximityAlertActive = false;
            this.shoreAlert.setVisible(false);
        }
    }

    handleAnglingInput() {
        if (!this.scene.isActive('OverworldScene')) return;
        if (this.dialogActive) return;

        if (this.anglingState === 'idle') {
            if (this.checkShorelineProximity()) {
                this.startChargingSetup();
            }
        } else if (this.anglingState === 'charging') {
            // Already charging (handled by holds/update)
        } else if (this.anglingState === 'launching' || this.anglingState === 'waiting') {
            // Pull rod/bait back early!
            const cooldownPassed = !this.castTime || (this.time.now - this.castTime > 400);
            if (cooldownPassed) {
                this.cancelAngling();
            }
        } else if (this.anglingState === 'biting') {
            // Reeled in time, trigger minigame!
            this.successBiteReaction();
        }
    }

    getRodTipPosition() {
        let rx = this.player.x;
        let ry = this.player.y;
        
        if (this.playerFacing === 'down') {
            rx += 18;
            ry += 17;
        } else if (this.playerFacing === 'left') {
            rx -= 24;
            ry += 11;
        } else if (this.playerFacing === 'right') {
            rx += 24;
            ry += 11;
        } else if (this.playerFacing === 'up') {
            rx -= 14;
            ry += 1;
        }
        return { x: rx, y: ry };
    }

    startChargingSetup() {
        this.anglingState = 'charging';
        this.chargePower = 0;
        this.chargeDir = 1;
        this.player.setVelocity(0, 0); // Lock movement
        this.shoreAlert.setVisible(false);
        
        // Set sprite to charging posture (rod backward)
        this.player.setTexture('player-charge-' + this.playerFacing);
    }

    createSplashRipple(x, y) {
        const ripple = this.add.graphics();
        ripple.setDepth(8);
        
        const rippleData = { scale: 1, alpha: 0.8 };
        
        this.tweens.add({
            targets: rippleData,
            scale: 6,
            alpha: 0,
            duration: 650,
            ease: 'Quad.easeOut',
            onUpdate: () => {
                ripple.clear();
                ripple.lineStyle(1.5, 0xffffff, rippleData.alpha);
                ripple.strokeCircle(x, y, rippleData.scale * 3);
            },
            onComplete: () => {
                ripple.destroy();
            }
        });
    }

    launchBobber() {
        this.anglingState = 'launching';
        this.castTime = this.time.now;
        
        // Clear charge graphics bar
        if (this.chargeGraphics) {
            this.chargeGraphics.clear();
        }
        
        // Set sprite to casting posture (rod forward)
        this.player.setTexture('player-cast-' + this.playerFacing);
        
        // Play rod swinging sound!
        SFX.playCast();
        
        // Save the power multiplier to affect landing distance and rarity chance!
        this.castDistanceMultiplier = this.chargePower / 100;
        
        // Perfect MAX chime effect if power is high!
        if (this.chargePower >= 92) {
            SFX.playPerfectCast();
            
            // Show perfect floating pop-up text!
            const textMsg = this.chargePower >= 98 ? 'PERFECT! 🌟' : 'MAX! 🔥';
            const floatText = this.add.text(this.player.x, this.player.y - 20, textMsg, {
                fontFamily: 'Fredoka',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#ffe59e',
                stroke: '#3d2314',
                strokeThickness: 3
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: floatText,
                y: this.player.y - 50,
                alpha: 0,
                duration: 900,
                onComplete: () => floatText.destroy()
            });
        }
        
        // Distance calculation
        const pCol = Math.floor(this.player.x / 40);
        const pRow = Math.floor(this.player.y / 40);
        
        // Determine how far to throw: 1 to 3.2 tiles based on power
        const tilesToThrow = 1 + (this.chargePower / 100) * 2.2;
        
        let bCol = pCol;
        let bRow = pRow;
        
        if (this.playerFacing === 'down') bRow += tilesToThrow;
        else if (this.playerFacing === 'up') bRow -= tilesToThrow;
        else if (this.playerFacing === 'left') bCol -= tilesToThrow;
        else if (this.playerFacing === 'right') bCol += tilesToThrow;
        
        // Bound clamp to keep it on board map
        bCol = Phaser.Math.Clamp(bCol, 0, 19);
        bRow = Phaser.Math.Clamp(bRow, 0, 14);
        
        const targetX = bCol * 40 + 20;
        const targetY = bRow * 40 + 20;
        
        // Spawn flying bobber from rod tip position
        const startTip = this.getRodTipPosition();
        this.bobberSprite = this.add.sprite(startTip.x, startTip.y, 'tile-bobber');
        this.bobberSprite.setDepth(10);
        
        // Tween bobber flying in an arc!
        this.tweens.add({
            targets: this.bobberSprite,
            x: targetX,
            y: targetY,
            duration: 600, // 0.6 seconds flight time
            ease: 'Quad.easeOut',
            onUpdate: (tween, target) => {
                const progress = tween.progress;
                // High curve arc offset
                const arcHeight = Math.sin(progress * Math.PI) * -35;
                target.y = startTip.y + (targetY - startTip.y) * progress + arcHeight;
            },
            onComplete: () => {
                // Splash down water sound!
                SFX.playPlop();
                
                // Draw expanding water ripples
                this.createSplashRipple(targetX, targetY);
                
                // Transition state to waiting
                this.anglingState = 'waiting';
                this.bobberTargetY = targetY;
                
                // Schedule random quick bite wait time strictly under 10 seconds:
                // Let's use 1.0 to 3.0 seconds!
                const waitTime = Phaser.Math.Between(1000, 3000);
                this.biteTimer = this.time.delayedCall(waitTime, () => {
                    if (this.anglingState === 'waiting') {
                        this.anglingState = 'biting';
                        this.biteEndTime = this.time.now + 1200; // 1.2 seconds bite window
                        SFX.playPlop(); // splash bite sound
                    }
                });
            }
        });
    }

    cancelAngling() {
        this.anglingState = 'idle';
        if (this.bobberSprite) {
            this.bobberSprite.destroy();
            this.bobberSprite = null;
        }
        this.biteAlert.setVisible(false);
        if (this.fishingLineGraphics) {
            this.fishingLineGraphics.clear();
        }
        if (this.chargeGraphics) {
            this.chargeGraphics.clear();
        }
        // Restore player posture
        this.player.setTexture('player-' + this.playerFacing);
        this.showToastNotification('🎣 ดึงเบ็ดเปล่ากลับฝั่ง...', '#f2cc8f');
    }

    failBiteReaction() {
        this.anglingState = 'idle';
        if (this.bobberSprite) {
            this.bobberSprite.destroy();
            this.bobberSprite = null;
        }
        this.biteAlert.setVisible(false);
        if (this.fishingLineGraphics) {
            this.fishingLineGraphics.clear();
        }
        if (this.chargeGraphics) {
            this.chargeGraphics.clear();
        }
        // Restore player posture
        this.player.setTexture('player-' + this.playerFacing);

        SFX.playFail(); // Play disappointed slide note
        this.showToastNotification('💨 ปลาสะบัดเบ็ดหนีไปแล้ว! ตอบสนองช้าเกินไป', '#e07a5f');
    }

    successBiteReaction() {
        this.anglingState = 'minigame'; // Set to 'minigame' state to lock controls, while keeping OverworldScene active
        if (this.bobberSprite) {
            this.bobberSprite.destroy();
            this.bobberSprite = null;
        }
        this.biteAlert.setVisible(false);
        if (this.fishingLineGraphics) {
            this.fishingLineGraphics.clear();
        }
        if (this.chargeGraphics) {
            this.chargeGraphics.clear();
        }
        // Restore player posture
        this.player.setTexture('player-' + this.playerFacing);

        // Boost higher rarity based on power casting distance multiplier!
        const rand = Math.random();
        const dist = this.castDistanceMultiplier || 0.5;
        let difficulty = 'easy';
        
        const hardChance = 0.05 + dist * 0.25; // up to 30% hard chance at max power
        const medChance = 0.25 + dist * 0.35;  // up to 60% medium chance at max power
        
        if (rand < hardChance) {
            difficulty = 'hard';
        } else if (rand < hardChance + medChance) {
            difficulty = 'medium';
        } else {
            difficulty = 'easy';
        }

        // Show flash camera effect
        this.cameras.main.flash(200, 255, 255, 255);

        // Directly transition into parallel FishingScene overlay minigame without pausing OverworldScene
        this.scene.launch('FishingScene', { difficulty: difficulty });
    }

    // Dynamic wave simulation drawn with Phaser Graphics (zigzag wave foam + gradient fill overlay)
    drawAnimatedWaves(time) {
        if (!this.waveGraphics) return;
        this.waveGraphics.clear();

        // 1. Fill the ocean water background below the shoreline, splitting around the bridge (x: 360 to 440)
        this.waveGraphics.fillStyle(0x0984e3, 1);
        this.waveGraphics.fillRect(0, 440, 360, 160); // Left Ocean
        this.waveGraphics.fillRect(440, 440, 360, 160); // Right Ocean

        const waveY = 440;
        const amplitude = 6;
        const frequency = 0.035;

        // 2. Draw Left Wave overlay and foam
        this.waveGraphics.fillStyle(0x74b9ff, 0.75);
        this.waveGraphics.beginPath();
        this.waveGraphics.moveTo(0, 600);
        this.waveGraphics.lineTo(0, waveY + Math.sin(time * 0.002) * 3);
        for (let x = 0; x <= 360; x += 15) {
            const waveOffset = Math.sin(x * frequency + time * 0.0028) * amplitude;
            const zigzagFoam = (x % 30 === 0) ? -2.5 : 2.5;
            this.waveGraphics.lineTo(x, waveY + waveOffset + zigzagFoam);
        }
        this.waveGraphics.lineTo(360, 600);
        this.waveGraphics.closePath();
        this.waveGraphics.fillPath();

        this.waveGraphics.lineStyle(4, 0xffffff, 0.95);
        this.waveGraphics.beginPath();
        this.waveGraphics.moveTo(0, waveY + Math.sin(time * 0.002) * 3);
        for (let x = 0; x <= 360; x += 15) {
            const waveOffset = Math.sin(x * frequency + time * 0.0028) * amplitude;
            const zigzagFoam = (x % 30 === 0) ? -2.5 : 2.5;
            this.waveGraphics.lineTo(x, waveY + waveOffset + zigzagFoam);
        }
        this.waveGraphics.strokePath();

        // Left soft secondary wave foam line
        this.waveGraphics.lineStyle(2.5, 0xdfe6e9, 0.45);
        this.waveGraphics.beginPath();
        this.waveGraphics.moveTo(0, waveY + 12 + Math.cos(time * 0.0015) * 2);
        for (let x = 0; x <= 360; x += 20) {
            const waveOffset2 = Math.cos(x * 0.025 - time * 0.0022) * 4;
            this.waveGraphics.lineTo(x, waveY + 12 + waveOffset2);
        }
        this.waveGraphics.strokePath();


        // 3. Draw Right Wave overlay and foam
        this.waveGraphics.fillStyle(0x74b9ff, 0.75);
        this.waveGraphics.beginPath();
        this.waveGraphics.moveTo(440, 600);
        this.waveGraphics.lineTo(440, waveY + Math.sin(time * 0.002) * 3);
        for (let x = 440; x <= 800; x += 15) {
            const waveOffset = Math.sin(x * frequency + time * 0.0028) * amplitude;
            const zigzagFoam = (x % 30 === 0) ? -2.5 : 2.5;
            this.waveGraphics.lineTo(x, waveY + waveOffset + zigzagFoam);
        }
        this.waveGraphics.lineTo(800, 600);
        this.waveGraphics.closePath();
        this.waveGraphics.fillPath();

        this.waveGraphics.lineStyle(4, 0xffffff, 0.95);
        this.waveGraphics.beginPath();
        this.waveGraphics.moveTo(440, waveY + Math.sin(time * 0.002) * 3);
        for (let x = 440; x <= 800; x += 15) {
            const waveOffset = Math.sin(x * frequency + time * 0.0028) * amplitude;
            const zigzagFoam = (x % 30 === 0) ? -2.5 : 2.5;
            this.waveGraphics.lineTo(x, waveY + waveOffset + zigzagFoam);
        }
        this.waveGraphics.strokePath();

        // Right soft secondary wave foam line
        this.waveGraphics.lineStyle(2.5, 0xdfe6e9, 0.45);
        this.waveGraphics.beginPath();
        this.waveGraphics.moveTo(440, waveY + 12 + Math.cos(time * 0.0015) * 2);
        for (let x = 440; x <= 800; x += 20) {
            const waveOffset2 = Math.cos(x * 0.025 - time * 0.0022) * 4;
            this.waveGraphics.lineTo(x, waveY + 12 + waveOffset2);
        }
        this.waveGraphics.strokePath();
    }

    // Check if player is adjacent to water shore tile and facing it
    checkShorelineProximity() {
        // Find player's center grid tile position
        const pCol = Math.floor(this.player.x / 40);
        const pRow = Math.floor(this.player.y / 40);

        // Bound check for player tile
        if (pCol < 0 || pCol >= 20 || pRow < 0 || pRow >= 15) return false;

        // Project a checking coordinate 1 step ahead based on player's facing direction
        let checkCol = pCol;
        let checkRow = pRow;

        if (this.playerFacing === 'down') checkRow += 1;
        else if (this.playerFacing === 'up') checkRow -= 1;
        else if (this.playerFacing === 'left') checkCol -= 1;
        else if (this.playerFacing === 'right') checkCol += 1;

        // Bound clamps
        if (checkCol < 0 || checkCol >= 20 || checkRow < 0 || checkRow >= 15) {
            return false;
        }

        const currentTileType = this.mapLayout[pRow][pCol];
        const frontTileType = this.mapLayout[checkRow][checkCol];

        // 1. If player is standing on sand and front tile is shoreline wave (value 1)
        if (currentTileType !== 7 && frontTileType === 1) {
            return true;
        }

        // 2. If player is standing on the wooden bridge (value 7) and front tile is shoreline (value 1) or deep ocean (value 2)
        if (currentTileType === 7 && (frontTileType === 1 || frontTileType === 2)) {
            return true;
        }

        return false;
    }

    getRodTipPosition() {
        let rx = this.player.x;
        let ry = this.player.y;
        
        if (this.playerFacing === 'down') {
            rx += 18;
            ry += 17;
        } else if (this.playerFacing === 'left') {
            rx -= 24;
            ry += 11;
        } else if (this.playerFacing === 'right') {
            rx += 24;
            ry += 11;
        } else if (this.playerFacing === 'up') {
            rx -= 14;
            ry += 1;
        }
        return { x: rx, y: ry };
    }


    // Capture Fishing victory events
    onFishingSuccess(data) {
        this.input.keyboard.resetKeys(); // Reset any stuck keyboard states
        this.dialogActive = false;
        this.anglingState = 'idle';
        if (this.fishingLineGraphics) this.fishingLineGraphics.clear();
        if (this.chargeGraphics) this.chargeGraphics.clear();
        this.player.setTexture('player-' + this.playerFacing);

        // Process caught count
        caughtCount++;
        document.getElementById('caught-count').innerText = `${caughtCount} ตัว`;

        // Update Log list
        this.updateHTMLFishingLog(data.difficulty, true);

        // Show Toast overlay inside canvas
        this.showToastNotification(`🏆 ตกได้สำเร็จ! ตกปลาได้ระดับ [${data.difficulty.toUpperCase()}]`, '#a8d5ba');
    }

    // Capture Fishing fail events
    onFishingFail(data) {
        this.input.keyboard.resetKeys(); // Reset any stuck keyboard states
        this.dialogActive = false;
        this.anglingState = 'idle';
        if (this.fishingLineGraphics) this.fishingLineGraphics.clear();
        if (this.chargeGraphics) this.chargeGraphics.clear();
        this.player.setTexture('player-' + this.playerFacing);

        // Update Log list
        this.updateHTMLFishingLog(data.difficulty, false);

        // Show Fail Toast overlay
        this.showToastNotification('💨 ปลาสะบัดเบ็ดหลุดตัวหนีไปแล้ว!', '#e07a5f');
    }

    // Slides a beautiful cozy pop-up Toast notification down from top screen in Phaser
    showToastNotification(message, bgHexColor) {
        if (this.toastText) {
            this.toastText.destroy();
        }

        // Draw toast card
        this.toastText = this.add.text(400, -50, message, {
            fontFamily: 'Fredoka',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#4a3e3d',
            backgroundColor: bgHexColor,
            padding: { x: 20, y: 10 },
            borderRadius: 6
        }).setOrigin(0.5).setStroke('#6e4e37', 2).setDepth(200);

        // Tween sliding down and back up
        this.tweens.add({
            targets: this.toastText,
            y: 45,
            duration: 400,
            ease: 'Back.easeOut',
            completeDelay: 2200,
            onComplete: () => {
                this.tweens.add({
                    targets: this.toastText,
                    y: -50,
                    duration: 350,
                    ease: 'Quad.easeIn',
                    onComplete: () => {
                        this.toastText.destroy();
                        this.toastText = null;
                    }
                });
            }
        });
    }

    // Appends dynamic log alerts into the index.html sidebar logging track
    updateHTMLFishingLog(difficulty, isSuccess) {
        const logBox = document.getElementById('log-box');
        
        // Remove empty state message
        const emptyMsg = logBox.querySelector('.empty-log-msg');
        if (emptyMsg) {
            emptyMsg.remove();
        }

        // Create log item container
        const item = document.createElement('div');
        item.className = `log-item ${difficulty}`;
        
        // Fish details dictionary
        const fishList = {
            easy: ['ปลาคาร์ปส้ม (Koi Fish)', 'ปลานิลแม่น้ำ (Tilapia)', 'ปลาซิวจิ๋ว (Minnow)'],
            medium: ['ปลาแซลมอนสีรุ้ง (Rainbow Salmon)', 'ปลาทูน่าครีบเหลือง (Tuna)', 'ปลาชะโดเกราะ (Pike)'],
            hard: ['ราชาปลาใต้มหาสมุทร (Legendary Sturgeon)', 'ฉลามหัวค้อนวัยรุ่น (Hammerhead)', 'ปลากระเบนไฟฟ้า (Electric Ray)']
        };

        const list = fishList[difficulty];
        const fishName = list[Math.floor(Math.random() * list.length)];
        const difficultyTH = difficulty === 'easy' ? 'ง่าย' : (difficulty === 'medium' ? 'ปานกลาง' : 'ยาก');

        if (isSuccess) {
            item.innerHTML = `
                <span>🐟 <strong>${fishName}</strong></span>
                <span class="fish-badge">ระดับ ${difficultyTH}</span>
            `;
        } else {
            item.innerHTML = `
                <span style="color: #ab7a5e;">💨 ปลาหนีหายไปใต้คลื่น</span>
                <span class="fish-badge" style="background-color: #ab7a5e; color: #fdfaf6;">เกือบได้แล้ว</span>
            `;
        }

        // Insert at very top
        logBox.insertBefore(item, logBox.firstChild);
    }
}

// 3. FishingScene: The Floating Vertical mini-game overlay
class FishingScene extends Phaser.Scene {
    constructor() {
        super('FishingScene');
    }

    init(data) {
        // Fetch difficulty parameters passed from OverworldScene
        this.difficulty = data.difficulty || 'easy';
    }

    create() {
        // Set camera background transparent to let the OverworldScene show underneath
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');

        const currentTuning = PHYSICS_TUNING[this.difficulty];

        // 1. Center UI Overlay Cabinet
        this.minigameContainer = this.add.container(400, 300);

        // Blocker sheet to overlay and tint background
        const blackTint = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.4);
        this.minigameContainer.add(blackTint);

        // Draw Wood board casing in center
        const cabinet = this.add.graphics();
        cabinet.fillStyle(0x5c3d2e, 1); // Border Mahogany shadow
        cabinet.fillRoundedRect(-110, -270, 220, 540, 24);
        cabinet.fillStyle(0x89573c, 1); // Warm face plate
        cabinet.fillRoundedRect(-106, -266, 212, 532, 20);
        cabinet.lineStyle(3, 0x3d2314, 0.95);
        cabinet.strokeRoundedRect(-110, -270, 220, 540, 24);

        // Inner water tube track
        cabinet.fillStyle(0x0e1c26, 0.95);
        cabinet.fillRoundedRect(-60, -255, 60, 510, 10);

        // Right track Progress slot
        cabinet.fillStyle(0x3d2314, 0.7);
        cabinet.fillRoundedRect(40, -255, 18, 510, 8);
        cabinet.lineStyle(2, 0xb07d62, 0.6);
        cabinet.strokeRoundedRect(40, -255, 18, 510, 8);

        this.minigameContainer.add(cabinet);

        // Ambient bubble particles rising inside tube
        this.bubbles = this.add.particles(0, 0, 'bubble', {
            x: { min: -50, max: -10 },
            y: 250,
            speedY: { min: -40, max: -85 },
            scale: { min: 0.6, max: 1.4 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 6000,
            frequency: 450
        });
        this.minigameContainer.add(this.bubbles);

        // 2. Physics Spawns: Hook Bar (The Green Bar)
        // Position coordinate: relative inside parent container
        this.hookBar = this.add.container(-30, 150);
        this.physics.add.existing(this.hookBar);

        // Redraw bar textures with current difficulty bounds
        const hookGraphics = this.add.graphics();
        hookGraphics.fillStyle(0xa8d5ba, 0.35); // Glow area green pastel
        hookGraphics.fillRoundedRect(-25, -currentTuning.hookSize / 2, 50, currentTuning.hookSize, 12);
        hookGraphics.lineStyle(3, 0x81b29a, 0.95); // border
        hookGraphics.strokeRoundedRect(-25, -currentTuning.hookSize / 2, 50, currentTuning.hookSize, 12);
        // Highlights stripes
        hookGraphics.fillStyle(0xddf0e5, 0.8);
        hookGraphics.fillRoundedRect(-15, -currentTuning.hookSize / 2 + 10, 30, 6, 3);
        hookGraphics.fillRoundedRect(-15, currentTuning.hookSize / 2 - 16, 30, 6, 3);
        
        this.hookBar.add(hookGraphics);
        this.minigameContainer.add(this.hookBar);

        // Set green bar physics specs
        this.hookBar.body.setCollideWorldBounds(true);
        // Bounds limiters: clamp movements within the tube
        // Tube relative boundaries inside container: y from -255 to +255
        // Total canvas height translates to global coordinates. 
        // Real gauge covers vertical center: 300 - 255 = 45px to 300 + 255 = 555px.
        // We set global world bounds clamp for this container.
        this.hookBar.body.setBoundsRectangle(new Phaser.Geom.Rectangle(340, 45, 60, 510));
        this.hookBar.body.setGravityY(currentTuning.gravity);
        this.hookBar.body.setDragY(currentTuning.drag);
        this.hookBar.body.setBounce(0, currentTuning.bounce);
        this.hookBar.body.setSize(50, currentTuning.hookSize);
        this.hookBar.body.setOffset(-25, -currentTuning.hookSize / 2);

        // 3. Physics Spawns: Fish Target
        this.fishTarget = this.add.container(-30, 0);
        this.physics.add.existing(this.fishTarget);

        // Cozy koi fish procedural drawing
        const fishGraphics = this.add.graphics();
        fishGraphics.fillStyle(0x2b1c18, 0.3);
        fishGraphics.fillEllipse(3, 3, 24, 16);
        fishGraphics.fillStyle(0xf2cc8f, 1);
        fishGraphics.fillEllipse(0, 0, 24, 16);
        fishGraphics.fillStyle(0xe07a5f, 1);
        fishGraphics.fillEllipse(-4, 0, 16, 12);
        // tail
        fishGraphics.fillStyle(0xe07a5f, 1);
        fishGraphics.beginPath();
        fishGraphics.moveTo(10, 0); fishGraphics.lineTo(20, -8); fishGraphics.lineTo(16, 0); fishGraphics.lineTo(20, 8);
        ctxClose(fishGraphics);
        fishGraphics.fill();
        // eye
        fishGraphics.fillStyle(0xfdfaf6, 1);
        fishGraphics.fillCircle(-8, -2, 3);
        fishGraphics.fillStyle(0x3d5a80, 1);
        fishGraphics.fillCircle(-9, -2, 1.5);
        // side fins
        fishGraphics.fillStyle(0xf2cc8f, 1);
        fishGraphics.beginPath();
        fishGraphics.moveTo(-2, 6); fishGraphics.lineTo(-6, 12); fishGraphics.lineTo(2, 8);
        ctxClose(fishGraphics);
        fishGraphics.fill();

        this.fishTarget.add(fishGraphics);
        this.minigameContainer.add(this.fishTarget);

        this.fishTarget.body.setCollideWorldBounds(true);
        this.fishTarget.body.setBoundsRectangle(new Phaser.Geom.Rectangle(340, 45, 60, 510));
        this.fishTarget.body.setSize(30, 24);
        this.fishTarget.body.setOffset(-15, -12);

        // 4. Sparkle Particle system
        this.sparks = this.add.particles(0, 0, 'sparkle', {
            speed: { min: 40, max: 110 },
            scale: { start: 1.2, end: 0.1 },
            alpha: { start: 1, end: 0 },
            gravityY: 100,
            lifespan: 550,
            frequency: -1
        });
        // particle coordinate global matches game world, so add outside container
        this.sparks.setDepth(150);

        // 5. Red escape warning background overlay (inside container coordinates)
        this.warningOverlay = this.add.graphics();
        this.warningOverlay.fillStyle(0xe07a5f, 0.22);
        this.warningOverlay.fillRect(-400, -300, 800, 600);
        this.warningOverlay.alpha = 0;
        this.minigameContainer.add(this.warningOverlay);

        // 6. Right side Progress filling meter
        this.progressMeter = this.add.graphics();
        this.minigameContainer.add(this.progressMeter);

        // Sound trigger helper text
        this.add.text(400, 570, '🖱️ คลิกเมาส์ซ้ายค้าง เพื่อประคองแถบเขียวทับตัวปลา!', {
            fontFamily: 'Fredoka',
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#fdfaf6',
            backgroundColor: 'rgba(61,90,128,0.85)',
            padding: { x: 14, y: 6 },
            borderRadius: 6
        }).setOrigin(0.5).setDepth(200);

        // Spacebar input binding
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Initialize progress level state
        this.progressVal = 35; // Start comfortable buffer

        // Difficulty preset parameters initialization
        this.initFishAI();
    }

    update(time, delta) {
        const currentTuning = PHYSICS_TUNING[this.difficulty];

        // 1. INPUT REEL-IN: Push Hook Bar upwards
        const isClicking = this.input.activePointer.isDown || this.spaceKey.isDown;
        if (isClicking) {
            this.hookBar.body.setAccelerationY(currentTuning.upwardForce);
            if (time - (this.lastReelSoundTime || 0) > 90) {
                SFX.playReel();
                this.lastReelSoundTime = time;
            }
        } else {
            this.hookBar.body.setAccelerationY(0);
        }

        // Clamp speed boundaries
        const velY = this.hookBar.body.velocity.y;
        if (velY < currentTuning.maxSpeedUp) {
            this.hookBar.body.setVelocityY(currentTuning.maxSpeedUp);
        } else if (velY > currentTuning.maxSpeedDown) {
            this.hookBar.body.setVelocityY(currentTuning.maxSpeedDown);
        }

        // 2. Fish AI: Handle movement logic
        this.updateFishAI(time);

        // Cute fish wiggles
        const wiggle = Math.sin(time * 0.015) * 0.05;
        this.fishTarget.list[0].scaleY = 1 + wiggle;
        this.fishTarget.list[0].scaleX = 1 - Math.abs(wiggle);

        // 3. COLLISION OVERLAP CHECK
        const isOverlapping = this.checkOverlap(this.hookBar, this.fishTarget);

        if (isOverlapping) {
            this.progressVal += currentTuning.gainRate;
            if (this.progressVal > 100) this.progressVal = 100;

            // Spurt dynamic success sparkle particles
            if (Math.random() < 0.35) {
                // spark coord is global game coordinate
                this.sparks.emitParticleAt(this.fishTarget.x, this.fishTarget.y, 1);
            }

            // Glow alpha animation
            this.hookBar.list[0].alpha = 0.55 + Math.sin(time * 0.02) * 0.15;
        } else {
            this.progressVal -= currentTuning.decayRate;
            if (this.progressVal < 0) this.progressVal = 0;

            this.hookBar.list[0].alpha = 0.35;
        }

        // Redraw indicator fill bar
        this.drawProgressMeter();

        // 4. WIN / LOSE triggers
        if (this.progressVal >= 100) {
            this.triggerWin();
        } else if (this.progressVal <= 0) {
            this.triggerLose();
        }

        // 5. Escape Warning soft screen throb
        if (this.progressVal < 25) {
            this.warningOverlay.alpha = (0.25 - (this.progressVal / 100)) * (0.8 + Math.sin(time * 0.01) * 0.2);
        } else {
            this.warningOverlay.alpha = 0;
        }
    }

    // Custom vertical bounds checker
    checkOverlap(bar, target) {
        const tuning = PHYSICS_TUNING[this.difficulty];
        const halfHeight = tuning.hookSize / 2;
        
        const barTop = bar.y - halfHeight;
        const barBottom = bar.y + halfHeight;
        const fishY = target.y;

        return fishY >= barTop && fishY <= barBottom;
    }

    // Dynamic fish AI setup based on difficulty selected
    initFishAI() {
        // Choose list of active AI configurations
        const aiPresets = {
            easy: [FISH_PATTERNS.RELAXED, FISH_PATTERNS.DEEP_DWELLER],
            medium: [FISH_PATTERNS.DEEP_DWELLER, FISH_PATTERNS.DARTING],
            hard: [FISH_PATTERNS.TWITCHY, FISH_PATTERNS.DARTING]
        };

        const presets = aiPresets[this.difficulty];
        this.activePattern = presets[Math.floor(Math.random() * presets.length)];
        
        this.fishTargetY = 0; // Relative center starting position inside coordinate
        this.fishNextDecisionTime = 0;
    }

    // Fish swim vector logic
    updateFishAI(time) {
        const tuning = PHYSICS_TUNING[this.difficulty];

        if (time > this.fishNextDecisionTime) {
            // Find random target vertical node
            // Bounds limits: relative coords inside the tube container: from -240 to +240
            const randomTargetY = Phaser.Math.Between(this.activePattern.minY - 300, this.activePattern.maxY - 300);
            this.fishTargetY = randomTargetY;

            // Decision timer delta
            const baseInterval = this.activePattern.changeInterval;
            const randomizeFactor = Phaser.Math.Between(80, 125) / 100;
            this.fishNextDecisionTime = time + (baseInterval * randomizeFactor);

            // Trigger jitter
            if (Math.random() < this.activePattern.jitterChance) {
                this.fishTargetY += Phaser.Math.Between(-60, 60);
                this.fishTargetY = Phaser.Math.Clamp(this.fishTargetY, -240, 240);
                this.fishNextDecisionTime -= 150;
            }
        }

        // Smooth physics glide velocity to destination node Y
        const diffY = this.fishTargetY - this.fishTarget.y;
        const trackingSpeed = tuning.fishSpeedMultiplier * this.activePattern.speed;

        this.fishTarget.body.setVelocityY(diffY * trackingSpeed);

        // Clamp speed caps
        const maxFishSpeed = this.difficulty === 'hard' ? 440 : 310;
        const currentVel = this.fishTarget.body.velocity.y;
        if (Math.abs(currentVel) > maxFishSpeed) {
            this.fishTarget.body.setVelocityY(Phaser.Math.Clamp(currentVel, -maxFishSpeed, maxFishSpeed));
        }
    }

    // Draw the wooden panel progress meter
    drawProgressMeter() {
        this.progressMeter.clear();

        const trackHeight = 510;
        const fillHeight = (this.progressVal / 100) * trackHeight;
        const fillY = 255 - fillHeight; // bottom aligned relative

        if (fillHeight > 5) {
            let fillColor = 0xa8d5ba; // Soft Green
            if (this.progressVal < 30) {
                fillColor = 0xe07a5f; // Terracotta Red
            } else if (this.progressVal < 60) {
                fillColor = 0xf2cc8f; // Caramel Orange-yellow
            }

            this.progressMeter.fillStyle(fillColor, 0.92);
            this.progressMeter.fillRoundedRect(41, fillY, 16, fillHeight, 6);

            // Glare sheen strip
            this.progressMeter.fillStyle(0xffffff, 0.25);
            this.progressMeter.fillRoundedRect(43, fillY + 3, 4, fillHeight - 6, 2);
        }
    }

    triggerWin() {
        this.physics.pause();
        this.sparks.explode(40, this.fishTarget.x, this.fishTarget.y);
        SFX.playVictory();
        
        // Success flash camera effect
        this.cameras.main.flash(350, 168, 213, 186);

        // Text banner slide
        const winBanner = this.add.text(400, 300, '🏆 ตกปลาสำเร็จ!', {
            fontFamily: 'Fredoka',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#fdfaf6',
            backgroundColor: '#6e4e37',
            padding: { x: 20, y: 12 },
            borderRadius: 8
        }).setOrigin(0.5).setStroke('#3d2314', 4).setDepth(200);

        this.time.delayedCall(1500, () => {
            winBanner.destroy();
            
            // Broadcast success signal to OverworldScene
            this.game.events.emit('fishing-success', { difficulty: this.difficulty });
            
            // Stop and shut down this overlay scene
            this.scene.stop('FishingScene');
        });
    }

    triggerLose() {
        this.physics.pause();
        this.cameras.main.flash(400, 224, 122, 95);
        SFX.playFail();

        const loseBanner = this.add.text(400, 300, '💨 ปลาหลุดตัวหนีไป!', {
            fontFamily: 'Fredoka',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#fdfaf6',
            backgroundColor: '#e07a5f',
            padding: { x: 20, y: 12 },
            borderRadius: 8
        }).setOrigin(0.5).setStroke('#5c3d2e', 4).setDepth(200);

        this.time.delayedCall(1500, () => {
            loseBanner.destroy();
            
            // Broadcast fail signal to OverworldScene
            this.game.events.emit('fishing-fail', { difficulty: this.difficulty });
            
            this.scene.stop('FishingScene');
        });
    }
}

// Sub helper to close custom path drawings to prevent syntax logs errors in Phaser Graphics
function ctxClose(gfx) {
    gfx.closePath();
}

// Global Physics tuning presets matching difficulty
const PHYSICS_TUNING = {
    easy: {
        gravity: 900,
        upwardForce: -2400,
        maxSpeedUp: -450,
        maxSpeedDown: 450,
        drag: 550, // simulated water drag
        bounce: 0.12, // soft bottom dampening
        hookSize: 140,
        fishSpeedMultiplier: 2.2,
        decayRate: 0.15,
        gainRate: 0.25
    },
    medium: {
        gravity: 1100,
        upwardForce: -2800,
        maxSpeedUp: -500,
        maxSpeedDown: 500,
        drag: 650, // simulated water drag
        bounce: 0.08,
        hookSize: 100,
        fishSpeedMultiplier: 3.5,
        decayRate: 0.18,
        gainRate: 0.22
    },
    hard: {
        gravity: 1300,
        upwardForce: -3200,
        maxSpeedUp: -550,
        maxSpeedDown: 550,
        drag: 750, // simulated water drag
        bounce: 0.05,
        hookSize: 75,
        fishSpeedMultiplier: 5.2,
        decayRate: 0.22,
        gainRate: 0.18
    }
};

// Movement presets for Fish Target
const FISH_PATTERNS = {
    RELAXED: {
        speed: 1.0,
        changeInterval: 2800,
        minY: 100,
        maxY: 500,
        jitterChance: 0.05
    },
    DARTING: {
        speed: 2.2,
        changeInterval: 1400,
        minY: 60,
        maxY: 540,
        jitterChance: 0.3
    },
    TWITCHY: {
        speed: 2.8,
        changeInterval: 800,
        minY: 80,
        maxY: 520,
        jitterChance: 0.6
    },
    DEEP_DWELLER: {
        speed: 1.2,
        changeInterval: 2200,
        minY: 380,
        maxY: 550,
        jitterChance: 0.15
    }
};

// Phaser configuration launcher
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    transparent: true,
    pixelArt: true, // Enables nearest-neighbor pixel art filtering for crisp retro visuals
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, OverworldScene, FishingScene]
};

// Initialize game
const gameInstance = new Phaser.Game(config);

// Global browser listeners to automatically unlock Web Audio API on first user interaction
window.addEventListener('click', () => SFX.init());
window.addEventListener('keydown', () => SFX.init());

// Bind Reset Log button trigger from sidebar DOM
document.getElementById('btn-reset').addEventListener('click', () => {
    caughtCount = 0;
    document.getElementById('caught-count').innerText = '0 ตัว';
    
    // Clear list
    const logBox = document.getElementById('log-box');
    logBox.innerHTML = '<p class="empty-log-msg">ยังไม่มีบันทึก... ลองเดินไปตกปลาที่ริมหาดดูสิ!</p>';
});
