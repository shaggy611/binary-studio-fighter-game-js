import controls from '../../constants/controls';

export async function fight(firstFighter, secondFighter) {
    return new Promise(resolve => {
        // resolve the promise with the winner when fight is over
        let winner = null;
        let firstFighterCriticalStrikeTime = Date.now();
        let secondFighterCriticalStrikeTime = Date.now();
        const firstFighterHealthBar = document.getElementById('left-fighter-indicator');
        const secondFighterHealthBar = document.getElementById('right-fighter-indicator');
        const firstFighterMaxHealth = firstFighter.health;
        const secondFighterMaxHealth = secondFighter.health;
        let pressedKeys = new Set();

        document.addEventListener('keydown', event => {
            pressedKeys.add(event.code);

            const pressedKeysArray = Array.from(pressedKeys);
            let keysCombinationArraysFirstFighter = controls.PlayerOneCriticalHitCombination.every(key => pressedKeysArray.includes(key));
            let keysCombinationArraysSecondFighter = controls.PlayerTwoCriticalHitCombination.every(key => pressedKeysArray.includes(key));

            if (event.code === controls.PlayerOneAttack && !secondFighter.isBlocking) {
                const damage = getDamage(firstFighter, secondFighter);
                secondFighter.health -= damage;
                reduceHealthBar(secondFighterHealthBar, secondFighter.health, secondFighterMaxHealth)

                if (secondFighter.health <= 0) {
                    winner = firstFighter;
                    resolve(winner);
                }
            }

            if (event.code === controls.PlayerTwoAttack && !firstFighter.isBlocking) {
                const damage = getDamage(secondFighter, firstFighter);
                firstFighter.health -= damage;
                reduceHealthBar(firstFighterHealthBar, firstFighter.health, firstFighterMaxHealth);
                if (firstFighter.health <= 0) {
                    winner = secondFighter;
                    resolve(winner);
                }
            }

            if (keysCombinationArraysFirstFighter && isCriticalStrikeAvailable(firstFighterCriticalStrikeTime)) {
                const damage = getCriticalStrikeDamage(firstFighter);
                firstFighterCriticalStrikeTime += 10000;
                secondFighter.health -= damage;
                reduceHealthBar(secondFighterHealthBar, secondFighter.health, secondFighterMaxHealth);
                pressedKeys.clear();
                if (secondFighter.health <= 0) {
                    winner = firstFighter;
                    resolve(winner);
                }
            }

            if (keysCombinationArraysSecondFighter && isCriticalStrikeAvailable(secondFighterCriticalStrikeTime)) {
                const damage = getCriticalStrikeDamage(secondFighter);
                secondFighterCriticalStrikeTime += 10000;
                firstFighter.health -= damage;
                reduceHealthBar(firstFighterHealthBar, firstFighter.health, firstFighterMaxHealth);
                pressedKeys.clear();
                if (firstFighter.health <= 0) {
                    winner = secondFighter;
                    resolve(winner);
                }
            }

            if (event.code === controls.PlayerOneBlock) {
                firstFighter.isBlocking = true;
            }

            if (event.code === controls.PlayerTwoBlock) {
                secondFighter.isBlocking = true;
            }
        });

        document.addEventListener('keyup', event => {
            if (event.code === controls.PlayerOneBlock) {
                firstFighter.isBlocking = false;
            }

            if (event.code === controls.PlayerTwoBlock) {
                secondFighter.isBlocking = false;
            }
        });
    });
}

export function getDamage(attacker, defender) {
    // return damage
    const hitPower = getHitPower(attacker);
    const blockPower = getBlockPower(defender);

    const damage = hitPower - blockPower > 0 ? hitPower - blockPower : 0;

    return damage;
}

export function getHitPower(fighter) {
    // return hit power
    const criticalChance = Math.floor(Math.random() * 2) + 1;
    return fighter.attack * criticalChance;
}

export function getBlockPower(fighter) {
    // return block power
    const dodgeChance = Math.floor(Math.random() * 2) + 1;
    return fighter.defense * dodgeChance;
}

export function isCriticalStrikeAvailable(lastCriticalStrikeTime) {
    return Date.now() - lastCriticalStrikeTime >= 10000;
}

export function getCriticalStrikeDamage(fighter) {
    const hitPower = fighter.attack;
    return hitPower * 2;
}

export function reduceHealthBar(healthBarDOMlement, health, maxHealth) {
    const healthPercentage = (health / maxHealth) * 100;
    healthBarDOMlement.style.width = `${healthPercentage}%`;
}