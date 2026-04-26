export const ENEMY_SCORE = 100;
export const FINISH_BONUS = 1000;
export const HIT_PENALTY = 75;


export function addEnemyScore(currentScore = 0) {
    return currentScore + ENEMY_SCORE;
}


export function calculateScore({
    elapsedMs = 0,
    enemiesDefeated = 0,
    hitsTaken = 0,
    levelCompleted = false
}) 
{
    const enemyScore = enemiesDefeated * ENEMY_SCORE;
    let finishScore = 0;

    if (levelCompleted) {
        finishScore = FINISH_BONUS;
    }
    
    const elapsedBlocks = Math.floor(elapsedMs / 100);
    const rawTimeBonus = 3000 - elapsedBlocks;
    const timeBonus = Math.max(0, rawTimeBonus);

    const damagePenalty = hitsTaken * HIT_PENALTY;

    const totalBeforePenalty = enemyScore + finishScore + timeBonus;
    const totalAfterPenalty = totalBeforePenalty - damagePenalty;
    const finalScore = Math.max(0, totalAfterPenalty);

    return finalScore;
}