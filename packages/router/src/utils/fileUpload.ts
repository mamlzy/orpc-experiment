import * as fs from 'fs/promises';
import * as path from 'path';

// import { Context } from "hono";
// import * as formidable from "formidable";
// import { parseCSV, parseExcel } from "./parseData";
// import { users } from "@db/model";

const FAILED_DIR = path.join(process.cwd(), '../../src/public/failed_uploads');

const ensureDirectoryExists = async (dir: string) => {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error(`Failed to create directory: ${dir}`, error);
    throw new Error('Error creating directory');
  }
};

export const saveFile = async (file: File, folder: string) => {
  try {
    await ensureDirectoryExists(folder);

    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext);
    const uniqueName = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(folder, uniqueName);

    const buffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buffer));

    return { name: uniqueName, path: filePath };
  } catch (error) {
    throw new Error('Error saving file');
  }
};

export const moveToFailed = async (filePath: string) => {
  try {
    await ensureDirectoryExists(FAILED_DIR);

    const fileName = path.basename(filePath);
    const failedPath = path.join(FAILED_DIR, fileName);
    await fs.rename(filePath, failedPath);
  } catch (error) {
    console.error('Failed to move file to failed directory', error);
  }
};

export const deleteFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete file', error);
  }
};

// const allowedTables: Record<string, any> = {
//   users,
// };

// export const uploadData = async (ctx: Context) => {
//   const form = formidable({ multiples: false, keepExtensions: true });

//   return new Promise((resolve, reject) => {
//     form.parse(ctx.req.raw as any, async (err, fields, files) => {
//       if (err) {
//         return resolve(
//           ctx.json(
//             { success: false, message: "File upload error", error: err },
//             500
//           )
//         );
//       }

//       const tableName = fields.table?.[0];
//       if (!tableName || !allowedTables[tableName]) {
//         return resolve(
//           ctx.json(
//             { success: false, message: "Invalid or missing table name" },
//             400
//           )
//         );
//       }

//       const file = files.file?.[0];
//       if (!file) {
//         return resolve(
//           ctx.json({ success: false, message: "No file uploaded" }, 400)
//         );
//       }

//       const filePath = file.filepath;
//       const fileExt = path.extname(file.originalFilename || "").toLowerCase();

//       try {
//         let data: Record<string, any>[] = [];

//         if (fileExt === ".csv") {
//           data = await parseCSV(filePath);
//         } else if (fileExt === ".xls" || fileExt === ".xlsx") {
//           data = parseExcel(filePath);
//         } else {
//           return resolve(
//             ctx.json({ success: false, message: "Invalid file format" }, 400)
//           );
//         }

//         if (data.length === 0) {
//           return resolve(
//             ctx.json({ success: false, message: "No valid data found" }, 400)
//           );
//         }

//         return data;
//       } catch (error) {
//         return resolve(
//           ctx.json(
//             { success: false, message: "Failed to process file", error },
//             500
//           )
//         );
//       } finally {
//         fs.unlink(filePath);
//       }
//     });
//   });
// };
