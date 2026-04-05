export interface TestCase {
  id: number;
  inputArguments: string; // e.g., "[2, 7, 11, 15], 9"
  expectedOutput: string; // e.g., "[0, 1]"
}

export interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  descriptionHtml: string;
  starterCode: string;
  testCases: TestCase[];
  functionName: string;
}

export const problems: Problem[] = [
  {
    id: "two-sum",
    title: "1. Two Sum",
    difficulty: "Easy",
    functionName: "twoSum",
    descriptionHtml: `
      <p class="text-gray-300 mb-4">
        Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.
      </p>
      <p class="text-gray-300 mb-4">
        You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the same element twice.
      </p>
      <p class="text-gray-300 mb-4">
        You can return the answer in any order.
      </p>
      
      <div class="mt-6 mb-4">
        <h3 class="font-semibold text-white mb-2">Example 1:</h3>
        <pre class="bg-[#1e1e2e] p-3 rounded-lg border border-[#2a2a3a] text-sm font-mono text-gray-300">
<strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</pre>
      </div>

      <div class="mb-4">
        <h3 class="font-semibold text-white mb-2">Example 2:</h3>
        <pre class="bg-[#1e1e2e] p-3 rounded-lg border border-[#2a2a3a] text-sm font-mono text-gray-300">
<strong>Input:</strong> nums = [3,2,4], target = 6
<strong>Output:</strong> [1,2]</pre>
      </div>
    `,
    starterCode: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    pass
`,
    testCases: [
      { id: 1, inputArguments: "[2, 7, 11, 15], 9", expectedOutput: "[0, 1]" },
      { id: 2, inputArguments: "[3, 2, 4], 6", expectedOutput: "[1, 2]" },
      { id: 3, inputArguments: "[3, 3], 6", expectedOutput: "[0, 1]" },
    ],
  },
];
