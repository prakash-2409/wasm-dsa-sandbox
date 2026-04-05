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
  {
    id: "valid-palindrome",
    title: "125. Valid Palindrome",
    difficulty: "Easy",
    functionName: "isPalindrome",
    descriptionHtml: `
      <p class="text-gray-300 mb-4">
        A phrase is a <strong>palindrome</strong> if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.
      </p>
      <p class="text-gray-300 mb-4">
        Given a string <code>s</code>, return <code>True</code><em> if it is a <strong>palindrome</strong>, or </em><code>False</code><em> otherwise</em>.
      </p>
      
      <div class="mt-6 mb-4">
        <h3 class="font-semibold text-white mb-2">Example 1:</h3>
        <pre class="bg-[#1e1e2e] p-3 rounded-lg border border-[#2a2a3a] text-sm font-mono text-gray-300">
<strong>Input:</strong> s = "A man, a plan, a canal: Panama"
<strong>Output:</strong> True
<strong>Explanation:</strong> "amanaplanacanalpanama" is a palindrome.</pre>
      </div>

      <div class="mb-4">
        <h3 class="font-semibold text-white mb-2">Example 2:</h3>
        <pre class="bg-[#1e1e2e] p-3 rounded-lg border border-[#2a2a3a] text-sm font-mono text-gray-300">
<strong>Input:</strong> s = "race a car"
<strong>Output:</strong> False
<strong>Explanation:</strong> "raceacar" is not a palindrome.</pre>
      </div>
    `,
    starterCode: `def isPalindrome(s: str) -> bool:
    # Write your solution here
    pass
`,
    testCases: [
      { id: 1, inputArguments: "\"A man, a plan, a canal: Panama\"", expectedOutput: "True" },
      { id: 2, inputArguments: "\"race a car\"", expectedOutput: "False" },
      { id: 3, inputArguments: "\" \"", expectedOutput: "True" },
    ],
  },
  {
    id: "fibonacci-number",
    title: "509. Fibonacci Number",
    difficulty: "Easy",
    functionName: "fib",
    descriptionHtml: `
      <p class="text-gray-300 mb-4">
        The <strong>Fibonacci numbers</strong>, commonly denoted <code>F(n)</code> form a sequence, called the <strong>Fibonacci sequence</strong>, such that each number is the sum of the two preceding ones, starting from <code>0</code> and <code>1</code>. That is,
      </p>
      <pre class="bg-[#1e1e2e] p-3 rounded-lg border border-[#2a2a3a] text-sm font-mono text-gray-300 mb-4">
F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1.</pre>
      <p class="text-gray-300 mb-4">
        Given <code>n</code>, calculate <code>F(n)</code>.
      </p>
      
      <div class="mt-6 mb-4">
        <h3 class="font-semibold text-white mb-2">Example 1:</h3>
        <pre class="bg-[#1e1e2e] p-3 rounded-lg border border-[#2a2a3a] text-sm font-mono text-gray-300">
<strong>Input:</strong> n = 2
<strong>Output:</strong> 1
<strong>Explanation:</strong> F(2) = F(1) + F(0) = 1 + 0 = 1.</pre>
      </div>

      <div class="mb-4">
        <h3 class="font-semibold text-white mb-2">Example 2:</h3>
        <pre class="bg-[#1e1e2e] p-3 rounded-lg border border-[#2a2a3a] text-sm font-mono text-gray-300">
<strong>Input:</strong> n = 3
<strong>Output:</strong> 2
<strong>Explanation:</strong> F(3) = F(2) + F(1) = 1 + 1 = 2.</pre>
      </div>
    `,
    starterCode: `def fib(n: int) -> int:
    # Write your solution here
    pass
`,
    testCases: [
      { id: 1, inputArguments: "2", expectedOutput: "1" },
      { id: 2, inputArguments: "3", expectedOutput: "2" },
      { id: 3, inputArguments: "4", expectedOutput: "3" },
    ],
  }
];
