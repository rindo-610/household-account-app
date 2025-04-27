// pages/api/transactions/list.js
import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { year, month } = req.query
  if (!year || !month) {
    return res.status(400).json({ message: 'year, month を指定してください' })
  }

  const y = Number(year)
  const m = Number(month) - 1
  const start = new Date(y, m, 1)
  const end = new Date(y, m + 1, 0, 23, 59, 59)

  try {
    const transactions = await prisma.transaction.findMany({
      where: { date: { gte: start, lte: end } },
      include: {
        category: { select: { name: true } },
        tag:      { select: { name: true } }
      },
      orderBy: { date: 'asc' }
    })

    const result = transactions.map(t => ({
      id:       t.id,
      date:     t.date.toISOString().split('T')[0],
      amount:   t.amount.toNumber ? t.amount.toNumber() : t.amount,
      type:     t.type,            // 'INCOME' or 'EXPENSE'
      category: t.category.name,
      tag:      t.tag?.name || '',
      memo:     t.memo || ''
    }))

    return res.status(200).json(result)
  } catch (error) {
    console.error('Failed to fetch list:', error)
    return res.status(500).json({ message: 'DB Error', error: error instanceof Error ? error.message : String(error) })
  }
}