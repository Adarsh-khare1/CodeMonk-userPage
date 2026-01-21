// Judge service - evaluates code against test cases for multiple languages
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Language configurations
const LANGUAGE_CONFIGS = {
  javascript: {
    extension: 'js',
    compileCommand: null,
    runCommand: 'node {file}',
    timeout: 5000,
  },
  python: {
    extension: 'py',
    compileCommand: null,
    runCommand: 'python {file}',
    timeout: 5000,
  },
  cpp: {
    extension: 'cpp',
    compileCommand: 'g++ {file} -o {output} -std=c++17',
    runCommand: '{output}',
    timeout: 5000,
  },
  c: {
    extension: 'c',
    compileCommand: 'gcc {file} -o {output} -std=c99',
    runCommand: '{output}',
    timeout: 5000,
  },
  java: {
    extension: 'java',
    compileCommand: 'javac {file}',
    runCommand: 'java {className}',
    timeout: 5000,
  },
};

// Create temporary directory for code execution
const createTempDir = () => {
  try {
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log('📁 Created temp directory:', tempDir);
    }
    return tempDir;
  } catch (error) {
    console.error('❌ Error creating temp directory:', error);
    throw error;
  }
};

// Execute code with timeout
const executeWithTimeout = (command, timeout, input = '') => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log('⚙️ Executing command:', {
      command: command.substring(0, 100) + (command.length > 100 ? '...' : ''),
      timeout,
      hasInput: !!input,
      timestamp: new Date().toISOString()
    });

    const child = exec(command, { timeout }, (error, stdout, stderr) => {
      const duration = Date.now() - startTime;

      if (error) {
        console.error('❌ Command execution failed:', {
          command: command.substring(0, 100),
          error: error.message,
          code: error.code,
          signal: error.signal,
          stderr: stderr?.substring(0, 200),
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        });

        if (error.code === 'ETIMEDOUT') {
          reject(new Error('Time Limit Exceeded'));
        } else {
          reject(new Error(stderr || error.message));
        }
      } else {
        console.log('✅ Command executed successfully:', {
          command: command.substring(0, 100),
          stdoutLength: stdout.length,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        });
        resolve(stdout.trim());
      }
    });

    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }

    // Handle process errors
    child.on('error', (error) => {
      console.error('💥 Process error:', {
        command,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  });
};

// Compile code if needed
const compileCode = async (language, filePath) => {
  const config = LANGUAGE_CONFIGS[language];
  if (!config.compileCommand) {
    console.log('ℹ️ No compilation needed for language:', language);
    return null;
  }

  let compileCmd = config.compileCommand.replace('{file}', filePath);

  if (language === 'cpp' || language === 'c') {
    const outputPath = filePath.replace(/\.(cpp|c)$/, '');
    compileCmd = compileCmd.replace('{output}', outputPath);
  }

  try {
    console.log('🔨 Compiling code:', {
      language,
      filePath,
      command: compileCmd.substring(0, 100),
      timestamp: new Date().toISOString()
    });

    await executeWithTimeout(compileCmd, 10000);
    const outputPath = (language === 'cpp' || language === 'c') ? filePath.replace(/\.(cpp|c)$/, '') : null;

    console.log('✅ Compilation successful:', {
      language,
      outputPath,
      timestamp: new Date().toISOString()
    });

    return outputPath;
  } catch (error) {
    console.error('❌ Compilation failed:', {
      language,
      filePath,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Compilation Error: ${error.message}`);
  }
};

// Run compiled/interpreted code
const runCode = async (language, filePath, input = '', timeout = 5000) => {
  const config = LANGUAGE_CONFIGS[language];
  let runCmd = config.runCommand.replace('{file}', filePath);

  if (language === 'cpp' || language === 'c') {
    const outputPath = filePath.replace(/\.(cpp|c)$/, '');
    runCmd = runCmd.replace('{output}', outputPath);
  } else if (language === 'java') {
    const className = path.basename(filePath, '.java');
    runCmd = runCmd.replace('{className}', className);
  }

  try {
    const output = await executeWithTimeout(runCmd, timeout, input);
    return output;
  } catch (error) {
    if (error.message.includes('Time Limit Exceeded')) {
      throw new Error('Time Limit Exceeded');
    }
    throw new Error(`Runtime Error: ${error.message}`);
  }
};

// Judge submission for any supported language
export const judgeSubmission = async (code, testCases, language = 'javascript') => {
  const startTime = Date.now();
  const config = LANGUAGE_CONFIGS[language];

  if (!config) {
    return {
      status: 'Compilation Error',
      error: `Unsupported language: ${language}`,
      results: [],
      passed: 0,
      total: testCases.length,
      executionTime: 0,
      memoryUsed: 0,
    };
  }

  const tempDir = createTempDir();
  const fileName = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const filePath = path.join(tempDir, `${fileName}.${config.extension}`);

  try {
    // Write code to file
    fs.writeFileSync(filePath, code);

    // Compile if needed
    await compileCode(language, filePath);

    // Run test cases
    const results = [];
    let passed = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        const output = await runCode(language, filePath, testCase.input, config.timeout);

        // Compare output (trim whitespace and normalize line endings)
        const expected = testCase.expectedOutput.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const actual = output.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const isPassed = actual === expected;
        if (isPassed) passed++;

        results.push({
          testCase: i + 1,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: output,
          passed: isPassed,
        });
      } catch (error) {
        results.push({
          testCase: i + 1,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: '',
          passed: false,
          error: error.message,
        });
      }
    }

    const executionTime = Date.now() - startTime;
    const status = passed === testCases.length ? 'Accepted' : 'Wrong Answer';

    return {
      status,
      results,
      passed,
      total: testCases.length,
      executionTime,
      memoryUsed: 0, // Would need more complex monitoring for memory usage
    };

  } catch (error) {
    return {
      status: 'Compilation Error',
      error: error.message,
      results: [],
      passed: 0,
      total: testCases.length,
      executionTime: Date.now() - startTime,
      memoryUsed: 0,
    };
  } finally {
    // Clean up temporary files
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      // Clean up compiled files
      if (language === 'cpp' || language === 'c') {
        const outputPath = filePath.replace(/\.(cpp|c)$/, '');
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } else if (language === 'java') {
        const className = path.basename(filePath, '.java');
        const classFile = path.join(tempDir, `${className}.class`);
        if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
    }
  }
};

// Run sample tests (similar to judgeSubmission but only for sample test cases)
export const runSampleTests = async (code, sampleTests, language = 'javascript') => {
  const config = LANGUAGE_CONFIGS[language];

  if (!config) {
    return {
      status: 'Error',
      error: `Unsupported language: ${language}`,
      results: [],
    };
  }

  const tempDir = createTempDir();
  const fileName = `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const filePath = path.join(tempDir, `${fileName}.${config.extension}`);

  try {
    fs.writeFileSync(filePath, code);

    // Compile if needed
    await compileCode(language, filePath);

    const results = [];

    for (let i = 0; i < sampleTests.length; i++) {
      const test = sampleTests[i];
      try {
        const output = await runCode(language, filePath, test.input, config.timeout);

        const expected = test.output.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const actual = output.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        results.push({
          testCase: i + 1,
          input: test.input,
          expected: test.output,
          actual: output,
          passed: actual === expected,
        });
      } catch (error) {
        results.push({
          testCase: i + 1,
          input: test.input,
          expected: test.output,
          actual: '',
          passed: false,
          error: error.message,
        });
      }
    }

    return {
      status: 'Completed',
      results,
    };

  } catch (error) {
    return {
      status: 'Error',
      error: error.message,
      results: [],
    };
  } finally {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (language === 'cpp' || language === 'c') {
        const outputPath = filePath.replace(/\.(cpp|c)$/, '');
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } else if (language === 'java') {
        const className = path.basename(filePath, '.java');
        const classFile = path.join(tempDir, `${className}.class`);
        if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
    }
  }
};
