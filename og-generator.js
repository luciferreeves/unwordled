/**
 * @typedef {Object} WordleData
 * @property {number} id
 * @property {string} solution
 * @property {string} print_date
 * @property {number} days_since_launch
 * @property {string} editor
 */

/**
 * @param {WordleData} data
 * @param {Date} date
 * @returns {Promise<string>}
 */
async function generateOGImage(data, date) {
    const canvas = document.getElementById('ogCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 1200;
    canvas.height = 630;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    const bgColor = isDark ? '#121213' : '#e8e4d9';
    const cardBg = isDark ? '#2a2a2b' : '#f9f7f0';
    const textColor = isDark ? '#d7dadc' : '#2c2416';
    const accentColor = isDark ? '#538d4e' : '#6aaa64';
    const accentDark = isDark ? '#6aaa64' : '#538d4e';
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1200, 630);
    
    drawCard(ctx, 100, 100, 1000, 430, cardBg, isDark);
    
    ctx.fillStyle = textColor;
    ctx.font = 'bold 48px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 Unwordled', 600, 180);
    
    ctx.font = '28px Poppins, sans-serif';
    ctx.fillStyle = isDark ? '#818384' : '#6b5d4f';
    const dateStr = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    ctx.fillText(dateStr, 600, 220);
    
    const letters = data.solution.toUpperCase().split('');
    const boxSize = 100;
    const gap = 12;
    const totalWidth = letters.length * boxSize + (letters.length - 1) * gap;
    const startX = (1200 - totalWidth) / 2;
    const startY = 280;
    
    letters.forEach((letter, i) => {
        const x = startX + i * (boxSize + gap);
        drawLetterBox(ctx, x, startY, boxSize, letter, accentColor, accentDark, isDark);
    });
    
    ctx.fillStyle = isDark ? '#818384' : '#6b5d4f';
    ctx.font = '20px Poppins, sans-serif';
    ctx.fillText(`Puzzle #${data.id}`, 600, 460);
    
    return canvas.toDataURL('image/png');
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} bgColor
 * @param {boolean} isDark
 */
function drawCard(ctx, x, y, w, h, bgColor, isDark) {
    ctx.save();
    
    if (!isDark) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 8;
    }
    
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 20);
    ctx.fill();
    
    if (!isDark) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowOffsetX = -8;
        ctx.shadowOffsetY = -8;
        ctx.fill();
    }
    
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {string} letter
 * @param {string} color
 * @param {string} borderColor
 * @param {boolean} isDark
 */
function drawLetterBox(ctx, x, y, size, letter, color, borderColor, isDark) {
    ctx.save();
    
    ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    
    ctx.fillStyle = color;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 8);
    ctx.fill();
    ctx.stroke();
    
    ctx.shadowColor = 'transparent';
    
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.5}px Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, x + size / 2, y + size / 2);
    
    ctx.restore();
}

if (typeof window !== 'undefined') {
    window.generateOGImage = generateOGImage;
}
