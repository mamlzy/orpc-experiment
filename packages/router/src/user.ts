import fs from 'fs/promises';
import path from 'path';
import { os } from '@orpc/server';
import { z } from 'zod';

import { CWD } from './data/constants';

export const listUsers = os
  // .input(
  //   z.object({
  //     limit: z.number().int().min(1).max(100).optional(),
  //     cursor: z.number().int().min(0).default(0),
  //   }),
  // )
  .handler(async () => {
    const users = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
      { id: 3, name: 'Jim Doe' },
    ];

    return users;
  });

export const createUser = os
  .input(z.object({ name: z.string(), file: z.instanceof(File) }))
  .handler(async ({ input }) => {
    const { file } = input;

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const uploadDir = path.join(CWD, 'public', 'uploads');
    const filePath = path.join(uploadDir, file.name);

    console.log('filePath =>', filePath);

    try {
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      // Write the file
      await fs.writeFile(filePath, fileBuffer);
    } catch (error) {
      console.error(`Error saving file:`, error);
      throw new Error(
        `Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return 'ok';
  });
