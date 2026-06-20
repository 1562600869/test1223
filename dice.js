class DiceRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.size = canvas.width;
        this.currentValue = 1;
        this.selected = false;
        this.rolling = false;
        this.rollInterval = null;
        this.rollSpeed = 80;
    }

    draw(value, selected) {
        this.currentValue = value;
        this.selected = selected;
        this.render();
    }

    render() {
        const ctx = this.ctx;
        const size = this.size;
        const padding = size * 0.08;
        const diceSize = size - padding * 2;

        ctx.clearRect(0, 0, size, size);

        ctx.save();
        ctx.shadowColor = 'rgba(93, 64, 55, 0.3)';
        ctx.shadowBlur = size * 0.08;
        ctx.shadowOffsetY = size * 0.04;

        const radius = diceSize * 0.18;
        const x = padding;
        const y = padding;
        const w = diceSize;
        const h = diceSize;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
        if (this.selected) {
            gradient.addColorStop(0, '#E8F5E9');
            gradient.addColorStop(0.5, '#C8E6C9');
            gradient.addColorStop(1, '#A5D6A7');
        } else {
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.5, '#FAFAFA');
            gradient.addColorStop(1, '#EFEBE9');
        }
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();

        const borderGradient = ctx.createLinearGradient(x, y, x + w, y + h);
        if (this.selected) {
            borderGradient.addColorStop(0, '#81C784');
            borderGradient.addColorStop(1, '#4CAF50');
            ctx.lineWidth = size * 0.04;
        } else {
            borderGradient.addColorStop(0, '#E0E0E0');
            borderGradient.addColorStop(1, '#BDBDBD');
            ctx.lineWidth = size * 0.02;
        }
        ctx.strokeStyle = borderGradient;
        ctx.stroke();
        ctx.restore();

        this.drawDots(this.currentValue);
    }

    drawDots(value) {
        const ctx = this.ctx;
        const size = this.size;
        const padding = size * 0.08;
        const diceSize = size - padding * 2;
        const centerX = size / 2;
        const centerY = size / 2;
        const dotRadius = diceSize * 0.11;

        const dotColor = this.selected ? '#2E7D32' : '#212121';
        ctx.fillStyle = dotColor;

        const positions = this.getDotPositions(value, centerX, centerY, diceSize);

        positions.forEach(pos => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, dotRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.beginPath();
            ctx.arc(pos.x - dotRadius * 0.3, pos.y - dotRadius * 0.3, dotRadius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
            ctx.restore();
        });
    }

    getDotPositions(value, cx, cy, diceSize) {
        const offset = diceSize * 0.28;
        const positions = [];

        switch (value) {
            case 1:
                positions.push({ x: cx, y: cy });
                break;
            case 2:
                positions.push({ x: cx - offset, y: cy - offset });
                positions.push({ x: cx + offset, y: cy + offset });
                break;
            case 3:
                positions.push({ x: cx - offset, y: cy - offset });
                positions.push({ x: cx, y: cy });
                positions.push({ x: cx + offset, y: cy + offset });
                break;
            case 4:
                positions.push({ x: cx - offset, y: cy - offset });
                positions.push({ x: cx + offset, y: cy - offset });
                positions.push({ x: cx - offset, y: cy + offset });
                positions.push({ x: cx + offset, y: cy + offset });
                break;
            case 5:
                positions.push({ x: cx - offset, y: cy - offset });
                positions.push({ x: cx + offset, y: cy - offset });
                positions.push({ x: cx, y: cy });
                positions.push({ x: cx - offset, y: cy + offset });
                positions.push({ x: cx + offset, y: cy + offset });
                break;
            case 6:
                positions.push({ x: cx - offset, y: cy - offset });
                positions.push({ x: cx + offset, y: cy - offset });
                positions.push({ x: cx - offset, y: cy });
                positions.push({ x: cx + offset, y: cy });
                positions.push({ x: cx - offset, y: cy + offset });
                positions.push({ x: cx + offset, y: cy + offset });
                break;
        }

        return positions;
    }

    startRollAnimation(duration, callback) {
        if (this.rolling) return;

        this.rolling = true;
        this.canvas.classList.add('rolling');
        let startTime = null;
        let lastValueChange = 0;
        const speed = this.rollSpeed;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;

            const elapsed = timestamp - startTime;

            if (timestamp - lastValueChange > speed) {
                this.currentValue = Math.floor(Math.random() * 6) + 1;
                this.render();
                lastValueChange = timestamp;
            }

            if (elapsed < duration) {
                this.rollInterval = requestAnimationFrame(animate);
            } else {
                this.stopRollAnimation();
                if (callback) callback();
            }
        };

        this.rollInterval = requestAnimationFrame(animate);
    }

    stopRollAnimation() {
        if (this.rollInterval) {
            cancelAnimationFrame(this.rollInterval);
            this.rollInterval = null;
        }
        this.rolling = false;
        this.canvas.classList.remove('rolling');
        this.render();
    }

    setSelected(selected) {
        this.selected = selected;
        this.render();
    }
}
