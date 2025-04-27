// pages/api/transactions.js

import prisma from '../../lib/prisma'
import { Prisma } from '@prisma/client'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { year, month, tag, condition } = req.query
    if (!year || !month) {
      return res.status(400).json({ message: 'year, month を指定してください' })
    }

    const y = Number(year)
    const m = Number(month) - 1
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0, 23, 59, 59)

    // 共通の where
    const whereCommon = {
      date: { gte: start, lte: end }
    }

    if (tag && tag.trim() !== '') {
      if (condition === 'only') {
        whereCommon.tag = { name: String(tag) }
      } else if (condition === 'exclude') {
        whereCommon.OR = [
          { tag: null },
          { NOT: { tag: { name: String(tag) } } }
        ]
      }
    }

    try {
      // 「収入」の集計
      const incomes = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...whereCommon, type: 'INCOME' },
        _sum: { amount: true }
      })

      // 「支出」の集計
      const expenses = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...whereCommon, type: 'EXPENSE' },
        _sum: { amount: true }
      })

      // 全カテゴリ取得
      const cats = await prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      })

      const categories = cats.map((c) => c.name)
      const income = cats.map((c) => {
        const rec = incomes.find((i) => i.categoryId === c.id)?._sum.amount
        return rec ? rec.toNumber() : 0
      })
      const expense = cats.map((c) => {
        const rec = expenses.find((e) => e.categoryId === c.id)?._sum.amount
        return rec ? rec.toNumber() : 0
      })

      return res.status(200).json({ categories, income, expense })
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      return res.status(500).json({
        message: 'DB Error',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  if (req.method === 'POST') {
    const { amount, type, categoryName, tagName, memo, date } = req.body
    if (!amount || !type || !categoryName || !date) {
      return res.status(400).json({ message: '必須フィールドが不足しています' })
    }

    try {
      // カテゴリ取得 or 作成
      let category = await prisma.category.findUnique({
        where: { name: String(categoryName) }
      })
      if (!category) {
        category = await prisma.category.create({
          data: { name: String(categoryName) }
        })
      }

      // タグ取得 or 作成
      let tag = null
      if (tagName && tagName.trim() !== '') {
        tag = await prisma.tag.findUnique({
          where: { name: String(tagName) }
        })
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: String(tagName) }
          })
        }
      }

      // トランザクション作成
      const created = await prisma.transaction.create({
        data: {
          amount: new Prisma.Decimal(String(amount)),
          type: type === 'income' ? 'INCOME' : 'EXPENSE',
          categoryId: category.id,
          tagId: tag?.id,
          memo: memo ? String(memo) : null,
          date: new Date(date)
        }
      })

      return res.status(201).json(created)
    } catch (error) {
      console.error('Failed to create transaction:', error)
      return res.status(500).json({
        message: 'DB Error',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: 'Method Not Allowed' })
}
