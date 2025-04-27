// pages/api/tags/all.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  // 認証チェック
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const userId = session.user.id;
    const tags = await prisma.tag.findMany({
      where: { userId },
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
