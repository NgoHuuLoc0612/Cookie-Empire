class ClickerGame {
    constructor() {
        this.gameState = {
            cookies: 0,
            totalClicks: 0,
            clickPower: 1,
            cps: 0,
            goldenCookiesClicked: 0,
            recentClicks: [],
            buildings: {
                cursor: { count: 0, basePrice: 15, production: 0.1 },
                grandma: { count: 0, basePrice: 100, production: 1 },
                farm: { count: 0, basePrice: 1100, production: 8 },
                mine: { count: 0, basePrice: 12000, production: 47 },
                factory: { count: 0, basePrice: 130000, production: 260 }
            },
            upgrades: {
                doubleClick: { purchased: false, price: 500, multiplier: 2 },
                goldenTouch: { purchased: false, price: 5000, multiplier: 5 },
                megaClick: { purchased: false, price: 50000, multiplier: 10 }
            },
            achievements: {
                firstClick: { unlocked: false, requirement: 1, type: 'clicks' },
                hundredClicks: { unlocked: false, requirement: 100, type: 'clicks' },
                clickMaster: { unlocked: false, requirement: 1000, type: 'clicks' },
                tenThousandClicks: { unlocked: false, requirement: 10000, type: 'clicks' },
                marathonClicker: { unlocked: false, requirement: 100000, type: 'clicks' },
                
                thousandCookies: { unlocked: false, requirement: 1000, type: 'cookies' },
                tenThousandCookies: { unlocked: false, requirement: 10000, type: 'cookies' },
                millionaire: { unlocked: false, requirement: 1000000, type: 'cookies' },
                billionaire: { unlocked: false, requirement: 1000000000, type: 'cookies' },
                trillionaire: { unlocked: false, requirement: 1000000000000, type: 'cookies' },
                
                firstBuilding: { unlocked: false, requirement: 1, type: 'buildings' },
                tenBuildings: { unlocked: false, requirement: 10, type: 'buildings' },
                hundredBuildings: { unlocked: false, requirement: 100, type: 'buildings' },
                
                hundredCPS: { unlocked: false, requirement: 100, type: 'cps' },
                thousandCPS: { unlocked: false, requirement: 1000, type: 'cps' },
                megaCPS: { unlocked: false, requirement: 10000, type: 'cps' },
                
                allUpgrades: { unlocked: false, requirement: 3, type: 'upgrades' },
                
                oneCursor: { unlocked: false, requirement: 1, type: 'cursor' },
                oneGrandma: { unlocked: false, requirement: 1, type: 'grandma' },
                oneFarm: { unlocked: false, requirement: 1, type: 'farm' },
                fiveFarms: { unlocked: false, requirement: 5, type: 'farm' },
                oneMine: { unlocked: false, requirement: 1, type: 'mine' },
                oneFactory: { unlocked: false, requirement: 1, type: 'factory' },
                tenFactories: { unlocked: false, requirement: 10, type: 'factory' },
                
                speedClicker: { unlocked: false, requirement: 10, type: 'speed_clicks', timeWindow: 1000 },
                goldenCookieHunter: { unlocked: false, requirement: 5, type: 'golden_cookies' }
            }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.startGameLoop();
        this.updateDisplay();
    }

    bindEvents() {
        // Cookie click event
        document.getElementById('cookieButton').addEventListener('click', (e) => {
            this.clickCookie(e);
        });

        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Building purchases
        document.querySelectorAll('.building').forEach(building => {
            const buyButton = building.querySelector('.buy-button');
            buyButton.addEventListener('click', () => {
                this.buyBuilding(building.dataset.building);
            });
        });

        // Upgrade purchases
        document.querySelectorAll('.upgrade').forEach(upgrade => {
            const buyButton = upgrade.querySelector('.buy-upgrade-button');
            buyButton.addEventListener('click', () => {
                this.buyUpgrade(upgrade.dataset.upgrade);
            });
        });

        // Save/Load/Reset
        document.getElementById('saveGame').addEventListener('click', () => {
            this.saveGame();
        });

        document.getElementById('loadGame').addEventListener('click', () => {
            this.loadGame();
        });

        document.getElementById('resetGame').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
                this.resetGame();
            }
        });
    }

    clickCookie(event) {
        this.gameState.cookies += this.gameState.clickPower;
        this.gameState.totalClicks++;

        // Track recent clicks for speed achievement
        const now = Date.now();
        this.gameState.recentClicks.push(now);
        this.gameState.recentClicks = this.gameState.recentClicks.filter(time => now - time <= 1000);

        // Visual effects
        this.showClickEffect();
        this.showClickValue();

        this.updateDisplay();
        this.checkAchievements();
    }

    showClickEffect() {
        const effect = document.getElementById('clickEffect');
        effect.classList.remove('active');
        setTimeout(() => {
            effect.classList.add('active');
        }, 10);
    }

    showClickValue() {
        const clickValue = document.getElementById('clickValue');
        clickValue.textContent = `+${this.gameState.clickPower}`;
        clickValue.classList.remove('show');
        setTimeout(() => {
            clickValue.classList.add('show');
        }, 10);
    }

    buyBuilding(buildingType) {
        const building = this.gameState.buildings[buildingType];
        const price = this.getBuildingPrice(buildingType);

        if (this.gameState.cookies >= price) {
            this.gameState.cookies -= price;
            building.count++;
            
            this.updateCPS();
            this.updateDisplay();
            this.checkAchievements();
            
            this.showNotification(`Bought ${this.getBuildingName(buildingType)}!`);
        }
    }

    buyUpgrade(upgradeType) {
        const upgrade = this.gameState.upgrades[upgradeType];

        if (!upgrade.purchased && this.gameState.cookies >= upgrade.price) {
            this.gameState.cookies -= upgrade.price;
            upgrade.purchased = true;
            
            this.updateClickPower();
            this.updateDisplay();
            
            this.showNotification(`Upgrade purchased: ${this.getUpgradeName(upgradeType)}!`);
        }
    }

    getBuildingPrice(buildingType) {
        const building = this.gameState.buildings[buildingType];
        return Math.floor(building.basePrice * Math.pow(1.15, building.count));
    }

    getBuildingName(buildingType) {
        const names = {
            cursor: 'Auto Cursor',
            grandma: 'Grandma',
            farm: 'Cookie Farm',
            mine: 'Cookie Mine',
            factory: 'Cookie Factory'
        };
        return names[buildingType];
    }

    getUpgradeName(upgradeType) {
        const names = {
            doubleClick: 'Double Click',
            goldenTouch: 'Golden Touch',
            megaClick: 'Mega Click'
        };
        return names[upgradeType];
    }

    updateCPS() {
        this.gameState.cps = 0;
        for (const buildingType in this.gameState.buildings) {
            const building = this.gameState.buildings[buildingType];
            this.gameState.cps += building.count * building.production;
        }
    }

    updateClickPower() {
        this.gameState.clickPower = 1;
        for (const upgradeType in this.gameState.upgrades) {
            const upgrade = this.gameState.upgrades[upgradeType];
            if (upgrade.purchased) {
                this.gameState.clickPower *= upgrade.multiplier;
            }
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    checkAchievements() {
        const achievements = this.gameState.achievements;
        
        // Check each achievement
        for (const achievementId in achievements) {
            const achievement = achievements[achievementId];
            if (!achievement.unlocked) {
                let requirement_met = false;
                
                switch (achievement.type) {
                    case 'clicks':
                        requirement_met = this.gameState.totalClicks >= achievement.requirement;
                        break;
                    case 'cookies':
                        requirement_met = this.gameState.cookies >= achievement.requirement;
                        break;
                    case 'buildings':
                        const totalBuildings = Object.values(this.gameState.buildings)
                            .reduce((sum, building) => sum + building.count, 0);
                        requirement_met = totalBuildings >= achievement.requirement;
                        break;
                    case 'cps':
                        requirement_met = this.gameState.cps >= achievement.requirement;
                        break;
                    case 'upgrades':
                        const purchasedUpgrades = Object.values(this.gameState.upgrades)
                            .filter(upgrade => upgrade.purchased).length;
                        requirement_met = purchasedUpgrades >= achievement.requirement;
                        break;
                    case 'speed_clicks':
                        requirement_met = this.gameState.recentClicks.length >= achievement.requirement;
                        break;
                    case 'golden_cookies':
                        requirement_met = this.gameState.goldenCookiesClicked >= achievement.requirement;
                        break;
                    case 'cursor':
                    case 'grandma':
                    case 'farm':
                    case 'mine':
                    case 'factory':
                        requirement_met = this.gameState.buildings[achievement.type].count >= achievement.requirement;
                        break;
                }
                
                if (requirement_met) {
                    achievement.unlocked = true;
                    this.unlockAchievement(achievementId);
                }
            }
        }
    }

    unlockAchievement(achievementId) {
        const achievementElement = document.querySelector(`[data-achievement="${achievementId}"]`);
        achievementElement.classList.add('unlocked');
        achievementElement.classList.remove('locked');
        achievementElement.querySelector('.achievement-status').textContent = 'Unlocked!';
        
        this.showNotification(`Achievement Unlocked: ${this.getAchievementName(achievementId)}!`, 'achievement');
    }

    getAchievementName(achievementId) {
        const names = {
            firstClick: 'First Click',
            hundredClicks: 'Century',
            clickMaster: 'Click Master',
            tenThousandClicks: 'Click Veteran',
            marathonClicker: 'Marathon Clicker',
            
            thousandCookies: 'Cookie Master',
            tenThousandCookies: 'Cookie Hoarder',
            millionaire: 'Millionaire',
            billionaire: 'Billionaire',
            trillionaire: 'Trillionaire',
            
            firstBuilding: 'Builder',
            tenBuildings: 'Industrial Tycoon',
            hundredBuildings: 'Cookie Empire',
            
            hundredCPS: 'Cookie Machine',
            thousandCPS: 'Cookie Rocket',
            megaCPS: 'Cookie Supernova',
            
            allUpgrades: 'Perfectionist',
            
            oneCursor: 'First Helper',
            oneGrandma: 'Grandma\'s Love',
            oneFarm: 'Farmer',
            fiveFarms: 'Agriculture Expert',
            oneMine: 'Miner',
            oneFactory: 'Industrialist',
            tenFactories: 'Factory Owner',
            
            speedClicker: 'Speed Clicker',
            goldenCookieHunter: 'Golden Hunter'
        };
        return names[achievementId];
    }

    showNotification(message, type = 'normal') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateDisplay() {
        // Update main stats
        document.getElementById('cookies').textContent = this.formatNumber(Math.floor(this.gameState.cookies));
        document.getElementById('cps').textContent = this.formatNumber(this.gameState.cps.toFixed(1));
        document.getElementById('totalClicks').textContent = this.formatNumber(this.gameState.totalClicks);
        document.getElementById('clickPower').textContent = this.formatNumber(this.gameState.clickPower);

        // Update buildings
        for (const buildingType in this.gameState.buildings) {
            const building = this.gameState.buildings[buildingType];
            const buildingElement = document.querySelector(`[data-building="${buildingType}"]`);
            
            if (buildingElement) {
                const countElement = buildingElement.querySelector('.building-count');
                const priceElement = buildingElement.querySelector('.building-price');
                const buyButton = buildingElement.querySelector('.buy-button');
                
                countElement.textContent = building.count;
                priceElement.textContent = this.formatNumber(this.getBuildingPrice(buildingType));
                
                // Disable button if can't afford
                const canAfford = this.gameState.cookies >= this.getBuildingPrice(buildingType);
                buyButton.disabled = !canAfford;
            }
        }

        // Update upgrades
        for (const upgradeType in this.gameState.upgrades) {
            const upgrade = this.gameState.upgrades[upgradeType];
            const upgradeElement = document.querySelector(`[data-upgrade="${upgradeType}"]`);
            
            if (upgradeElement) {
                const buyButton = upgradeElement.querySelector('.buy-upgrade-button');
                
                if (upgrade.purchased) {
                    upgradeElement.style.opacity = '0.5';
                    buyButton.textContent = 'Owned';
                    buyButton.disabled = true;
                } else {
                    const canAfford = this.gameState.cookies >= upgrade.price;
                    buyButton.disabled = !canAfford;
                }
            }
        }

        // Update achievements display
        for (const achievementId in this.gameState.achievements) {
            const achievement = this.gameState.achievements[achievementId];
            const achievementElement = document.querySelector(`[data-achievement="${achievementId}"]`);
            
            if (achievementElement && achievement.unlocked) {
                achievementElement.classList.add('unlocked');
                achievementElement.classList.remove('locked');
                achievementElement.querySelector('.achievement-status').textContent = 'Unlocked!';
            }
        }
    }

    formatNumber(num) {
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
        return (num / 1000000000000).toFixed(1) + 'T';
    }

    startGameLoop() {
    // Load game when starting
    this.loadGame();
    
    setInterval(() => {
        if (this.gameState.cps > 0) {
            this.gameState.cookies += this.gameState.cps / 10;
            this.updateDisplay();
            this.checkAchievements();
        }
    }, 100);
    
    // Auto-save every 30 seconds
    setInterval(() => {
        this.saveGame();
    }, 30000);
}

    saveGame() {
    const gameData = JSON.stringify(this.gameState);
    localStorage.setItem('cookieEmpireGame', gameData);
    this.showNotification('Game saved successfully!');
}

    loadGame() {
    const savedData = localStorage.getItem('cookieEmpireGame');
    if (savedData) {
        try {
            this.gameState = JSON.parse(savedData);
            this.updateCPS();
            this.updateClickPower();
            this.updateDisplay();
            this.showNotification('Game loaded successfully!');
        } catch (e) {
            this.showNotification('Failed to load game data!');
        }
    } else {
        this.showNotification('No saved game found!');
    }
}

    resetGame() {
        this.gameState = {
            cookies: 0,
            totalClicks: 0,
            clickPower: 1,
            cps: 0,
            goldenCookiesClicked: 0,
            recentClicks: [],
            buildings: {
                cursor: { count: 0, basePrice: 15, production: 0.1 },
                grandma: { count: 0, basePrice: 100, production: 1 },
                farm: { count: 0, basePrice: 1100, production: 8 },
                mine: { count: 0, basePrice: 12000, production: 47 },
                factory: { count: 0, basePrice: 130000, production: 260 }
            },
            upgrades: {
                doubleClick: { purchased: false, price: 500, multiplier: 2 },
                goldenTouch: { purchased: false, price: 5000, multiplier: 5 },
                megaClick: { purchased: false, price: 50000, multiplier: 10 }
            },
            achievements: {
                firstClick: { unlocked: false, requirement: 1, type: 'clicks' },
                hundredClicks: { unlocked: false, requirement: 100, type: 'clicks' },
                clickMaster: { unlocked: false, requirement: 1000, type: 'clicks' },
                tenThousandClicks: { unlocked: false, requirement: 10000, type: 'clicks' },
                marathonClicker: { unlocked: false, requirement: 100000, type: 'clicks' },
                
                thousandCookies: { unlocked: false, requirement: 1000, type: 'cookies' },
                tenThousandCookies: { unlocked: false, requirement: 10000, type: 'cookies' },
                millionaire: { unlocked: false, requirement: 1000000, type: 'cookies' },
                billionaire: { unlocked: false, requirement: 1000000000, type: 'cookies' },
                trillionaire: { unlocked: false, requirement: 1000000000000, type: 'cookies' },
                
                firstBuilding: { unlocked: false, requirement: 1, type: 'buildings' },
                tenBuildings: { unlocked: false, requirement: 10, type: 'buildings' },
                hundredBuildings: { unlocked: false, requirement: 100, type: 'buildings' },
                
                hundredCPS: { unlocked: false, requirement: 100, type: 'cps' },
                thousandCPS: { unlocked: false, requirement: 1000, type: 'cps' },
                megaCPS: { unlocked: false, requirement: 10000, type: 'cps' },
                
                allUpgrades: { unlocked: false, requirement: 3, type: 'upgrades' },
                
                oneCursor: { unlocked: false, requirement: 1, type: 'cursor' },
                oneGrandma: { unlocked: false, requirement: 1, type: 'grandma' },
                oneFarm: { unlocked: false, requirement: 1, type: 'farm' },
                fiveFarms: { unlocked: false, requirement: 5, type: 'farm' },
                oneMine: { unlocked: false, requirement: 1, type: 'mine' },
                oneFactory: { unlocked: false, requirement: 1, type: 'factory' },
                tenFactories: { unlocked: false, requirement: 10, type: 'factory' },
                
                speedClicker: { unlocked: false, requirement: 10, type: 'speed_clicks', timeWindow: 1000 },
                goldenCookieHunter: { unlocked: false, requirement: 5, type: 'golden_cookies' }
            }
        };

        // Reset UI
        document.querySelectorAll('.achievement').forEach(element => {
            element.classList.remove('unlocked');
            element.classList.add('locked');
            element.querySelector('.achievement-status').textContent = 'Locked';
        });

        document.querySelectorAll('.upgrade').forEach(element => {
            element.style.opacity = '1';
            const buyButton = element.querySelector('.buy-upgrade-button');
            buyButton.textContent = 'Buy';
            buyButton.disabled = false;
        });

        this.updateDisplay();
        this.showNotification('Game reset successfully!');
    }
}

// Special Effects and Enhancements
class GameEffects {
    static addParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 6px;
                height: 6px;
                background: #ffd700;
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
            `;
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / 5;
            const velocity = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            let opacity = 1;
            let px = x;
            let py = y;
            
            const animate = () => {
                px += vx * 0.02;
                py += vy * 0.02 + 1; // gravity
                opacity -= 0.02;
                
                particle.style.left = px + 'px';
                particle.style.top = py + 'px';
                particle.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new ClickerGame();
    window.gameInstance = game; // Make it globally accessible for golden cookies
    
    // Add particle effects on cookie click
    document.getElementById('cookieButton').addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        GameEffects.addParticles(x, y);
    });
    
    // Golden cookie random spawner
    setInterval(() => {
        if (Math.random() < 0.001) { // 0.1% chance every 100ms = roughly every 2 minutes
            createGoldenCookie();
        }
    }, 100);
});

function createGoldenCookie() {
    const goldenCookie = document.createElement('div');
    goldenCookie.innerHTML = '✨';
    goldenCookie.style.cssText = `
        position: fixed;
        font-size: 40px;
        cursor: pointer;
        z-index: 1000;
        animation: goldenFloat 10s linear forwards;
        left: -50px;
        top: ${Math.random() * (window.innerHeight - 100)}px;
    `;
    
    // Add golden cookie animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes goldenFloat {
            from { left: -50px; }
            to { left: ${window.innerWidth + 50}px; }
        }
    `;
    document.head.appendChild(style);
    
    goldenCookie.addEventListener('click', () => {
        // Award bonus cookies
        const bonus = Math.floor(Math.random() * 100) + 50;
        // Access the game instance (would need to be global or passed)
        if (window.gameInstance) {
            window.gameInstance.gameState.cookies += bonus;
            window.gameInstance.gameState.goldenCookiesClicked++;
            window.gameInstance.updateDisplay();
            window.gameInstance.checkAchievements();
            window.gameInstance.showNotification(`Golden Cookie! +${bonus} cookies!`, 'achievement');
        }
        goldenCookie.remove();
        style.remove();
    });
    
    document.body.appendChild(goldenCookie);
    
    // Remove after 10 seconds if not clicked
    setTimeout(() => {
        if (goldenCookie.parentNode) {
            goldenCookie.remove();
            style.remove();
        }
    }, 10000);
}
