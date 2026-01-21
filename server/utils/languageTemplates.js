// Language starter code templates
export const getStarterCode = (language) => {
  const templates = {
    javascript: `function solution(input) {
    // Write your JavaScript code here
    // input is a string, parse it as needed

    return "Hello World";
}`,

    python: `def solution(input_str):
    # Write your Python code here
    # input_str is a string, parse it as needed

    return "Hello World"`,

    cpp: `#include <iostream>
#include <string>
using namespace std;

string solution(string input) {
    // Write your C++ code here
    // input is a string, parse it as needed

    return "Hello World";
}

int main() {
    string input;
    getline(cin, input);
    cout << solution(input) << endl;
    return 0;
}`,

    c: `#include <stdio.h>
#include <string.h>

char* solution(char* input) {
    // Write your C code here
    // input is a string, parse it as needed

    return "Hello World";
}

int main() {
    char input[1000];
    fgets(input, sizeof(input), stdin);
    // Remove newline character
    input[strcspn(input, "\\n")] = 0;
    printf("%s\\n", solution(input));
    return 0;
}`,

    java: `import java.util.Scanner;

public class Solution {
    public static String solution(String input) {
        // Write your Java code here
        // input is a string, parse it as needed

        return "Hello World";
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        System.out.println(solution(input));
        scanner.close();
    }
}`
  };

  return templates[language] || templates.javascript;
};