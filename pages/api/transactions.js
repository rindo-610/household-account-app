// pages/api/transactions.js

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const baseUrl = process.env.API_BASE_URL; 
      const apiKey = process.env.API_PUBLIC_KEY; 
      const apiSecret = process.env.API_SECRET_KEY;

      // 認証ヘッダー（Basic認証例）
      const credentials = btoa(`${apiKey}:${apiSecret}`);
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      };

      const { year, month, tag, condition } = req.query;

      let url;
      if (tag && tag.trim() !== '') {
        // tagがある場合はタグ用のエンドポイントを使用
        url = `${baseUrl}/transactions?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}&tag=${encodeURIComponent(tag)}&condition=${encodeURIComponent(condition)}`;
      } else {
        // tagがない場合はタグなし用のエンドポイントを使用
        url = `${baseUrl}/transactions/no_tag?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`;
      }

      const transactionResponse = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!transactionResponse.ok) {
        throw new Error('Failed to fetch transaction data');
      }

      const transactionData = await transactionResponse.json();

      const rows = transactionData.data && transactionData.data.rows ? transactionData.data.rows : [];
      const categories = rows.map(r => r.category_name);
      const income = rows.map(r => r.total_income || 0);
      const expense = rows.map(r => r.total_expense || 0);

      return res.status(200).json({ categories, income, expense });
    } catch (error) {
      console.error('Caught error:', error);
      return res.status(500).json({ 
        message: 'DB Error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  } else if (req.method === 'POST') {
    const { amount, type, categoryName, tagName, memo, date } = req.body;
    try {
      const baseUrl = process.env.API_BASE_URL; 
      const apiKey = process.env.API_PUBLIC_KEY; 
      const apiSecret = process.env.API_SECRET_KEY;
      
      // 認証ヘッダー（Basic認証）
      const credentials = btoa(`${apiKey}:${apiSecret}`);
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      };

      // --- ここ以降は既存のPOST処理そのまま ---
      // 1. カテゴリID取得または新規作成
      let categoryId = null;
      if (categoryName) {
        let categoryResponse = await fetch(`${baseUrl}/categories?name=${encodeURIComponent(categoryName)}`, {
          method: 'GET',
          headers
        });
        let categoryData = await categoryResponse.json();

        if (categoryResponse.ok && categoryData && categoryData.data.rows.length > 0) {
          categoryId = categoryData.data.rows[0].id;
        } else {
          let createCategoryRes = await fetch(`${baseUrl}/categories`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: categoryName })
          });
          if (!createCategoryRes.ok) throw new Error('Failed to create category');
          let createdCategory = await createCategoryRes.json();
          categoryId = createdCategory.data.rows[0].id;
        }
      }

      // 2. タグID取得または新規作成
      let tagId = null;
      if (tagName && tagName.trim() !== '') {
        let tagResponse = await fetch(`${baseUrl}/tags?name=${encodeURIComponent(tagName)}`, {
          method: 'GET',
          headers
        });
        let tagData = await tagResponse.json();

        if (tagResponse.ok && tagData && tagData.data.rows.length > 0) {
          tagId = tagData.data.rows[0].id;
        } else {
          let createTagRes = await fetch(`${baseUrl}/tags`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: tagName })
          });
          if (!createTagRes.ok) throw new Error('Failed to create tag');
          let createdTag = await createTagRes.json();
          tagId = createdTag.data.rows[0].id;
        }
      }

      // 3. トランザクション登録
      const transactionData = {
        amount: amount ? parseFloat(amount) : 0,
        type: type,
        category_id: categoryId,
        memo: memo || '',
        date: date || new Date().toISOString().split('T')[0]
      };

      let transactionResponse;

      if (tagId) {
        transactionData.tag_id = tagId;
        transactionResponse = await fetch(`${baseUrl}/transactions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(transactionData)
        });
      } else {
        transactionResponse = await fetch(`${baseUrl}/transactions/no_tag`, {
          method: 'POST',
          headers,
          body: JSON.stringify(transactionData)
        });
      }

      if (!transactionResponse.ok) {
        throw new Error('Failed to create transaction');
      }

      const newTransaction = await transactionResponse.json();
      return res.status(200).json({ message: 'Success', data: newTransaction });
    } catch (error) {
      console.error('Caught error:', error);
      return res.status(500).json({ 
        message: 'DB Error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
