import { NAME } from './constants';

export const form = state => state[NAME].get('form');
export const loadingTaskForm = state => state[NAME].get('loadingTaskForm');
export const submissionStatus = state => state[NAME].get('submissionStatus');
export const customEventSubmissionStatus = state => state[NAME].get('customEventSubmissionStatus');
export const nextTask  = state => state[NAME].get('nextTask');
export const nextVariables  = state => state[NAME].get('nextVariables');
export const submissionResponse = state => state[NAME].get('submissionResponse');
