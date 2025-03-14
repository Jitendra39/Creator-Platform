import mongoose from "mongoose";
import ProblemModel from "./models/problem";
import connectDB from "./dbConfig";
import { marked } from "marked";

async function start() {
  try {
    // Connect to the database
    await connectDB();

    // Clear existing data to avoid duplicates
    await ProblemModel.deleteMany({});
    console.log("Cleared existing problems.");

    // Dummy data for the Problem model
    const dummyProblems = [
      {
        main: {
          id: 1,
          name: "Two Sum",
          difficulty: "easy",
          like_count: 1543,
          dislike_count: 402,
          description_body: `
Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

## Examples

### Example 1:
# 

\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

#

### Example 2:
#

\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

## Constraints

- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- Only one valid answer exists.
`,
          accept_count: 5000,
          submission_count: 10000,
          acceptance_rate_count: 50,
          discussion_count: 350,
          related_topics: ["Array", "Hash Table"],
          similar_questions: ["Three Sum", "Four Sum"],
          solution_count: 3,
          code_default_language: "javascript",
          code_body: {
            javascript: `function twoSum(nums, target) { 
}`,
          },
          status: "solved",
        },
        editorial: {
          editorial_body: `
## Two Sum: Editorial

The Two Sum problem can be solved efficiently using a hash map to store the complement of each element as we iterate through the array.
          `,
        },
        test: [
          [[2, 7, 11, 15], 9, [0, 1]],
          [[3, 2, 4], 6, [1, 2]],
        ],
        function_name: "twoSum",
      },
      {
        main: {
          id: 2,
          name: "Median of Two Sorted Arrays",
          difficulty: "hard",
          like_count: 1284,
          dislike_count: 322,
          description_body: `
Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be **O(log(m+n))**.

## Examples

### Example 1:
# 

\`\`\`
Input: nums1 = [1,3], nums2 = [2]  
Output: 2.00000  
Explanation: merged array = [1,2,3] and median is 2.
\`\`\`



### Example 2:
#

\`\`\`
Input: nums1 = [1,2], nums2 = [3,4]  
Output: 2.50000  
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.
\`\`\`

## Constraints

- \`nums1.length == m\`  
- \`nums2.length == n\`  
- \`0 <= m <= 1000\`  
- \`0 <= n <= 1000\`  
- \`1 <= m + n <= 2000\`  
- \`-10^6 <= nums1[i], nums2[i] <= 10^6\`

`,
          accept_count: 3200,
          submission_count: 8700,
          acceptance_rate_count: 36,
          discussion_count: 410,
          related_topics: ["Array", "Binary Search"],
          similar_questions: ["Kth Largest Element", "Intersection of Two Arrays"],
          solution_count: 2,
          code_default_language: "python",
          code_body: {
            javascript: `
            function MedianofTwotwosortedarray(s){
            }
            `,
          },
          status: "unsolved",
        },
        editorial: {
          editorial_body: `
## Median of Two Sorted Arrays: Editorial

This problem requires an optimized solution using binary search with time complexity O(log(m+n)).
          `,
        },
        test: [
          [[1, 3], [2], 2.0],
          [[1, 2], [3, 4], 2.5],
        ],
        function_name: "findMedianSortedArrays",
      },
      {
        main: {
          id: 3,
          name: "Longest Substring Without Repeating Characters",
          difficulty: "medium",
          like_count: 2130,
          dislike_count: 503,
          description_body: `
Given a string \`s\`, find the length of the longest substring without repeating characters.

## Examples

### Example 1:
# 

\`\`\`
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
\`\`\`

#

### Example 2:
#

\`\`\`
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
\`\`\`

## Constraints

- \`0 <= s.length <= 5 * 10^4\`
- \`s\` consists of English letters, digits, symbols and spaces.
`,
          accept_count: 5800,
          submission_count: 11000,
          acceptance_rate_count: 52,
          discussion_count: 400,
          related_topics: ["String", "Sliding Window"],
          similar_questions: ["Longest Palindromic Substring"],
          solution_count: 2,
          code_default_language: "javascript",
          code_body: {
            javascript: `function lengthOfLongestSubstring(s) { 
}`,
          },
          status: "attempted",
        },
        editorial: {
          editorial_body: `
## Longest Substring Without Repeating Characters: Editorial

The sliding window technique efficiently solves this problem by dynamically adjusting the window size.
          `,
        },
        test: [
          ["abcabcbb", 3],
          ["bbbbb", 1],
        ],
        function_name: "lengthOfLongestSubstring",
      },
    ];

    // Insert dummy problems into the database
    await ProblemModel.insertMany(dummyProblems);
    console.log("Problems inserted successfully.");
  } catch (error) {
    console.error("Error inserting dummy data:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

start();


































// import mongoose from "mongoose";
// import ProblemModel from "./models/problem";
// import connectDB from "./dbConfig";
// import { marked } from "marked";

// async function start() {
//   try {
//     // Connect to the database
//     await connectDB();

//     // Clear existing data to avoid duplicates
//     await ProblemModel.deleteMany({});
//     console.log("Cleared existing problems.");

//     // Dummy data for the Problem model
//     const dummyProblems = [
//       {
//         main: {
//           id: 1,
//           name: "Two Sum",
//           difficulty: "Easy",
//           like_count: 1543,
//           dislike_count: 402,
//           description_body: `
// Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

// You may assume that each input would have exactly one solution, and you may not use the same element twice.

// You can return the answer in any order.

// ## Examples

// ### Example 1:
// # 

// \`\`\`
// Input: nums = [2,7,11,15], target = 9
// Output: [0,1]
// Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
// \`\`\`

// #

// ### Example 2:
// #

// \`\`\`
// Input: nums = [3,2,4], target = 6
// Output: [1,2]
// \`\`\`

// ## Constraints

// - \`2 <= nums.length <= 10^4\`
// - \`-10^9 <= nums[i] <= 10^9\`
// - \`-10^9 <= target <= 10^9\`
// - Only one valid answer exists.
// `
//         },
//       },
//       {
//         main: {
//           id: 2,
//           name: "Median of Two Sorted Arrays",
//           difficulty: "Hard",
//           like_count: 1284,
//           dislike_count: 322,
//           description_body: `
// Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

// The overall run time complexity should be **O(log(m+n))**.

// ## Examples

// ### Example 1:
// # 

// \`\`\`
// Input: nums1 = [1,3], nums2 = [2]  
// Output: 2.00000  
// Explanation: merged array = [1,2,3] and median is 2.
// \`\`\`



// ### Example 2:
// #

// \`\`\`
// Input: nums1 = [1,2], nums2 = [3,4]  
// Output: 2.50000  
// Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.
// \`\`\`

// ## Constraints

// - \`nums1.length == m\`  
// - \`nums2.length == n\`  
// - \`0 <= m <= 1000\`  
// - \`0 <= n <= 1000\`  
// - \`1 <= m + n <= 2000\`  
// - \`-10^6 <= nums1[i], nums2[i] <= 10^6\`
// `
//         },
//       },
//       {
//         main: {
//           id: 3,
//           name: "Longest Substring Without Repeating Characters",
//           difficulty: "Medium",
//           like_count: 2130,
//           dislike_count: 503,
//           description_body: `
// Given a string \`s\`, find the length of the longest substring without repeating characters.

// ## Examples

// ### Example 1:
// # 

// \`\`\`
// Input: s = "abcabcbb"
// Output: 3
// Explanation: The answer is "abc", with the length of 3.
// \`\`\`

// #

// ### Example 2:
// #

// \`\`\`
// Input: s = "bbbbb"
// Output: 1
// Explanation: The answer is "b", with the length of 1.
// \`\`\`

// ## Constraints

// - \`0 <= s.length <= 5 * 10^4\`
// - \`s\` consists of English letters, digits, symbols and spaces.
// `
//         },
//       },
//       {
//         main: {
//           id: 4,
//           name: "Reverse Integer",
//           difficulty: "Medium",
//           like_count: 1342,
//           dislike_count: 421,
//           description_body: `
// Given a signed 32-bit integer \`x\`, return \`x\` with its digits reversed. If reversing \`x\` causes the value to go outside the signed 32-bit integer range, return 0.

// ## Examples

// ### Example 1:
// # 

// \`\`\`
// Input: x = 123
// Output: 321
// \`\`\`

// #

// ### Example 2:
// #

// \`\`\`
// Input: x = -123
// Output: -321
// \`\`\`

// ## Constraints

// - \`-2^31 <= x <= 2^31 - 1\`
// `
//         },
//       },
//       {
//         main: {
//           id: 5,
//           name: "Palindrome Number",
//           difficulty: "Easy",
//           like_count: 980,
//           dislike_count: 170,
//           description_body: `
// Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

// ## Examples

// ### Example 1:
// # 

// \`\`\`
// Input: x = 121
// Output: true
// \`\`\`

// #

// ### Example 2:
// #

// \`\`\`
// Input: x = -121
// Output: false
// Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.
// \`\`\`

// ## Constraints

// - \`-2^31 <= x <= 2^31 - 1\`
// `
//         },
//       },
//     ];

//     // Insert dummy problems into the database
//     await ProblemModel.insertMany(dummyProblems);
//     console.log("Problems inserted successfully.");
//   } catch (error) {
//     console.error("Error inserting dummy data:", error);
//   } finally {
//     // Close the database connection
//     mongoose.connection.close();
//   }
// }

// start();













// // seed.ts
// import mongoose from "mongoose";
// import ProblemModel from "./models/problem";
// import connectDB from "./dbConfig";

// async function start() {
//   try {
//     // Connect to your database if not already connected
//     await connectDB();

//     // Dummy data for the Problem model
//     const dummyProblems = [
//       {
//         main: {
//           id: 1,
//           name: "Two Sum",
//           difficulty: "Easy",
//           like_count: 100,
//           dislike_count: 5,
//           description_body:
//             "Find two numbers in the array that add up to a specific target.",
//           accept_count: 80,
//           submission_count: 120,
//           acceptance_rate_count: 66.67,
//           discussion_count: 10,
//           related_topics: ["Array", "Hash Table"],
//           similar_questions: ["3Sum", "4Sum"],
//           solution_count: 80,
//           code_default_language: "JavaScript",
//           code_body: { js: "function twoSum(nums, target) { /* code */ }" },
//         },
//         editorial: {
//           editorial_body:
//             "A hash map can be used to solve this problem in O(n) time.",
//         },
//         test: [
//           [[2, 7, 11, 15], 9, [0, 1]],
//           [[3, 2, 4], 6, [1, 2]],
//         ],
//         function_name: "twoSum",
//       },
//       {
//         main: {
//           id: 2,
//           name: "Reverse String",
//           difficulty: "Easy",
//           like_count: 150,
//           dislike_count: 3,
//           description_body: "Reverse the provided string.",
//           accept_count: 140,
//           submission_count: 160,
//           acceptance_rate_count: 87.5,
//           discussion_count: 5,
//           related_topics: ["String"],
//           similar_questions: [],
//           solution_count: 130,
//           code_default_language: "Python",
//           code_body: { py: "def reverseString(s): return s[::-1]" },
//         },
//         editorial: {
//           editorial_body:
//             "In Python, string slicing can quickly reverse the string.",
//         },
//         test: [
//           ["hello", "olleh"],
//           ["world", "dlrow"],
//         ],
//         function_name: "reverseString",
//       },
//     ];

//     // Insert dummy problems
//     await ProblemModel.insertMany(dummyProblems);
//     console.log("Problems inserted successfully.");
//   } catch (error) {
//     console.error("Error inserting dummy data:", error);
//   } finally {
//     // Close the database connection
//     mongoose.connection.close();
//   }
// }

// start();