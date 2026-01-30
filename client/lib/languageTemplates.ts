export const getStarterCode = (language: string): string => {
  const templates: Record<string, string> = {
    javascript: `const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim();

// Write your solution here
// input contains all input from stdin

console.log("Hello World");
`,

    python: `import sys

input_data = sys.stdin.read().strip()

# Write your solution here
# input_data contains all input from stdin

print("Hello World")
`,

    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string input, line;
    while (getline(cin, line)) {
        input += line;
    }

    // Write your solution here
    cout << "Hello World";

    return 0;
}
`,

    c: `#include <stdio.h>
#include <string.h>

int main() {
    char input[100000];
    fread(input, 1, sizeof(input), stdin);

    // Write your solution here
    printf("Hello World");

    return 0;
}
`,

    java: `import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder input = new StringBuilder();
        String line;

        while ((line = br.readLine()) != null) {
            input.append(line);
        }

        // Write your solution here
        System.out.print("Hello World");
    }
}
`
  };

  return templates[language] || templates.javascript;
};
