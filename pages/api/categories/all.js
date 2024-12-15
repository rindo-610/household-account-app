// pages/api/categories/all.js

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

        let categoryResponse = await fetch(`${baseUrl}/categories/all`, {
            method: 'GET',
            headers
        });
        let categoryData = await categoryResponse.json();

        // 取得したcategoryDataをそのままクライアントに返す
        if (categoryResponse.ok) {
            return res.status(200).json({ message: 'Success', data: categoryData });
        } else {
            return res.status(categoryResponse.status).json({ 
            message: 'Failed to fetch categories', 
            error: categoryData
            });
        }
        } catch (error) {
        console.error('Caught error:', error);
        return res.status(500).json({ 
            message: 'Server Error', 
            error: error instanceof Error ? error.message : String(error) 
        });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}