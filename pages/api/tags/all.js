// pages/api/tags/all.js

import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    return res.status(200).json(tags);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return res.status(500).json({
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
