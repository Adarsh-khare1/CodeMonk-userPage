import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem.model.js';

dotenv.config();

const problems = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'Easy',
    category: ['Array', 'Hash Table'],
    starterCode: `function twoSum(nums, target) {
    // Your code here
    return [];
}`,
    sampleTestCases: [
      { input: '[2,7,11,15], 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: '[3,2,4], 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' },
      { input: '[3,3], 6', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].' },
    ],
    testCases: [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]', isPublic: false },
      { input: '[3,2,4], 6', expectedOutput: '[1,2]', isPublic: false },
      { input: '[3,3], 6', expectedOutput: '[0,1]', isPublic: false },
      { input: '[1,2,3,4,5], 8', expectedOutput: '[2,4]', isPublic: false },
      { input: '[0,4,3,0], 0', expectedOutput: '[0,3]', isPublic: false },
    ],
    constraints: '2 <= nums.length <= 10^4',
    attemptsCount: 0,
    acceptedCount: 0,
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
    difficulty: 'Easy',
    category: ['Array', 'Dynamic Programming'],
    starterCode: `function maxProfit(prices) {
    // Your code here
    return 0;
}`,
    sampleTestCases: [
      { input: '[7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
      { input: '[7,6,4,3,1]', output: '0', explanation: 'In this case, no transactions are done and the max profit = 0.' },
    ],
    testCases: [
      { input: '[7,1,5,3,6,4]', expectedOutput: '5', isPublic: false },
      { input: '[7,6,4,3,1]', expectedOutput: '0', isPublic: false },
      { input: '[1,2,3,4,5]', expectedOutput: '4', isPublic: false },
      { input: '[2,1,2,1,0,1,2]', expectedOutput: '2', isPublic: false },
    ],
    constraints: '1 <= prices.length <= 10^5',
    attemptsCount: 0,
    acceptedCount: 0,
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'Medium',
    category: ['String', 'Hash Table', 'Sliding Window'],
    starterCode: `function lengthOfLongestSubstring(s) {
    // Your code here
    return 0;
}`,
    sampleTestCases: [
      { input: '"abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: '"bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: '"pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' },
    ],
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3', isPublic: false },
      { input: '"bbbbb"', expectedOutput: '1', isPublic: false },
      { input: '"pwwkew"', expectedOutput: '3', isPublic: false },
      { input: '""', expectedOutput: '0', isPublic: false },
      { input: '"au"', expectedOutput: '2', isPublic: false },
      { input: '"dvdf"', expectedOutput: '3', isPublic: false },
    ],
    constraints: '0 <= s.length <= 5 * 10^4',
    attemptsCount: 0,
    acceptedCount: 0,
  },
  {
    title: 'Container With Most Water',
    description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.',
    difficulty: 'Medium',
    category: ['Array', 'Two Pointers'],
    starterCode: `function maxArea(height) {
    // Your code here
    return 0;
}`,
    sampleTestCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.' },
    ],
    testCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isPublic: false },
      { input: '[1,1]', expectedOutput: '1', isPublic: false },
      { input: '[4,3,2,1,4]', expectedOutput: '16', isPublic: false },
    ],
    constraints: 'n == height.length, 2 <= n <= 10^5',
    attemptsCount: 0,
    acceptedCount: 0,
  },
  {
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    difficulty: 'Easy',
    category: ['Math', 'Dynamic Programming'],
    starterCode: `function climbStairs(n) {
    // Your code here
    return 0;
}`,
    sampleTestCases: [
      { input: '2', output: '2', explanation: 'There are two ways to climb to the top: 1 step + 1 step, 2 steps' },
      { input: '3', output: '3', explanation: 'There are three ways: 1+1+1, 1+2, 2+1' },
    ],
    testCases: [
      { input: '2', expectedOutput: '2', isPublic: false },
      { input: '3', expectedOutput: '3', isPublic: false },
      { input: '5', expectedOutput: '8', isPublic: false },
      { input: '10', expectedOutput: '89', isPublic: false },
    ],
    constraints: '1 <= n <= 45',
    attemptsCount: 0,
    acceptedCount: 0,
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    difficulty: 'Easy',
    category: ['String', 'Stack'],
    starterCode: `function isValid(s) {
    // Your code here
    return false;
}`,
    sampleTestCases: [
      { input: '"()"', output: 'true', explanation: 'Valid parentheses' },
      { input: '"()[]{}"', output: 'true', explanation: 'Valid parentheses' },
      { input: '"(]"', output: 'false', explanation: 'Invalid parentheses' },
    ],
    testCases: [
      { input: '"()"', expectedOutput: 'true', isPublic: false },
      { input: '"()[]{}"', expectedOutput: 'true', isPublic: false },
      { input: '"(]"', expectedOutput: 'false', isPublic: false },
      { input: '"([)]"', expectedOutput: 'false', isPublic: false },
      { input: '"{[]}"', expectedOutput: 'true', isPublic: false },
    ],
    constraints: '1 <= s.length <= 10^4',
    attemptsCount: 0,
    acceptedCount: 0,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-practice');
    console.log('Connected to MongoDB');

    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    await Problem.insertMany(problems);
    console.log(`Seeded ${problems.length} problems`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
}

seed();
