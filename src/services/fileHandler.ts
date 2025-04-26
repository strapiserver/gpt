import { promises as fs } from "fs";

export async function writeMyFile(
  filePath: string,
  data: string
): Promise<void> {
  try {
    await fs.writeFile(filePath, data, "utf8");
    console.log(`Data successfully written to ${filePath}`);
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    throw error;
  }
}

export async function readMyFile(filePath: string): Promise<string> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    console.log(`Data successfully read from ${filePath}`);
    return data;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}
