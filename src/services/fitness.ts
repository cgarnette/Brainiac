import * as FITNESS_PROFILES from '../../data/fitness.json';
import * as fs from 'fs';

export type FitnessProfile = {
    [discordId: string]: {
        goals: string[] // these can be revised, added, and removed
        preferredExercises: string[],
        levelOfDailyActivity: string,
        currentProgress: string
    }
}

const USER_DATA: FitnessProfile = {
    ...FITNESS_PROFILES
};

const saveToFile = async () => {
    return fs.writeFileSync('../../fitness.json', JSON.stringify(USER_DATA));
};

const removeGoal = (index: number, userId: string) => {
    USER_DATA[userId].goals = USER_DATA[userId].goals.filter((goal, goalIndex) => goalIndex !== index);
};

const addGoal = (goal: string, userId: string) => {
    USER_DATA[userId].goals.push(goal);
};

const getUserGoals = (userId: string) => {
    return USER_DATA[userId].goals;
};

const getFitnessProfileContext = (userId: string) => {
    const { goals, preferredExercises, levelOfDailyActivity, currentProgress } = USER_DATA[userId];

    let goalsAsText = `My Goals are the following: \n${goals.join('\n')}`;
    let exercisesAsText = `My preferred exercises are: \n${preferredExercises.join('\m')}`;
    let activityLevel = `My level of daily activity would likely be considered: \n${levelOfDailyActivity}`;
    let current = `Currently my general fitness standings are as follows: ${currentProgress}. I would like to continue to build from this`;

    return `
        ${goalsAsText}\n${exercisesAsText}\n${activityLevel}\n${current}\n
    `
};

const createFitnessProfile = () => {};


/**
 * Planning for Fitness Bot:
 * 
 * Each user can request to have a fitness profile built for them.
 * It will create a line the database indexed by the users discord ID.
 * 
 * The table will hold the users goals and progress and everytime the user makes a request to the fitness bot
 * We will take their data from the table and condense it, then send it as context to the bot for the actual fitness request
 * 
 * A user should say: I'd like to build a fitness profile. (We'll parse messages to see if they include 'build' and 'fitness profile')
 * Then the user will be asked a series of questions to help build their profile in the database
 * 
 * Data Schema:
 * 
 * {
 *  id: string <Discord ID>,
 *  goals: comma separated list,
 *  currentStanding: This is where we track progress on your goals. W
 *  preferredExercise: 'sports' | 'cardio' | 'weight lifting' | etc
 *  levelOfDailyActivity: 
 * }
 * 
 * remind users if they would like to update their fitness profile to use the command "Update my profile" (We'll parse messages to see if they include 'update' and 'profile')
 * 
 * fitness.json
 */